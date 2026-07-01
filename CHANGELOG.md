# Changelog

Newest first. Bump `feld-skills/.claude-plugin/plugin.json` version with each change.

## 0.2.0 (2026-07-01)
Distilled from the Gulf Coast Stays build (white-label vacation-rental marketplace).
- **New: white-label-branding**: one deployment, many brands: config-driven
  identity/content/theme, per-request server resolve, brand-as-props (client can't
  resolve the tenant), CSS-variable theming from stored tokens, per-brand SEO/comms/legal.
- **New: seo-aeo-geo**: get found by search AND answer engines: JSON-LD (incl.
  FAQPage), an AI-crawler-friendly robots policy, a published-only sitemap, llms.txt,
  canonicals, and extractable content patterns.
- **New: trust-and-verification**: identity + right-to-act attestation + private
  document uploads; the mock-in-dev / hard-block-in-prod gate; publish/checkout gating.
- **New: shipping-nextjs-app**: run `next build` before "done" (tsc + tests miss it),
  plus the App Router build gotchas (request-scoped APIs at build time, useSearchParams
  + Suspense, per-tenant pages must be dynamic).
- **Updated: multi-tenant-isolation**: added domain-resolved (white-label) tenancy and
  the concrete Postgres RLS patterns (restrictive policy layered on ownership,
  parent-derived tenant-id triggers, per-tenant unique namespaces, real-DB isolation test).

## 0.1.0 (2026-06-27)
- Initial marketplace + `feld-skills` plugin with four playbook skills:
  saas-billing, multi-tenant-isolation, product-positioning, marketing-asset-gen.
- Distilled from the Confetti Albums build.
