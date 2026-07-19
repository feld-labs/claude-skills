---
name: release-qa-plan
description: Read when writing, regenerating, or running a QA / test plan for a release, or deciding what must pass before shipping or charging real users. Produces a release-gates-first plan: the hard-stop gates (tenant isolation, the money path end to end, critical-path regression, onboarding) before the per-feature checklists, with assertions pulled from real code. Use to structure QA, avoid an aspirational checklist, and keep one source of truth for "what's next after QA."
---

# Release QA Plan (gates first)

Most QA docs list features in the order they were built. That buries the things that actually block a
launch. Structure the plan by **risk**: the release gates first (a failure is a hard stop), then the
per-feature checklists. This is a meta-skill; it defers the gate specifics to the domain skills.

## 1. Release gates (must pass before charging a real user)
Put these at the top, before everything else. For a typical multi-tenant SaaS:
- **Tenant isolation.** No endpoint returns or writes another tenant's data. Any cross-read is a blocker.
  Defer the exact tests to [[multi-tenant-isolation]].
- **The money path, end to end.** Free/trial state -> the paywall response -> checkout -> webhook grant ->
  the entitlement fields flip -> the gated feature now works -> refund behaves. Run in the provider's TEST
  mode. Defer specifics + the idempotency/replay check to [[saas-billing]].
- **Critical-path / legacy regression.** The existing thing you must not break still works unchanged
  (the founder's account, the primary workflow, the data that predates the new code).
- **Onboarding a brand-new user.** Empty account -> create -> connect data -> lands in the app on the
  correct default tier, with no retired options in the flow.
- **Security-review pass.** A launch-grade security audit is green at the depth the surface warrants: no
  open Critical/High, and the mechanizable classes (RLS enabled per table, no client-writable
  billing/usage state, no globally-readable table carrying per-user content, secrets tripwire) are
  enforced as standing CI gates, not just checked by hand. Defer the checklist and the CI-gate shape to
  [[security-review]]. A Critical/High finding stops the release the same way a cross-tenant read does.

State plainly: any red gate stops the release. Everything below is important but not a launch blocker.

## 2. Feature areas (after the gates)
One short checklist per area (auth, data layer, the core feature, sharing, performance, security/privacy,
feature-level enforcement). Keep each item **tied to reality**, a thing you can actually click or curl, not
an aspiration. Mark pass/fail and note anomalies.

## 3. Pull assertions from CODE, not memory
When an area has exact numbers or rules, read them out of the source so QA checks the truth:
- A **billing grant table** built straight from the entitlement map (e.g. `TIER_GRANTS`), so each SKU's
  caps/credits are asserted against what the code grants, not what a doc claims.
- **Negative checks** for retired paths: assert old SKUs / dead tiers now 400 or are gone.
- Verify **migrations** are actually applied before trusting migration-dependent gates (see
  [[supabase-migration-verify]]).

## 4. One source of truth
- **Defer** gate specifics to the domain skills (don't duplicate the isolation or billing tests here).
- End with a short **"what's next after QA"** that points at the project's roadmap/TODO, rather than
  re-listing the whole backlog. QA feeds the plan; it is not the plan.

## 5. Make it verifiable and legible
- Checkboxes; a legend for backend-agnostic vs backend-specific checks.
- Group by risk so a reader can run the gates first and stop if one is red.
- Note prerequisites up front (a second test account for isolation, the provider's test-mode keys, a
  throwaway record) so the human can actually execute it.

The goal: a reader can run the gates, know instantly whether the release is safe, and only then work
through the feature areas.
