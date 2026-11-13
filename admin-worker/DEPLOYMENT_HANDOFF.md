# BizGuide GitHub → Cloudflare Worker build handoff

**STATUS: PREPARATION ONLY — DO NOT CONNECT / DEPLOY YET.**

Existing live Worker: `bizguide-admin-api`, built manually in Cloudflare, with a working /admin dashboard, a D1 binding named `DB` and an Access policy on all traffic.

Source code: `admin-worker/src/index.js` in branch `feature/wholesale-services-preview`.

Cloudflare builds support the following settings:
- **Git repository:** `mirkhel1380/bizguide-website`
- **Production branch:** `feature/wholesale-services-preview` (temporary development branch)
- **Build command:** `npm install --prefix admin-worker --no-audit --no-fund`
- **Deploy command:** `cd admin-worker && npx wrangler deploy --config wrangler.jsonc`
- **Preview builds:** disabled until staging and Access policy are reviewed

**IMPORTANT BLOCKERS:**
1. `admin-worker/wrangler.jsonc` is intentionally **not present**. Do not replace it with `wrangler.example.jsonc` unedited. Its route/team/audience/email placeholders must be replaced after a deliberate domain and security review.
2. The GitHub Worker now has corresponding order-list, history, demo-order and review endpoints, but it has **not been tested against the deployed Worker**. Its staff review writes and demo writes remain disabled by default and its UI differs from the deployed one. Deploying it now can remove current live features.
3. Running `wrangler deploy` could alter runtime variables and bindings. Preserve existing verified Cloudflare Access (All traffic and MFA), D1 binding, and admin identity.
4. Use `npx wrangler deploy --dry-run --config wrangler.jsonc` from `admin-worker` before the first deployment and review output. A dry run is not a security or production test.
5. The GitHub repository also hosts the public BizGuide website. Never run `npx wrangler deploy` from the repository root without an explicit config path.
6. A Worker configured with a protected custom admin hostname differs from the currently protected `workers.dev` URL; do not replace active routing without a tested migration.

Until these blockers are resolved, leave Cloudflare's **Connect to a repository** screen unsaved. The existing Worker remains the active version.

After a verified parity test, make an approved single production deploy, check /admin, /api/admin/orders and /api/admin/order-history, ensure unauthorized requests are rejected, and only then enable future automatic deploys.

## Confirmed status (2026-11-13)

- GitHub security/unit tests previously passed. Current additions need their own CI result before release.
- D1 has been created manually and a sample order is visible in the manually deployed Cloudflare Worker.
- **No deploy authorization is implied by pushing to the feature branch.** Do not activate automatic GitHub deploy until parity is checked and rollback is prepared.
