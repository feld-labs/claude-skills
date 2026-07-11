# AI Agent Operating Rules

Operating manual for any AI agent working in this repo. The block at the bottom is the Feld
Labs master rule set, propagated from feld-labs/claude-config (do not edit it here; edit the
master and re-run scripts/sync-agents.sh). Put project-specific rules in the section below.

## Project-specific
- Stack, architecture, data flow, testing, deploy: fill in.

<!-- FELD-PORTABLE:BEGIN v1 (generated from feld-labs/claude-config/AGENTS.md; do not edit inside a repo, edit the master and re-run scripts/sync-agents.sh) -->
## Feld Labs portable rules (all repos, all models)

Vendor-neutral. Binds ANY AI coding agent working in a Feld Labs repo, Claude or otherwise.
Project-specific rules live OUTSIDE this block and may only ADD, never weaken what is here.

### Style (non-negotiable)
- **NEVER use an em-dash.** Anywhere: code, comments, docs, copy, commit messages, PRs, chat. Use a
  comma, period, colon, parentheses, or split the sentence.
- **Never run a live git repo inside a synced folder** (Google Drive, OneDrive, Dropbox, iCloud). Local
  disk only; GitHub is the backup and cross-machine sync. Keep `node_modules` and build artifacts off synced drives.
- **Default GitHub org is `feld-labs`; new repos are private by default.**

### Model routing (capability tiers, hybrid / multi-model)
Match the model to the task. A token spent above the task is waste; below it is a quality risk. Reason
in capability TIERS, not vendor names, so the same routing holds across a hybrid of models:
- **Mechanical / deterministic** (renames, formatting, changelog entries, status updates) -> smallest capable model.
- **Well-scoped build against a written spec** (features, tests, UI, migrations, adapters) -> mid-tier.
- **Judgment** (architecture, security boundaries, merge-conflict resolution, the QA gate on every mid-tier PR) -> top-tier.
- **Strategy** (positioning, pricing, spec writing) -> strategy-tier.

Current Claude mapping: `haiku` = mechanical, `sonnet` = well-scoped build, `opus` = judgment + QA gate,
`fable` = strategy. When mixing vendors, map each model to the equivalent tier and keep the SAME gates:
- **Never merge your own PR.** Security-critical work (auth, tenant isolation, capability / share tokens,
  write-path billing, breach or data-loss surfaces, consent / trust-and-safety, ToS / retention /
  sending-law compliance) gets an INDEPENDENT reviewer, never self-QA.
- **Parallel agents only when collision is impossible:** one agent = one dedicated worktree = one unique
  branch = a declared disjoint file set. Two agents never share a branch or working tree. Same-file tasks queue.
- **Checkpoint discipline:** many small PRs (not one big in-flight branch), a live `RESUME.md` per project,
  mirror state into memory. Stop at a clean boundary if context or credits run low.

### Human-only actions (NEVER a model, at any tier)
No model performs these without the owner's explicit per-run sign-off: live or production credentials
and OAuth consent, live external API writes (Stripe or any payment provider, production databases,
provider write APIs), domain / DNS / registrar changes, production deploys, purchases, and launch or
go-live approvals. If a task seems to require one, stop and ask; do not improvise.

### Git governance (ai-git-ops)
- **Never commit directly to the default branch** (`main` / `master`). Branch first, using the taxonomy:
  `feature/`, `fix/`, `experiment/`, `refactor/`.
- **Atomic commits, imperative messages.** If a commit needs more than one sentence to describe, it is too large.
- **Read `README.md`, `ARCHITECTURE.md`, this `AGENTS.md`, and the repo's own context docs** before implementing.
- Every change lands via a **Pull Request** (Summary, Reasoning, Risk, Testing evidence) plus a
  **`CHANGELOG.md`** entry. **Halt for human approval before merge; never self-merge.**

### Secrets and privacy (non-negotiable)
- **NEVER commit, push, or share secrets:** `.env`, API keys, tokens, OAuth client secrets,
  service-account JSON, `.pem` / `.key` / `.p12`, database credentials. Commit only placeholder
  templates (`.env.example`). Verify no secrets are tracked before any push or making a repo public.
- **NEVER run against live / production credentials or live external APIs** without the owner's explicit
  per-run sign-off. Development and verification run fully mocked and offline; use provider test modes.
- **Auth is SSO / OIDC only** (Google via Supabase today). Never build, store, or manage passwords or
  credentials. Identity comes from the verified SSO token; authorize via membership / roles.
- **Treat user / customer data as private:** gitignore it, never upload to third parties without explicit
  consent, prefer local or self-hosted processing.

### Multi-tenant and integrations (where applicable)
- If the app is multi-tenant, **scope every data access by tenant; tenant isolation is a release gate.**
- Integrations follow **"dormant until keyed":** wired into the code now, inert until a real key exists.
<!-- FELD-PORTABLE:END -->
