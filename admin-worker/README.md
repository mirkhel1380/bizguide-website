# BizGuide Admin Worker — protected staging source

This directory contains the **GitHub source candidate** for a protected admin Cloudflare Worker. It is **not the same artifact as the currently deployed** `bizguide-admin-api` Worker, which was created and edited in the Cloudflare dashboard. Do not deploy or connect automated builds until the existing live code and settings have been backed up and checked for parity.

## Implemented features in this source

- Verify Cloudflare Access JWT signature, issuer, audience, and exact admin email (fail closed).
- List at most 50 orders from D1, including aggregated service codes; optional whitelisted status filter.
- Show per-order audit history using `GET /api/admin/order-history?id=...`.
- Manual staff `quote_requested` / `review_required` transitions only via `POST /api/admin/review-status`, behind `ENABLE_STAFF_REVIEW_CHANGES=true`.
- Generate **test-only** order records (IDs prefixed `DEMO-`) via `POST /api/admin/create-order`, behind `ENABLE_DEMO_ORDERS=true`. Never creates payments, filings, or real customer orders.
- Staff quote drafts via `POST /api/admin/quote-drafts`, behind `ENABLE_STAFF_QUOTE_DRAFTS=true`; disabled for initial deployment.
- All routes require verified admin Cloudflare Access authentication. Write endpoints require same-origin JSON requests.

### Read-only routes

`GET /admin`, `GET /api/admin/health`, `GET /api/admin/orders`, `GET /api/admin/order-history`.

### Write routes

`POST /api/admin/review-status`, `POST /api/admin/create-order`, `POST /api/admin/quote-drafts` — all feature-gated as noted above.

## Current deployment blockers

1. The Cloudflare-deployed Worker has not been backed up or compared with this source, so an overwrite could remove live features.
2. There is deliberately **no active `wrangler.jsonc`**. `wrangler.example.jsonc` is a non-deployable template with placeholder routes and Access settings.
3. Existing Cloudflare Access **All traffic** protection and MFA, the D1 `DB` binding, and live Worker variables must be preserved.
4. A production deploy from the GitHub repository root would target the wrong directory. See [DEPLOYMENT_HANDOFF.md](DEPLOYMENT_HANDOFF.md).
5. Do not put SSNs, sensitive identity documents, passwords, cards, RAI credentials, or customer information into GitHub, D1 demo forms, or tickets. No actual fulfillment/payment automation is included.

## Developer validation

From `admin-worker/`: run `npm install` then `npm test` for local tests. CI runs the security/test suite on GitHub. Tests do not prove the deployed Cloudflare Worker is identical to this source.

This GitHub project also hosts a public static website; protected administrative content must stay on Cloudflare Access-protected Worker routes.
