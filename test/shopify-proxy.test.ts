import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import handler from "../api/shopify";

// The Vercel function in api/shopify.ts is the proxy that actually runs in
// production — the Express route in server/routes.ts only serves the local
// host. It is unauthenticated and public, so its validation is the only thing
// standing between the internet and a Shopify token. These tests pin the
// behaviour that hardening added; a regression here is silent and expensive.

type Res = {
  statusCode?: number;
  body?: unknown;
  headers: Record<string, string>;
  status: (c: number) => Res;
  json: (b: unknown) => Res;
  setHeader: (k: string, v: string) => void;
};

function mockRes(): Res {
  const res = {
    headers: {} as Record<string, string>,
    status(c: number) {
      res.statusCode = c;
      return res;
    },
    json(b: unknown) {
      res.body = b;
      return res;
    },
    setHeader(k: string, v: string) {
      res.headers[k] = v;
    },
  } as Res;
  return res;
}

let ipCounter = 0;
/** Each request gets a unique IP: the rate limiter is module-level state that
 *  persists across tests in a file, so sharing an IP would make later tests
 *  fail with 429 for the wrong reason. */
function mockReq(overrides: Record<string, any> = {}): any {
  ipCounter += 1;
  return {
    method: "POST",
    headers: { host: "turathcollective.com", "x-forwarded-for": `10.0.0.${ipCounter}` },
    socket: { remoteAddress: `10.0.0.${ipCounter}` },
    body: { query: "{ shop { name } }" },
    ...overrides,
  };
}

const call = async (req: any) => {
  const res = mockRes();
  await handler(req, res as any);
  return res;
};

beforeEach(() => {
  process.env.SHOPIFY_STOREFRONT_TOKEN = "test-token";
  process.env.SHOPIFY_STORE_DOMAIN = "test.myshopify.com";
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("shopify proxy — request validation", () => {
  it("rejects non-POST", async () => {
    const res = await call(mockReq({ method: "GET" }));
    expect(res.statusCode).toBe(405);
    expect(res.headers.Allow).toBe("POST");
  });

  it("blocks schema introspection via __schema", async () => {
    const res = await call(mockReq({ body: { query: "{ __schema { types { name } } }" } }));
    expect(res.statusCode).toBe(400);
    expect(res.body).toMatchObject({ message: "Introspection is not supported" });
  });

  it("blocks schema introspection via __type", async () => {
    const res = await call(mockReq({ body: { query: '{ __type(name: "Product") { name } }' } }));
    expect(res.statusCode).toBe(400);
    expect(res.body).toMatchObject({ message: "Introspection is not supported" });
  });

  it("rejects an oversized query", async () => {
    const res = await call(mockReq({ body: { query: "q".repeat(20_001) } }));
    expect(res.statusCode).toBe(400);
    expect(res.body).toMatchObject({ message: "Invalid GraphQL query" });
  });

  it("accepts a query at exactly the size limit", async () => {
    // Boundary: 20_000 is allowed, 20_001 is not.
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ status: 200, json: async () => ({ data: {} }) }),
    );
    const res = await call(mockReq({ body: { query: "q".repeat(20_000) } }));
    expect(res.statusCode).toBe(200);
  });

  it.each([
    ["a non-object body", "string body"],
    ["an array body", [{ query: "{}" }]],
    ["a null body", null],
  ])("rejects %s", async (_label, body) => {
    const res = await call(mockReq({ body }));
    expect(res.statusCode).toBe(400);
  });

  it("rejects a missing or non-string query", async () => {
    expect((await call(mockReq({ body: {} }))).statusCode).toBe(400);
    expect((await call(mockReq({ body: { query: 42 } }))).statusCode).toBe(400);
    expect((await call(mockReq({ body: { query: "" } }))).statusCode).toBe(400);
  });

  it("rejects non-object variables and non-string operationName", async () => {
    expect(
      (await call(mockReq({ body: { query: "{a}", variables: [1, 2] } }))).statusCode,
    ).toBe(400);
    expect(
      (await call(mockReq({ body: { query: "{a}", operationName: 7 } }))).statusCode,
    ).toBe(400);
  });
});

describe("shopify proxy — origin enforcement", () => {
  it.each([
    "https://turathcollective.com",
    "https://www.turathcollective.com",
    "https://preview.vercel.app",
    "http://localhost:5000",
  ])("allows %s", async (origin) => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ status: 200, json: async () => ({ data: {} }) }),
    );
    const res = await call(mockReq({ headers: { host: "turathcollective.com", origin } }));
    expect(res.statusCode).not.toBe(403);
  });

  it("blocks a foreign browser origin", async () => {
    const res = await call(
      mockReq({ headers: { host: "turathcollective.com", origin: "https://evil.example" } }),
    );
    expect(res.statusCode).toBe(403);
  });

  it("allows a caller that sends no Origin (non-browser)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ status: 200, json: async () => ({ data: {} }) }),
    );
    const res = await call(mockReq());
    expect(res.statusCode).not.toBe(403);
  });
});

describe("shopify proxy — credentials and upstream", () => {
  it("returns the 503 shape the client keys off when credentials are missing", async () => {
    delete process.env.SHOPIFY_STOREFRONT_TOKEN;
    const res = await call(mockReq());
    expect(res.statusCode).toBe(503);
    // The client checks `shopifyDisabled` to fall back — this shape is API.
    expect(res.body).toMatchObject({ shopifyDisabled: true });
  });

  it("forwards ONLY the validated fields, never the raw body", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ status: 200, json: async () => ({ data: { ok: true } }) });
    vi.stubGlobal("fetch", fetchMock);

    await call(
      mockReq({
        body: {
          query: "{ shop { name } }",
          variables: { a: 1 },
          operationName: "Shop",
          // A hostile extra field must not reach Shopify.
          smuggled: "should-not-be-forwarded",
        },
      }),
    );

    const sent = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sent).toEqual({
      query: "{ shop { name } }",
      variables: { a: 1 },
      operationName: "Shop",
    });
    expect(sent).not.toHaveProperty("smuggled");
  });

  it("does not leak the storefront token in the response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ status: 200, json: async () => ({ data: {} }) }),
    );
    const res = await call(mockReq());
    expect(JSON.stringify(res.body ?? "")).not.toContain("test-token");
  });

  it("maps an upstream timeout to 504 and any other failure to 502", async () => {
    const abort = Object.assign(new Error("aborted"), { name: "AbortError" });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(abort));
    expect((await call(mockReq())).statusCode).toBe(504);

    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    expect((await call(mockReq())).statusCode).toBe(502);
  });
});

describe("shopify proxy — rate limiting", () => {
  it("429s after the per-IP ceiling and sets Retry-After", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ status: 200, json: async () => ({ data: {} }) }),
    );
    const ip = "203.0.113.99";
    const req = () => ({
      method: "POST",
      headers: { host: "turathcollective.com", "x-forwarded-for": ip },
      socket: { remoteAddress: ip },
      body: { query: "{ shop { name } }" },
    });

    let limited: Res | undefined;
    for (let i = 0; i < 62; i += 1) {
      const res = await call(req());
      if (res.statusCode === 429) {
        limited = res;
        break;
      }
    }

    expect(limited, "expected the 60-request ceiling to trip").toBeDefined();
    expect(limited!.headers["Retry-After"]).toBe("60");
  });
});
