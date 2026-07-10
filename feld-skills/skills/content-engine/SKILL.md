---
name: content-engine
description: Read when standing up or running a content operation for any product site, scoping a content strategy, building a content calendar, writing SEO/GEO reference pages or blog posts at scale, or turning a one-off content ask into a repeatable production pipeline. Covers the two-track content repository (reference pages + editorial pillars), the strategy-scoping phase (positioning spine, competitive model choice, journey-mapped pillars, N-format topic clusters), the writing rules (voice, GEO, accuracy contract, benchmark honesty), and the model/agent production pipeline (strategist scopes and QAs, cheaper writer agents draft against templates and exemplars into disjoint files, orchestrator integrates single-track). Use for "content strategy", "content calendar", "write the blog posts", "fill the glossary", "content base for <site>", or any request to produce many content pieces.
---

# Content Engine: Scoping, Writing, and Production at Scale

A repeatable system for taking a product from "we should have content" to a full, scheduled,
publishable content base. Distilled from the Lucid Arc content build (strategy doc + 15 metric
reference pages + editorial pillar posts + a 27-post cluster backlog produced by a writer fleet).
This skill owns the content OPERATION. It pairs with [[seo-aeo-geo]] (the technical
discoverability layer: JSON-LD, robots, sitemap, llms/glossary files) and
[[product-positioning]] (how the positioning spine is derived). [[delegate-and-qa]] owns the
general delegation mechanics this skill applies to writing.

## 1. The repository: content-as-data, two tracks

Before any writing, the site needs the Lucid Arc-proven storage pattern (build it once, per
[[seo-aeo-geo]] and the web-experience playbook):

- **Track 1: permanent reference pages** (`/metrics`, `/glossary`, `/guides`, whatever the
  domain's atomic concepts are). One typed object per concept in a data module
  (`content/<things>.ts`), rendered by ONE template. Fields for the Lucid Arc shape: name, slug,
  one-liner, "in short" AEO block, definition, formula/procedure, worked example, the
  DIFFERENTIATED angle (see 2.1), benchmark/reference table, common mistakes, related links, FAQ.
- **Track 2: editorial** (`/blog`). One typed object per post, block-model body (heading /
  paragraph / list / callout), named author, ISO date, tags, rendered by ONE template.
- **Machine surfaces updated with every content add**: glossary.txt (or llms.txt) line per
  concept, sitemap.xml URL per page. Same PR, never a follow-up.
- Adding content = appending typed entries. No engineering per piece. This is what lets a
  writing lane (or an agent fleet) scale content without touching code.

If the repository does not exist yet, that is an engineering ticket FIRST (route per
[[delegate-and-qa]]); do not start writing into documents that have no home.

## 2. The scoping phase (strategist lane, do once)

One strategy doc (`docs/CONTENT-STRATEGY.md` in the product repo), five decisions. Every later
piece hangs off it; nothing gets written before it exists.

### 2.1 The positioning spine
One paragraph every piece reinforces, with a one-line contrast against the obvious competitor
("X tells you what your numbers are. We tell you whether they are right."). Derive per
[[product-positioning]]. Include the practical test: if a competitor's blog could publish the
piece unchanged, it does not ship. The spine names the DIFFERENTIATED angle every reference page
must carry (for Lucid Arc: "how a buyer verifies this," not just "what it is").

### 2.2 The competitive model choice, made explicitly
Survey 3 or 4 content operations in or near the space. For each: their model, what to take, what
to reject. Then one sentence: "we copy A's foundation, run through B's discipline, on C's
structure, and deliberately do not play D's game." An implicit model produces drift; an explicit
one makes every future content decision mechanical. (Lucid Arc: Baremetrics'
glossary-as-SEO-foundation x PostPeer/SocialKit's systematic formats-per-topic x LiveFlow's
editorial/programmatic split; explicitly NOT ChartMogul's 540-article volume game.)

### 2.3 The N-format topic cluster (the backbone)
Pick the domain's atomic topic list (10 to 20 concepts) and fix N formats per topic. Lucid Arc:
15 metrics x 3 formats (definition page, "How to Calculate X", "How Buyers Verify X") = a
45-piece backbone. Put the full backbone in the strategy doc as a TABLE: topic, slug, one row
per format, status (live / this wave / backlog), title. Fixed title patterns per format keep the
cluster systematic and make delegation trivial.

### 2.4 Editorial pillars mapped to a journey
3 or 4 pillars, each with audience, journey stage, cadence, and JOB. Map to the journey the
competition ignores (Lucid Arc: everyone writes for the operator journey; we own the seller
journey, and the buyer-side pillar is the flanking move that reaches sellers from across the
table). Any pillar gated on data or capability you lack is marked FUTURE with its unlock
condition, never started early.

### 2.5 The dated calendar
90 days of specific, titled, dated pieces (publish dates go into each entry's date field).
Beyond 90 days: a cadence rule for the backlog (e.g. one cluster-pair per week, ordered by
search volume). The calendar is the production queue for every later wave.

## 3. The writing rules (every piece, every writer)

- **Voice**: short sentences, one idea each. Lead with the finding, not the product. Specific
  numbers over vague claims. No hedging, no filler, NO em-dashes (house rule). H2/H3 in question
  form so answer engines lift them. Named author on every piece (a real person, ratified).
- **The accuracy contract**: every factual or product claim traces to a named source-of-truth
  doc (for Lucid Arc: METRICS_METHODOLOGY.md). Writers never invent formulas, thresholds, or
  product capabilities. Where the product does NOT do something adjacent (compute CAC, show a
  standalone tile), the piece says exactly what the product does instead. Overclaiming in
  content is a trust bug shipped to production.
- **Benchmark honesty**: figures you do not have data for are BROAD INDUSTRY RANGES, framed as
  ranges, with a note. "Our data shows" and "across N companies" are banned until a real corpus
  exists. Precision without provenance is decoration.
- **GEO**: each piece answers a specific question a real person would ask an AI assistant;
  self-contained extractable facts; cite the methodology explicitly ("We define X as ...").
- **Format templates**: each recurring format gets a numbered outline in the strategy doc
  (open with the failure, inputs, walkthrough, the trap, sanity check, CTA is the Lucid Arc
  "How to Calculate" shape) plus ONE full exemplar written by the strategist. Template +
  exemplar is what makes cheap delegation safe.
- **Internal linking and credibility (non-negotiable, checked at the QA gate)**: every piece is
  a node in a topical-authority graph, and the link structure is the credibility signal both
  search and answer engines read. Rules: (1) every post inline-links its reference page (the
  CTA paragraph at minimum) AND carries a small related-links block (reference page + its
  format-cluster sibling + one adjacent piece); (2) sibling formats always cross-link, so each
  topic's cluster closes around its reference page; (3) listicle/pillar posts link every
  concept they enumerate, both the definition page and the deeper how-to piece; (4) anchor
  text names the concept, never "click here"; (5) no orphans: a new piece ships in the same PR
  with at least one link pointing TO it from an existing piece; (6) method claims cite the
  methodology/reference page; (7) external citations only to named authoritative sources,
  accurately represented, sparing, never a substitute for the internal cluster. Engineering
  prerequisite: the post renderer must support a safe inline-link subset (internal paths via
  the router, https external with noopener, all other schemes rendered as plain text) plus a
  related-links section; if it does not, that is the one code ticket the first linked wave
  carries. Retrofits scale as plain code: fix exact CTA phrases and inject related blocks by
  script with hard assertions, hand-weave only the flagship pillar posts.

## 4. The production pipeline (model/agent routing)

Match the model to the phase; a token spent above the task is waste, below it is a quality risk
(see [[delegate-and-qa]] and the global orchestration framework).

| Phase | Model/lane | Why |
|---|---|---|
| Strategy doc, spine, competitive read, pillar architecture | Strategist (Fable) | Judgment across positioning, competition, and journey; produces the doc everything builds from |
| Reference pages (the differentiated backbone) + one exemplar per format | Strategist | These carry the positioning and the accuracy contract; they become the writers' spec |
| Cluster/backlog posts against template + exemplar | Writer agents (Sonnet) | A written spec exists; batch 3 topics (6 posts) per agent |
| Glossary lines, sitemap entries, date/slug tables, index updates | Haiku or inline | Mechanical, zero judgment |
| Template/route/schema changes the content needs | Engineering lane (Opus/Sonnet per [[delegate-and-qa]]) | Content waves never silently change code; one tag-union addition is the acceptable ceiling |
| QA gate on every delegated batch | Strategist or Opus, never the writer | No model QAs its own work |

**Fleet mechanics (the collision-proof shape):**
- Writer agents NEVER edit the shared content modules. Each agent writes ONE disjoint draft
  file (scratchpad or a drafts dir): `batch-a.ts` ... `batch-e.ts`, containing complete typed
  entries. The orchestrator integrates all batches into the shared module single-track, then
  updates sitemap/glossary/changelog itself.
- Per-agent batch: about 3 topics x 2 formats = 6 posts. Big enough to amortize context,
  small enough to survive a session cutoff.
- The delegation brief per writer (stands alone, agent starts cold):
  OBJECTIVE (write N posts as typed literals to one file) / CONTEXT (read: strategy doc
  sections for spine + templates + voice; the content module for types and the exemplars; the
  source-of-truth doc or reference entries for the topics) / EXACT SPEC per post (const name,
  slug, title, date, tags, fixed by the orchestrator so the calendar cannot drift) / FILES
  (exactly one output path; repo files off-limits) / CONSTRAINTS (voice, no em/en dashes
  "fireable", no proprietary-data claims, product claims limited to what the reference pages
  say, CTA shape, do-not-duplicate-the-exemplar) / ACCEPTANCE (file exists, count, valid
  syntax, zero U+2014/U+2013, spec fields exact) / REPORT BACK (path, count, dash-sweep
  confirmation).
- **QA gate on each batch before integration**: read the drafts (not the agent's claims);
  check voice, the accuracy contract against the reference pages, benchmark framing, slug/
  date/tag exactness; run the dash sweep yourself; verify no product overclaims. Verdict per
  [[delegate-and-qa]]: accept / patch / bounce once / take over.
- **Integration is single-track**: one session appends batches to the content module, updates
  sitemap + glossary, adds the CHANGELOG entry, runs typecheck + tests + build + dash sweep,
  opens the PR. Never two writers on the shared module; never an agent on the PR.

## 5. Publishing and scheduling

- Each entry's date field is its INTENDED publish date; the calendar lives in the data.
- Drafts land via PR; the human reviews (they are the named author) and merges; deploy cadence
  controls go-live. If the renderer does not date-gate, note in the PR that merging + deploying
  publishes everything, and stage merges if staged publishing is wanted. (Optional follow-up
  ticket: date-gate the index so future-dated entries hide until their date.)
- Every content PR carries: the entries, sitemap + glossary updates, CHANGELOG, and the
  verification results (typecheck, tests, build, dash sweep). Content PRs follow the same
  ai-git-ops gate as code: never self-merged.
- Wave rhythm: wave 1 = strategy + backbone + exemplars (strategist-heavy). Wave 2+ = fleet
  production against the backlog (writer-heavy, strategist QA). The strategy doc's "next run
  picks up" section is the standing handoff between waves.

## 6. Checklist (per wave)

- [ ] Strategy doc exists and is current (spine, model choice, backbone table, pillars, calendar).
- [ ] Repository pattern in place; adding content touches no components.
- [ ] Every piece specced (slug, title, date, tags) BEFORE any writer starts.
- [ ] Writers briefed with template + exemplar + source-of-truth; one disjoint file each.
- [ ] QA gate run on every batch: voice, accuracy contract, benchmark honesty, dash sweep.
- [ ] Linking pass: every piece links its reference page + sibling + one adjacent; no orphans;
      pillar posts link everything they enumerate.
- [ ] Integration single-track: module + sitemap + glossary + CHANGELOG in one PR.
- [ ] typecheck + tests + build + em-dash sweep green before the PR.
- [ ] PR flagged for the named author's review; not self-merged.
- [ ] Strategy doc's backlog/status table updated to reflect what shipped.
