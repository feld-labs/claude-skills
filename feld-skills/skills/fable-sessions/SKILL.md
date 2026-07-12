---
name: fable-sessions
description: Read when running a session on the strategy-tier model (Fable / Mythos class), when deciding whether a task deserves that tier at all, or when Brian says "use fable", "should this be fable or opus", "make the most of this session", or switches the session model to Fable. Covers what actually earns top-tier tokens (cross-doc synthesis into new strategy, kill-checks and adversarial honesty, exemplar writing, spec frames, economics-times-isolation tradeoffs), what wastes them (re-deriving settled docs, mechanical execution), the pilot-seat rule (an interactive Fable session takes the senior seat: scope, spawn fleets, run QA gates), and the session ops that protect an expensive session from a cutoff (checkpointing, RESUME.md, memory mirroring, downshift handoff).
---

# Fable Sessions: Spending Strategy-Tier Tokens Well

How to get full value from the most capable (and most expensive) model tier. "Fable" here means
whatever occupies the top strategy tier; the discipline is tier-portable. The routing table itself
lives in the global orchestration framework (`~/.claude/AGENT_ORCHESTRATION.md`) and
[[delegate-and-qa]]; this skill is the field guide for the sessions that land on that tier,
distilled from the five venture-scoping runs, the Keel v1 program, and the Lucid Arc marketing
handoff.

## 1. What earns Fable tokens

Route work here when it has one of these shapes; each is a pattern where the tier gap showed up
in output quality:

- **Synthesis across many documents into a NEW strategic output**: positioning, pricing
  architecture, ICP and messaging, roadmap prioritization, a PRD from research. Reading one spec
  and building against it is Sonnet; combining twelve docs into a direction is Fable.
- **Adversarial honesty against our own work**: kill-checks that can actually return KILL
  ([[venture-scoping]]), overclaim hunting at content QA (the Lucid Arc writer-fleet gate caught
  a proprietary-data overclaim no cheaper pass flagged), pre-mortems on a plan.
- **Exemplar writing**: one gold-standard instance of a recurring artifact (a reference page, a
  landing section, a delegation brief) that cheaper models then imitate at scale. One Fable
  exemplar upgrades an entire Sonnet fleet's output; this is the highest-leverage token spend we
  have measured ([[content-engine]] institutionalizes it for content).
- **Spec frames and decision framing**: turning ambiguity into D-numbered gates with
  recommendations and defaults, and writing the frames (REQUIREMENTS-FRAME, OPUS-0 prompts) that
  let Opus and Sonnet work cold.
- **Decisions that couple unit economics to an architecture or isolation boundary** (per the
  orchestration framework, these are never defaulted by the building model).

## 2. What wastes them

- **Re-deriving settled strategy.** Before any strategic ask, check the project docs and memory
  for an existing ratified answer. If it exists, cite it and move on; re-derivation is the
  number one recorded Fable waste.
- **Mechanical execution**: renames, formatting, changelog grinding, boilerplate. Spawn Haiku.
- **Well-scoped builds with a spec in hand.** Spawn Sonnet, QA the result.
- **Being spawned as a subordinate role.** Fable is not delegated TO for orchestration, QA gates,
  or merge-conflict resolution; those are Opus jobs in the routing table.

## 3. The pilot seat

The "be conservative with Fable" rule governs spawning Fable as a role inside someone else's
workflow. It does not mean an interactive Fable session must sit idle between strategy asks. When
Brian runs the session ON Fable, it takes the senior seat for the duration:

- Scope the program, write the tiers and briefs, and fix the interface contracts.
- Spawn and coordinate the Sonnet/Haiku fleets ([[delegate-and-qa]] mechanics apply unchanged:
  disjoint worktrees, standalone briefs, one merge authority).
- Run the QA gates itself rather than spawning Opus to do so; the seniority requirement is "a
  model at or above the gate's tier that did not write the work", and the pilot satisfies it.
  The independent-reviewer requirement for security-critical work is unchanged: that reviewer is
  a separate session/agent or Brian, never the builder, never mere self-QA.
- Keep judgment inline, push execution down. The Lucid Arc six-tier handoff and the 27-post
  writer fleet both ran this way: Fable scoped, briefed, and gated; Sonnet built; Haiku swept.

What still never happens from the pilot seat: grinding mechanical edits inline that a spawned
agent should do, and letting fleet-babysitting crowd out the strategic work that justified the
tier.

## 4. Getting full value per session

- **Front-load the strategic asks.** Batch the judgment-heavy questions early while context is
  rich; push execution to the back half or to agents.
- **Batch decisions into gates.** Collect judgment calls into one D-numbered ratification block
  ([[venture-scoping]] section 3) instead of interrupting Brian per question.
- **Write outputs to durable docs immediately.** A Fable insight that lives only in the
  transcript dies with the session. Docs, exemplars, templates, and skills are how the
  capability persists; if a session produced a genuinely reusable method, propose adding it to
  this plugin.
- **Convert one-off wins into exemplars.** If Fable wrote one great instance of something
  recurring, save it as the template before moving on.

## 5. Session ops: protect the investment

An expensive session that dies without checkpoints is the costliest failure mode. The global
checkpoint discipline applies with extra force here:

- Commit and merge incrementally; many small PRs, branches pushed for durability.
- Keep `RESUME.md` current at every milestone: status, exact resume command, done, next, open
  gates, Brian's owed items.
- Mirror state into project memory so any future session (on any model) recalls it.
- When strategy is done and execution remains, use plan-and-handoff: write the plan durably,
  downshift the session to a cheaper model, and compact. Do not idle a Fable session through
  Sonnet-shaped work.
- Nearing a context or credit boundary: stop at a clean boundary (everything merged, RESUME.md
  updated) rather than opening work that cannot be checkpointed.

## Anti-patterns

- Re-deriving a ratified strategy doc or a settled kill-check instead of citing it.
- Spawning Fable for orchestration, QA, or conflict resolution (Opus jobs).
- The pilot grinding mechanical edits inline "because it's already here".
- Strategic output left in the transcript: no doc, no exemplar, no memory mirror.
- Running a Fable session to the hard cutoff with unmerged work in flight.
- Treating this tier as "a better Opus" for everything. It is a different tool: documents,
  judgment, and frames that other models build from.
