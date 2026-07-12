---
name: keel-product
description: The product manual and technical map for Keel, Feld & Co's local-first financial reporting and FP&A platform (feld-labs/keel at ~/dev/keel). Read whenever a task involves Keel by name or its features (three-statement reporting, transaction drill-down, client/company workspaces, QuickBooks sync, budgets/forecasts, vendor rules and monitoring, investor packages, CSV import, AI search over the ledger), including using it, extending it, debugging it, answering "how does Keel do X", or onboarding an associate. Routes to the repo's living docs rather than duplicating them.
---

# Keel (product skill)

Keel is Feld & Co's internal LiveFlow + Bunker replacement: a local-first FP&A platform that
syncs QuickBooks Online, keeps a balanced double-entry ledger per client company, and provides
three-statement reporting, dashboards, budgets/forecasts, vendor intelligence, and an
AI-retrieval layer. Built overnight 2026-07-10 to 2026-07-12 (17+ PRs, all Opus-QA-gated).

## Where truth lives (read these, do not trust memory of them)
- Repo: `~/dev/keel` (GitHub feld-labs/keel, private). Run: double-click `Keel.command`, or
  `pnpm install && pnpm db:migrate && pnpm seed && pnpm dev` -> localhost:3000.
- `docs/PRD.md` product spec and success criteria; `docs/ARCHITECTURE.md` how it is built;
  `docs/DECISIONS.md` D-1..D-11 assumptions and their blast radii; `docs/ROADMAP.md` sequencing;
  `RESUME.md` current state; `docs/TASK-LOG.md` the board.
- `docs/MULTI-COMPANY.md` client-isolation architecture (workspace-per-company files; M2 hosted
  entitlements plan). `docs/SPEC-10-ai-retrieval.md` + `docs/AI-QUERY-GUIDE.md` the AI search
  layer and how a bot should query the ledger. `docs/QBO-SETUP.md` Intuit app runbook.
- In-app user docs at `/help` (source: `src/app/help/`), written for associates.
- Competitive research: `docs/research/LIVEFLOW.md`, `docs/research/BUNKER.md`.

## Product invariants (enforced by AGENTS.md in the repo; never violate when extending)
1. The ledger is the source of truth: transaction headers + signed integer-cent lines
   (positive = debit, negative = credit), every transaction balances to zero via
   `insertBalancedTransaction()`. No floats, no editable aggregates.
2. Sign normalization lives ONLY in `src/lib/report-engine/signs.ts`.
3. **Drill guarantee:** no number, bar, slice, point, or KPI renders without a path to its
   underlying transactions (DrillRef); drill totals must equal displayed values.
4. **Client isolation:** one SQLite file per company workspace (`data/workspaces/`), resolved
   per request from the `keel_ws` cookie, failing closed; per-workspace HKDF token keys. Never
   introduce cross-workspace reads. Hosted/multi-user requires the M2 plan (Supabase+RLS+SSO)
   BEFORE exposure.
5. Integrations are dormant until keyed (QBO needs env keys; no live API calls in dev/tests).
6. AI answers come from the typed layer (search/aggregate/report procedures), never raw SQL;
   aggregates always return DrillRefs; period keys are YYYY-MM / YYYY-Qn / YYYY.

## Extending Keel
Follow the repo's AGENTS.md and the orchestration pattern used to build it: spec first
(docs/SPEC-N), Sonnet builds in a worktree against the spec, Opus QA-gates, isolation-touching
work gets an independent security review, orchestrator wires shared files (root.ts, nav,
schema) between merges. Verification gate for every milestone:
`pnpm typecheck && pnpm test && pnpm build` plus seeded-data live checks.

## Operating it for a client
Create a workspace (sidebar switcher > New company) -> connect data (QBO OAuth once keyed, or
CSV export from QuickBooks via /import) -> categorize (rules engine, monitoring inbox) ->
report (three statements, custom saved reports, dashboards) -> plan (budgets, forecasts) ->
deliver (investor package, print to PDF). Each client's setup, saved views, and connection are
isolated in their workspace file; back up a client by copying that file.
