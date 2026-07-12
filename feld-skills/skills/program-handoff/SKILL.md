---
name: program-handoff
description: Read when packaging a large multi-PR program of work for execution and handoff to Brian, or when Brian says "hand this off", "package this up", "tier this work", "wrap this program", or "what do I owe". The tiered-program pattern proven on the Lucid Arc six-tier marketing handoff and the Keel v1 build (8 PRs): dependency-ordered tiers each shipped as an independently mergeable PR, dormant-until-keyed wiring for anything awaiting external keys or accounts, independent review on security-adjacent tiers, a human-owes register of deploy blockers only Brian can clear, a parked-epics register naming what is explicitly out of scope and what unparks it, and a verified end state (merges confirmed landed, no open PRs, RESUME.md and memory current).
---

# Program Handoff: Tiered Delivery and a Clean Baton Pass

The pattern for delivering a large program (a marketing overhaul, a v1 build, a compliance sweep)
so that it lands fully merged and the baton passes to Brian with zero ambiguity about what
shipped, what is dormant, what he owes, and what was deliberately left out. Proven at scale on
the Lucid Arc six-tier marketing handoff (all tiers merged, deploy held by Brian) and the Keel v1
program (8 PRs, every one QA-gated). Execution mechanics per tier come from [[delegate-and-qa]]
and ai-git-ops; this skill owns the program-level structure and the handoff itself.

## 1. Tier the program before building anything

Decompose the program into tiers ordered by dependency and risk, and write the tier map down
before tier 1 starts:

- **One tier = one independently mergeable PR** (or a small numbered PR series). A tier is
  reviewable in one sitting and shippable even if every later tier is cancelled.
- **Order by dependency first, value second.** Foundations that later tiers build on (shared nav,
  a voice/style layer, plan enforcement) go first even when flashier tiers are more fun.
- **Fix interface contracts at tiering time** (routes, schemas, shared modules), so tiers built
  by different agents or sessions compose without rework.
- **Board, CHANGELOG, and docs update inside each tier's PR**, never as a follow-up. A tier that
  merges leaves the program's paper trail already correct.
- Tiers with disjoint file sets may build in parallel per [[delegate-and-qa]]; tiers sharing
  files queue single-track. Integration is always single-track.

## 2. Dormant-until-keyed for every external dependency

Any tier whose runtime behavior needs a key, account, domain, or third-party approval that does
not exist yet ships **wired but inert** ([[optional-integrations]] is the base pattern): code
merged, feature dark, activation being exactly "add the key". Lucid Arc shipped email summaries
dormant until the RESEND key and Stripe checkout dormant until test keys this way.

Never improvise around a missing key (stub creds, personal accounts, "temporary" live keys). The
missing key becomes a line on the human-owes register instead. This is what lets a program reach
100% merged while external dependencies are still pending.

## 3. Risk-route the sensitive tiers

Tiers touching billing, auth, tenant isolation, consent, or compliance machinery are
security-critical: highest-tier build attention plus an **independent reviewer** (a separate
agent/session or Brian) before merge, per the global rule. Lucid Arc's Stripe Checkout tier was
independent-reviewed and had its webhook confirmed as the sole plan-writer before merge; that
review caught real findings. Never self-merge anywhere; on these tiers, never even self-QA.

## 4. The human-owes register

Every action only Brian can take is captured in one register, not scattered through chat. Each
entry carries:

- **The item** (rotate these secrets, buy the domain, provide the RESEND key, name the legal
  contact, sign off on the deploy).
- **What it gates** (deploy, SEO/SSO, a dormant tier's activation).
- **Urgency**, flagged honestly (a leaked-secret rotation is urgent; a nice-to-have key is not).

Purchases and account creation are ALWAYS Brian-owned per the global framework: agents write the
runbook, never execute the purchase. The register lives in `RESUME.md` and is mirrored to project
memory, so any future session can answer "what does Brian owe" without the transcript.

## 5. The parked-epics register

Whatever the program deliberately does NOT include gets named, not dropped. Each parked epic
records what it is, why it is parked, and the trigger that unparks it (Lucid Arc: SSO parked
until Brian triggers it; analytics dashboards parked as a named epic). Silent scope-parking is
how work gets lost between sessions; a parked register is how a program says "no, for now" in a
way that survives.

## 6. End-state verification, then the handoff message

Before declaring the program done:

- **Verify every merge landed**: confirm origin's default branch actually advanced and the files
  exist there (`git ls-files`, tip SHA). Chained git+gh commands fail silently mid-chain; a
  claimed merge is not a landed merge.
- **No open PRs** owned by the program; every branch merged or explicitly parked.
- **RESUME.md current** (status, resume command, owes register, parked register) and **memory
  mirrored**.

Then hand off in one message with four sections, in this order: **what shipped** (tiers with PR
numbers and one-line outcomes), **what is dormant** (and the key that wakes each item), **what
Brian owes** (the register, urgency-flagged), **what is parked** (and each unpark trigger). The
test of a good handoff: a fresh session, or Brian at the GitHub UI, can act on it without asking
a single clarifying question.

## Anti-patterns

- One mega-branch carrying the whole program. A cutoff or a bad rebase loses everything; tiers
  exist so progress is merged progress.
- Improvised credentials to avoid shipping dormant. The dormant pattern plus an owes-register
  line is always available.
- Self-reviewed billing/auth tiers. Independent review is not optional there.
- Silent scope-parking: dropping an epic without a register entry and unpark trigger.
- Handoff with unverified merges, or "done" messages while PRs sit open.
- An owes list scattered across chat messages instead of one register in RESUME.md and memory.
