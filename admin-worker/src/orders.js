// DB boundary: read-only queries and strict whitelisted filters.
export const allowedStatuses = new Set([
  "draft", "quote_requested", "quoted", "customer_accepted",
  "payment_pending", "paid_verified", "review_required",
  "submitted_to_provider", "processing", "complete", "cancelled", "refunded"
]);

const columns = "id, state_code, company_status, status, currency, quoted_total_cents, created_at";
export async function listOrders(db, status) {
  if (!db || typeof db.prepare !== "function") throw new Error("Database unavailable");
  if (status && !allowedStatuses.has(status)) throw new RangeError("Invalid status");
  const sql = `SELECT ${columns} FROM orders` +
    (status ? " WHERE status = ?" : "") +
    " ORDER BY created_at DESC LIMIT 50";
  const stmt = db.prepare(sql);
  const { results = [] } = await (status ? stmt.bind(status) : stmt).all();
  return results;
}
