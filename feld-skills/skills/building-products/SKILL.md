---
name: building-products
description: The master skill for taking any product from idea to working code, scoping and gap analysis, roles and permissions, pricing research, PRD, schema-first database design with RLS, phased build, and handoff. Read it FIRST whenever someone wants to build, scope, plan, architect, or spec a product, app, platform, or SaaS ("build me an app", "I have a product idea", "create a PRD", "scope this", "architect this", "build something for [industry]"), including sub-steps (PRD, schema, roles, pricing). It ROUTES: it names the product-type layer and the focused skills to load for the specifics (marketplace, multi-tenant, billing, branding, trust, SEO, shipping). Product-agnostic; the depth lives in the skills it points to.
---

# Building Products (master)

The entry point for any product build. This skill owns the universal lifecycle and, more importantly,
**routes**: it tells you which specialization layer and which focused skills to load for the parts that
are deep and expensive to get wrong. Do not reinvent those here, compose them.

## Step 0: Route before you build
Identify the product type and load the matching skills alongside this one. They compose (a white-label
booking marketplace loads several).

| If the product involves... | Also load |
|---|---|
| A multi-sided marketplace / booking / rental / "Airbnb for X" | `building-marketplace-platforms` |
| One deployment serving many tenants (accounts/orgs) | `multi-tenant-isolation` |
| Per-tenant branding on their own domain (white-label) | `white-label-branding` (+ multi-tenant-isolation) |
| Payments, subscriptions, credits | `saas-billing` |
| Verifying identity / right-to-act before a high-stakes action | `trust-and-verification` |
| Public pages that must be found by search + AI answer engines | `seo-aeo-geo` |
| Optional third-party integrations (email, analytics, monitoring) | `optional-integrations` |
| Any real UI | `design-and-ui-craft` |
| Building on Next.js (App Router) | `shipping-nextjs-app` |
| A QA / release plan | `release-qa-plan` |
| Verifying which DB migrations are live | `supabase-migration-verify` |
| Naming, hero, and go-to-market | `product-positioning`, `marketing-asset-gen` |

Workflow skills apply throughout: `ai-git-ops` (branch/PR discipline), `plan-and-handoff` (multi-agent
and human+AI coordination), and the deploy skill for the target host (host-agnostic, not Vercel-specific).

## Core principles
1. **Never bury the lead.** Plain language; say what things do.
2. **Accessibility first**, and **design consistency** throughout (see `design-and-ui-craft`).
3. **SEO + AI discoverability** on every public page (see `seo-aeo-geo`).
4. **Security by default:** RLS on every table, encrypt sensitive data, never store secrets in code, audit writes.
5. **Never build half a feature.** Finish each piece; if you hit limits, stop and ask.
6. **Portable across sessions:** three living docs (PRD, TASK-LOG, CHANGELOG) are the source of truth.

## The phases (in order; each feeds the next)

**1. Scoping and gap analysis.** Absorb the idea, then produce ONE structured list of every ambiguity
(users/roles, workflows, data/sensitivity, pricing, integrations, platform, compliance) and ask it all
at once. Do not proceed until resolved (or explicitly deferred).

**2. Roles and permissions.** Map relationships (one person often holds different roles in different
contexts). Build a permissions matrix (actions x roles) plus the role hierarchy, it becomes the RLS
blueprint. See `references/permissions-template.md`.

**3. Industry and pricing research.** Research market size, margins, and competitor pricing. Design tiers
that scale with the customer's revenue, a genuinely useful free tier, and a long trial. Validate the name
against competitors, domains, and trademarks.

**4. PRD.** One document that fully specifies the build (what it is, money, roles, DB architecture,
security, payments, notifications, key flows, phased rollout, stack, backlog, metrics, resolved
decisions). See `references/prd-template.md`.

**5. Schema-first database (highest rigor).** Non-negotiables:
- UUIDs; `created_at`/`updated_at` via a shared `set_updated_at()` trigger; soft deletes (`deleted_at`)
  with partial-unique indexes so deleted rows do not block re-use.
- **RLS on every table, in the same migration.** RLS helpers are `SECURITY DEFINER` +
  `SET search_path = public, pg_temp` + `STABLE`.
- **All money is `bigint` cents**, never int, never float. Payment-provider ids stored as references;
  no card/bank data in the DB. Any ledger is **append-only** (triggers block UPDATE/DELETE; corrections
  are reversal rows) and written only via the service role. Money-recording webhooks need an
  **idempotency guard** (a `processed_events` table).
- Sensitive fields encrypted at the app layer (AES-256-GCM), decrypt server-side only.
- No-overlap rules (bookings/scheduling) use a **GiST exclusion constraint** at the DB, not app code.
- **Validate every migration with a real parser** (`pglast`) before presenting.
- Reporting is **DB views derived from the ledger**, never recomputed in app code
  (`references/reporting-and-hardening.md`). Multi-tenant scoping: `multi-tenant-isolation`.

**6. Task log and portable docs.** Group tasks by feature; each is a testable checkbox. Maintain the
three docs (`PRD`, `TASK-LOG`, `CHANGELOG`) so any session or agent resumes exactly where the last stopped.

**7. Build.** Within each feature, build migration -> RLS -> API route -> validation schema -> UI. Finish
each feature before the next. **Run a production build before calling a milestone done**, tsc + unit
tests do not catch build/prerender errors (see `shipping-nextjs-app`). Update the task log each session.

## Anti-patterns
- Coding before the PRD is done. Asking gap questions one at a time. Separate packages for segments that
  differ only by volume (use volume pricing). Assuming a name is free. Skipping RLS. Storing sensitive
  data unencrypted. Shipping half a feature. Recomputing money in app code. Declaring "done" without a
  production build.

## Detailed references
- `references/prd-template.md`, `references/permissions-template.md`, `references/reporting-and-hardening.md`
- Deep topics live in the focused skills listed in Step 0.
