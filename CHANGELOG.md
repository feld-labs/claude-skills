# Changelog

Newest first. Bump `feld-skills/.claude-plugin/plugin.json` version with each change.

## 0.2.0 (2026-07-01)
- Added **design-and-ui-craft**, a core design skill with a broad trigger, Feld Labs house rules
  (match existing tokens, no em-dashes, accessibility, verify by eye, restraint, honest copy), a
  deterministic motion tie-breaker, and priority routing (Emil > Impeccable > Taste) to three
  vendored open-source craft playbooks under `vendor/`.
- Vendored (attribution only, no fees; pinned commits, reviewed quarterly, see the skill's
  `VENDORED.md`): Emil Kowalski `skills` (MIT), Impeccable docs subset (Apache-2.0; runtime scripts
  and agents removed), Taste Skill `skills` (MIT). Each keeps its upstream LICENSE + a SOURCE.md.

## 0.1.0 (2026-06-27)
- Initial marketplace + `feld-skills` plugin with four playbook skills:
  saas-billing, multi-tenant-isolation, product-positioning, marketing-asset-gen.
- Distilled from the Confetti Albums build.
