/**
 * BizGuide admin API starter — NOT DEPLOYED.
 * Read-only orders, gated by a verified Cloudflare Access JWT.
 * No payment endpoints, order mutations, RAI requests or customer PII.
 */
import { createRemoteJWKSet, jwtVerify } from "jose";
import { dashboardHtml } from "./dashboard.js";

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer"
  }
});
const reject = (status) => json({ error: status === 403 ? "Forbidden" : "Unauthorized" }, status);

async function authorized(request, env) {
  // Fail closed unless ALL administrative configuration is populated.
  const team = env.CF_ACCESS_TEAM_DOMAIN;
  const audience = env.CF_ACCESS_AUD;
  const allowedEmail = env.ADMIN_EMAIL;
  if (!team || !audience || !allowedEmail || !/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(team)) return false;
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token) return false;
  try {
    const jwks = createRemoteJWKSet(new URL(team + "/cdn-cgi/access/certs"));
    const { payload } = await jwtVerify(token, jwks, {
      issuer: team,
      audience,
      algorithms: ["RS256"]
    });
    // Access policy must separately restrict users to admin(s).
    return typeof payload.email === "string" &&
      payload.email.toLowerCase() === allowedEmail.toLowerCase();
  } catch {
    return false;
  }
}

export default {
  async fetch(request, env) {
    // No Access means no admin functionality.
    if (!(await authorized(request, env))) return reject(401);
    const url = new URL(request.url);
    if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);
    if (url.pathname === "/admin" || url.pathname === "/admin/") {
      return new Response(dashboardHtml, { headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",
        "Referrer-Policy": "no-referrer"
      } });
    }
    if (url.pathname === "/api/admin/health") {
      return json({ ok: true, mode: "read-only", liveOrdersEnabled: false });
    }
    if (url.pathname !== "/api/admin/orders") return json({ error: "Not found" }, 404);
    if (!env.DB) return json({ error: "Database not configured" }, 503);
    const allowedStatuses = new Set([
      "draft", "quote_requested", "quoted", "customer_accepted",
      "payment_pending", "paid_verified", "review_required",
      "submitted_to_provider", "processing", "complete", "cancelled", "refunded"
    ]);
    const status = url.searchParams.get("status");
    if (status && !allowedStatuses.has(status)) return json({ error: "Invalid status" }, 400);
    const query = status
      ? env.DB.prepare("SELECT id, state_code, company_status, status, currency, quoted_total_cents, created_at FROM orders WHERE status = ? ORDER BY created_at DESC LIMIT 50").bind(status)
      : env.DB.prepare("SELECT id, state_code, company_status, status, currency, quoted_total_cents, created_at FROM orders ORDER BY created_at DESC LIMIT 50");
    try {
      const { results = [] } = await query.all();
      return json({ orders: results, mode: "read-only" });
    } catch {
      return json({ error: "Orders are not ready" }, 503);
    }
  }
};
