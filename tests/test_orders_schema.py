"""Smoke tests for the proposed SQLite-compatible Cloudflare D1 migration.
These tests use an in-memory database and never connect to customer data.
"""
import sqlite3
import unittest
from pathlib import Path

MIGRATION = Path(__file__).resolve().parents[1] / "migrations" / "0001_orders.sql"

class OrderSchemaTests(unittest.TestCase):
    def setUp(self):
        self.db = sqlite3.connect(":memory:")
        self.db.execute("PRAGMA foreign_keys = ON")
        self.db.executescript(MIGRATION.read_text(encoding="utf-8"))
        self.db.execute(
            "INSERT INTO orders (id, state_code, company_status) VALUES (?, ?, ?)",
            ("DEMO-001", "WY", "not_formed"),
        )

    def tearDown(self):
        self.db.close()

    def test_required_tables(self):
        names = {row[0] for row in self.db.execute(
            "SELECT name FROM sqlite_master WHERE type='table'"
        )}
        self.assertTrue({"orders", "order_services", "payment_events", "order_audit"} <= names)

    def test_default_status(self):
        status = self.db.execute("SELECT status FROM orders WHERE id = 'DEMO-001'").fetchone()[0]
        self.assertEqual(status, "draft")

    def test_invalid_status_rejected(self):
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("UPDATE orders SET status = 'paid_without_verification' WHERE id = 'DEMO-001'")

    def test_negative_amount_rejected(self):
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("UPDATE orders SET quoted_total_cents = -1 WHERE id = 'DEMO-001'")

    def test_orphan_service_rejected(self):
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute(
                "INSERT INTO order_services (order_id, service_code) VALUES ('MISSING', 'llc_formation')"
            )

    def test_payment_event_deduplicated(self):
        event = ("evt_demo_01", "DEMO-001", "test_provider", "pay_demo_01", "paid", 14900, "USD")
        sql = ("INSERT INTO payment_events "
               "(provider_event_id, order_id, payment_provider, payment_reference, event_type, amount_cents, currency) "
               "VALUES (?, ?, ?, ?, ?, ?, ?)")
        self.db.execute(sql, event)
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute(sql, event)

if __name__ == "__main__":
    unittest.main()
