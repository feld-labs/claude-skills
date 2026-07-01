---
name: saas-billing
description: Read before building payments, subscriptions, or billing into a SaaS (Stripe or any provider). Covers products/prices, checkout, webhooks, entitlements, idempotency, plan and credit metering, and the test/live split. Use when wiring checkout, webhooks, plan limits, or usage credits.
---

# SaaS Billing Playbook

A battle-tested pattern for adding billing to a SaaS without coupling your app to the payment
provider and without security holes. Provider-agnostic; Stripe specifics noted inline.

## 1. The core principle: separate object-creation from entitlement-writing
Two jobs, kept apart by a single contract:
- **Provider setup** (products, prices, the webhook endpoint): can be done by a connector/agent or a
  setup script. Output is a manifest of `lookup_key -> price_id`.
- **The app** owns the database and writes **entitlements** (what the user is now allowed to do).

The only interface between them is a **DB-field contract**: "after a successful payment, these exact
fields are true." Define it first. Example fields:
- account level: `stripe_customer_id`, `subscription_status`, `renews_at`, prepaid buckets.
- per-unit (event/project/seat): `feature_level`, `credits_remaining`, `paid_at`, `payment_ref`.

Get that contract right and the two sides can be built in parallel.

## 2. Checkout endpoint (server-side)
- Authenticated; resolve the buyer (account/user) from the session, never the request body.
- Map `sku -> price` **server-side** by lookup_key. NEVER trust a client-supplied price or amount.
- Attach **metadata** the webhook will need to grant (account_id, unit_id, sku, user_id).
- Owner/permission check before creating the session.
- Return the hosted checkout URL; redirect the client.

## 3. Webhook handler (where money becomes access)
- **Verify the signature** against the signing secret before trusting anything. No exceptions.
- Require the **raw request body** for verification (mount a raw body parser for that route only,
  before the JSON parser).
- **Idempotent: process-then-mark.** Check a processed-events table at the start; if seen, ack and
  skip; do the grant; THEN record the event id. A failed handler stays unmarked so the provider
  retries (at-least-once). Marking first would silently drop failed grants.
- Map each event type to a DB mutation:
  - `checkout.session.completed` -> apply the §1 grant from metadata.sku (the primary path).
  - subscription updated/deleted, invoice paid/payment_failed -> update subscription_status + renews_at.
- Increments (credits, buckets) have no atomic `+=` in most REST layers: read-modify-write is fine at
  webhook volume; guard so balances never go negative.

## 4. Metering (usage credits)
- Define the unit precisely ("1 credit = 1 finalized item"). The **app decrements** on use; **billing
  only ever tops up**. Check balance before the action (return 402 if short), decrement after success.

## 5. Test vs live
- Mirror the catalog in **test mode** (same lookup_keys). Switch by **key prefix**: if the secret key
  starts with the test prefix, load the test price manifest; else live.
- Webhook secrets differ per mode (env-driven). **Never point production at a test secret** or vice versa.
- QA locally with the provider's CLI listener (it issues its own local signing secret). Use a throwaway
  test account so QA never touches real data.

## 6. Security (non-negotiable)
- Secret key + webhook secret live in env only (gitignored). Only the publishable key and price IDs
  may reach the browser. If a secret is ever pasted in chat or a log, rotate it.
- Server maps sku -> price; reject unknown skus. Idempotency keyed on the provider event id.

## 7. Dependency-free option
You usually do not need the provider's SDK. A tiny `fetch` client plus Node `crypto` for HMAC webhook
verification keeps deploys simple (fewer deps). Checkout = a form-encoded POST; verification = HMAC-SHA256
of `${timestamp}.${rawBody}` compared timing-safely to the `v1` signature, within a tolerance window.

## 8. Test matrix (run before launch)
- Each one-time sku flips the exact entitlement field; each subscription event transitions status.
- Idempotency: re-deliver an event -> no double grant (credits not doubled).
- Declined card -> nothing granted. Tampered signature -> 400, nothing granted.
- Credit shortfall -> 402; sufficient -> decrement.

## Checklist
- [ ] DB-field contract written first
- [ ] Checkout maps sku->price server-side, attaches metadata, owner-checked
- [ ] Webhook: signature-verified, raw body, process-then-mark idempotent
- [ ] Test/live switch by key prefix; secrets in env; rotate on exposure
- [ ] Metering: app decrements, billing tops up, 402 on shortfall
- [ ] Test matrix passes in test mode before going live

## Related skills
- The dependency-free `fetch` client here is one instance of the [[optional-integrations]] pattern
  (dormant until keyed): the same discipline used for email, analytics, and monitoring.
- The money path is a release gate; see [[release-qa-plan]] for how it sits in the QA plan.
- If entitlement fields live behind a recent migration, confirm it is applied with
  [[supabase-migration-verify]] before trusting the grant.
