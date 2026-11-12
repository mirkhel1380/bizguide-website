# BizGuide — Cloudflare D1 setup (NOT DEPLOYED)

This is the next manual deployment step for the owner. The GitHub repository is static and **does not** provide Cloudflare account access. These commands have **not** been run against the owner's Cloudflare account.

## 1. Create database in your own Cloudflare account

From the repository's `admin-worker` directory after installing Node.js:

```sh
npm install
npx wrangler login
npx wrangler d1 create bizguide-orders
```

Copy the **real** D1 database UUID returned by Cloudflare. Never put API tokens or passwords into GitHub.

## 2. Configure locally; keep placeholders out of production

Copy `admin-worker/wrangler.example.jsonc` to `admin-worker/wrangler.jsonc` and replace:

- `database_id` with the new D1 database UUID.
- `CF_ACCESS_TEAM_DOMAIN` with your **own** Access team URL.
- `CF_ACCESS_AUD` with the actual Cloudflare Access application AUD.
- `ADMIN_EMAIL` with the authorized operator's email.

Do **not** deploy yet. Before deployment, create a Cloudflare Access application and restrict access to that one administrator with MFA; verify the route is guarded. Do not treat a web page, guessed JWT, or unsigned email header as authentication.

Do not expose the configured admin Worker on a public workers.dev subdomain without Access protection. Set `workers_dev: false` (already in the template) and plan a custom protected domain/route.

## 3. Local database smoke check (no production charges or writes)

From `admin-worker`:

```sh
npx wrangler d1 migrations apply bizguide-orders --local --config wrangler.jsonc
npx wrangler d1 execute bizguide-orders --local --config wrangler.jsonc --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
```

Only after local tests and a backup/rollback plan: apply the migration to **remote** D1. Explicitly choose `--remote`:

```sh
npx wrangler d1 migrations apply bizguide-orders --remote --config wrangler.jsonc
```

Note: Running the remote command changes the account's real database. Review the schema and correct account before doing it.

## 4. Safeguards required before serving orders

- Configure an Access-protected admin hostname; test unauthorized access gets denied.
- Add real staff sign-in, account recovery procedures and least-privilege policy.
- Install and run Worker tests: `npm run check && npm test`.
- Confirm D1 binding `DB` is present. Without a binding, requests are denied/fail safely.
- No customer orders should be collected until secure request APIs, retention/privacy rules and an authorized payment webhook are implemented.
- Customer SSNs, passports, tax IDs and card data must **not** be put into this D1 order-metadata schema.
- **Manual RAI fulfillment** needs no RAI API credentials.

## Current status

- D1 schema and its SQLite tests exist on the preview branch.
- Live GitHub Pages quote and order pages remain non-operational previews.
- **No Cloudflare D1 database, Access application, Worker route or production connection was created by this change.**
