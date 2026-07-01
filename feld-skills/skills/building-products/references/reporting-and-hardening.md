# Reporting & Hardening Reference

Universal patterns for any SaaS product that handles money or needs reporting.
Loaded only when Phase 5 (database) or pre-launch hardening is in play.

## Contents
- Scale-hardening audit checklist
- Reporting as ledger-derived views
- Pre-launch hardening (rate limiting, encryption, error monitoring)
- Validation suite

---

## Scale-hardening audit checklist

Run before a money-handling schema scales. Fix with **additive migrations only** (no data loss).

**Critical:** money columns `int`->`bigint`; RLS helpers `SECURITY DEFINER` + pinned `search_path`; webhook idempotency table; append-only ledger (block UPDATE/DELETE via trigger, correct via reversal rows).

**High:** index every FK used in joins/filters; composite pagination indexes; partial-unique on soft-deleted rows; document a partitioning plan for high-growth tables (add the composite indexes now, partition at ~1M rows).

**Medium/Low:** payment-intent uniqueness; currency column on ledger tables; enum-vs-text consistency; retention plans for high-volume tables; optimistic-lock version columns; materialized aggregates for read-heavy summaries; a `total_equals_parts` CHECK so the DB verifies money adds up.

Already-right and must NOT be "fixed": UUID PKs, soft deletes, GiST no-overlap constraints, integer cents, RLS coverage, ledger-table separation.

---

## Reporting as ledger-derived views

**Principle:** every reported number derives from the ledger tables, so all reporting reconciles by construction. Build reporting as database views, not app-code math.

A useful three-layer split for any product with parties who earn money:
- **Layer 1, Entity/User (real-time, RLS-scoped):** per-record and per-user reconciliation, earned, paid, owed, withheld. Views use `security_invoker = true` so a user sees only their own rows.
- **Layer 2, Segment/Market (over time):** performance trends and demand/engagement signals, bucketed by period. Admin-scoped.
- **Layer 3, Platform (operator P&L):** total volume, net revenue, take rate, growth, outstanding liabilities. Admin-scoped.

Keep Layer 1 real-time. Materialize Layer 2/3 only at scale (document the threshold; refresh via nightly cron).

If "engagement heat" or demand interest matters, capture top-of-funnel signals (views, searches) in an append-only `demand_events` table (no PII, anonymous session id) via a fire-and-forget endpoint, most schemas capture conversions but not browsing, and heat without top-of-funnel is just conversions rephrased.

---

## Pre-launch hardening

- **Rate limiting**, sliding-window (DB-backed is fine at launch) on auth-adjacent and high-frequency endpoints; fail-open so a store outage never blocks legitimate users.
- **Field encryption**, AES-256-GCM for credentials/codes; deliver decrypted values server-side only, time-gated to when they're needed.
- **Error monitoring**, Sentry (or equivalent) across server/client/edge; scrub PII from breadcrumbs; wire `captureException` into the payment webhook first.
- **Document exports**, derive CSV (client-side) and PDF (server-side) from the same reporting views, never from re-computed numbers.
- **Threshold alerts**, configurable KPI thresholds evaluated by a nightly cron against the reporting views; surfaced in the admin console.

---

## Validation suite (run before every handoff)

```bash
# Migrations parse
python3 -c "import pglast,glob;[pglast.parse_sql(open(f).read()) for f in glob.glob('supabase/migrations/*.sql')];print('migrations OK')"
# Source syntax
find src -name "*.ts" -o -name "*.tsx" | while read f; do npx esbuild "$f" --bundle=false --format=esm >/dev/null 2>e && echo OK || echo "FAIL $f"; done | sort | uniq -c; rm -f e
# Nav gaps (every sidebar link has a page)
for L in src/app/*/layout.tsx; do grep "href:" "$L" | grep -o "'/[^']*'" | while read h; do p=$(echo $h|tr -d "'"); [ -f "src/app${p}/page.tsx" ]||echo "MISSING $p"; done; done
# Secrets reachable from client bundle
grep -rln "'use client'" src --include="*.tsx" | xargs grep -l "SERVICE_ROLE\|STRIPE_SECRET" 2>/dev/null
# metadata exported from a client component (silently ignored by Next.js)
grep -rln "'use client'" src --include="*.tsx" | xargs grep -l "^export const metadata" 2>/dev/null
```
