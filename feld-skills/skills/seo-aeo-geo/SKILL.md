---
name: seo-aeo-geo
description: Read when building any public-facing pages that should be found, by search engines AND by AI answer engines (ChatGPT, Claude, Perplexity, Google AI Overviews). Covers structured data (JSON-LD incl. FAQPage), an AI-crawler-friendly robots policy, a published-only sitemap, llms.txt/llms-full.txt, canonical per-page metadata, content patterns (per-section "in short" summaries, propositions over adjectives) that answer engines extract and cite, the doctrine for scaled per-entity/programmatic pages (compete for the query without asserting the superlative, a no-data-no-page anti-spam gate, a banned-phrase CI check), plus the credibility layer that makes authority content actually rank: primary-source sourcing discipline verified by re-fetching (not trusting) the source, a claim ledger, mechanism-over-outcome claims, publishing original first-party research with Dataset schema as an AEO moat, the boundary between what that program publishes and what it must keep private to protect the underlying data moat, and a pattern for distributing third-party content (listings, reviews) without becoming a penalized mirror site. Applies to any product with a public surface, not just SaaS. Use whenever building marketing pages, listing/detail pages, legal pages, blogs, docs, or a research/benchmark hub.
---

# SEO / AEO / GEO Playbook

Two discovery channels now matter: classic **search** (SEO) and **answer/generative engines** (AEO/GEO,
ChatGPT, Claude, Perplexity, Google AI Overviews). The same foundations serve both: clean structured
data, crawlable public pages, and self-contained, extractable facts. Apply to every public page.

Three pillars, not two. The mechanics below (structured data, crawlability, extractable facts) make a
page *findable*. But for any authority or research play, a fourth thing decides whether it *ranks and
gets cited*: **the credibility of the claims themselves** (section 8). A perfectly-marked-up page full
of unsourced statistics loses to a plain page whose every number links to a primary source. Do not skip
section 8 because it is not about code; it is the part competitors get wrong.

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
explicitly permitted. Every figure in it obeys section 8: no claim appears here that could not appear on
a published page. It is also bound by the moat boundary (section 9): it inlines the authority corpus
only, never protected per-record data.

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

## 7. Programmatic pages: the scaled-content doctrine
Section 6 covers a single page. This section covers pages generated at scale, one per company,
product, location, or other entity, which is where AEO spam and the search engines' scaled-content and
site-reputation penalties concentrate. The governing rule: **compete for the "best [X] for [entity]"
query, never assert the superlative.** Answer the high-intent question with entity-specific facts and
let the content earn "best"; do not print the word.
- **Interrogative or plainly descriptive titles and H1s, never self-praise.** "How to [do X] at
  [entity]" or "[Entity]'s [category] and how it works", never a superlative about your own product
  bolted onto an entity name. A title that asserts rank is telling the reader, and the crawler, that the
  body will not have to.
- **The no-data-no-page gate (the anti-spam gate).** A scaled page ships ONLY if its entity-specific
  slots can be filled from real, current data you uniquely hold. A template with the noun swapped and an
  otherwise-identical body is the textbook programmatic-spam signature, the exact pattern both search and
  answer engines are now tuned to demote. If you have nothing entity-specific to say about this entity,
  publish nothing for it.
- **Entity-specific claims require entity-specific evidence.** You may state category- or
  platform-level facts if sourced, and facts you observe about the entity if timestamped. Never
  attribute to a specific entity something you cannot evidence for THAT entity; a true category-level
  statement is not proof of an entity-level one.
- **Cap and label boilerplate.** Identical text shared across the page set is fine, but bound it to one
  labeled block. The entity-specific content must be the majority of the page by construction, the slot
  structure guarantees this, it is not left to editorial discipline.
- **Pages decay with their data.** When the data behind a page goes stale, the page says so or
  unpublishes (out of the sitemap, out of llms.txt, `noindex`). Asserting live or current data you no
  longer hold is a freshness lie, and at scale it is the fastest way to lose trust across the whole page
  set at once.
- **Enforce mechanically, not by memory.** Add a banned-phrase CI check (a list like "best", "top",
  "#1", "guaranteed", plus outcome-claim phrases) that FAILS THE BUILD. Review-by-memory does not scale
  to a page-per-entity template, a red build does; one bad template reviewed once can otherwise
  instantiate the violation across every entity in the set.

## 8. Credibility: the layer that makes authority content actually rank
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
- **A citation is not sufficient, the source must support the claim AS WRITTEN.** Verify this by
  actually re-fetching the source and rereading it, not by trusting that a pasted URL backs the sentence
  sitting next to it. A URL that resolves is not evidence; a URL whose content matches the specific
  number and scope claimed is. Two failure modes account for most of the drift, both come from a real
  citation that does not say what the copy says:
  - **Overstatement**: a general category or market-trend statement (the source says an industry or
    practice is common) gets attributed to one specific named vendor or entity, as if that entity were
    individually confirmed.
  - **Figure drift**: a specific-figure claim (a count, a percentage, a "N states/companies/cases")
    that is not actually stated on the cited page, usually because a broader or vaguer source got
    paraphrased into a precise number somewhere along the way.
  Use "citable with caveat" for a source that supports PART of the claim but not all of it, the
  direction or category but not the exact figure, or a narrower scope than the claim states; write the
  caveat inline next to the claim, not only in the ledger.
- **Authority pages carry a `verified-as-of` date, and claims are re-verified on a cadence**, not
  written once and left. Treat a stale `verified-as-of` date as a risk flag in itself: in practice the
  oldest unverified pages are exactly where drift and overstatement concentrate, because nobody has
  looked at them since they were current, and content that was accurate at write time silently stops
  being accurate while the page keeps asserting it.
- **Mechanism claims over outcome claims.** Prefer claims about what the product verifiably DOES over
  claims about outcomes you cannot evidence. "We check a posting is still open before recommending it" is
  checkable; "our users get hired 3x faster" needs a study you probably do not have. If you do not have
  the study, do not imply the outcome. This is also better AEO material (see section 6).
- **State dataset scope explicitly.** Every published figure names its sample size (n), source, date
  range, and methodology limits. This is what `Dataset` schema (section 9) encodes, and what separates a
  citable benchmark from a floating number.
- **Interactive tools inherit the same gate.** A calculator or estimator is only as honest as its inputs.
  If a multiplier or rate has no primary source, either omit it or label it visibly as an editorial
  assumption; never present an unsourced coefficient as a measured result.

## 9. Original research as an AEO moat
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
- **Moat boundary: a content/AEO program can silently undo an anti-enumeration or anti-scraping
  defense.** Publishing your data as authority content and protecting your data as a competitive moat
  are in tension; it is easy to leak the moat one page at a time without anyone deciding to. Define
  explicitly what NEVER goes on a public surface (per-item extracted analysis, per-record derived
  signals, the bulk dataset that sits behind auth), and exclude it from sitemaps, structured data
  (JSON-LD), AND `llms-full.txt` alike. Publish the authority layer (research, explainers, aggregate
  stats); never the moat itself. `llms-full.txt` inlines the authority corpus only, never the protected
  per-record data, treat it as a public surface bound by the same exclusion list as the sitemap, not as
  an internal export.

## 10. Distributing third-party content without becoming a mirror site
When a page surfaces content owned by others (listings, third-party descriptions, reviews, aggregated
data), there is a defensible pattern and a penalized one; know which one you are building before you
scale it.
- **The defensible pattern**: uncopyrightable facts (price, date, location, category) + one bounded,
  visibly-attributed excerpt + your own value-add (analysis, comparison, context the source itself does
  not provide) + a canonical link back to the source + auto-expiry when the source item goes away.
- **The mirror-site failure mode**: republishing others' prose as your own content, at scale, with
  little or no added value on top. This is duplicate content at scale, both search and answer engines
  penalize it, and it reads as off-brand even in the cases it is not caught.
- **Vertical structured-data surfaces reward attributed distribution.** A jobs, products, or events
  rich-result feed treats a well-attributed, clearly-sourced participant as legitimate, not as a mirror,
  provided the pattern above holds.
- **Freshness is a ranking edge on these surfaces, not just a quality nicety.** Verified-still-live data
  beats a bigger but staler competitor feed; being the source whose items are actually current is a
  defensible position a larger competitor cannot buy just by listing more items.

## Checklist
- [ ] JSON-LD on every public page (Organization/WebSite on home; domain type per page; FAQPage where possible)
- [ ] robots.txt allows named search + AI crawlers; private paths disallowed AND auth-protected
- [ ] sitemap.xml is DB-driven, published/public only
- [ ] llms.txt served (brand-aware if white-label); llms-full.txt for research/content-heavy sites, with license
- [ ] Every public page: specific title/description, self-referential canonical, OG; private pages noindex
- [ ] Long-form pages use "in short" summaries + anchored headings for extraction
- [ ] Claims are propositions, not adjectives; mechanism over outcome
- [ ] Programmatic/per-entity pages pass the no-data-no-page gate, use interrogative/descriptive titles
      (never self-praise), and a banned-phrase CI check fails the build on superlative/outcome claims
- [ ] Every external figure links a PRIMARY source; a claim ledger gates what ships; unsourced = not
      published; citations verified by re-fetching the source and support the claim AS WRITTEN, not just
      trusted; `verified-as-of` dates set and re-checked on a cadence
- [ ] Original research published with Dataset/TechArticle/Table schema and explicit scope (n, source, dates, limits)
- [ ] Moat boundary defined: per-item/per-record protected data excluded from sitemap, JSON-LD, AND llms-full.txt
- [ ] Third-party content distribution uses facts + one bounded attributed excerpt + your own value-add
      + a canonical link to the source, never a mirror of others' prose
