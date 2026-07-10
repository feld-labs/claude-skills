# Changelog

Newest first. Bump `feld-skills/.claude-plugin/plugin.json` version with each change.

## 0.8.0 (2026-07-09)
- **security-review: bake in learnings from two real audits (Lucid Arc + Confetti Albums).** Woven
  into the existing tiers, not appended:
  - New Tier 1 item, **trusting client-controlled request metadata**: a Confetti Albums finding where
    `req.headers.host` matched against `localhost` was used to SKIP authentication, live-exploitable
    by any client that sends `Host: localhost`. Same root cause covers building outbound URLs
    (reset/invite/share links, OAuth redirects, Stripe `success_url`) from the Host header, and the
    reverse-proxy angle (force the upstream Host, don't forward the client's).
  - Tier 1 #1 (RLS) expanded with three sub-points: codify RLS in migrations (a table added by SQL
    doesn't auto-enable RLS, diff migrations against the table list), confirm live state with the
    anon key or the provider's security advisor (migrations alone don't prove prod truth, needs
    sign-off), and policy-scoped-by-membership-but-not-role (a viewer reading service-role-only
    columns like OAuth tokens).
  - New Tier 0 item: **PostgREST/Supabase-REST filter injection** from string-concatenated query
    params (unencoded `&=(),` lets an attacker append filters or widen `select=`).
  - Tier 1 #3 (money pump) gained two sub-points: caps must be per-payer not per-resource, and
    expensive actions must role-gate the actor, not just rate-limit the route.
  - Two new Tier 2 scars: fail-open tenant scoping (a missing tenant id must return empty/throw, never
    "all rows") and rate-limit keys must come from the trusted proxy-derived IP, not a spoofable raw
    `X-Forwarded-For`.
  - `references/production-hardening.md` gained a **Payments and webhooks: money-path robustness**
    section: claim-first atomic webhook idempotency (not check-then-mark, which TOCTOU
    double-processes), never swallowing a transient idempotency-claim error (a genuine duplicate is
    silent, a DB error must 500 so the provider retries), atomic credit/balance mutations (never
    read-then-patch), gating grants on confirmed payment status including the async Stripe methods,
    and correlating refund reversals on `payment_intent` (not the Checkout Session id).
  - Method section gained a step: verify live infra state, not just code, for anything whose real
    behavior lives outside the repo (RLS on? bucket public? default vhost? enabled payment methods?),
    with the owner's per-run sign-off for anything touching prod.
  Sourced from a live-exploited production finding in the Confetti Albums audit and RLS/webhook/money-
  path findings in the Lucid Arc audit.

## 0.7.0 (2026-07-06)
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
