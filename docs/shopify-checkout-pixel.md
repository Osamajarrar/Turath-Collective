# PostHog on the Shopify checkout (custom web pixel)

The storefront is headless, so checkout happens on `checkout.turathcollective.com`,
which is Shopify-hosted — our app code never runs there. The only supported way to
track it is a **Shopify custom web pixel**, which runs in a sandboxed iframe on the
checkout pages and subscribes to Shopify's event stream.

This doc contains the paste-ready pixel code and how it connects to the storefront's
consent + identity systems.

## How the pieces fit

| Problem | Solution |
|---|---|
| Our code can't run on checkout | Shopify custom pixel (Settings → Customer events) |
| Pixel sandbox would mint a new anonymous ID, breaking the funnel | Bootstrap PostHog with the `distinct_id`/session read from the storefront's PostHog cookie — readable because posthog-js sets it on `.turathcollective.com` and the pixel's `browser.cookie` API proxies the top frame |
| Consent banner stores its decision in localStorage, which does NOT cross subdomains | `client/src/lib/consent.ts` mirrors the decision into a `turath-consent` cookie on `.turathcollective.com`; the pixel checks it and fails closed (no consent cookie → no tracking) |
| Shopify's pixel editor rejects top-level `await` ("missing semicolon" errors) | All code lives inside an `async` event callback — no top-level `await` |

PostHog's own guidance: use the pixel **for conversion tracking only** (other event
types from inside the sandbox can hit CORS issues). The storefront already captures
`add_to_cart` and `begin_checkout`; the pixel adds the missing end of the funnel.

## Setup (Shopify admin — one-time)

1. Shopify admin → **Settings → Customer events → Add custom pixel**.
2. Name it `PostHog checkout` and paste the code below.
3. Replace `phc_YOUR_PROJECT_KEY` with the real project API key (same value as
   `VITE_POSTHOG_KEY`; it is a public key, safe to embed).
4. In the pixel's **Customer privacy** settings, set permissions to **not required**
   — consent is enforced by the `turath-consent` cookie check inside the code
   (Shopify's own consent signals aren't wired to our headless banner, so leaving
   them "required" would silently block the pixel forever).
5. **Save** and **Connect**.

## Pixel code

```js
// Turath Collective — PostHog checkout conversion pixel.
// Consent: only runs when the storefront banner set turath-consent=granted
// (mirrored cookie from client/src/lib/consent.ts). Fails closed otherwise.
const POSTHOG_KEY = "phc_YOUR_PROJECT_KEY";
const POSTHOG_HOST = "https://us.i.posthog.com";

analytics.subscribe("checkout_completed", async (event) => {
  // 1. Honor the storefront consent decision (PIPEDA / Quebec Law 25 opt-in).
  const consent = await browser.cookie.get("turath-consent");
  if (consent !== "granted") return;

  // 2. Reuse the storefront visitor's identity so the funnel stays stitched
  //    (the sandbox has no access to the storefront's PostHog storage, but the
  //    cookie posthog-js set on .turathcollective.com is readable here).
  const bootstrap = {};
  try {
    const raw = await browser.cookie.get("ph_" + POSTHOG_KEY + "_posthog");
    if (raw) {
      const parsed = JSON.parse(decodeURIComponent(raw));
      if (parsed.distinct_id) bootstrap.distinctID = parsed.distinct_id;
      if (parsed.$sesid && parsed.$sesid[1]) bootstrap.sessionID = parsed.$sesid[1];
    }
  } catch (e) {
    // Cookie missing/unreadable — fall back to a fresh ID rather than dropping
    // the conversion entirely.
  }

  // 3. Load posthog-js (PostHog's official loader snippet, verbatim).
  !(function (t, e) {
    var o, n, p, r;
    e.__SV ||
      ((window.posthog = e),
      (e._i = []),
      (e.init = function (i, s, a) {
        function g(t, e) {
          var o = e.split(".");
          (2 == o.length && ((t = t[o[0]]), (e = o[1])),
            (t[e] = function () {
              t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
            }));
        }
        (((p = t.createElement("script")).type = "text/javascript"),
          (p.crossOrigin = "anonymous"),
          (p.async = !0),
          (p.src = s.api_host + "/static/array.js"),
          (r = t.getElementsByTagName("script")[0]).parentNode.insertBefore(p, r));
        var u = e;
        for (
          void 0 !== a ? (u = e[a] = []) : (a = "posthog"),
            u.people = u.people || [],
            u.toString = function (t) {
              var e = "posthog";
              return ("posthog" !== a && (e += "." + a), t || (e += " (stub)"), e);
            },
            u.people.toString = function () {
              return u.toString(1) + ".people (stub)";
            },
            o =
              "capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagResult reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys getNextSurveyStep onSessionId".split(
                " ",
              ),
            n = 0;
          n < o.length;
          n++
        )
          g(u, o[n]);
        e._i.push([i, s, a]);
      }),
      (e.__SV = 1));
  })(document, window.posthog || []);

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    persistence: "memory", // sandbox storage is throwaway; identity comes from bootstrap
    bootstrap: bootstrap,
    capture_pageview: false,
    autocapture: false,
  });

  // 4. Capture the conversion.
  const checkout = event.data.checkout;
  posthog.capture("purchase", {
    order_id: checkout.order && checkout.order.id,
    value: checkout.totalPrice && checkout.totalPrice.amount,
    currency: checkout.currencyCode,
    num_items: checkout.lineItems ? checkout.lineItems.length : 0,
    products: (checkout.lineItems || []).map(function (item) {
      return {
        title: item.title,
        quantity: item.quantity,
        price: item.variant && item.variant.price && item.variant.price.amount,
        sku: item.variant && item.variant.sku,
      };
    }),
  });
});
```

## Verifying it works

1. On the storefront, accept analytics in the consent banner, add a product to the
   cart, and go to checkout. Complete a test order (the Shopify dev-store password
   page currently blocks real checkout — use Shopify's test/bogus payment gateway
   once checkout is reachable).
2. In PostHog → Activity, look for a `purchase` event. Its distinct ID should match
   the storefront session's (check any `add_to_cart` event from the same run) —
   that confirms the funnel is stitched.
3. Repeat in a fresh browser profile WITHOUT accepting the banner: no `purchase`
   event should appear (and no PostHog requests fire from checkout — verify in the
   network tab filtered to `posthog`).

## Honesty/compliance notes

- The pixel is consent-gated by us, not by Shopify — do not remove the
  `turath-consent` check even if conversion counts look low.
- The privacy policy should mention that checkout runs on Shopify and that, with
  analytics consent, order conversion is measured (follow-up flagged in PR #11).
- If PostHog captures still show zero after setup, re-check the dashboard
  quota/billing issue first (`plans/01-posthog-capture-debug.md`).
