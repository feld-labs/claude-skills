---
name: strategy-on-opus
description: Read when a Fable-designated task (positioning, pricing architecture, PRD, kill-check, roadmap synthesis, spec frame, exemplar writing) needs to run on Opus instead of the ultra-tier model, or when Brian says "do this on opus", "without fable", "fable quality without fable tokens", or the budget rules out the top tier. The parity method: structure substitutes for raw capability. Run the task inside a proven frame (skills and exemplars are crystallized Fable capability), decompose big synthesis into staged extraction and compression, replace innate skepticism with explicit adversarial passes, widen the search with divergent drafts plus a judge, and hold output to a written rubric. Ends with the escalation triggers for the few tasks that still deserve Fable, used as a thin review gate rather than the deriving engine.
---

# Strategy on Opus: Fable-Quality Output Without Fable Tokens

The objective: get comparable quality on Fable-designated tasks (the strategy tier in the routing
table: positioning, pricing, ICP, PRDs, kill-checks, spec frames, exemplars, roadmap synthesis)
from Opus, at a fraction of the token cost. The working principle, proven across the portfolio
runs: **what the ultra tier does in one pass through raw capability, a mid tier can approximate
with structure**: frames, staged decomposition, adversarial passes, and an explicit quality bar.
Fable then shrinks from the deriving engine to a thin review gate, or disappears entirely.

Routing context lives in `~/.claude/AGENT_ORCHESTRATION.md` and [[delegate-and-qa]]; this skill
changes only WHO does the strategy work and HOW, not what the outputs are. The output contracts
(what a scoping package contains, what a content backbone looks like) stay identical to the
Fable-derived originals in [[venture-scoping]], [[product-positioning]], [[content-engine]].

## 1. Triage the task by transferability

Not all Fable-designated tasks transfer equally. Classify first:

- **Frame-following** (a proven skill, template, or exemplar already exists for this exact task
  shape): expect FULL parity on Opus. Running [[venture-scoping]] on a new idea, a positioning
  spine via [[product-positioning]], a landing revamp via [[landing-page-revamp]], a content
  backbone via [[content-engine]]. The judgment was spent building the frame; following it is
  within Opus's reach.
- **Heavy synthesis** (many documents into one strategic output, no single frame covers it):
  parity via staged decomposition (section 3) plus adversarial passes (section 4).
- **Novel judgment with high blast radius** (no prior frame, and the decision locks in unit
  economics, category positioning, or portfolio direction): Opus drafts with the full method,
  and a thin Fable gate reviews (section 6). This is the only class where ultra-tier tokens are
  still budgeted, and only for review, not derivation.

## 2. Lever 1: always run inside a frame

The skills in this plugin ARE crystallized Fable capability: each one is a judgment-heavy method
derived once on the expensive tier and written down precisely so a cheaper model can execute it.
So the first move on any strategy task is never freeform generation; it is finding the frame:

1. Check this plugin and the project's docs for a skill, template, or prior exemplar matching
   the task shape.
2. If a close-but-not-exact frame exists, adapt it explicitly (state what differs and why)
   rather than starting blank.
3. If no frame exists, that is a signal: either the task is novel-judgment class (section 6), or
   the frame should be derived once and saved as a skill or template so the NEXT run is
   frame-following. Building the frame is the expensive part; pay for it once.

An exemplar is the strongest frame of all. One gold-standard instance of the artifact (a
reference page, a PRD section, a pricing table with its reasoning) pins quality better than any
instruction list. If a past run produced one, put it in the prompt.

## 3. Lever 2: staged synthesis instead of one giant pass

Fable's raw edge is holding a dozen documents and the judgment in one head. Approximate it by
never asking Opus to do that. Pipeline instead:

1. **Inventory**: list every input doc and what question each bears on. A gap list falls out
   (research that must happen before synthesis, not during).
2. **Extraction**: per-source structured fact sheets against a fixed template (claims, numbers,
   constraints, quotes, each with its source pointer). This is mechanical enough for Sonnet
   agents in parallel on disjoint sources ([[delegate-and-qa]]); anything unverified is flagged
   UNVERIFIED inline, per the research fan-out rules.
3. **Compression**: merge the fact sheets into one decision-shaped artifact: a comparison
   matrix, a constraint register, an options table with tradeoffs. Still not judgment; this is
   arrangement.
4. **Judgment pass on the compressed layer only**: Opus now makes the strategic call while
   reading two or three pages, not twelve documents. Judgment quality tracks how clean the
   compressed layer is, which is why the extraction template matters more than the final prompt.

Rule of thumb: extraction and compression are delegable; **the judgment pass itself is never
delegated below Opus**. Splitting the judgment is where quality quietly dies.

## 4. Lever 3: adversarial passes replace innate skepticism

The observable quality gap between tiers on strategy work is mostly honesty under ambiguity:
the ultra tier volunteers "this claim is too strong", "this business should maybe not exist".
Opus produces that reliably only when a pass is explicitly tasked with it. So parity requires
splitting generation from attack, always:

- **Generate** the draft (inside the frame, from the compressed layer).
- **Red-team** with a FRESH pass or agent whose only brief is to refute: kill the premise, find
  the overclaim, name the unpriced risk, identify what a competitor would say. For kill-checks,
  the red-team brief says a KILL verdict is the expected outcome unless the case survives; this
  reproduces the live-KILL property [[venture-scoping]] requires. For content and copy, the
  brief is the overclaim hunt (the Lucid Arc gate that caught a proprietary-data claim was
  exactly this pass, and it works run on Opus).
- **Revise** against the findings, recording which attacks landed and what changed. Findings
  that did not change the doc get an explicit "considered, rejected because" line; that record
  is what makes the verdict citable later instead of re-derived.

A separate pass costs a second prompt. It is the cheapest quality mechanism in this skill and
the one most often skipped. Never ship single-pass strategy output.

## 5. Lever 4: divergent drafts plus a judge, for wide solution spaces

For tasks where the answer space is wide (positioning angles, pricing architectures, roadmap
cutlines), one draft anchors on its first idea regardless of tier. Run two or three independent
Opus drafts from forced-different angles (economics-first, customer-pain-first, risk-first),
then a judge pass scores them against the rubric (section 6) and synthesizes: winner as the
spine, best ideas grafted from the runners-up. Three drafts plus a judge on Opus still costs a
small fraction of one ultra-tier derivation, and beats it on anchoring.

Skip this lever when the frame already fixes the shape (a spec frame, a checklist-driven doc);
divergence pays only where the search space is genuinely open.

## 6. Lever 5: a written quality bar, checked before "done"

Fable's implicit taste becomes an explicit rubric. Before starting, write (or reuse) the
acceptance list the output must pass; run it as a real checking pass at the end, not decoration.
The house rubric for strategy docs:

- **Differentiation test**: could a competitor publish this unchanged? If yes, it fails
  ([[product-positioning]]).
- **Sourcing**: every factual claim traces to a named source or is flagged UNVERIFIED; no
  benchmark or proprietary-data claims without a corpus ([[content-engine]] accuracy contract).
- **Kill-check honesty**: KILL was a live outcome and the verdict records why it survived.
- **Decisions surfaced**: every shaping judgment is a D-gate with recommendation, default, and
  what it gates ([[venture-scoping]]); nothing silently defaulted.
- **Beachhead-scoped**: recommendations target the ratified beachhead, not the total market.
- **Red-team record present**: attacks that landed and the considered-rejected list.
- **House rules**: no em-dashes, no secrets, durable doc not chat, memory mirrored.

An output that passes this rubric is accepted regardless of which model produced it. That is
the point: the bar is on the artifact, not the model badge.

## 7. The thin Fable layer: escalation triggers

Fable is still worth its tokens in exactly these cases, and as a REVIEWER of an Opus-drafted
package (one pass over a finished doc, a small fraction of derivation cost), not as the engine:

- Novel-judgment class from section 1: no frame exists AND the decision is hard to reverse
  (category positioning for a new venture, pricing architecture that locks unit economics,
  cross-portfolio prioritization).
- Any decision the orchestration framework already reserves upward: architecture choices
  coupling unit economics to an isolation boundary get the economic analysis at the top tier
  plus Brian's sign-off.
- Tie-breaks the judge pass cannot resolve between divergent drafts.
- A red-team pass keeps finding structural problems after two revision rounds; that smells like
  a premise problem, which is top-tier territory.

Keep score. When an Opus run with this method needed the Fable gate and the gate found nothing,
that task class moves permanently to Opus-only. When the gate caught something material, record
what, and keep that class on the escalation list. The list should shrink over time; that is the
economic win compounding.

## Anti-patterns

- Freeform Opus strategy when a frame exists in this plugin or the project docs. The frame is
  the parity mechanism; skipping it re-opens the tier gap.
- Shipping single-pass output. Generation without a separate red-team pass is the number one
  parity failure.
- Delegating the judgment pass itself to Sonnet because extraction went well there. Extraction
  and compression are delegable; the call is not.
- Using the rubric as a closing flourish instead of a real gate (checking boxes without
  re-reading the doc against them).
- Escalating to Fable to re-derive something ratified, or to "double-check" work the rubric and
  red-team already passed. The gate is for the escalation list only.
- Letting the frame library rot: deriving the same task shape freeform twice instead of saving
  the frame after the first run.
