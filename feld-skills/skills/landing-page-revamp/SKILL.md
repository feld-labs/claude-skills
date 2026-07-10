---
name: landing-page-revamp
description: Read when revamping, rewriting, or building a product's landing page or public marketing site, or when a landing page is described as lackluster, weak, generic, or not converting. A repeatable audit-to-relaunch procedure distilled from the Lucid Arc public-site program: audit the current page, lock the positioning spine, rebuild on the proven section architecture (finding-first hero, who-it's-for paths, differentiated-angle section, honest trust surface), rewrite in the house voice, wire discoverability and internal links, gate with a real build. Use for "revamp the landing page", "rewrite the homepage", "hero copy", "marketing site refresh", or standing up the first public page of a new product.
---

# Landing Page Revamp: from lackluster to launch-grade

A repeatable procedure for taking any product's public landing surface from generic to
convincing. Distilled from the Lucid Arc public-site program (nav unification, the
Justin-Welsh-voice rewrite, the content hub, trust pages, and the conversion-ordered hero).

This skill owns the revamp PROCESS. It composes with, and does not duplicate:
[[product-positioning]] (derives the message; run it first if no ratified positioning exists),
[[seo-aeo-geo]] (the technical discoverability layer), [[content-engine]] (the ongoing content
operation and internal-linking rules), [[design-and-ui-craft]] (visual quality), and
[[delegate-and-qa]] (who builds what). Work runs under ai-git-ops: branch, atomic commits,
CHANGELOG, PR, never self-merged.

## Step 0. Audit before touching anything

Produce a short written audit (it becomes section 1 of the revamp doc and the PR's rationale):

- **Message test**: cover the logo. Could this hero sit on a competitor's site unchanged? Does
  the first sentence name a finding or pain the visitor recognizes, or does it describe the
  product? Count feature-first vs outcome-first sentences.
- **Audience test**: who is this page talking to? If the product has multiple ICPs, is there a
  path per ICP or one blended pitch that serves none?
- **Structure drift**: per-page navs, dead footer links ("#" placeholders), inconsistent casing,
  orphaned routes. The most common decay is every page having grown its own shell.
- **Honesty scan**: claims the product cannot back (fabricated certs, invented stats,
  overclaimed AI). These are trust bugs, not copy problems, and they get fixed first.
- **Discoverability scan**: JSON-LD present? robots welcoming AI crawlers? sitemap real and
  published-only? Trust pages (Privacy/Terms/Security) real or "coming soon"?
- **Screenshot the before.** The PR shows before/after.

## Step 1. Lock the positioning inputs

No copy gets written before these exist, ratified by the human:

- The **positioning spine**: one paragraph the whole site reinforces, with a one-line contrast
  against the obvious alternative ("X tells you what your numbers are. We tell you whether they
  are right." / "Your Stripe dashboard is not a data room."). Derive via [[product-positioning]]
  if it does not exist; never re-derive one that does.
- The **ICP map**: which audiences land here and what each is trying to decide.
- The **honesty constraints**: what the product genuinely does, where the real differentiation
  is, and what must not be overclaimed (e.g. which parts are AI and which are a rules engine;
  say the honest version, it converts better under scrutiny anyway).
- The **journey stance**: B2B pages lead with verification, risk, and proof (the reader is
  building a case). B2C pages lead with the felt moment and the emotional outcome (the reader
  is imagining a result). Same architecture below, different first note.

## Step 2. Rebuild on the proven section architecture

Order matters; each section answers the visitor's next question in sequence:

1. **Finding-first hero**: the pain or finding in the visitor's own words, then the one-line
   what-this-is, then a primary CTA (verb phrase) and a low-commitment secondary. No carousel,
   no stock illustration, no adjective pileup.
2. **Credibility strip**: whatever is honestly available: real usage, a concrete number, a
   methodology pointer, named author/founder. Never fabricated logos or invented counts.
3. **How it works, in 3 steps**: the shortest honest path from "I arrive" to "I get the value".
4. **The differentiated-angle section**: the one thing the spine says nobody else does, shown
   not asserted (a real screenshot, a worked example, a before/after).
5. **Who it's for**: one block or page per ICP, each in that ICP's vocabulary, reachable from a
   nav dropdown. A blended pitch converts nobody.
6. **Pricing clarity** (if public): the ladder with the intended plan visually centered. Fences
   enforced server-side, never only in the UI.
7. **FAQ**: real questions, self-contained answers, emitted as FAQPage JSON-LD (the
   highest-leverage schema for answer engines).
8. **Final CTA**: restate the finding, one action.

Structural rules: ONE shared PublicNavBar and PublicFooter imported by every public page; footer
links only to routes that exist; Title Case consistent everywhere; per-section "in short" lines
where sections carry facts an answer engine could cite.

## Step 3. Rewrite in the house voice

- Lead with the finding, not the product. Name the moment the reader feels the pain.
- Short sentences. One idea each. Specific numbers over vague claims. No hedging, no filler,
  no hype adjectives ("revolutionary", "seamless"), NO em-dashes (house rule).
- CTAs are verbs describing what happens next, not "Learn more".
- Headings in question form where natural, so answer engines can lift them.
- Every claim passes the honesty constraints from step 1.

## Step 4. Wire discoverability, trust, and links

- Apply [[seo-aeo-geo]]: JSON-LD (Organization, WebSite, FAQPage, page-appropriate types),
  robots.txt welcoming search + AI crawlers with private paths excluded, published-only
  sitemap, canonical metadata per page.
- Real Privacy / Terms / Security pages before asking anyone to connect data. Security page
  describes only implemented measures, with an explicit what-we-do-not-claim section.
- Internal links per [[content-engine]]'s linking rules: the landing page links into the
  content hub's reference pages where concepts are named; no orphan pages; concept-named
  anchor text. If a content hub exists, the hero's differentiated angle should link to its
  strongest proof piece.

## Step 5. Design pass

Route through [[design-and-ui-craft]]: tokens not hardcoded hexes, consistent spacing and type
scale, generous whitespace, no stock illustration. Design serves the message order from step 2;
it never reorders it.

## Step 6. Gate and ship

- Full verification: typecheck, tests, a REAL production build, em-dash sweep on every touched
  file, click every nav and footer link, mobile pass.
- Screenshot the after; PR carries before/after and the audit from step 0.
- PR halts for the human (voice sign-off is theirs; never self-merge).
- Measure if instrumentation exists (PostHog dormant-until-keyed pattern); otherwise note the
  events the page should emit when analytics goes live.

## Model routing (per [[delegate-and-qa]])

| Phase | Lane |
|---|---|
| Audit, spine, section-by-section copy brief, final voice pass | Strategist (Fable/capable model) |
| Component/page builds against the copy brief and architecture | Sonnet, one page per brief |
| Mechanical sweeps (casing, dead links, sitemap lines) | Haiku or inline |
| Anything touching pricing enforcement, auth, or data paths | Opus + independent review (it is not landing-page work anymore) |
| QA gate on every delegated page | Capable model, never the builder |

Parallelize page builds only on disjoint files (each agent one page, nobody touches the shared
nav/footer; the orchestrator integrates shared files single-track).

## Checklist

- [ ] Written audit with before screenshot; honesty violations fixed first.
- [ ] Spine + ICP map + honesty constraints ratified before copy.
- [ ] Section architecture in order; one shared nav/footer; no dead links.
- [ ] Voice rules pass on every section; zero em-dashes.
- [ ] JSON-LD + robots + sitemap + real trust pages.
- [ ] Internal links into the content hub; no orphan pages.
- [ ] typecheck + tests + production build + link-click pass + mobile pass.
- [ ] PR with before/after; human merges.
