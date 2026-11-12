# BizGuide Admin API — starter (NOT DEPLOYED)

This directory contains an **admin-only, read-only** Cloudflare Worker starter. It is not connected to the live website and it is **not a production-ready order-management system**.

## Purpose

- Enforce Cloudflare Access JWT verification (signature / issuer / audience).
- Require a configured admin email in the signed JWT.
- Read a **limited metadata-only** order list from Cloudflare D1.
- Reject all POST/PUT/PATCH/DELETE methods.
- Keep all payment processing, customer personal information and RAI credentials out of scope.

## Prerequisites for later deployment

1. Create a separate Worker route / hostname protected by **Cloudflare Access** with an identity-restricted policy and MFA.
2. Bind a Cloudflare D1 database to Worker variable `DB` and apply `migrations/0001_orders.sql` after review.
3. Configure Worker environment values (never commit account identifiers or secrets):
   - `CF_ACCESS_TEAM_DOMAIN` e.g. `https://your-team.cloudflareaccess.com` (without trailing slash)
   - `CF_ACCESS_AUD` Cloudflare Access application audience
   - `ADMIN_EMAIL` the single allowed admin identity
4. Install dependencies with `npm install`; test with `npm run check`. Review and pin dependencies before real deployment.
5. Add network restrictions, security testing, audit logging, and production environment configuration before turning on real orders.

Routes (both protected; `GET` only): `/api/admin/health`, `/api/admin/orders` (optional `?status=` filter).

**Important:** Never use a public GitHub Pages page to hold customer data. The previous `order-operations-preview.html` remains fictional and separate. Do not provide Access tokens, credentials or customer records in chat. Do not deploy this code until identity and DB configuration are reviewed.
