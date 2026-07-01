# Vendored: Impeccable design language

- **Upstream:** https://github.com/pbakaus/impeccable (branch `main`)
- **Pinned commit:** `a82f02d1a186356d99d2f9256fce146c063fb56f`
- **Pulled:** 2026-07-01
- **License:** Apache-2.0 (see `LICENSE` in this folder)
- **What we vendored:** the `impeccable/` skill's **documentation subset only**:
  `SKILL.md` + the full `reference/` playbooks (audit, layout, colorize, typeset, critique,
  polish, craft, etc.). We **removed** the upstream `scripts/` (browser-automation + anti-pattern
  detector runtime) and `agents/` (runtime configs), which do not run standalone in our vendored
  context. This is a modification for size/relevance; per Apache-2.0 we note it here.
- **Want the full runnable tool** (live browser iteration, detector, slash commands)? Install
  Impeccable from upstream directly; this vendored copy is design **reference guidance**.

Role in `design-and-ui-craft`: **systematic audit + vocabulary.** Reach here for spacing (8px),
color systems (OKLCH, tinted neutrals), tokens, hierarchy, accessibility audits, and structured
critique of an existing interface.

Attribution only, no fees. To refresh, see `../../VENDORED.md`.
