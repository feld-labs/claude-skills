---
name: venture-scoping
description: Read when taking a new product or venture idea from raw concept to build-ready, or when Brian says "scope this idea", "run phase 0", "kill-check this", "write the PRD", "is this worth building", or brings a new business/app concept with no repo yet. The strategy-tier scoping pipeline proven across five ventures (Waypoint, Tributary, Astrolabe, Motif, Lodestone): kill-check before any scoping investment, lettered phases each answering one strategic question, numbered decision gates (D-1..D-n) ratified by Brian before build, a hard PRD gate where strategy stops, and the handoff artifact set (PRD-v1, build plan, spec frame, OPUS-0 prompt, RESUME.md) that lets cheaper models build without the transcript.
---

# Venture Scoping: Idea to Build-Ready

The repeatable pipeline for taking a raw venture idea to a ratified, build-ready strategy package.
Run five times to date (Waypoint, Tributary, Astrolabe, Motif, Lodestone), each run converging on
the same shape. This skill owns the strategy phase only: it ends at the PRD gate. Building against
the ratified package belongs to [[delegate-and-qa]] and the ai-git-ops workflow; positioning inputs
come from [[product-positioning]]; the technical master plan comes from [[building-products]].

The pipeline: **idea -> kill-check -> phased scoping -> decision gates -> PRD gate -> ratification
-> spec handoff -> build.** Each arrow is a stop point where Brian can redirect cheaply.

## 1. Kill-check first (before any scoping investment)

Before writing a single strategy doc, run an honest would-we-kill-this analysis. The strategist
must be genuinely willing to return KILL; a kill-check that always passes is theater. Tributary's
check returned BUILD STANDS only after real scrutiny, and that verdict is now load-bearing: it is
cited whenever the project's premise is questioned, instead of re-litigating.

Interrogate at minimum:
- **Demand evidence**: who has this problem, how do we know, what do they do about it today?
- **Distribution**: is there a credible path to the first 10 customers that we can execute?
- **Moat / differentiation**: what survives a competent competitor noticing us?
- **Unit economics**: does a paying customer cover their own COGS at plausible pricing?
- **Portfolio fit**: does this fit the operator's time, stack, and existing portfolio, or does it
  cannibalize a stronger bet?

Output is a short written verdict: KILL (with the one or two reasons), or BUILD STANDS with the
reasons recorded so they are never re-derived. A surviving kill-check goes in the strategy doc and
the project memory.

## 2. Phased scoping: one strategic question per phase

Structure the scoping as lettered phases (A, B, C... as in Astrolabe's A-G) or a numbered Phase 0.
Rules that made this work:

- **Each phase answers exactly one strategic question** (who is the beachhead; what is the
  positioning spine; what is the pricing architecture; what is the MVP cutline; what is the
  compliance/risk register; what is the go-to-market motion).
- **Each phase ends in a written doc**, committed to the project's `docs/` folder (or the Claude
  Project folder if no repo exists yet, as Motif did). Strategy in chat only is strategy lost.
- **Beachhead before features.** The beachhead ICP decision comes early and gets explicitly
  ratified (Waypoint: "beachhead ratified" is a recorded milestone). Every later phase is scoped
  to the beachhead, not the total market.
- Phases run in order but the plan is cheap to reorder; if a phase surfaces a premise problem,
  return to the kill-check rather than pushing through.

## 3. Decision gates: the D-number protocol

Every judgment call that shapes the build becomes a numbered decision (D-1, D-2, ...) rather than
a silent default. This is the single highest-leverage habit from the five runs (Keel D-1..D-11,
Tributary D-3/D-5/D-6/D-7, Motif D-5..D-10).

For each gate record:
- **The question**, in one sentence.
- **The recommendation** with a short why (the strategist always takes a position).
- **The default** if Brian does not decide (so an unratified gate never silently blocks unrelated
  work, but also never silently resolves the gated work).
- **What it gates**: which phases or tickets cannot start until this is ratified.

Present gates in a single ratification block at a stop point, not scattered through prose. Work
that depends on an unratified gate HALTS; work that does not depends may continue. Once ratified,
the decision is recorded in the strategy doc and in project memory, and is never re-derived. If
new evidence challenges a ratified decision, that is a new gate referencing the old one, not a
quiet reversal.

## 4. Naming research economy

Name research is a notorious token sink. House rule (learned the expensive way): generate
candidates cheaply, check **sector collision and SEO viability** as the deciding factors, do at
most **one .com availability lookup per candidate**, and do **no trademark tracing** (that is
counsel's job at registration time, not the strategist's during scoping). A working codename
(Waypoint, Tributary, Motif...) is fine for the entire scoping phase; do not block strategy on the
final name.

## 5. The PRD gate: where strategy stops

The pipeline has a hard stop at the PRD gate (Tributary: "stopped at PRD gate" is the designed
outcome, not a stall). Build-ready means the following artifact set exists, and the strategist
does NOT slide past it into scaffolding or code:

- **PRD-v1**: the product definition scoped to the ratified beachhead.
- **Build plan + tickets**: phased, with acceptance criteria, model routing per ticket, and the
  human-only actions (purchases, account creation, key provisioning) tagged as Brian tickets.
- **Spec frame** (`docs/REQUIREMENTS-FRAME.md` or equivalent): the constraints and contracts the
  spec-writing model must honor, so specs are derivable without the scoping transcript.
- **OPUS-0 prompt** (`docs/CLAUDE-CODE-PROMPT.md`, the Astrolabe pattern): a standalone prompt
  that boots the spec-writing model (Opus) cold to produce SPEC-1..N from the frame.
- **RESUME.md**: one-line status, exact resume command, done / next / open gates, Brian's owed
  items. Updated at every milestone, not just at the end.
- **Memory mirror**: the project memory file carries the state so any future session recalls it.

## 6. Handoff to build

After ratification, the flow is: strategist package -> **Opus writes SPEC-1..N** from the frame ->
**Sonnet waves build** against the specs -> Opus QA gate per PR ([[delegate-and-qa]]). The
strategist's job on this venture is now done unless a genuinely new strategic question appears.
The two most common wastes to refuse: re-deriving a ratified strategy doc, and using the strategy
model to grind execution. This pipeline itself normally runs on Opus, not the ultra tier: see
[[strategy-on-opus]] for the parity method and the few escalation triggers.

## Anti-patterns

- Scoping without a kill-check, or a kill-check performed to pass. The check earns its cost only
  if KILL is a live outcome.
- Sliding past the PRD gate into scaffolding "while we're here". The gate exists so Brian ratifies
  direction before build tokens are spent.
- Silent defaults on shaping decisions. If it changes what gets built, it is a D-gate.
- Re-deriving ratified decisions or the kill-check verdict in later sessions. Read the docs and
  memory first; cite, do not recompute.
- Unbounded naming research (trademark tracing, multi-TLD sweeps). See section 4.
- Strategy that lives only in the transcript. Every phase ends in a committed doc.
