# Evaluations, building-marketplace-platforms

Three scenarios verifying the skill triggers and applies marketplace-specific rigor.

## Eval 1, "Airbnb for X" idea (should trigger without the word "marketplace")
```json
{
  "skills": ["building-marketplace-platforms", "building-products"],
  "query": "I want to build something like Airbnb but for parking spaces, owners list spots, drivers book and pay, we take a cut.",
  "expected_behavior": [
    "Triggers building-marketplace-platforms (multi-sided, splits payments, takes a cut)",
    "Also engages building-products for the universal lifecycle",
    "Maps more than two roles (driver, owner, support, admin)",
    "Plans the money flow so ledger rows are written only in the payment webhook",
    "Proposes a GiST exclusion constraint for no-overlap booking of a spot"
  ]
}
```

## Eval 2, Scale-hardening sub-task
```json
{
  "skills": ["building-marketplace-platforms"],
  "query": "Audit my booking platform's database to make sure it can scale.",
  "expected_behavior": [
    "Triggers on the sub-task (audit DB for scale)",
    "Loads references/hardening.md",
    "Flags int money columns (should be bigint), RLS helpers needing SECURITY DEFINER, missing webhook idempotency, mutable ledger",
    "Recommends additive migrations only (no destructive changes)"
  ]
}
```

## Eval 3, Guest-facing pricing must not recompute on the client
```json
{
  "skills": ["building-marketplace-platforms"],
  "query": "Build the booking widget that shows the price as the guest picks dates.",
  "expected_behavior": [
    "The widget FETCHES the server quote endpoint (debounced) rather than recomputing price in the component",
    "Does not reimplement base-rate/discount/tax math client-side for 'instant feedback'",
    "Renders the itemized breakdown returned by the engine (base, discounts, fees, tax, total)",
    "Notes that the displayed price must equal what booking-create will charge (same engine)"
  ]
}
```

## Eval 4, Reporting sub-task
```json
{
  "skills": ["building-marketplace-platforms"],
  "query": "Design owner payout and occupancy reporting for our rental platform.",
  "expected_behavior": [
    "Triggers on the reporting sub-task",
    "Loads references/reporting.md",
    "Builds reporting as ledger-derived database views, not app-code math",
    "Produces the three layers (entity/owner, market, platform) with Layer 1 RLS-scoped via security_invoker",
    "Notes the demand-events table for occupancy/heat top-of-funnel signal"
  ]
}
```

## Negative control, should NOT over-trigger
```json
{
  "skills": [],
  "query": "Write me a Python function to reverse a linked list.",
  "expected_behavior": [
    "Neither marketplace nor SaaS skill triggers; this is a plain coding task"
  ]
}
```
