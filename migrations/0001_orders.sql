-- BizGuide Wholesale | Cloudflare D1 | Initial schema (NOT DEPLOYED)
-- This migration creates internal order metadata only; never store SSNs, DOBs,
-- card numbers, passwords, passport scans, or full filing forms here.
-- Access must be restricted to server-side authenticated authorization.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  state_code TEXT NOT NULL CHECK (length(state_code) = 2),
  company_status TEXT NOT NULL CHECK (company_status IN ('not_formed','formed','unsure')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft','quote_requested','quoted','customer_accepted',
    'payment_pending','paid_verified','review_required',
    'submitted_to_provider','processing','complete','cancelled','refunded'
  )),
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency = 'USD'),
  -- All amounts in integer cents. Final quotes must verify state fees and bundling.
  service_fee_cents INTEGER CHECK (service_fee_cents IS NULL OR service_fee_cents >= 0),
  government_fee_cents INTEGER CHECK (government_fee_cents IS NULL OR government_fee_cents >= 0),
  quoted_total_cents INTEGER CHECK (quoted_total_cents IS NULL OR quoted_total_cents >= 0),
  provider_reference TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_services (
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  service_code TEXT NOT NULL CHECK (service_code IN (
    'llc_formation','registered_agent','ein_with_ssn','ein_without_ssn'
  )),
  PRIMARY KEY (order_id, service_code)
);

-- This table is written ONLY by a verified server-side payment webhook.
-- A redirect or user-submitted payment status is never sufficient proof.
CREATE TABLE IF NOT EXISTS payment_events (
  provider_event_id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id),
  payment_provider TEXT NOT NULL,
  payment_reference TEXT NOT NULL,
  event_type TEXT NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  currency TEXT NOT NULL CHECK (currency = 'USD'),
  verified_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Human actions and automated system transitions require an audit trail.
CREATE TABLE IF NOT EXISTS order_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL REFERENCES orders(id),
  actor_type TEXT NOT NULL CHECK (actor_type IN ('customer','staff','system','payment_webhook')),
  action TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at);
CREATE INDEX IF NOT EXISTS idx_payment_events_order ON payment_events(order_id);
CREATE INDEX IF NOT EXISTS idx_order_audit_order ON order_audit(order_id, created_at);

-- Next prerequisites before any real storage:
-- 1) Deploy a protected Cloudflare Worker and D1 database.
-- 2) Implement server-side admin/customer authorization and least privilege.
-- 3) Implement authenticated quotes, input validation, and legal consent.
-- 4) Verify payment webhook signatures, payment amounts and idempotency.
-- 5) No RAI API use required for the manual fulfillment phase.
