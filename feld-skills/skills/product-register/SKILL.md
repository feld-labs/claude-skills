---
name: product-register
description: Read when you need to know or state where a product stands FUNCTIONALLY, when Brian asks "where does the product stand", "what have we built", "give me a status", "what functions do we have", or when a product has grown enough that answering that requires archaeology across the changelog, tickets, and deploy log. Establishes and maintains PRODUCT-REGISTER.md, a by-function state map that is the single source of truth for what exists and its status, plus the update-log layer (DEPLOY-LOG + CHANGELOG), kept current in the same PR that changes a function's status so the record never drifts. Born from the Meridino gap (2026-08-05): the chronological changelog, the tickets ledger, and the deploy log fragmented the answer to "where does the product stand," and a harvest subsystem silently sat BROKEN for 11 days because no functional-state view surfaced it.
---

# Product Register: the functional state of the product, kept true

Every product past a handful of functions needs one artifact that answers, at a glance, "where does
this product stand today, by function." The changelog, the tickets ledger, and the deploy log do not
answer that: they are time-ordered histories, not a state map. This skill owns the register and the
discipline that keeps it true. It pairs with [[technical-documentation]] (how to write and verify
docs), [[program-handoff]] (a program's tiered state and human-owes register), and ai-git-ops /
[[delegate-and-qa]] (the PR discipline that keeps records current).

## 1. The gap it fills (why the changelog is not enough)

- **CHANGELOG** = chronological history, one entry per PR ("what changed, when").
- **TICKETS** = a work ledger ("what to build / in flight / done").
- **DEPLOY-LOG** = deploy history ("what commit and which migrations are actually running in prod").

None of them answers "where does the product stand today, by function." Reconstructing that from three
time-ordered logs is archaeology, it goes stale silently, and it hides regressions. Concrete failure:
on Meridino a job-harvest subsystem crash-looped and the pool sat frozen for ELEVEN days before anyone
noticed, because nothing gave a functional-state view where a BROKEN status would have been obvious.
The register is the missing STATE layer sitting on top of those HISTORY layers.

## 2. What PRODUCT-REGISTER.md is

One doc, organized BY FUNCTION, never chronologically:

- A top **summary table**: `function -> status`, the whole product scannable in one screen.
- One **section per functional area**, each carrying: **STATUS**, a one-line "what it does", the **key
  files/components** that implement it, the **flags/env** that gate it, and **known gaps**.
- A short **"how to keep this current"** note at the top (see section 4).

Fixed **status vocabulary** (do not invent variants):
- **LIVE** - in production and on.
- **DORMANT-FLAGGED** - built and merged, but off behind a flag or an unset key.
- **IN-PROGRESS** - being built now.
- **PLANNED** - specced or ticketed, not built.
- **BROKEN** - regressed or down. Name it loudly; a BROKEN row is the point of the register.

Cover the real functional areas the codebase has. A typical SaaS map: access/auth, discovery/ingest,
verification, matching/scoring, generation, the app screens, billing/metering, anti-abuse/security,
monitoring. Adapt to what the code actually is.

## 3. Build it from the codebase, not from memory

Derive both the structure and each status from what the code ACTUALLY is: survey the routes/screens,
the engine/services, the workers, and the migrations (the data model). Then CROSS-CHECK status against
reality, which is the whole value:
- A flag's LIVE value (not what a doc claims), the deploy-log's high-water commit, whether a subsystem
  is actually PRODUCING (query it), whether a "live" feature is really keyed.
- **Flag anything you cannot verify** rather than asserting it (e.g. "billing BUILT; verify the Price
  IDs on the box"). A register that guesses is worse than none.
This is judgment work (run it on Opus, see [[strategy-on-opus]]). A mechanical file-list misses the
"is it actually on / actually working" question, which is the only question that matters.

## 4. Keep it current in the SAME PR that changes a function's status

Records drift the instant they depend on someone circling back (the exact failure mode that leaves a
TICKETS.md calling a shipped, live feature "pending deploy"). So:

- A PR that ships, flips a flag, breaks, or retires a function **updates the register in that same
  PR**, exactly like its CHANGELOG entry. Non-negotiable, not a follow-up.
- Where the toolchain allows, a **doc-drift CI check** fails the build when a status claim contradicts
  reality (a flag's value, a deploy-log commit). A convention is not enough; make staleness a red build.
- The register is **reviewed against the box at each deploy**, alongside the deploy-log entry.

## 5. The three-layer record

- **PRODUCT-REGISTER.md = STATE** ("what exists and its status, now"). The single source for a status
  update.
- **CHANGELOG.md = HISTORY per PR** ("what changed, when").
- **DEPLOY-LOG.md = HISTORY per deploy** ("what commit and migrations are actually running"; the box
  wins, and it is written by the thing that does the deploy, never reconstructed later).

The register REFERENCES the logs but is not them. When the register and a log disagree, that is a
drift SIGNAL to resolve in the same session, not to paper over.

## 6. When to create and refresh one

- **Create it the first time a status update takes more than a glance** - once the product has more
  than a handful of functions. Do not wait to be asked; the Meridino register was created reactively,
  after the 11-day silent break.
- **Refresh at every milestone and deploy**, and whenever any status changes.
- A **new venture** gets a register stub as soon as it has real functional surface
  ([[venture-scoping]], [[building-products]]).

## 7. A BROKEN status is a monitoring failure, not just a register entry

The register RECORDS that a function is broken; it does not CATCH the break. If a subsystem can sit
broken for days, the real gap is a missing monitor, not a missing doc. Whenever you add a BROKEN row
for something that failed silently, add or demand the alarm that would have caught it (a staleness
check, a heartbeat / dead-man's-switch, an error monitor) per [[in-house-observability]]. The register
is the map; observability is the smoke detector. Ship both.

## Checklist

- [ ] `PRODUCT-REGISTER.md` exists with a summary table + one section per function.
- [ ] Every status uses the fixed vocabulary (LIVE / DORMANT-FLAGGED / IN-PROGRESS / PLANNED / BROKEN).
- [ ] Status was cross-checked against reality (live flag values, deploy-log commit, actual output);
      anything unverifiable is flagged, not asserted.
- [ ] The "keep current in the same PR" note is at the top, and the last status-changing PR honored it.
- [ ] Any BROKEN or silently-degradable function has a monitor, or one is now ticketed.
- [ ] The register, CHANGELOG, and DEPLOY-LOG do not contradict each other (drift resolved).
