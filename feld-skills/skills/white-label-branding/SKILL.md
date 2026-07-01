---
name: white-label-branding
description: Read when making a product white-label, one deployment that renders as many brands (its own name, copy, theme/colors, logo, domain, and legal/SEO identity). Covers config-driven brand identity, resolving the brand per request, passing it to the UI (client components can't resolve it), theming via CSS variables from stored tokens, and per-brand SEO/comms/legal. Pairs with multi-tenant-isolation (that skill owns data isolation; this one owns look, copy, and identity). Use for "make this white-label", "let customers use their own domain and branding", or per-tenant theming/content.
---

# White-Label Branding Playbook

Turning one app into many brands is mostly a *data + propagation* problem, not a redesign. The rule:
**nothing brand-specific is hardcoded; everything renders from resolved config.** Pair this with
`multi-tenant-isolation`, which keeps each brand's DATA separate; this skill keeps each brand's
IDENTITY (name, copy, theme, SEO, legal) correct.

## 1. Split brand config into three kinds
- **Content** (home hero, destinations, story, CTAs): the marketing copy that changes per brand.
- **Identity** (legal name, support email + phone, domain, currency, locale, SMS sender): used by
  transactional email/SMS, SEO, and legal/footer.
- **Theme** (color tokens, logo): the visual skin.
Keep a **static default** for all three so the primary brand renders byte-for-byte unchanged and any
resolve failure degrades to it. A tenant row overrides only the keys it sets.

## 2. Resolve the brand once per request, on the server
- One resolver (`getBrand()`) reads the request host (via the middleware-set, unspoofable header, see
  multi-tenant-isolation) and layers the tenant's stored content/identity/theme over the static default.
- **Wrap it in a request cache** (e.g. React `cache()`) so the root layout, page, and metadata all
  resolve with a single DB hit.
- Unknown host, or DB hiccup, returns the default. The primary brand never breaks.

## 3. Client components receive the brand as PROPS
This is the bug that always ships first: a client component (`Header`, `SearchBar`, footer) does
`import { brand } from '@/lib/brand/config'` and hardcodes the default brand, so every tenant domain
shows the WRONG name and nav. Client components have no request context and **cannot** resolve the
tenant. Resolve on the server (layout/page) and pass `brandName`, nav items, destinations, etc. down as
props. Grep for direct static-config imports in `'use client'` files before shipping.

## 4. Theme via CSS variables generated from stored tokens
- Define the palette as CSS custom properties consumed with an alpha channel, e.g. Tailwind
  `rgb(var(--brand-500) / <alpha-value>)`. Then a brand re-skins by overriding variables, no component
  changes.
- Store the tenant's overrides as data (`brands.theme` jsonb: `{ "brand": { "500": "12 74 110" } }`,
  space-separated RGB channels matching the token format).
- A **pure serializer** turns that into a `:root { --brand-500: ...; }` block; the root layout injects it
  in `<head>` when non-empty. Empty theme = no-op = default unchanged.
- **Validate every token name and value** (allowed palette, numeric shade, safe characters) so stored
  data can never break out of the `<style>` tag. Unit-test the serializer.

## 5. Per-brand SEO, comms, and legal
- SEO: titles, canonicals, `og:url`, and JSON-LD use the resolved brand's name + origin (its own domain
  for a tenant). See the `seo-aeo-geo` skill for the structured-data kit.
- Transactional email/SMS: From name/address, support contact, and SMS sender come from brand identity.
- Legal/footer: legal entity name, support email, and governing-law jurisdiction are brand identity
  fields (env-overridable), so Terms/Privacy/About render per brand. Provide sensible defaults.

## 6. Onboarding a new brand is an operation, not a deploy
The payoff of doing the above: a new customer = one `brands` row (name, domain, content, identity, theme)
+ pointing their domain at the app. No code change, no rebuild. Keep a seed script that stands up a real
second brand so the multi-brand path is always exercised.

## Checklist
- [ ] Content, identity, and theme are config/data, with a static default fallback
- [ ] One cached server resolver; unknown host degrades to default
- [ ] No `'use client'` component imports the static brand config; brand passed as props
- [ ] Theme is CSS-variable tokens overridden from validated stored jsonb; serializer unit-tested
- [ ] SEO, email/SMS, and legal copy all read the resolved brand
- [ ] A new brand is a row + a domain (seed script proves the second-brand path)
