---
name: delegate-and-qa
description: Read when deciding whether to hand a task to a cheaper model agent (Sonnet/Haiku) and how to QA the result. Triage rubric for model assignment, the delegation brief format, spawn mechanics, and the mandatory senior-model audit gate. Use when executing phases of a written plan, batching well-scoped dev tasks, or when Brian says "delegate", "hand this to sonnet", or "spin up an agent for this".
---

# Delegate & QA: task triage, agent assignment, senior audit

The companion to plan-and-handoff. That skill gets a plan written by the capable model; this skill
governs the execution leg: evaluate each task, assign the cheapest model that cannot fail it, spawn
an agent with a tight brief, then have the capable model audit the output before anything ships.

The economics: plans are expensive to derive and cheap to follow. Execution against a good spec is
where cheaper models shine. QA is cheap for a strong model and catastrophic to skip.

## Step 1. Triage: pick the model, or refuse to delegate

Classify the task before anything else. When in doubt, one tier up.

| Tier | Model | Task profile | Examples |
|---|---|---|---|
| Mechanical | Haiku | Zero judgment, exact spec, low blast radius | Renames, file moves, formatting sweeps, boilerplate from a template, doc typo passes |
| Well-scoped build | Sonnet | Clear acceptance criteria, verifiable by command, bounded files | CRUD endpoints from a spec, UI from a mockup, tests from a written contract, migration from a schema diff, refactor gated by green tests |
| Keep it (do NOT delegate) | Capable model (you) | Judgment, ambiguity, or high blast radius | Architecture, anything touching auth/payments/tenant isolation/secrets/production data, debugging with unknown root cause, cross-cutting refactors, tasks that need the conversation's context |

Refuse-to-delegate heuristics (any one is disqualifying):
- Writing the spec would take longer than doing the task. Just do it.
- Acceptance cannot be verified by a command or a diff read. If you cannot check it, do not delegate it.
- A wrong result is expensive or hard to detect (data migrations on live DBs, security boundaries).
- The task is under ~5 minutes of work. Agents start cold; spawn overhead eats the savings.
- The task requires live/production credentials or calls to a live external API (Stripe, payment
  providers, production databases). Not delegable to any model, and not runnable by the senior model
  either without Brian's explicit per-run sign-off. Tests and verification must pass fully mocked,
  offline, with no credentials present.

## Step 2. Write the delegation brief

The agent gets no conversation history. The brief must stand alone. Required sections:

```
OBJECTIVE: <1-2 sentences>
CONTEXT: read <plan doc / spec file> first. Working dir: <path>. Branch from <base> as <taxonomy>/<slug>.
FILES: <exact files to touch; everything else is off-limits>
CONSTRAINTS: no em-dashes anywhere; no secrets in code or docs; never commit to main;
  match surrounding code style; do not install new dependencies without listing them in the report;
  NEVER run anything that uses live/production credentials or calls a live external API (Stripe or
  any provider): the only commands you may run are the VERIFY list plus read-only git/file inspection.
ACCEPTANCE: <criteria, each verifiable by a command>
VERIFY: run <exact commands: tests, typecheck, lint> and include real output in your report.
REPORT BACK: files changed, commands run with output, anything you could not do and why.
```

If the plan doc (PLAN-*.md) already carries acceptance criteria, point at the phase instead of
restating it, but still pin FILES and VERIFY explicitly.

## Step 3. Spawn mechanics

Multi-session coordination (do this BEFORE every spawn, it is cheap):
- `git fetch`, then review open PRs, `git worktree list`, and unmerged `origin/*` branches. Other
  orchestrator sessions may be working the same repo; their footprint is worktrees + pushed branches.
- Never spawn work that overlaps an open PR or an in-flight branch. If overlap is ambiguous, read
  the repo's plan doc / follow-up doc for an in-flight section before deciding.
- Treat pushed branch names as the claim ledger: push the agent's branch as soon as it exists so
  parallel sessions can see the task is taken (commits can stay local until QA, the name is the claim).
- One merge authority per repo. If two sessions are active, only one merges PRs; the other halts at
  PR-open and says so in the PR body.

Spawn:
- Agent tool, `subagent_type: general-purpose`, `model: "sonnet"` or `"haiku"` per triage.
- Code changes get `isolation: "worktree"` so the agent cannot dirty your working tree.
- Parallel agents only on disjoint file sets. Overlapping files means one agent, sequenced tasks.
- To iterate on a returned result, continue the same agent via SendMessage (it keeps its context).
  A new Agent call starts cold.
- `subagent_type: "fork"` inherits the full conversation but always runs on the parent model, so it
  is never a cost downgrade. Fork for context-heavy side work, not for savings.

## Step 4. Senior QA gate (mandatory, never skip)

The capable model audits every delegated result before reporting it done. Trust nothing claimed;
verify everything cheap to verify.

1. **Read the diff yourself.** Whole diff for Sonnet work, spot-check plus full grep sweep for Haiku bulk work.
2. **Re-run verification yourself:** tests, typecheck, lint. The agent's pasted output is a claim, not evidence.
3. **Check acceptance criteria one by one** against the brief.
4. **House-rule sweep:** grep the diff for em-dashes and secret-shaped strings
   (`sk_live|sk_test|password.*=|BEGIN.*PRIVATE`); confirm branch taxonomy; confirm nothing landed on main.
5. **Live-API sweep:** from the agent's report, confirm it ran nothing beyond the VERIFY list and
   local build/test commands, and that no command could have reached a live external API or used
   production credentials. Anything outside the whitelist is an automatic bounce, even if the diff is good.
6. **Duplicate sweep:** re-fetch and confirm the work does not overlap something merged or opened
   while the agent ran (parallel sessions move fast); if it does, trim to the true delta before PR.
7. Verdict:
   - **Accept**: criteria met, checks green. Fold into the PR flow (ai-git-ops).
   - **Patch**: small issues (naming, a missed edge, comment noise). Fix them yourself; cheaper than a round trip.
   - **Bounce once**: material gaps. SendMessage the same agent with numbered findings. One bounce
     maximum; if the second result still fails, take the task over yourself. Never loop a failing agent.
   - **Reject and takeover**: the triage was wrong (task was not delegable). Note that for next time.

## Step 5. Report

Tell Brian in one short block: what was delegated and to which model, QA verdict with evidence
(test output, diff size), anything patched or bounced, and what stayed on the senior model and why.

## Anti-patterns

- Delegating the plan itself. Planning, architecture, and review stay on the capable model.
- "Fire and forget": reporting an agent's claim as done without the QA gate.
- Re-spawning fresh agents to fix a previous agent's work (context is lost; use SendMessage or take over).
- Splitting one coherent change across agents to parallelize; merge pain exceeds the speedup.
- Delegating to save tokens on a task that needs the transcript. Fork or keep it.
