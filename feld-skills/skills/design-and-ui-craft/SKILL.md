---
name: design-and-ui-craft
description: Read whenever improving, designing, redesigning, reviewing, or polishing any user interface, visual design, or user experience. Covers landing and marketing pages, app screens, dashboards, components, forms, onboarding, empty and error states; and every craft dimension: layout, spacing, typography, color, hierarchy, motion and animation, micro-interactions, responsive behavior, accessibility, theming and design tokens, and copy in the UI. Use for broad asks too ("make this look better", "more premium", "less generic / less like AI slop", "sharpen the design", "tighten the UX"). Routes to three vendored craft playbooks (Emil Kowalski, Impeccable, Taste) and applies Feld Labs house rules on top.
---

# Design and UI Craft (core)

The Feld Labs design brain. When we sharpen how something looks, feels, or behaves, this skill sets
the house rules and then routes to the right vendored playbook for the job. The three playbooks live
in `vendor/` as **reference** (they are not separately-registered skills); read the relevant file,
then apply it through the house rules below.

## House rules (these win over any vendored guidance)
1. **Match the project's existing design system.** Use the app's own tokens (e.g. Confetti's
   `theme.css`: `--brand`, `--ink`, spacing, radii). Never introduce a parallel palette, font stack,
   or spacing scale. Extend the tokens; do not fork them.
2. **No em-dashes anywhere** (copy, labels, comments). House style.
3. **Accessibility is not optional.** WCAG AA contrast, visible focus, keyboard reachable, respect
   `prefers-reduced-motion`. If a vendored rule fights contrast, contrast wins.
4. **Verify visually before shipping.** Render the change (headless browser is fine; see the
   `marketing-asset-gen` skill) and actually look at it. Design is judged by eye, not by diff.
5. **Restraint over novelty.** Editorial and calm beats trendy. One idea per section, generous
   whitespace, real hierarchy. Do not add motion or effects that do not earn their place.
6. **Honesty in copy.** No fabricated testimonials, stats, or logos. If there is no real proof yet,
   use the brand promise, not invented social proof.

## Motion tie-breaker (the playbooks differ, so pick deterministically)
- Default to **Emil's** guidance: UI transitions roughly 150 to 300ms, custom easing (not the CSS
  defaults), and perceived performance matters as much as real speed.
- When building a **token system**, adopt **Impeccable's** 100 / 300 / 500ms scale (micro / entrance /
  page) so durations are systematic.
- Always honor `prefers-reduced-motion` and keep entrances subtle.

## Routing: which playbook for which need (priority Emil -> Impeccable -> Taste)
Each specializes. Pick by the task, not by habit. Emil is the default craft authority; escalate to the
others when the need matches.

| The need | Go to | Good entry files |
|----------|-------|------------------|
| Craft feel, animation, micro-interactions, easing, "why does this feel right", component polish, DX | **Emil** (`vendor/emil/skills/`) | `emil-design-eng/SKILL.md`, `animation-vocabulary/SKILL.md`, `review-animations/SKILL.md` |
| Systematic **audit** of an existing UI: spacing (8px), color system (OKLCH, tinted neutrals), tokens, hierarchy, typography, accessibility, structured critique | **Impeccable** (`vendor/impeccable/impeccable/`) | `reference/audit.md`, `reference/layout.md`, `reference/colorize.md`, `reference/typeset.md`, `reference/critique.md`, `reference/polish.md` |
| Greenfield direction, full **redesign**, choosing an aesthetic or design system, killing "templated / AI-slop" feel, variance tuning | **Taste** (`vendor/taste/skills/`) | `taste-skill/SKILL.md`, `minimalist-skill/SKILL.md`, `redesign-skill/SKILL.md`, `soft-skill/SKILL.md` |

Rules of thumb:
- **Polishing something that already exists?** Start with Emil (feel) and run Impeccable's `audit`.
- **Starting from a blank page or doing a from-scratch redesign?** Start with Taste to set direction,
  then Emil for the craft pass, then Impeccable to audit before shipping.
- When two playbooks conflict, follow the house rules, then prefer the higher-priority playbook
  (Emil > Impeccable > Taste).

## How to use a vendored playbook
1. Read the entry file(s) above for the task at hand (do not dump all of `vendor/`).
2. Translate the guidance into the project's existing tokens and components.
3. Apply the house rules as overrides.
4. Render and eyeball the result before committing.

## Maintenance
Vendored copies are pinned to specific upstream commits and reviewed on a cadence. See
`VENDORED.md` in this folder for the pins, the licenses, and the refresh procedure.

## Related skills
- `marketing-asset-gen`: render UI/marketing assets to verify design by eye.
- `product-positioning`: the words on the page (hero, value hierarchy). Use alongside this for copy.
