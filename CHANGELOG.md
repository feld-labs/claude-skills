# Changelog

Newest first. Bump `feld-skills/.claude-plugin/plugin.json` version with each change.

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
