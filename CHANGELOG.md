# Changelog

Newest first. Bump `feld-skills/.claude-plugin/plugin.json` version with each change.

## 0.13.0 - 2026-07-18
- security-review: fold in five classes surfaced by the Covaro (feld-labs/covaro) full audit. New
  Tier 1 item 6, the app-layer gate (allowlist / plan / feature flag) that is never enforced at the
  data layer, so a direct PostgREST call with the browser's anon key skips your middleware entirely.
  Tighten the SSRF item with the parts most guards miss: `not is_global` over a hand-rolled denylist,
  IPv6 translation-form unwrapping, connection-pinning to the validated IP (re-checking alone still
  races DNS rebinding), and per-hop redirect revalidation. New Tier 2 scars: the user can write the row
  that bills them (usage/credit/verification state must be server-written, not just RLS-scoped);
  count-then-insert quota checks race (TOCTOU); internal service seams that treat loopback as auth;
  and a hardening fix applied to one path but not its twin. Plus two greps (globally-readable tables,
  self-writable billing state). No open holes were found in the audited app; these are the
  generalizable lessons from what was checked.
- security-review: make the review a standing programmatic gate, not a one-off event. New sections:
  "Make it a standing gate" turns the mechanizable classes into copyable CI assertions (RLS enabled per
  table, internal tables deny authenticated, billing/usage state not client-writable, globally-readable
  tables on a reviewed allowlist) that extend the real-Postgres isolation test, plus the secrets/PII
  tripwire and the app-gate-at-the-DB probe; "Wire it into the release process" makes a security-review
  pass a hard release gate. The audit's remaining job is the classes CI cannot express (SSRF logic,
  injection reach, business-logic abuse, attack chains).
- release-qa-plan: add a security-review pass to the hard release gates, deferring the checklist and
  CI-gate shape to [[security-review]]; a Critical/High finding stops the release like a cross-tenant read.

## 0.12.0 - 2026-07-17
- Replace the project-specific keel-product skill with a portable technical-documentation method skill (doc types, accuracy/audience contracts, SPEC and living-doc shapes, in-app help structure, doc verification gate). Keel's own product docs stay in the keel repo.

## 0.11.1 - 2026-07-14
- multi-tenant-isolation: add the Supabase grant trap. Supabase grants anon AND authenticated ALL
  privileges on every new public table by default, a hole separate from RLS (TRUNCATE is not
  RLS-gated), and a plain-Postgres isolation test never sees it. New section 9 + checklist items:
  lock down grants by construction via one-call helpers (secure_tenant_table / secure_global_table /
  lock_down_table), and make the isolation test mirror the Supabase default then assert the
  locked-down posture so CI catches any table left wide open. Distilled from the live Waypoint audit.

## 0.11.0 - 2026-07-12
- Add keel-product skill: product manual + technical map for feld-labs/keel (invariants, doc routing, operating and extension guides)

## 0.10.0 (2026-07-12)

Three new skills synthesizing the Fable-era learnings, distilled from the five venture-scoping
runs (Waypoint, Tributary, Astrolabe, Motif, Lodestone), the Keel v1 program, and the Lucid Arc
marketing handoff. The through-line: the expensive tier's judgment gets captured as frames and
methods so future runs execute on cheaper models at comparable quality.

- **New skill: venture-scoping.** The idea-to-build-ready pipeline: kill-check before any scoping
  investment (the strategist must be willing to return KILL; a surviving verdict is recorded and
  cited, never re-litigated); lettered phases each answering one strategic question and each
  ending in a committed doc; beachhead ratified early and everything scoped to it; the D-number
  decision-gate protocol (question, recommendation, default, what it gates; presented as one
  ratification block; ratified decisions never re-derived); naming research economy (sector
  collision + SEO decide, max one .com lookup, no trademark tracing); the hard PRD gate where
  strategy stops; and the handoff artifact set (PRD-v1, build plan + tickets with human-only
  actions tagged, spec frame, standalone OPUS-0 prompt, RESUME.md, memory mirror) feeding the
  Opus SPEC-1..N then Sonnet-waves build flow.
- **New skill: strategy-on-opus.** The parity method for getting Fable-quality output on
  Fable-designated tasks (positioning, pricing, PRDs, kill-checks, spec frames, roadmap
  synthesis) from Opus, so the ultra tier is rarely needed: triage by transferability
  (frame-following = full parity; heavy synthesis = staged decomposition; novel high-blast
  judgment = the only class still budgeted Fable tokens, as reviewer); always run inside a
  proven frame (the plugin's skills and saved exemplars ARE crystallized top-tier capability,
  derived once, followed cheaply); staged synthesis (inventory -> per-source extraction, even
  Sonnet -> compression into a decision-shaped layer -> judgment pass on Opus only, never
  delegated further down); explicit adversarial passes replacing innate skepticism (generate /
  red-team-to-refute / revise with a considered-rejected record; never ship single-pass
  strategy output); divergent drafts + a judge for wide solution spaces; a written quality
  rubric checked as a real gate (differentiation test, sourcing, live KILL, D-gates surfaced,
  beachhead-scoped, red-team record); and the thin-Fable-layer escalation list (review gate on
  finished Opus packages, tie-breaks, repeated structural red-team failures), with score-keeping
  so the escalation list shrinks over time.
- **New skill: program-handoff.** The tiered-delivery and baton-pass pattern: one tier = one
  independently mergeable PR ordered by dependency, contracts fixed at tiering time, board and
  CHANGELOG inside each tier's PR; dormant-until-keyed wiring for every missing external
  dependency (never improvised credentials); independent review on security-adjacent tiers;
  the human-owes register (item, what it gates, honest urgency) in RESUME.md + memory; the
  parked-epics register with unpark triggers; end-state verification (merges confirmed landed,
  no open PRs) and the four-section handoff message (shipped / dormant / owed / parked).
- Plugin version 0.10.0; description and keywords updated.

## [Unreleased] - AGENTS.md sync (2026-07-10)

### Added
- Add `AGENTS.md`, created from the project stub plus the managed `FELD-PORTABLE` block. The block carries the Feld Labs portable rules that bind any AI agent working in this repo, Claude
  or otherwise: style, model routing tiers, git governance (ai-git-ops), secrets and privacy, and the
  human-only actions list.
- Generated by `scripts/sync-agents.sh` from the single master, `feld-labs/claude-config/AGENTS.md`.
  Do not edit the managed block in this repo; edit the master and re-run the sync.

## 0.9.0 (2026-07-10)
- **New skill: landing-page-revamp.** The audit-to-relaunch procedure for any product's public
  landing surface, distilled from the Lucid Arc public-site program (nav unification #100,
  Justin-Welsh-voice rewrite #102, content hub #103, trust pages #106, pricing ladder #109).
  Six steps: (0) written audit with the cover-the-logo message test, audience test, structure
  drift, honesty scan, and a before screenshot; (1) lock positioning inputs before any copy
  (spine + one-line contrast via product-positioning, ICP map, honesty constraints incl. what
  must not be overclaimed, B2B verification-first vs B2C felt-moment-first stance); (2) the
  proven eight-section architecture in conversion order (finding-first hero, honest credibility
  strip, how-it-works in 3, differentiated-angle shown-not-asserted, who-it's-for per ICP,
  pricing clarity with server-side fences, FAQ as FAQPage JSON-LD, final CTA) on one shared
  nav/footer; (3) house voice rules; (4) discoverability + trust + internal-link wiring
  (composes seo-aeo-geo and content-engine); (5) design pass via design-and-ui-craft; (6) gate
  with a real production build, link-click and mobile passes, before/after PR, human merge.
  Includes model routing per phase (strategist copy brief, Sonnet page builds on disjoint
  files, anything touching pricing/auth escalates to Opus + independent review). First target:
  the Confetti Albums landing page.

## 0.8.1 (2026-07-10)
- **content-engine: internal linking and credibility rules** (Brian review feedback from the
  Lucid Arc wave-2 content PR). New non-negotiable writing rule checked at the QA gate: every
  piece is a node in a topical-authority graph. Every post inline-links its reference page and
  carries a related-links block (reference page + cluster sibling + one adjacent piece);
  sibling formats cross-link so each topic's cluster closes around its definition page;
  pillar/listicle posts link every concept they enumerate (definition page + deeper how-to);
  concept-named anchor text; no orphans (a new piece ships with at least one inbound link in
  the same PR); method claims cite the methodology page; external citations sparing and
  accurate. Documents the engineering prerequisite (safe inline-link subset + related section
  in the post renderer) and the scripted-retrofit pattern with hard assertions. Checklist gains
  a linking pass.

## 0.8.0 (2026-07-10)
- **New skill: content-engine.** The content operation playbook distilled from the Lucid Arc
  content build (strategy doc + 15 metric reference pages + pillar posts + a 27-post cluster
  backlog produced by a Sonnet writer fleet). Covers: the two-track content-as-data repository
  (reference pages + editorial, glossary/sitemap updated with every add); the scoping phase as
  five explicit decisions (positioning spine with the "could a competitor publish this
  unchanged" test, an explicit competitive model choice, the N-format topic-cluster backbone as
  a status table, journey-mapped editorial pillars that target the journey competitors ignore,
  and a dated 90-day calendar that doubles as the production queue); the writing rules (voice,
  GEO, the accuracy contract tracing every claim to a named source-of-truth doc, benchmark
  honesty banning proprietary-data claims until a corpus exists, and template + exemplar per
  recurring format); and the production pipeline with model routing (strategist scopes, writes
  the differentiated backbone + exemplars, and runs the QA gate; Sonnet writer agents batch-draft
  cluster posts into disjoint files from standalone briefs with slug/title/date fixed by the
  orchestrator; Haiku or inline for mechanical surfaces; integration always single-track into
  the shared module with sitemap + glossary + CHANGELOG in one never-self-merged PR). Composes
  with [[seo-aeo-geo]] (technical discoverability), [[product-positioning]] (spine derivation),
  and [[delegate-and-qa]] (delegation mechanics).
- **New skill: security-review.** The portfolio-wide vulnerability checklist plus a repeatable audit
  method, distilled from a real Lucid Arc audit and the "5 holes in every vibecoded app" parts 1 and 2.
  Three tiers: Tier 0 open doors (auth on every endpoint, IDOR/authorization scoping, isolation
  actually on, no secrets in repo/client, baseline rate limits); Tier 1 "you turned it on and it still
  leaks" (RLS policy holes that join to an open table or trust a user-set column, storage-bucket
  listing, pre-auth money pumps where per-user limits fail, SSRF to the cloud metadata endpoint, and
  prompt injection / AI that takes actions); Tier 2 Feld scars (secrets committed AND tracked,
  password-reset token returned in the response = account takeover, empty signing-secret fallback
  `?? ""`, plaintext provider keys at rest, PII redaction done only client-side, `sameSite:none`, dead
  starter-template scaffolding as live attack surface). Encodes the SSO-only standard as the structural
  fix for the entire password/credential class (having password auth at all is itself a finding). Method
  section: audit the deployed branch not a stale checkout, two independent passes (one pass under-covers),
  verify every finding in-source, handle secrets by key-name-not-value, rank + split code fixes from
  live-credential/destructive actions, and gate with an independent reviewer (never self-merge).
  Composes with [[multi-tenant-isolation]], [[optional-integrations]], [[saas-billing]],
  [[trust-and-verification]], [[delegate-and-qa]], and the built-in `/security-review`. Ships three
  reference files for launch-grade depth: `production-hardening.md` (security headers, transport,
  session hardening, file uploads, DB least-privilege + encryption, audit logging, business-logic
  abuse, compliance, CI/CD), `ai-endpoint-security.md` (token-aware rate limiting, cost caps + global
  spend circuit breaker, system-prompt isolation, indirect-injection defence, output PII/leakage/XSS
  filtering, per-tenant AI isolation, gating AI actions), and `attack-path-chaining.md` (defensive
  adversary-emulation: chain confirmed findings into ranked attack paths with detection gaps + fixes).
  The reference checklists are adapted, in our own words, from the open-source `seatrial` audit
  skill-set (github.com/Lagunaswift/SeaTrails, MIT, James Swift) and OWASP practice, and the skill
  points to seatrial for a heavier multi-lens automated audit.

## 0.6.0 (2026-07-06)
- **New skill: in-house-observability.** Error monitoring you own, no third-party service required.
  Every error goes to the console AND a Supabase `error_log` table via a `log_error()` RPC (on by
  default); Sentry/webhook/OTel stay optional forwarders. Consistent cross-project schema, fingerprint
  grouping (a burst of one error is one row with a count, not thousands), PII-safe context allow-list,
  a never-throws module, and a define/identify/fix triage workflow for build + bug-squash phases.
  Ships copy-paste `references/monitor.js` + `references/error_log.sql`. Includes a graduation path to
  OpenTelemetry/a vendor. Instance of [[optional-integrations]]; informed by OTel practice
  (Dash0/o11y-dev) but kept lightweight. Extracted from the Confetti Albums reference implementation.

## 0.5.1 (2026-07-02)
- **delegate-and-qa: coordination + command whitelist (procedure only).** Pre-spawn check (fetch,
  open PRs, worktrees, unmerged branches; pushed branch name = task claim; one merge authority per
  repo), a post-run duplicate sweep, and briefs/QA enforce a VERIFY command whitelist. The
  live-credentials BAN itself moved to global CLAUDE.md (claude-config): it is policy, must bind
  every session and agent always, not only when a skill loads. From the Lucid Arc parallel-session
  collision on 2026-07-02, trimmed after the skill-bloat audit.

## 0.5.0 (2026-07-02)
- **New skill: delegate-and-qa.** The execution leg of the plan-and-handoff pattern: a triage
  rubric that assigns each task the cheapest model that cannot fail it (Haiku mechanical, Sonnet
  well-scoped builds, capable model for judgment or high blast radius), a standalone delegation
  brief format, spawn mechanics (worktree isolation, SendMessage over respawn, one-bounce rule),
  and a mandatory senior-model QA gate (read the diff, re-run verification, house-rule sweep).
  Formalized from the Lucid Arc takeover session.

## 0.4.1 (2026-07-02)
- **saas-billing: fee handling.** New "Fees: who pays, and keep the total honest" section on
  passing vs absorbing a fee (record both sides; keep the absorbed cost outside the reconciled
  order total) and the constraint-drift trap (a `total = sum(parts)` check must include every fee,
  or a stale check 500s the whole money path). From the Gulf Coast Stays card-fee pass/absorb work.

## 0.4.0 (2026-07-01)
Distilled from the Gulf Coast Stays build (white-label vacation-rental marketplace), plus a
build-methodology structure. (Supersedes the earlier PR that targeted 0.2.0 before `main` moved.)
- **New master: building-products**: the entry point for any product build. Universal lifecycle
  (scoping, roles, pricing, PRD, schema-first DB with RLS, phased build, handoff) + a routing table
  that names the product-type layer and the focused skills to load per concern. Migrated and
  generalized from the local `building-saas-products` methodology.
- **New layer: building-marketplace-platforms**: multi-sided booking/rental marketplaces (splits +
  payouts, double-booking GiST, scale hardening, financial reporting, iCal sync, legal register).
  Migrated from gulf-coast-stays; now references `building-products`.
- **New: white-label-branding**: one deployment, many brands (config-driven identity/content/theme,
  per-request resolve, brand-as-props, CSS-variable theming, per-brand SEO/comms/legal).
- **New: seo-aeo-geo**: found by search AND answer engines (JSON-LD incl. FAQPage, AI-crawler robots,
  published-only sitemap, llms.txt, canonicals, extractable content patterns).
- **New: trust-and-verification**: identity + right-to-act attestation + private doc uploads; the
  mock-in-dev / hard-block-in-prod gate; publish/checkout gating.
- **New: shipping-nextjs-app**: run `next build` before "done"; App Router build gotchas.
- **Updated: multi-tenant-isolation**: added domain-resolved (white-label) tenancy + the concrete
  Postgres RLS patterns (restrictive policy layered on ownership, parent-derived tenant-id triggers,
  per-tenant unique namespaces, real-DB isolation test).

## 0.3.0 (2026-07-01)
- Added three technical playbooks distilled from the Confetti Albums build:
  - **optional-integrations**: the dependency-free "dormant until keyed" pattern (no-op until the env
    key is set) for email/analytics/monitoring; ship the wiring before the account exists.
  - **supabase-migration-verify**: verify which migrations are live by REST-probing a distinctive
    column/table per migration (service key only, no psql), reading the `42703` errors.
  - **release-qa-plan**: gates-first QA structure (isolation, money path, regression, onboarding) with
    assertions pulled from code; composes multi-tenant-isolation + saas-billing.
- Cross-linked **saas-billing** to optional-integrations, release-qa-plan, and supabase-migration-verify.

## 0.2.0 (2026-07-01)
- Added **design-and-ui-craft**, a core design skill with a broad trigger, Feld Labs house rules
  (match existing tokens, no em-dashes, accessibility, verify by eye, restraint, honest copy), a
  deterministic motion tie-breaker, and priority routing (Emil > Impeccable > Taste) to three
  vendored open-source craft playbooks under `vendor/`.
- Vendored (attribution only, no fees; pinned commits, reviewed quarterly, see the skill's
  `VENDORED.md`): Emil Kowalski `skills` (MIT), Impeccable docs subset (Apache-2.0; runtime scripts
  and agents removed), Taste Skill `skills` (MIT). Each keeps its upstream LICENSE + a SOURCE.md.

## 0.1.0 (2026-06-27)
- Initial marketplace + `feld-skills` plugin with four playbook skills:
  saas-billing, multi-tenant-isolation, product-positioning, marketing-asset-gen.
- Distilled from the Confetti Albums build.
