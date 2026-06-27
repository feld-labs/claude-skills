---
name: marketing-asset-gen
description: Generate marketing visuals with a headless browser: branded OG/social images and pixel-accurate product screenshots rendered from the app's own CSS, with a privacy blur for real photos. Use when a marketing or landing page needs an OG image or product screenshots and you cannot or should not run the full app with real data.
---

# Marketing Asset Generation (headless browser)

Render real-looking marketing assets without design tools and without running the full app with
production data. Works because Chrome and Edge ship a headless screenshot mode.

## When to use
- A page references an OG image that does not exist yet.
- "Screenshot placeholder" boxes need real product shots, but the app needs auth and data to run, or
  the data is private (real user content).

## Technique 1: branded OG / social image (no app needed)
1. Write a self-contained HTML template at 1200x630 using the brand palette (inline CSS, system-safe
   font fallbacks so it renders offline). Keep a generator template in the project repo.
2. Render it:
   `chrome --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=1200,630 --screenshot=og-image.png file:///abs/path/template.html`
3. Open the PNG and visually verify before shipping.

## Technique 2: pixel-accurate product screenshots from the app's own CSS
Do NOT try to run the full authenticated app. Instead rebuild each view as a static mockup:
1. Copy or link the app's real `theme.css` + `style.css` and reuse the **actual DOM classes** from the
   view's render code (read the template/JS to copy the markup: tiles, cards, headers, badges).
2. Fill the content slots with sample or real images.
3. Serve the folder over a tiny local HTTP server (so `?v=` cache-busting query strings on CSS links
   resolve; `file://` drops query strings), or strip the queries and use `file://`.
4. Render headless at 2x for crispness:
   `chrome --headless --force-device-scale-factor=2 --window-size=1440,900 --screenshot=out.png http://localhost:PORT/mock.html`
5. View each PNG to verify it matches the live product.

## Privacy (when using real user photos)
- Apply a blur so people are not clearly identifiable: a CSS `filter: blur(Npx)` on the images at
  render time bakes into the screenshot. Use a light blur on small grid thumbnails (2-3px) and a
  heavier blur on close-up face crops (5-6px).
- Keep raw originals OUT of the repo (a folder outside the published tree). Commit only the rendered,
  blurred output. Getting consent for publishing identifiable faces is the owner's call.

## Where things live
- The technique is general (this skill). Keep app-specific templates and mockup builders in the
  project repo, not here.
- Output images go in the web root (e.g., `public/screenshots/`, `public/og-image.png`).

## Gotchas
- `file://` ignores query strings, so `theme.css?v=123` fails to load over file://; serve over HTTP or
  drop the query.
- Fonts loaded from a CDN need network; otherwise they fall back. Fine for a quick asset, but verify.
- Large PNG screenshots are heavy; convert photo-heavy shots to optimized JPEG/WebP if page weight matters.

## Checklist
- [ ] OG image rendered at 1200x630 and visually verified
- [ ] Product mockups use the app's real CSS + DOM classes (pixel-accurate)
- [ ] Real photos blurred (light on thumbnails, heavy on faces); raw originals not committed
- [ ] Output committed to the web root; templates kept in the project repo
