---
name: building-marketplace-platforms
description: 'Marketplace-specific methodology layered on building-products, covering what is unique to multi-sided booking and rental platforms: multi-party payment splits and payouts, scale-hardening the financial database, three-layer financial reporting, two-way calendar (iCal) sync, the legal-document register, and entity/insurance scoping. Use whenever a request involves building, scoping, or extending a marketplace, booking platform, reservation system, rental or vacation-rental site, "Airbnb for X", "Uber for X", a two-sided or multi-sided platform, a listings site where one party lists and another books, or any product that splits payments, takes commission, or pays out hosts, owners, vendors, or providers (e.g. Stripe Connect). Also use for marketplace sub-tasks: the booking/payment/tax money flow, auditing the database for scale, payout/occupancy reporting, or calendar/availability sync. Trigger on the idea or sub-task; do not wait for the word "marketplace."'
---

# Building Marketplace Platforms

This skill is the **marketplace specialization layer.** Use the `building-products` skill for the universal lifecycle (scoping -> roles -> pricing -> PRD -> schema -> build -> handoff); this skill adds only the parts that are specific to multi-sided booking/rental marketplaces and are expensive to get wrong.

Core philosophy: **the database and money flow are the costly things to get wrong; everything above them is malleable.** Spend rigor at the bottom of the stack first.

## What this skill adds on top of building-products

| Concern | Where |
|---|---|
| Multi-party money flow (splits, payouts, commission, tax) | This file, "Money flow" |
| Double-booking prevention | This file, "Availability" |
| Scale-hardening audit (the 14 findings) | `references/hardening.md` |
| Three-layer financial reporting | `references/reporting.md` |
| Two-way iCal calendar sync | `references/calendar-sync.md` |
| Legal register + entity/insurance scoping | `references/legal-entity-insurance.md` |

## Marketplace non-negotiables (beyond the universal schema rules)

- **Roles are always more numerous than the client thinks**, typically guest, owner, internal manager, external manager, support, admin (six, not two). Map them in Phase 2 of building-products.
- **Region/city as first-class entities** if multi-jurisdiction tax is in scope, expansion becomes config, not schema change.
- **GiST exclusion constraint** for no-overlap booking: `USING gist (unit_id WITH =, daterange(check_in, check_out, '[)') WITH &&)`. DB-level, not app-level. Error code `23P01`.
- **Money moves only in the payment webhook**, never in the booking-create route (only the webhook knows payment succeeded). The ledger is append-only and idempotent (see hardening reference).

## Money flow, write it in layers, never all at once

```
booking-create route -> validates + creates booking(pending) + payment-provider checkout URL
checkout             -> guest pays
payment webhook      -> confirms booking + writes payment/tax/splits + schedules payout + notifies
payout cron          -> releases scheduled payouts (provider transfers)
comms cron           -> pre-arrival emails, review requests
```

Rules:
- **Never write ledger rows in the booking-create route.** Only the webhook does.
- **One pricing engine, one source of truth, the client must NEVER recompute price.** Put all pricing math (base-rate resolution, promotions, discounts, fees, tax) in a single server-side engine module, and have BOTH the quote endpoint and the booking-create endpoint call it. Guest-facing UI (booking widget, checkout) must FETCH that quote endpoint (debounced) and render what it returns, never reimplement the math client-side for "instant feedback." A client reimplementation looks fine in review and silently drifts the moment pricing gains a feature (weekday/weekend, seasonal rates, promotions): the guest then sees one price and is charged another -> chargebacks. This is a real bug that has happened; the fix is to delete client-side price math, not to "keep it in sync."
- **Persist the price breakdown on the booking at purchase time** (base subtotal, each discount label + amount, fees, tax). Promotions change over time, so the invoice/receipt must show what was actually charged, it cannot recompute from current pricing. Freeze it on the row.
- **Stub money movement behind a named flag** (`ENABLE_TRANSFERS = false`) when a legal/tax question is pending. Write the ledger row correctly; just don't move money. Make flipping it a conscious one-line change.

## Availability, two layers, DB constraint is the real guard

1. **Soft check** before creating a checkout session -> friendly UX error.
2. **GiST exclusion constraint** -> rejects at the DB, can't be bypassed. Catch `23P01`.

Test both: the soft check for normal conflicts, a concurrency test (two simultaneous inserts, one must fail) for the constraint.

## The regulatory monster comes first

For booking/hospitality marketplaces, **jurisdiction-specific tax is usually the hard constraint**, research it before designing the money flow, because discovering it late means rewriting the splits. Whether the platform or the host remits is typically set by the host agreement and may require a registration form. Capture the unknown behind the `ENABLE_TRANSFERS` stub until a tax professional confirms. See `references/legal-entity-insurance.md`.

## Detailed references (load as needed)

- **Scale hardening:** `references/hardening.md`, the 14-point audit + remediation SQL + validation suite
- **Financial reporting:** `references/reporting.md`, the three-layer view definitions + demand-events heat signal
- **Calendar sync:** `references/calendar-sync.md`, iCal export/import patterns + gotchas
- **Legal/entity/insurance:** `references/legal-entity-insurance.md`, document register, venue-not-seller doctrine, entity options, insurance posture
- **Evaluations:** `references/EVALS.md`

## The habits that matter most

1. Schema and money flow first, with full rigor.
2. Validate before presenting, `pglast` on every migration; the full validation suite at session end.
3. Additive migrations only when hardening a live schema.
4. Reporting derives from the ledger, never recomputed in app code.
5. For legal/entity/insurance: **inform, don't decide**, research thoroughly, then route to the right professional with specific questions.
