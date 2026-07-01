# Three-Layer Financial Reporting Reference

## Contents
- The three reporting layers and the reconciliation principle
- View definitions (Layer 1 / 2 / 3)
- Demand-events heat signal
- Refresh strategy

---

## Phase 12, Three-layer reporting (view definitions)

**Rule:** views derive from the ledger; app never recomputes money math.

```sql
-- LAYER 1 (RLS-scoped, real-time), owner sees only their own rows
create view owner_statement with (security_invoker = true) as
  select o.id as organization_id, o.name,
    coalesce(ps_owner.net_cents,0)  as owner_net_earned_cents,
    coalesce(pay_paid.amt,0)        as paid_to_date_cents,
    coalesce(pay_pending.amt,0)     as pending_payout_cents,
    coalesce(tax_held.amt,0)        as tax_withheld_cents
  from organizations o
  left join (select organization_id, sum(net_amount_cents)::bigint net_cents
             from payment_splits_net where party='owner' group by organization_id) ps_owner
    on ps_owner.organization_id = o.id
  -- ... (paid / pending / tax_held subqueries)
  where o.deleted_at is null;

-- LAYER 2 (admin), market performance + demand heat
create view listing_demand as
  select l.id as listing_id, l.title,
    coalesce(views.cnt,0) as views_30d,
    coalesce(favs.cnt,0)  as favorites_total,
    (coalesce(views.cnt,0)*1 + coalesce(favs.cnt,0)*5
     + coalesce(inq.cnt,0)*10 + coalesce(bk.cnt,0)*25) as heat_raw
  from listings l
  left join (...) views on ... -- from demand_events
  where l.deleted_at is null;

-- LAYER 3 (admin), platform P&L: GBV, net revenue, take rate
```

**Demand events table (the heat signal):**
```sql
create type demand_event_type as enum
  ('listing_view','search','favorite_add','inquiry_start','checkout_start');
create table demand_events (
  id uuid primary key default gen_random_uuid(),
  event_type demand_event_type not null,
  listing_id uuid references listings(id) on delete set null,
  city_id uuid references cities(id),
  session_id text,                    -- anonymous, NOT a user id
  user_id uuid references users(id),  -- only if authenticated
  metadata jsonb, occurred_at timestamptz not null default now()
);
-- RLS: anyone may INSERT (with check true); admin-only SELECT.
```

Client tracker: `sendBeacon` (survives navigation) -> fallback `fetch keepalive`;
fire-and-forget; never blocks UX. Server endpoint silently accepts bad payloads.

**Reconciliation identity (must always hold):**
`guest total = owner_net + platform_fee + management_fee + tax_withheld`.
The `total_equals_parts` CHECK enforces line 1 at the DB.

**Refresh strategy:** Layer 1 = always real-time views. Layer 2/3 = regular views
at launch; convert to materialized + nightly `refresh` cron at ~1M bookings.

---
