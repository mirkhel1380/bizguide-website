# BizGuide Direct Services — Launch Readiness Checklist

Status: **PREVIEW ONLY**. This branch is not a production checkout.

## Website model

BizGuide is operated by Basirm LLC. Educational provider comparisons remain independent of direct services. RAI wholesale orders will be submitted manually by an authorized human operator until the IP-whitelisted Corporate Tools API integration can be safely deployed.

## Already implemented in this branch

- `business-services.html`: direct-service explanatory landing page, intentionally no checkout.
- `request-quote.html` + `quote-planner.js`: state/service choice, local-only summary, optional `mailto:` draft. **No form submission, data storage, card processing, or order placement**.
- `services.html`: adds a link to the direct-service preview.
- Both new pages use `noindex,nofollow` while pre-launch.

## Requirements before receiving paid orders

1. **Prices:** choose retail margin for LLC, RA, EIN; verify wholesale price per service in live cart. Show government/state fees separately, where relevant. Do not present wholesale rates as customer pricing.
2. **Terms:** disclose merchant of record (Basirm LLC), contract scope, third-party service delivery, available states, renewal details, cancellation/change-of-agent rules, deadlines, refund terms, and legal/tax advice disclaimer. Obtain legal review appropriate to offered services.
3. **Account & secure data:** implement authenticated customer accounts, secure storage, least privilege and retention policies. Do not collect SSN, passport, ID scans, DOB or payment card numbers on static GitHub Pages or ordinary email.
4. **Checkout:** use an eligible payment processor with verified webhook signatures and server-side state transitions. Never rely on browser success redirects as proof of payment. Confirm refund/dispute/chargeback exposure before accepting payments.
5. **Order lifecycle:** `draft → quoted → customer_accepted → payment_pending → paid_verified → review_required → submitted_to_provider → processing → complete`, with a separate cancellation/refund track. Retain unique order IDs, human approval and audit log, customer communication, and idempotency to avoid duplicate provider orders.
6. **Manual fulfillment:** an authorized operator verifies payment in the processor, reviews customer permission and filing details, confirms provider/state fees and manually submits a RAI wholesale order. The customer gets immediate payment receipt but **not** a false claim of immediate LLC formation or EIN issuance.
7. **Affiliate compliance:** avoid unapproved partner logos, tracking links and endorsement claims. Keep editorial provider comparisons separate and neutral; follow partner-specific restrictions upon approval.
8. **Testing:** use non-sensitive data; no real formation invoice payments for Corporate Tools API testing. The account's test API calls still target a production API host.
9. **Go-live gate:** do not merge a functional checkout until customer support, tax/legal disclosures, provider provisioning, payment settlement, data handling and end-to-end order recovery have been verified.

## Preliminary price worksheet (internal only)

The agreed commercial examples from partner correspondence: registered agent $45 per entity/state/year; LLC formation $75 plus government state fees; EIN price depends on SSN eligibility. These are **wholesale inputs**, not live retail quotes, and must be independently confirmed in the wholesale cart for the chosen services and state.

`Retail quote = BizGuide service fee + state/government charges + optional products + applicable taxes/processor charges`.

Pricing must be explicit about annual renewals, fee inclusions and any free or included first-year RA benefits. Do not double-charge for bundled items.

## Next implementation phase

Choose retail rates, state coverage and secure backend/payment provider. Then build server-side quote creation with an accurate state fee source, authenticated order records, idempotent verified payment webhooks and an operator-only manual RAI fulfillment dashboard.

## Security

Never commit payment credentials, Corporate Tools Access/Secret Keys, JWTs, customer personal data or webhook secrets to GitHub.
