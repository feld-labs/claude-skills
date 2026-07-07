# Attack-Path Chaining (the synthesis pass)

Run this LAST, after the atomic checklist in `SKILL.md` and after you have verified each finding. It is
not another scan. It is the step that asks: given everything the other passes found and confirmed, what
can an attacker actually achieve?

Adapted for Feld Labs from the `seatrial` adversary-emulation lens (MIT, James Swift). Strictly
defensive: model attacks against a system you own to harden it. Never produce working exploits, payloads,
or anything aimed at a system you do not control. If a finding is only useful to an attacker and not to
the defender fixing it, it does not belong in the report.

## Why it matters

Every atomic check finds an isolated flaw: this query is unbounded, that route lacks an ownership check,
this email is never verified. Each alone might be a "medium." But an attacker does not experience your
app as a list of independent findings. They experience it as a path to a goal. Three mediums that chain,
register without email verification, then hit an export endpoint with no ownership check, then receive
another user's full record, compose into a critical breach that no single check names, because each check
only saw its own slice. This pass is that synthesis.

**Feed it the verified set, not the raw list.** A chain built on a finding you later refuted asserts a
path that does not exist. Chain only from confirmed findings.

## Pass 1 (Red): pick the attacker's goals for THIS app

Derive goals from what the app holds and does:
- Account takeover (normal user; admin).
- Mass data exfiltration, especially special-category data (health, financial, PII).
- Privilege escalation (user -> admin; tenant A -> tenant B).
- Financial abuse (bypass payment, abuse refunds, run up metered/AI cost on the operator's bill).
- Integrity attack (tamper with records, balances, audit logs).
- Denial of service / resource exhaustion where cheap to trigger.

## Pass 2 (Red): trace the kill chain for each goal

Build the path from entry to impact using confirmed findings. Use these stages as the spine so chains
are comparable (a defensive reading of the standard ATT&CK sequence):
- **Initial access** - foothold: weak signup, exposed endpoint, leaked secret, SSRF.
- **Exploitation** - the flaw triggered: injection, IDOR, logic flaw, prompt injection.
- **Persistence** - keeping access: a token that never expires, a self-granted role.
- **Privilege escalation** - more rights: missing authz, mass-assignment of a role field.
- **Credential access** - others' secrets: exposed JWTs, predictable/returned reset tokens.
- **Collection / exfiltration** - what data comes out and how much: over-broad export, unbounded query.
- **Impact** - the realised damage: breach scope, financial loss, integrity loss.

A chain whose every link is a real, located finding is a real attack path. A chain that needs a step
nobody found is a hypothesis: label it clearly and verify the missing link before rating it high.

## Pass 3 (Blue): would you even notice?

For each chain, walk it and ask at every step: is there logging, alerting, rate limiting, or anomaly
detection that would fire? A silent path is worse than a loud one. Missing detection is itself a finding.

## Pass 4 (Purple): pair each path with its fix

The deliverable is a small set of ranked attack paths, each with: the chained findings, the detection
gap, and the single highest-leverage fix that breaks the chain (often one control kills several paths).
Priority-bump any chain that matches a known real-world pattern (OWASP Top 10, common CVE class, a recent
breach shape).

## Builder-awareness check

For each chain, was this a blind spot or a known risk the team accepted? Evidence of an intentional
security decision (a comment, a guard, a test) vs a silent gap changes both the severity read and how you
raise it. A deliberate, documented trade-off is a conversation; a blind spot is a bug.

## Output

A short ranked list of attack paths, most-severe first. For each: goal, the chain (entry -> impact) with
the finding ids it is built from, the detection gap, and the breaking fix. Keep every item actionable for
the defender. A clean pass means these chains did not form from the current findings, nothing more.
