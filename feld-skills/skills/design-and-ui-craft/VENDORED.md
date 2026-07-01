# Vendored playbooks: pins, licenses, and refresh cadence

The three design playbooks under `vendor/` are copied from upstream open-source repos, pinned to a
specific commit so we control when we take updates. All are permissively licensed: **no fees, ever**,
the only obligation is attribution (their `LICENSE` file is kept in each folder, plus a `SOURCE.md`).

## Manifest

| Vendor | Upstream repo | Pinned commit | License | Copyright | Pulled | Next review |
|--------|---------------|---------------|---------|-----------|--------|-------------|
| emil | emilkowalski/skills | `1274a05` | MIT | per LICENSE (Matt Pocock, 2026) | 2026-07-01 | 2026-10-01 |
| impeccable | pbakaus/impeccable | `a82f02d` | Apache-2.0 | Paul Bakaus / contributors | 2026-07-01 | 2026-10-01 |
| taste | Leonxlnx/taste-skill | `06d6028` | MIT | Leonxlnx, 2026 | 2026-07-01 | 2026-10-01 |

Priority when guidance conflicts: **Emil > Impeccable > Taste** (see the routing table in `SKILL.md`).

Modifications from upstream:
- **impeccable**: documentation subset only. We kept `SKILL.md` + `reference/`; we removed `scripts/`
  (runtime browser tooling) and `agents/` (runtime configs). Noted per Apache-2.0.
- **emil, taste**: full `skills/` trees, verbatim.

## Refresh cadence: review every 3 months (or sooner if you hear of a major release)

**Next review: 2026-10-01.** Then roll the date forward 3 months each time.

Procedure (run from a clone of this repo on local disk):

1. **Check for upstream movement** since our pin:
   ```
   for r in emilkowalski/skills pbakaus/impeccable Leonxlnx/taste-skill; do
     echo -n "$r head: "; gh api "repos/$r/commits/main" --jq .sha
   done
   ```
   Compare each to the pinned commit in the table above. Same SHA = nothing to do; just bump the
   review date.

2. **See whether the change is significant** (not just typo/CI churn). Shallow-clone upstream and read
   the log for the part we vendor:
   ```
   git clone --depth=50 https://github.com/<repo>.git up && \
   git -C up log --oneline <pinned_sha>..HEAD -- skills/    # or .agents/skills/impeccable/reference for impeccable
   ```
   "Significant" = new rules, restructured guidance, new playbooks we would route to, or corrections
   we rely on. Cosmetic or tooling-only changes can wait.

3. **If significant, re-vendor** just the tracked subtree, keeping our trims:
   - emil: copy `up/skills/` over `vendor/emil/skills/`.
   - impeccable: copy `up/.agents/skills/impeccable/SKILL.md` and `.../reference/` over
     `vendor/impeccable/impeccable/` (do NOT re-add `scripts/` or `agents/`).
   - taste: copy `up/skills/` over `vendor/taste/skills/`.
   Then update the pinned commit + Pulled date in the table above, refresh `SOURCE.md`, note the change
   in the repo `CHANGELOG.md`, and bump the plugin `version`.

4. **If not significant**, just update the "Next review" date (+3 months) and move on.

5. Re-check the routing table and tie-breakers in `SKILL.md` still hold after any re-vendor.

Keeping the pins means an upstream change never silently alters our design guidance; we take updates
on purpose.
