---
name: seo-aeo-geo
description: Read when building any public-facing pages that should be found, by search engines AND by AI answer engines (ChatGPT, Claude, Perplexity, Google AI Overviews). Covers structured data (JSON-LD incl. FAQPage), an AI-crawler-friendly robots policy, a published-only sitemap, llms.txt/llms-full.txt, canonical per-page metadata, content patterns (per-section "in short" summaries, propositions over adjectives) that answer engines extract and cite, plus the credibility layer that makes authority content actually rank: primary-source sourcing discipline, a claim ledger, mechanism-over-outcome claims, and publishing original first-party research with Dataset schema as an AEO moat. Applies to any product with a public surface, not just SaaS. Use whenever building marketing pages, listing/detail pages, legal pages, blogs, docs, or a research/benchmark hub.
---

# SEO / AEO / GEO Playbook

Two discovery channels now matter: classic **search** (SEO) and **answer/generative engines** (AEO/GEO,
ChatGPT, Claude, Perplexity, Google AI Overviews). The same foundations serve both: clean structured
data, crawlable public pages, and self-contained, extractable facts. Apply to every public page.

Three pillars, not two. The mechanics below (structured data, crawlability, extractable facts) make a
page *findable*. But for any authority or research play, a fourth thing decides whether it *ranks and
gets cited*: **the credibility of the claims themselves** (section 7). A perfectly-marked-up page full
of unsourced statistics loses to a plain page whose every number links to a primary source. Do not skip
section 7 because it is not about code; it is the part competitors get wrong.

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

## 4. llms.txt (+ llms-full.txt) for AI discovery
Publish an `llms.txt` (llmstxt.org): a concise, curated, plain-text map of the site written for LLMs, an
H1 name, a one-line blockquote summary, then sectioned links (start here, key categories, for-hosts/for-
users, legal, contact). Serve it via a route handler (host-neutral, works on any deployment, not just
Vercel) and make it brand-aware if the app is white-label.
For a content or research-heavy site, also publish **`llms-full.txt`**: the full corpus inlined as clean
Markdown in one token-efficient document, so an answer engine can ingest the whole primary dataset
without crawling and without spending context on nav and chrome. Link it from `llms.txt` as an optional
"full corpus" entry. State the usage license at the top (e.g. CC BY 4.0) so citation-with-attribution is
explicitly permitted. Every figure in it obeys section 7: no claim appears here that could not appear on
a published page.

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
- **Claim propositions, not adjectives.** Answer engines extract and quote *specific factual assertions*,
  not superlatives. "Reads only first-party company job boards, never aggregators" is liftable; "the best
  job tool" is not. Mechanism claims (what the product concretely does) also have a defensive property a
  rating does not: a competitor can print a bigger number tomorrow, but cannot repeat your mechanism claim
  without changing their own product. Write the checkable proposition, and cut the adjective.

## 7. Credibility: the layer that makes authority content actually rank
Structured data gets you crawled. Sourcing gets you *cited and trusted*. For any page making factual
claims (research hub, benchmarks, "state of X", stat-backed marketing), this is the highest-leverage and
most-skipped work. The governing rule: **an unsourced or weakly-sourced claim is worse than no claim.**
- **Primary source or nothing.** Every external figure links to the entity that produced the data (the
  company's own report, a peer-reviewed paper, a government dataset), never to a content-marketing page
  that quoted it. If the honest verdict is "no primary source exists," do not publish the number.
- **Chase to origin.** When a claim is attributed to a blog or a bare publisher name, trace it upstream. If
  it resolves to a primary source, cite THAT directly and the aggregator never appears in your citations.
  If it dead-ends in a loop of marketing pages citing each other, drop it. (Cautionary example: the
  ubiquitous "75% of resumes are auto-rejected by an ATS" traces to a 2012 sales pitch by a company that
  folded in 2013, with no study behind it. Most pages "debunking" it are themselves unsourced. That whole
  circular ecosystem is what your site must not join.)
- **Keep a claim ledger.** A `CLAIM-LEDGER.md` listing every publishable claim with: the claim as stated,
  the source, source tier (primary / secondary / promotional / none), a verdict (citable / citable with
  caveat / source needed / do not publish), and a one-line note. Nothing ships to a public page until its
  ledger row is citable. This is the gate that keeps an authority site honest as it scales.
- **Mechanism claims over outcome claims.** Prefer claims about what the product verifiably DOES over
  claims about outcomes you cannot evidence. "We check a posting is still open before recommending it" is
  checkable; "our users get hired 3x faster" needs a study you probably do not have. If you do not have
  the study, do not imply the outcome. This is also better AEO material (see section 6).
- **State dataset scope explicitly.** Every published figure names its sample size (n), source, date
  range, and methodology limits. This is what `Dataset` schema (section 8) encodes, and what separates a
  citable benchmark from a floating number.
- **Interactive tools inherit the same gate.** A calculator or estimator is only as honest as its inputs.
  If a multiplier or rate has no primary source, either omit it or label it visibly as an editorial
  assumption; never present an unsourced coefficient as a measured result.

## 8. Original research as an AEO moat
Answer engines preferentially cite *primary datasets and original studies*, because aggregated advice is
synthesized away into the average. The durable play for a data-rich product is to become the source
others cite, not another citer.
- **Publish first-party data with `Dataset` + `TechArticle` + `Table` schema.** A three-tier hub works
  well: a `CollectionPage` / `DefinedTermSet` root, `ItemList` cluster pages, and leaf pages typed as
  `Dataset` + `TechArticle` with the numbers in a real `<table>`. Open the leaf with a 40-to-50-word
  direct-answer block (section 6), then the methodology and citations.
- **The best claim you cannot source yet is a study you can run.** If the category's key question has no
  rigorous public answer (common), and your product accumulates the relevant outcome data, you are
  positioned to publish the first credible measurement and become the cited authority. Treat that as a
  roadmap opportunity gated on real data and sound methodology, never as a claim you make before you have
  earned it.

## Checklist
- [ ] JSON-LD on every public page (Organization/WebSite on home; domain type per page; FAQPage where possible)
- [ ] robots.txt allows named search + AI crawlers; private paths disallowed AND auth-protected
- [ ] sitemap.xml is DB-driven, published/public only
- [ ] llms.txt served (brand-aware if white-label); llms-full.txt for research/content-heavy sites, with license
- [ ] Every public page: specific title/description, self-referential canonical, OG; private pages noindex
- [ ] Long-form pages use "in short" summaries + anchored headings for extraction
- [ ] Claims are propositions, not adjectives; mechanism over outcome
- [ ] Every external figure links a PRIMARY source; a claim ledger gates what ships; unsourced = not published
- [ ] Original research published with Dataset/TechArticle/Table schema and explicit scope (n, source, dates, limits)
