# Feld Labs Claude Skills

A private Claude Code marketplace of reusable playbook skills, distilled from real Feld Labs builds.
One source of truth, synced to every machine via the plugin system.

## What's inside (`feld-skills` plugin)
- **saas-billing**: payments, checkout, webhooks, entitlements, idempotency, plan and credit metering, test/live split.
- **multi-tenant-isolation**: scope-by-tenant patterns, session AND domain-resolved (white-label) context, the Postgres RLS isolation patterns, legacy compat, the isolation release gate.
- **white-label-branding**: one deployment as many brands, config-driven identity/content/theme, resolve per request, pass to the UI as props, CSS-variable theming, per-brand SEO/comms/legal.
- **seo-aeo-geo**: get found by search AND answer engines, JSON-LD (incl. FAQPage), AI-crawler robots policy, published-only sitemap, llms.txt, canonicals, extractable content patterns.
- **trust-and-verification**: verify people and their right to act before high-stakes actions, gate pattern (mock in dev, hard-block in prod), identity + attestation, private doc uploads, publish/checkout gates.
- **shipping-nextjs-app**: run `next build` before "done" (tsc + tests miss build errors), and the App Router gotchas (request-scoped APIs at build, useSearchParams + Suspense, per-tenant pages must be dynamic).
- **product-positioning**: find the real buy reason, value-led hero, de-emphasize hype.
- **marketing-asset-gen**: OG images and product screenshots via headless browser from the app's own CSS, privacy-blurred.

## Install (per machine, once)
```
/plugin marketplace add feld-labs/claude-skills
/plugin install feld-skills@feld-labs
```
(Private repo; needs access to the feld-labs GitHub org.)

## Update (e.g., weekly, on each machine)
```
/plugin marketplace update feld-labs
/plugin update feld-skills
```
Or just restart Claude Code, which re-reads installed plugins.

## Adding or editing a skill
1. Clone this repo on local disk (never inside a synced folder like Drive/OneDrive).
2. Add `feld-skills/skills/<name>/SKILL.md` (kebab-case dir; frontmatter `name` + `description`).
3. Bump `feld-skills/.claude-plugin/plugin.json` `version`, add a CHANGELOG entry, commit, push.
4. Run the update commands above on each machine.

## Notes
- Global *rules* (no em-dashes, never run a git repo in a synced folder) are NOT shipped here; they
  live in `~/.claude/CLAUDE.md` and sync via the separate dotfiles repo.
- House style: no em-dashes anywhere.
