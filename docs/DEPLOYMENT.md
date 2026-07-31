# Deployment

> How the ML Cosmetics frontend ships.

---

## 1. Build

```bash
npm ci
npm run build
```

Outputs to `.next/`. The build:

- Compiles all routes (admin + storefront).
- Generates static params for the storefront where possible.
- Emits the route manifest with bundle sizes per page.

The backend (Go + Gin) is its own deployable in `../backend`. The two
are deployed independently — the frontend never embeds backend
binaries.

---

## 2. Environment variables

| Name                            | Required | Notes                                          |
| ------------------------------- | -------- | ---------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`      | yes      | Backend origin, e.g. `https://api.mlcosmetics.vn` |
| `NEXT_PUBLIC_SITE_URL`          | yes      | Public storefront origin, used by sitemap       |

All `NEXT_PUBLIC_*` are inlined into the client bundle — never put a
secret in one. The backend CORS layer must allow this origin.

---

## 3. Recommended hosting

- **Vercel** — zero-config Next.js. Use the production branch as the
  default deployment, PR previews for staging.
- **Self-hosted (Docker)** — `Dockerfile` exists in the repo root;
  build with `next build` and serve with `next start` behind nginx.

---

## 4. Headers

Recommended response headers (configured at the edge):

| Header                              | Value                                                              |
| ----------------------------------- | ------------------------------------------------------------------ |
| `Strict-Transport-Security`         | `max-age=63072000; includeSubDomains; preload`                     |
| `X-Content-Type-Options`            | `nosniff`                                                          |
| `Referrer-Policy`                   | `strict-origin-when-cross-origin`                                  |
| `X-Frame-Options`                   | `DENY` (or `SAMEORIGIN` if you need to embed admin in an iframe)   |
| `Permissions-Policy`                | `camera=(), microphone=(), geolocation=()`                         |
| `Content-Security-Policy`           | tighten per deployment; current dev defaults are permissive        |

---

## 5. Cache strategy

| Path pattern              | Cache                                              |
| ------------------------- | -------------------------------------------------- |
| `/_next/static/*`         | Immutable, 1 year                                  |
| `/sitemap.xml`, `/robots.txt` | `s-maxage=3600, stale-while-revalidate=86400`   |
| Storefront pages          | `s-maxage=60, stale-while-revalidate=600`          |
| `/admin/*`                | `no-store` (always fresh)                          |
| `/login`                  | `no-store`                                         |

---

## 6. Observability

- Errors bubble to `app/error.tsx` which logs them with
  `console.error("[root-error-boundary]", error)`. In production,
  swap this for your observability backend (Sentry, Datadog, etc.).
- API errors come back as `APIError` with a typed `code` field; route
  them by code in your error tracker.
- No PII, tokens, or secrets are logged.

---

## 7. Release checklist

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] Smoke test `/admin/...` pages against staging backend
- [ ] Smoke test storefront pages
- [ ] Verify sitemap.xml + robots.txt
- [ ] Verify CSP does not break the contact map embed
- [ ] Verify 401 → /login redirect after token expiry
- [ ] Tag the release in git