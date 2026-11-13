/**
 * BizGuide admin API starter — NOT DEPLOYED.
 * Protected order metadata, audit history, and feature-gated staff-only actions.
 * No payment endpoints, RAI requests, or customer PII.
 */
import { createRemoteJWKSet, jwtVerify } from "jose";
import { dashboardHtml } from "./dashboard.js";
import { allowedStatuses, listOrders } from "./orders.js";
import { saveQuoteDraft } from "./quote-drafts.js";
import { changeReviewStatus } from "./review-status.js";
import { parseAdminQuoteRequest } from "./admin-quote-request.js";

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
    if (url.pathname === "/api/admin/review-status" && request.method === "POST") {
      if (env.ENABLE_STAFF_REVIEW_CHANGES !== "true") return json({error:"Not enabled"},503);
      if (!env.DB) return json({error:"Database not configured"},503);
      if (request.headers.get("Origin") !== url.origin ||
          request.headers.get("Content-Type")?.split(";")[0].trim().toLowerCase() !== "application/json")
        return json({error:"Same-origin JSON required"},403);
      if (Number(request.headers.get("Content-Length") || 0) > 512)
        return json({error:"Request too large"},413);
      let input;
      try {
        const raw=await request.text();
        if (raw.length>512) return json({error:"Request too large"},413);
        input=JSON.parse(raw);
        if (!input || typeof input!=="object" || Array.isArray(input) ||
            Object.keys(input).sort().join(",")!=="fromStatus,orderId,toStatus")
          return json({error:"Invalid request"},400);
      } catch { return json({error:"Invalid request"},400); }
      try {
        const result=await changeReviewStatus(env.DB,input.orderId,input.fromStatus,input.toStatus);
        return result.changed ? json(result) : json({error:"Order status changed or order not found"},409);
      } catch(e) {
        if(e instanceof TypeError) return json({error:"Invalid transition"},400);
        return json({error:"Unable to update order"},503);
      }
    }
    if (url.pathname === "/api/admin/quote-drafts" && request.method === "POST") {
      // Explicitly disabled until staff identity, Access and D1 have been deployed and reviewed.
      if (env.ENABLE_STAFF_QUOTE_DRAFTS !== "true") return json({ error: "Not enabled" }, 503);
      if (!env.DB) return json({ error: "Database not configured" }, 503);
      const parsed = await parseAdminQuoteRequest(request);
      if (parsed.error) return json({ error: parsed.error }, parsed.status);
      try {
        const result = await saveQuoteDraft(env.DB, parsed.quote);
        return json(result, 201);
      } catch {
        return json({ error: "Unable to save quote draft" }, 503);
      }
    }
    if (url.pathname === "/api/admin/create-order" && request.method === "POST") {
      // Safely scoped to DEMO records, disabled by default. Never accepts identity or payment data.
      if (env.ENABLE_DEMO_ORDERS !== "true") return json({error:"Demo creation disabled"},503);
      if (!env.DB) return json({error:"Database unavailable"},503);
      const contentType=request.headers.get("Content-Type")?.split(";")[0]?.trim().toLowerCase();
      if (request.headers.get("Origin") !== url.origin || contentType !== "application/json")
        return json({error:"Same-origin JSON required"},403);
      if (Number(request.headers.get("Content-Length") || 0) > 512)
        return json({error:"Request too large"},413);
      let input;
      try {
        const raw=await request.text();
        if (raw.length>512) return json({error:"Request too large"},413);
        input=JSON.parse(raw);
      } catch { return json({error:"Invalid JSON"},400); }
      if (!input || typeof input!=="object" || Array.isArray(input) ||
          Object.keys(input).sort().join(",")!=="service,state" ||
          !["llc_formation","registered_agent","ein_with_ssn","ein_without_ssn"].includes(input.service) ||
          !["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"].includes(input.state))
        return json({error:"Invalid selections"},400);
      const id="DEMO-"+crypto.randomUUID();
      try {
        await env.DB.batch([
          env.DB.prepare("INSERT INTO orders (id, state_code, company_status, status) VALUES (?, ?, 'unsure', 'quote_requested')").bind(id,input.state),
          env.DB.prepare("INSERT INTO order_services (order_id, service_code) VALUES (?, ?)").bind(id,input.service),
          env.DB.prepare("INSERT INTO order_audit (order_id, actor_type, action, to_status) VALUES (?, 'staff', 'demo_created', 'quote_requested')").bind(id)
        ]);
        return json({id,status:"quote_requested"},201);
      } catch { return json({error:"Unable to create demo order"},503); }
    }
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
      if (!env.DB) return json({ error: "Database unavailable" }, 503);
      try {
        const count = await env.DB.prepare("SELECT COUNT(*) AS total FROM orders").first();
        return json({service:"BizGuide Admin", database:"connected", orders:count?.total ?? 0});
      } catch { return json({error:"Database error"},503); }
    }
    if (url.pathname === "/api/admin/order-history") {
      if (!env.DB) return json({error:"Database unavailable"},503);
      const id=url.searchParams.get("id");
      if (!id || !/^[a-zA-Z0-9-]{1,64}$/.test(id)) return json({error:"Invalid order ID"},400);
      try {
        const {results=[]}=await env.DB.prepare(
          "SELECT action, actor_type, from_status, to_status, created_at FROM order_audit WHERE order_id = ? ORDER BY id DESC LIMIT 50"
        ).bind(id).all();
        return json({history:results});
      } catch { return json({error:"History unavailable"},503); }
    }
    if (url.pathname !== "/api/admin/orders") return json({ error: "Not found" }, 404);
    if (!env.DB) return json({ error: "Database not configured" }, 503);
    const status = url.searchParams.get("status");
    if (status && !allowedStatuses.has(status)) return json({ error: "Invalid status" }, 400);
    try {
      const results = await listOrders(env.DB, status);
      return json({ orders: results });
    } catch {
      return json({ error: "Orders are not ready" }, 503);
    }
  }
};
