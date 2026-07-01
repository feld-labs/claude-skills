# Scale Hardening & Pre-Launch Reference

## Contents
- The scale-hardening audit (14 findings + remediation SQL)
- Pre-launch hardening patterns
- Validation suite

---

## Phase 11, The scale-hardening audit (full checklist)

Run this as a staff-level review on any marketplace schema. Grade each finding
CRITICAL / HIGH / MEDIUM / LOW. Fix with **additive migrations only**.

### CRITICAL, fix before real money flows
- [ ] **C1. Money columns `int` -> `bigint`.** `int` max = 2,147,483,647 cents = $21.4M. Aggregates (annual payouts, lifetime GBV, 1099 totals) overflow silently. `ALTER ... TYPE bigint` on every `_cents` column.
- [ ] **C2. RLS helper functions `SECURITY DEFINER` + `SET search_path = public, pg_temp` + `STABLE`.** Fixes: (a) recursion when a policy calls a function that queries the same table, (b) search_path hijack, (c) per-row re-planning.
- [ ] **C3. Webhook idempotency.** `processed_stripe_events(event_id text primary key, ...)`. Insert-or-skip at the top of the handler; `on conflict do nothing returning event_id`, no row returned => already processed => skip.
- [ ] **C4. Immutable ledger.** `forbid_mutation()` trigger that `raise exception` on UPDATE/DELETE, attached to `payment_splits`, `tax_collections`, `audit_log`. Corrections via reversal rows (`reverses_id`, `reason`).

### HIGH, before scaling past a few hundred listings
- [ ] **H1. Index FKs used in joins/filters.** `bookings.unit_id` especially (availability search + GiST). `create index ... where deleted_at is null`.
- [ ] **H2.** RLS `IN (select helper())` re-evaluates per row, resolved by C2 making helpers definer-side + cached.
- [ ] **H3.** Partitioning plan for high-growth tables (availability, notifications, messages, audit_log). Add composite indexes now; partition at ~1M rows.
- [ ] **H4.** Composite pagination index, e.g. `messages(thread_id, created_at)`.
- [ ] **H5.** Partial-unique on soft-deleted rows: `create unique index ... on users(email) where deleted_at is null` (replace the full unique constraint). Same for `listings.slug`.

### MEDIUM
- [ ] **M1.** Partial-unique on `payments.stripe_payment_intent_id where not null`.
- [ ] **M2.** `currency text not null default 'usd'` on ledger tables (cheap now, painful retrofit later).
- [ ] **M3.** Append-only + retention plan for `audit_log`.
- [ ] **M4.** Enum-vs-text consistency; `cancellation_policy` -> real enum (it's in refund logic).
- [ ] **M5.** Retention/partition plan for `notifications`.
- [ ] **M6.** Optimistic-lock `version` column on hot entities edited by multiple roles.

### LOW
- [ ] **L1.** Materialize the rating-summary view, or denormalize `avg_rating`/`review_count` onto listings.
- [ ] **L2.** Controlled-vocabulary tags (avoid free-text fragmentation).
- [ ] **L3.** PostGIS `geography(Point)` + GiST for radius search at geographic scale.
- [ ] **L4.** `total_equals_parts` CHECK: `total_cents = nightly + cleaning + service_fee + tax + damage_waiver`.
- [ ] **L5.** Document intentional denormalizations (e.g., `guest_email` on bookings for guest checkout).

### Already-right list (DON'T "fix" these)
UUID PKs · soft deletes with partial indexes · GiST double-booking constraint · integer cents · RLS everywhere · ledger-table separation · shared `set_updated_at()` trigger · thread-participants join table.

### Remediation SQL patterns

```sql
-- C1: money to bigint (repeat per table)
alter table bookings
  alter column total_cents type bigint,
  alter column nightly_subtotal_cents type bigint;

-- C2: definer-secured RLS helper
create or replace function app_member_org_ids()
returns setof uuid language sql stable security definer
set search_path = public, pg_temp as $$
  select om.organization_id from organization_members om
  where om.user_id = app_current_user_id() and om.deleted_at is null;
$$;

-- C3: idempotency table
create table processed_stripe_events (
  event_id text primary key, event_type text not null,
  processed_at timestamptz not null default now()
);

-- C4: append-only trigger
create or replace function forbid_mutation() returns trigger language plpgsql as $$
begin raise exception 'Table % is append-only; % not permitted', tg_table_name, tg_op
  using errcode = 'check_violation'; end; $$;
create trigger trg_splits_immutable before update or delete on payment_splits
  for each row execute function forbid_mutation();

-- H5: partial unique on soft-deleted
alter table users drop constraint if exists users_email_key;
create unique index uq_users_email_active on users(email) where deleted_at is null;
```

Always: validate with `pglast.parse_sql(open(migration).read())` before presenting.

---

---

## Phase 15, Pre-launch hardening (patterns)

**Rate limiting**, sliding window, DB-backed:
```ts
// rate_limit_buckets(id bigserial, bucket_key text, ts timestamptz)
// count rows for key in window; if >= limit return true (block); else insert + allow.
// Fail OPEN on store error. Key = `${action}:${userId ?? ip}`.
```
Wire into booking-create (5/min/user) and high-frequency endpoints (events: 60/min/IP, silent). Nightly cleanup cron prunes rows > 1h.

**Field encryption**, AES-256-GCM:
```ts
// envelope = base64(iv[12] || authTag[16] || ciphertext); key from FIELD_ENCRYPTION_KEY (64 hex).
// Store access_code_encrypted / wifi_password_encrypted on listings.
// Decrypt server-side ONLY, delivered to the booked guest within 24h-before-checkin -> checkout.
```

**Sentry**, server/client/edge configs; disabled in dev; scrub PII (password/token/secret/code/email) from breadcrumbs; replay masked; `withSentryConfig` in next.config; `captureException` in the payment webhook first.

**Document exports**, CSV client-side; PDF server-side (reportlab via subprocess), both from the Layer-1 views. Brand header, KPI grid, reconciliation note, per-property table.

**KPI alerts**, `kpi_thresholds` (metric enum, direction, value, optional city/listing scope) + `kpi_alerts` (severity, message, resolved_at). Nightly cron evaluates thresholds against the reporting views, idempotent (no dup unresolved alert per threshold+entity). Admin panel surfaces + resolves.

---

---

## Validation suite (run at the end of every session)

```bash
# 1. Migrations parse
python3 -c "import pglast,glob; [pglast.parse_sql(open(f).read()) for f in glob.glob('supabase/migrations/*.sql')]; print('migrations OK')"
# 2. Source syntax
find src tests -name "*.ts" -o -name "*.tsx" | while read f; do npx esbuild "$f" --bundle=false --format=esm >/dev/null 2>e && echo OK || echo "FAIL $f"; done | sort | uniq -c; rm -f e
# 3. Nav gaps
for L in src/app/*/layout.tsx; do grep "href:" "$L" | grep -o "'/[^']*'" | while read h; do p=$(echo $h|tr -d "'"); [ -f "src/app${p}/page.tsx" ]||echo "MISSING $p"; done; done
# 4. Secrets in client bundle
grep -rln "'use client'" src --include="*.tsx" | xargs grep -l "SERVICE_ROLE\|STRIPE_SECRET" 2>/dev/null
# 5. metadata in client component
grep -rln "'use client'" src --include="*.tsx" | xargs grep -l "^export const metadata" 2>/dev/null
```
