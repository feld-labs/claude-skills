---
name: seo-aeo-geo
description: Read when building any public-facing pages that should be found, by search engines AND by AI answer engines (ChatGPT, Claude, Perplexity, Google AI Overviews). Covers structured data (JSON-LD incl. FAQPage), an AI-crawler-friendly robots policy, a published-only sitemap, an llms.txt file, canonical per-page metadata, and content patterns (per-section "in short" summaries) that answer engines extract and cite. Applies to any product with a public surface, not just SaaS. Use whenever building marketing pages, listing/detail pages, legal pages, blogs, or docs.
---

# SEO / AEO / GEO Playbook

Two discovery channels now matter: classic **search** (SEO) and **answer/generative engines** (AEO/GEO,
ChatGPT, Claude, Perplexity, Google AI Overviews). The same foundations serve both: clean structured
data, crawlable public pages, and self-contained, extractable facts. Apply to every public page.

## 1. Structured data (JSON-LD) is the core win
Emit schema.org JSON-LD on public pages so both Google and answer engines extract facts cleanly. Build
small typed helpers and render them in a `<script type="application/ld+json">`:
- **Organization** + **WebSite** (with `SearchAction`) on the home page.
- Domain type per page: e.g. `Product`, `VacationRental`, `Event`, `Article`, `Recipe`, `SoftwareApplication`.
- **BreadcrumbList** on nested pages.
- **WebPage / AboutPage** on marketing + legal pages, with `dateModified` and `publisher`.
- **FAQPage** wherever you can, this is the **highest-leverage schema for answer engines**: each Q/A
  becomes a directly citable fact. Keep answers self-contained and plain-text.
Only emit structured data for what's shown publicly, never PII, internal pricing, or private identities.

## 2. robots policy that WELCOMES AI crawlers
Serve `robots.txt` (a route/handler if you need it dynamic) that allows the public surface and disallows
private/functional paths (`/api/`, auth, account, checkout, admin, portals). Then explicitly name the
search + AI agents you want, same exclusions:
- Search: `Googlebot`, `Bingbot`, `DuckDuckBot`, `Applebot`.
- AI: `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `anthropic-ai`, `PerplexityBot`,
  `Perplexity-User`, `Google-Extended`, `Applebot-Extended`, `CCBot`.
robots.txt is discovery policy, NOT access control, the private paths must ALSO be behind auth + RLS.

## 3. Sitemap: public + published only
Generate `sitemap.xml` from the DB: static marketing pages + active/published entities only. Never
include drafts, private routes, or unpublished rows. Set sensible `changeFrequency`/`priority` and
regenerate on a short interval so new content appears promptly.

## 4. llms.txt for AI discovery
Publish an `llms.txt` (llmstxt.org): a concise, curated, plain-text map of the site written for LLMs, an
H1 name, a one-line blockquote summary, then sectioned links (start here, key categories, for-hosts/for-
users, legal, contact). Serve it via a route handler (host-neutral, works on any deployment, not just
Vercel) and make it brand-aware if the app is white-label.

## 5. Per-page metadata
Every public page sets a specific title + description, a **self-referential canonical**, and OpenGraph.
Every private/auth page sets `noindex`. For white-label, resolve name + origin per brand so canonicals
and `og:url` are per-tenant correct.

## 6. Content patterns answer engines love (GEO)
- **Per-section "in short" summaries** (the Airbnb/VRBO legal pattern): a one-line plain-language gist
  at the top of each section. Humans skim it; answer engines quote it as the citable summary of that
  section.
- **Deep-linkable headings** (anchored `id`s + a table of contents) so an engine can cite a specific
  clause or answer.
- **Self-contained answers**: write so a paragraph makes sense lifted out of context, that is exactly
  how it will be quoted.

## Checklist
- [ ] JSON-LD on every public page (Organization/WebSite on home; domain type per page; FAQPage where possible)
- [ ] robots.txt allows named search + AI crawlers; private paths disallowed AND auth-protected
- [ ] sitemap.xml is DB-driven, published/public only
- [ ] llms.txt served (brand-aware if white-label)
- [ ] Every public page: specific title/description, self-referential canonical, OG; private pages noindex
- [ ] Long-form pages use "in short" summaries + anchored headings for extraction
