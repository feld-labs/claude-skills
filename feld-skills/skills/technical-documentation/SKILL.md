---
name: technical-documentation
description: How Feld Labs specs, writes, and structures technical documentation for any product. Read whenever a task involves producing docs: build specs for a coder to execute, a PRD or architecture doc, an in-app help/knowledge section, API or integration docs, a runbook, a README, an onboarding guide, decision records, or a resume/handoff brief. Covers the doc TYPES and when to use each, the accuracy contract (docs describe shipped behavior, code is truth), the audience-layering rule (task-first usage on top, how-it-works underneath), and how docs get verified before they ship. Product-agnostic; the content lives in the target repo, not here.
---

# Technical Documentation (method)

Documentation is a build artifact with the same rigor as code: it is specced, written to a
contract, and verified before it ships. This skill is the repeatable method. It is NOT a place
to store any one product's docs (those live in that product's repo). It tells you which doc to
write, how to structure it, and how to know it is correct.

## Step 0: name the doc type, then write to its shape

Do not write "documentation." Write a specific artifact. Each has a job and a shape.

| Doc type | Job | Lives in | Load the shape below |
|---|---|---|---|
| **Build SPEC** | Brief a coder (or agent) to execute one ticket cold | `docs/SPEC-N-*.md` | §1 |
| **PRD** | Fully specify what to build and why, before building | `docs/PRD.md` | §2 |
| **Architecture** | How the system is built; the mental model | `docs/ARCHITECTURE.md` | §2 |
| **Decision record** | Capture a choice + its blast radius so it is not re-litigated | `docs/DECISIONS.md` | §2 |
| **In-app help / knowledge base** | Teach a user/associate the product inside the product | `src/app/help/**` (or site) | §3 |
| **README / runbook** | Get someone from clone to running, or through an operation | repo root / `docs/` | §3 |
| **RESUME / handoff** | Let any session or teammate re-enter work instantly | `RESUME.md` | §2 |
| **API / integration doc** | Let a developer call a surface correctly | `docs/` or in-app | §3 |

If a request is vague ("write docs for X"), pick the type from who reads it and what they do
next, say which you are writing, and write that one well rather than a blob that serves nobody.

## The three contracts (bind every doc type)

1. **Accuracy: the code is the source of truth.** Docs describe SHIPPED behavior, never
   aspirational or PRD-promised behavior the build dropped. Before documenting a feature, read
   its actual code/UI and cite exact labels, thresholds, paths, and env vars. Where a doc and
   the code disagree, the code wins and you fix the doc; where the PRD promised something the
   build cut, document what shipped and note the gap. A doc that lies is worse than no doc.
2. **Audience layering: task-first on top, how-it-works underneath.** Lead every topic with what
   the reader DOES (numbered steps, exact controls), then a distinct "How it works" subsection
   for the reader who needs the model. A non-engineer must get their task done from the top; an
   engineer or an associate covering for you must be able to go deep in the same page.
3. **No buried lead, define the jargon.** State what a thing does before how. Any term of art
   gets a one-line definition on first use. Write for the teammate who stepped away, not the
   person who watched it get built.

## §1 Build SPEC shape (a coder executes it with zero prior context)

A spec that a fresh agent or engineer can execute alone, with nothing but the repo:
- **Objective** (one sentence), **Reviewer** (who QAs), **Read-first** (exact files/docs).
- **Files you own**: the exact set this ticket may touch; everything else is off-limits (this is
  what makes parallel work safe). Name shared files the orchestrator wires between merges.
- **Requirements**: the actual behavior, in the product's real vocabulary. Call out any
  correctness landmines (accounting signs, timezones, money-as-integer, isolation boundaries)
  as BLOCKING with a required test.
- **Constraints**: house rules that bind (style, no new deps without listing them, never commit
  to main, no live credentials).
- **Acceptance**: every item command-verifiable. **Verify**: the exact commands to run and paste.
- **Report back**: files changed, command output, deviations, blockers.
Anti-patterns: prose that describes vibes not behavior; acceptance criteria you cannot check by
running something; letting two specs claim the same file.

## §2 Standing project docs (the portable-state set)

Keep a small set of living docs so any session/agent resumes exactly where the last stopped, and
so decisions are not re-argued:
- **PRD** one document that fully specifies the build (what, who, data, security, flows, phased
  rollout, backlog, resolved decisions). **Architecture** the how and the invariants (the rules
  no change may violate). **DECISIONS** a table of choices, each with rationale AND blast radius
  if reversed, plus assumptions made under ambiguity flagged for ratification. **TASK-LOG** the
  board (grouped by feature, testable checkboxes). **RESUME** one re-entry brief: one-line
  status, the exact resume command, done, ordered next steps, open items, and what a human owes.
  It POINTS to the deeper docs rather than duplicating them.
- Update these at every milestone, not just at the end. Convert relative dates to absolute.
- A portable **skill/README that routes** (like this one): it names where the living docs are and
  states the invariants, rather than copying content that will drift.

## §3 In-app help / reference shape (docs that live in the product)

When docs ship inside the app (a `/help` section) or as a reference site:
- **Landing page**: short overview + a card grid to every topic. **Topic pages**: each with an
  on-this-page TOC, a prev/next chain, a "How it works" subsection (contract 2), and exact UI
  labels (contract 1). Build a tiny shared component kit (DocPage, Section, Steps, Callout,
  Term, Kbd) so pages are consistent and one topic registry drives both the grid and the chain.
- **Per-install, not per-tenant** unless the content genuinely differs by tenant. No data-layer
  reads from doc pages.
- Cover the operator's real questions: getting started, the core workflows, the trust/isolation
  model, where data lives and how to back it up, "dormant until keyed" integrations, and a
  troubleshooting/FAQ.

## Verification: docs get a gate too

Documentation is not done because it reads well. Gate it:
- **It builds/renders**: the pages compile and every route is reachable (for in-app docs, a
  dead-link crawl over the topic registry, anchors, and prev/next chain).
- **Accuracy spot-checks**: pick 8+ concrete claims (a button label, a threshold, a file path, an
  env var, a default) and verify each against the code; a reviewer independent of the author
  re-checks a sample. List claim / file checked / verdict.
- **House sweep**: style rules (e.g. no em-dashes), no secrets, scope stayed in the owned files.
- Treat a doc-vs-code mismatch found in review as a real defect (PATCH the doc), not a nit.

## Anti-patterns
Writing before knowing who reads it and what they do next. Documenting the PRD instead of the
build. One giant page that serves no one. Aspirational claims. Duplicating living-doc content
into a "skill" so it drifts. Skipping the render/link/accuracy gate because "it's just docs."
Burying the one thing the reader needed under setup and history.
