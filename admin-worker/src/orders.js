// DB boundary: read-only queries and strict whitelisted filters.
export const allowedStatuses = new Set([
  "draft", "quote_requested", "quoted", "customer_accepted",
  "payment_pending", "paid_verified", "review_required",
  "submitted_to_provider", "processing", "complete", "cancelled", "refunded"
]);

const columns = "o.id, o.state_code, o.company_status, o.status, o.currency, o.quoted_total_cents, o.created_at, " +
  "(SELECT GROUP_CONCAT(s.service_code, ', ') FROM order_services s WHERE s.order_id = o.id) AS services";
export async function listOrders(db, status) {
  if (!db || typeof db.prepare !== "function") throw new Error("Database unavailable");
  if (status && !allowedStatuses.has(status)) throw new RangeError("Invalid status");
  const sql = `SELECT ${columns} FROM orders o` +
    (status ? " WHERE o.status = ?" : "") +
    " ORDER BY o.created_at DESC LIMIT 50";
  const stmt = db.prepare(sql);
  const { results = [] } = await (status ? stmt.bind(status) : stmt).all();
  return results;
}
