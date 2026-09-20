import { describe, it, expect, vi, afterEach } from "vitest";
import { app } from "../worker/index";
import type { Env } from "../worker/index";

// These tests used to drive api/shopify.ts — the Vercel serverless version of
// this proxy — through a mocked req/res pair. Cloudflare now serves the site,
// worker/index.ts owns POST /api/shopify, and the Vercel file has been
// deleted. The assertions below are the same security contract, re-pointed at
// the Hono app: the endpoint is public and unauthenticated, and it holds the
// storefront token, so a silent regression here is expensive.
//
// Where the Worker's behaviour legitimately differs from the Vercel handler's,
// the test asserts the NEW truth and says why in a comment.

const TOKEN = "test-token";

/** Synthetic bindings. Credentials come from `env` on the Worker, not
 *  process.env — that is the whole point of the Workers runtime model. */
function env(overrides: Partial<Env> = {}): Env {
  return {
    SHOPIFY_STORE_DOMAIN: "test.myshopify.com",
    SHOPIFY_STOREFRONT_TOKEN: TOKEN,
    ASSETS: { fetch: async () => new Response("asset") },
    ...overrides,
  } as Env;
}

function post(body: unknown, headers: Record<string, string> = {}) {
  return {
    method: "POST",
    headers: { "content-type": "application/json", host: "turathcollective.com", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  } satisfies RequestInit;
}

const okFetch = () =>
  vi.fn().mockResolvedValue(
    new Response(JSON.stringify({ data: {} }), {
      status: 200,
      headers: { "content-type": "application/json" },
    }),
  );

const call = (body: unknown, headers?: Record<string, string>, e: Env = env()) =>
  app.request("/api/shopify", post(body, headers), e);

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("shopify proxy — request validation", () => {
  it("does not serve non-POST", async () => {
    // CHANGED: the Vercel handler answered 405 with an `Allow: POST` header.
    // On the Worker, only app.post binds /api/shopify, so a GET falls through
    // to the `app.all("/api/*")` catch-all, which is a real 404. Either way
    // the request never reaches Shopify, which is the property that matters.
    const res = await app.request(
      "/api/shopify",
      { method: "GET", headers: { host: "turathcollective.com" } },
      env(),
    );
    expect(res.status).toBe(404);
    expect(res.headers.get("Allow")).toBeNull();
  });

  it("blocks schema introspection via __schema", async () => {
    const res = await call({ query: "{ __schema { types { name } } }" });
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ message: "Introspection is not supported" });
  });

  it("blocks schema introspection via __type", async () => {
    const res = await call({ query: '{ __type(name: "Product") { name } }' });
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ message: "Introspection is not supported" });
  });

  it("rejects an oversized query", async () => {
    const res = await call({ query: "q".repeat(20_001) });
    expect(res.status).toBe(400);
    // CHANGED: one shared rejection message now — the Worker validates the
    // whole body with a single zod schema rather than field-by-field, so an
    // oversized query and a malformed body are indistinguishable to the
    // caller. That is the safer direction for a public endpoint.
    expect(await res.json()).toMatchObject({ message: "Expected a GraphQL request body" });
  });

  it("accepts a query at exactly the size limit", async () => {
    // Boundary: 20_000 is allowed, 20_001 is not.
    vi.stubGlobal("fetch", okFetch());
    const res = await call({ query: "q".repeat(20_000) });
    expect(res.status).toBe(200);
  });

  it.each([
    ["a non-object body", '"string body"'],
    ["an array body", JSON.stringify([{ query: "{}" }])],
    ["a null body", "null"],
    ["an unparseable body", "not json at all"],
  ])("rejects %s", async (_label, raw) => {
    const res = await call(raw);
    expect(res.status).toBe(400);
  });

  it("rejects a missing or non-string query", async () => {
    expect((await call({})).status).toBe(400);
    expect((await call({ query: 42 })).status).toBe(400);
    expect((await call({ query: "" })).status).toBe(400);
  });

  it("rejects non-object variables and non-string operationName", async () => {
    expect((await call({ query: "{a}", variables: [1, 2] })).status).toBe(400);
    expect((await call({ query: "{a}", operationName: 7 })).status).toBe(400);
  });
});

describe("shopify proxy — origin enforcement", () => {
  it.each([
    "https://turathcollective.com",
    "https://www.turathcollective.com",
    // CHANGED: the old list included a *.vercel.app preview origin. The
    // Worker allows *.workers.dev instead — Cloudflare is the host now.
    "https://turath-collective.workers.dev",
    "http://localhost:5000",
  ])("allows %s", async (origin) => {
    vi.stubGlobal("fetch", okFetch());
    const res = await call({ query: "{ shop { name } }" }, { origin });
    expect(res.status).not.toBe(403);
  });

  it("blocks a foreign browser origin", async () => {
    const res = await call({ query: "{ shop { name } }" }, { origin: "https://evil.example" });
    expect(res.status).toBe(403);
  });

  it("allows a caller that sends no Origin (non-browser)", async () => {
    vi.stubGlobal("fetch", okFetch());
    const res = await call({ query: "{ shop { name } }" });
    expect(res.status).not.toBe(403);
  });
});

describe("shopify proxy — credentials and upstream", () => {
  it("returns the 503 shape the client keys off when credentials are missing", async () => {
    // Credentials come from the `env` argument on the Worker, not process.env.
    const res = await call({ query: "{ shop { name } }" }, {}, env({
      SHOPIFY_STOREFRONT_TOKEN: undefined,
    }));
    expect(res.status).toBe(503);
    // The client checks `shopifyDisabled` to fall back — this shape is API.
    expect(await res.json()).toMatchObject({ shopifyDisabled: true });
  });

  it("forwards ONLY the validated fields, never the raw body", async () => {
    const fetchMock = okFetch();
    vi.stubGlobal("fetch", fetchMock);

    await call({
      query: "{ shop { name } }",
      variables: { a: 1 },
      operationName: "Shop",
      // A hostile extra field must not reach Shopify.
      smuggled: "should-not-be-forwarded",
    });

    const sent = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sent).toEqual({
      query: "{ shop { name } }",
      variables: { a: 1 },
      operationName: "Shop",
    });
    expect(sent).not.toHaveProperty("smuggled");
  });

  it("does not leak the storefront token in the response", async () => {
    vi.stubGlobal("fetch", okFetch());
    const res = await call({ query: "{ shop { name } }" });
    const text = await res.text();
    expect(text).not.toContain(TOKEN);
    expect(JSON.stringify([...res.headers])).not.toContain(TOKEN);
  });

  it("maps an upstream timeout to 504 and any other failure to 502", async () => {
    // CHANGED: the Vercel handler aborted with an AbortController and checked
    // for `AbortError`. The Worker uses AbortSignal.timeout(), whose rejection
    // is named `TimeoutError` — that is the name the 504 branch keys off.
    const timeout = Object.assign(new Error("timed out"), { name: "TimeoutError" });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(timeout));
    expect((await call({ query: "{ shop { name } }" })).status).toBe(504);

    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    expect((await call({ query: "{ shop { name } }" })).status).toBe(502);
  });
});

describe("shopify proxy — rate limiting", () => {
  // CHANGED: rate limiting is a Cloudflare binding now, not express-rate-
  // limit's in-process counter — so there is no request loop to run and no
  // Retry-After header. The binding's verdict is the whole contract.
  it("429s when the rate limiter binding rejects the request", async () => {
    vi.stubGlobal("fetch", okFetch());
    const res = await call({ query: "{ shop { name } }" }, {}, env({
      SHOPIFY_RATE_LIMITER: { limit: async () => ({ success: false }) },
    }));
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBeNull();
  });

  it("allows the request when the rate limiter binding is absent (fail-open)", async () => {
    // Pinned deliberately: a missing binding must not brick the storefront,
    // but it also means a misconfigured deploy has NO ceiling. If that ever
    // becomes fail-closed, this test is where you find out.
    vi.stubGlobal("fetch", okFetch());
    const res = await call({ query: "{ shop { name } }" });
    expect(res.status).toBe(200);
  });
});
