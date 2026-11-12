/**
 * Draft quote persistence only; intentionally NOT connected to a public endpoint.
 * Caller must authenticate, authorize, rate-limit and enforce anti-abuse rules
 * before calling this helper. No identity information or payment data accepted.
 */
import { validateQuoteRequest } from "./quote-validation.js";

export async function saveQuoteDraft(db, input, id = crypto.randomUUID()) {
  const quote = validateQuoteRequest(input);
  if (!db || typeof db.batch !== "function") throw new Error("Database unavailable");
  if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    throw new TypeError("Invalid order identifier");
  }
  // D1 batch executes statements transactionally. No client-supplied price or identity fields.
  const statements = [
    db.prepare("INSERT INTO orders (id, state_code, company_status, status) VALUES (?, ?, ?, 'quote_requested')")
      .bind(id, quote.state, quote.companyStatus),
    ...quote.services.map(service =>
      db.prepare("INSERT INTO order_services (order_id, service_code) VALUES (?, ?)").bind(id, service)
    ),
    db.prepare("INSERT INTO order_audit (order_id, actor_type, action, to_status) VALUES (?, 'system', 'quote_requested', 'quote_requested')")
      .bind(id)
  ];
  await db.batch(statements);
  return { id, status: "quote_requested" };
}
