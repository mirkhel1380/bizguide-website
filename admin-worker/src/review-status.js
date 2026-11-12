// Staff-only manual review transition; payment statuses are deliberately excluded.
// The Worker must verify the signed Access JWT before calling this function.
const transitions = new Map([
  ["quote_requested", "review_required"],
  ["review_required", "quote_requested"]
]);

export async function changeReviewStatus(db, orderId, fromStatus, toStatus) {
  if (!db || typeof db.batch !== "function") throw Error("Database unavailable");
  if (typeof orderId !== "string" || !/^[a-zA-Z0-9-]{1,64}$/.test(orderId))
    throw new TypeError("Invalid order identifier");
  if (transitions.get(fromStatus) !== toStatus)
    throw new TypeError("Invalid transition");
  const audit = db.prepare(
    "INSERT INTO order_audit (order_id, actor_type, action, from_status, to_status) " +
    "SELECT id, 'staff', 'manual_review_transition', ?, ? FROM orders WHERE id = ? AND status = ?"
  ).bind(fromStatus, toStatus, orderId, fromStatus);
  const update = db.prepare(
    "UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = ?"
  ).bind(toStatus, orderId, fromStatus);
  const results = await db.batch([audit, update]);
  // D1 batch is transactional. Check the conditional update result.
  if (results?.[1]?.meta?.changes !== 1)
    return {changed:false};
  return {changed:true, id:orderId, status:toStatus};
}
