---
name: email-correspondence
description: Spin up on-brand, email-safe HTML email for a Feld Labs product quickly, and wire it to the sending system. Covers the hard email-safe HTML rules (table layout, inline styles, system fonts, one bulletproof CTA), a brand-token system so a new product's emails take minutes not hours, a nine-template catalog (magic-link sign-in, welcome, weekly product-update changelog, a transactional base, a payment receipt, dunning for a failed payment, a usage-limit upgrade nudge, a personalized results digest, and a migration/relaunch notice), a by-operating-model map of which templates a metered SaaS versus a discovery/matching product actually needs, provider wiring (Supabase Auth for transactional, Brevo for marketing) with the exact merge tags, deliverability and sending-law compliance, a preview-before-send workflow, and the launch-day email set every product needs. Use when a product needs any customer-facing email: auth emails, a welcome, a receipt, a dunning email, a usage nudge, a personalized digest, a product-update digest, or a customer migration notice.
---

# Email Correspondence

Stand up the email channel for a product fast, and keep it deliverable and compliant. This skill owns
the CHANNEL: email-safe HTML, the template system, provider wiring, and sending law. It does NOT own
the words (see below) or the message.

This is a LIVING skill, seeded from the MySheetAI relaunch email work (magic-link + a Railway-style
weekly changelog). Extend it: add house templates, per-product brand-token files, and new provider
notes as we wire more products.

## How this fits with the other skills

- **product-positioning** decides WHAT to say (the offer, the value). Do that first.
- **copywriting-craft** owns HOW the words read (voice, the anti-AI-tell playbook). Every line of email
  copy goes through it. This skill deliberately does not restate copy rules; it gives you the frame the
  words go in.
- **marketing-asset-gen** renders visual assets (OG images, screenshots). If an email needs a hero
  image, generate it there, then embed it here as a hosted URL or (small) inline data URI.
- **content-engine** owns production ops for the broader content program; the weekly changelog email is
  one distribution surface of it.
- **This skill** = the email itself: markup that survives Gmail/Outlook/Apple Mail, the send wiring,
  and not landing in spam or breaking sending law.

## The one rule that makes email hard

Email clients are not browsers. Gmail strips `<style>` blocks in some contexts, Outlook renders with
Word's engine, Apple Mail dark-mode inverts colors, and none of them run JavaScript or fetch external
CSS. So the whole discipline is: **build like it is 2005, inline everything, and test in the real
clients.** The rules below are not stylistic preferences; each one is a client that breaks without it.

## Email-safe HTML rules (non-negotiable)

1. **Table layout, not flexbox/grid.** Outlook ignores modern CSS layout. Nest `<table role="presentation">`
   for structure. A centering wrapper table, then a fixed-max-width content table.
2. **Inline styles only.** Every style goes in a `style=""` attribute on the element. Do not rely on a
   `<style>` head block or classes (Gmail clips them). No external stylesheet, ever.
3. **System font stack, no web fonts.** Use
   `-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif`. A linked web font
   silently falls back in most clients and can render an unstyled mess. (This is also why the
   MySheetAI emails do NOT use the app's display font.)
4. **Max width 600px, fluid below.** `width:600px;max-width:100%` on the content table so it fits phones.
5. **One bulletproof button per email.** A primary CTA built as a table cell with `bgcolor` + a padded
   `<a>` (not a styled `<div>`), so it renders in Outlook. One primary action; secondary links are text.
6. **Preheader text.** The hidden snippet the inbox shows next to the subject. Put a visually-hidden
   span as the first body element. Never leave it to chance (clients grab the first visible text).
7. **Alt text on every image, and never rely on an image loading.** Images are off by default in many
   clients. The email must make sense with zero images. No background-image-only content.
8. **Dark mode aware, lightly.** Do not fight it hard, but avoid pure-white logos on transparent and
   pure-black text locked by inline color that inverts badly. Test the primary CTA contrast in dark.
9. **No JS, no forms, no video.** Link out to the app for anything interactive.
10. **Plain-text alternative.** The sending system should include a text/plain part; keep the content
    expressible as plain text (another reason for a single clear CTA URL).

## Brand-token system (this is what makes it fast)

Do not hand-build each product's emails. Keep the templates in `templates/` tokenized, and fill a small
per-product token set once. The tokens (see `templates/_brand-tokens.md` for the full list and an
example):

- `BRAND_NAME`, `BRAND_WORDMARK_HTML` (the styled name, e.g. accent on part of it)
- `BRAND_ACCENT` (one hex, the CTA + accent color), `BRAND_ACCENT_BG` (a pale tint for header bars)
- `APP_URL`, `FOOTER_IDENTITY` (the from-line, e.g. "Brian at MySheetAI"), `SENDER_TAGLINE`
- `PREHEADER` (per-send)

Filling these for a new product is a 5-minute find-and-replace, then the whole catalog is on-brand.

## Template catalog (in `templates/`)

- **`magic-link.html`** transactional sign-in. SSO-only house rule means there is NO password-reset
  email ever; magic-link (passwordless OTP) is the only email-auth path. Keep the provider's link
  variable exactly (`{{ .ConfirmationURL }}` for Supabase). One CTA, expiry note, "ignore if not you".
- **`welcome.html`** lifecycle. Sent on first sign-in. One job: get them to the first valuable action.
  One CTA to the core flow, not a feature tour.
- **`weekly-changelog.html`** marketing/lifecycle. The Railway-style "what shipped this week" digest:
  eyebrow ("Product Update"), a "The week at <Brand>" heading, a scannable bulleted list ending in
  "Fixes and improvements", one "Read the changelog" CTA, a reply-for-feedback line, a personal signoff,
  and the required unsubscribe. Duplicate/trim the list per week. Pairs with a `/changelog` page.
- **`transactional-base.html`** a bare, tokenized shell (header, one content slot, one optional CTA,
  footer) to build any new transactional email (seat invite, expiry warning, one-off status update)
  in minutes.
- **`receipt.html`** transactional. Confirms a successful payment or subscription charge. A small
  2-column line-item table (plan, amount and billing period, next renewal date) and one "Manage
  billing" CTA to the billing portal. Fires on the provider's payment-succeeded webhook. No upsell
  copy, just the facts.
- **`payment-failed.html`** transactional dunning. Fires when a card is declined. Calm and reassuring,
  not alarming: states we will retry automatically, gives a self-serve "Update payment method" CTA,
  and names the grace window before anything actually lapses. This is the single highest-ROI
  retention email in the catalog, most declines are an expired card, not an intentional cancel, and a
  helpful email recovers revenue a silent retry loop would lose.
- **`usage-limit.html`** lifecycle/conversion nudge. Two states in one file (near-limit heads-up,
  at-limit hard stop), only one active at a time, switch by commenting the other block in/out.
  "You've used {{USED}} of {{ALLOWANCE}} {{UNIT}} this {{PERIOD}}" plus one "Upgrade" CTA. A nudge,
  not a nag, no repeated urgency.
- **`results-digest.html`** marketing/lifecycle, PERSONALIZED to the recipient (contrast with
  `weekly-changelog.html`, which is the same company news to everyone). A repeatable item-row block
  (title, one-line meta, short description, a "View" link), duplicated per result, with one "See all"
  CTA. The core re-engagement email for anything that generates ongoing personal results (new matches,
  new leads, new recommendations). Carries the required unsubscribe tag.
- **`migration-notice.html`** announcement, for a relaunch or an important account-level change
  (new auth system, new domain, new billing). States what is changing, what the customer must do,
  when it takes effect, and reassures that the subscription and data carry over. Sent BEFORE the
  cutover ships, never after. One CTA, unsubscribe kept as a safe default.

Each template carries a top HTML comment saying where to paste it and which merge tags to keep.

## Which emails a product needs (by operating model)

The full catalog is nine templates; which subset a given product needs depends on its operating
model, not its name. Two common shapes:

- **A metered SaaS** (usage caps, a paid tier, a recurring charge): `magic-link` + `welcome` for
  onboarding, `usage-limit` to drive upgrades as people hit the cap, `receipt` and `payment-failed`
  for the money path, `weekly-changelog` for ongoing engagement, and `migration-notice` on hand for
  the day the product relaunches or changes its auth/billing setup.
- **A discovery/matching product** (jobs, leads, recommendations, anything that surfaces new results
  over time): `magic-link` + `welcome` for onboarding, `results-digest` as the core re-engagement
  email (this is the one that brings people back, treat it as the most important send in the
  catalog for this shape of product), `receipt` and `payment-failed` once the product is monetized,
  plus `transactional-base` instances for one-off triggers, "your report is ready", an application
  or status update, a single seat invite. Build those from `transactional-base` rather than adding a
  bespoke file for each trigger; a one-off notification does not earn its own template.

Cross-cutting rule regardless of shape: `payment-failed` is the highest-ROI email in this catalog the
moment there is a recurring charge, wire it before anything else billing-adjacent.

## Provider wiring (who sends what)

Two lanes. Details and exact merge tags in `references/provider-wiring.md`.

- **Transactional / auth (magic-link, welcome, receipts): Supabase Auth + its SMTP.** Point Supabase's
  SMTP at the marketing ESP's SMTP relay (we use Brevo). Paste the transactional templates into
  Supabase's Auth email templates. Keep provider variables verbatim (`{{ .ConfirmationURL }}`).
- **Marketing (weekly changelog, announcements): the ESP's campaign tool (Brevo).** Paste the HTML as a
  campaign or reusable template. Marketing sends MUST include the ESP unsubscribe tag (`{{ unsubscribe }}`
  for Brevo) or they are non-compliant and hurt deliverability.

Dormant-until-keyed still applies: with no SMTP configured, auth emails simply do not send, and nothing
in the app breaks.

## Deliverability and sending law (do not skip)

Full checklist in `references/deliverability-and-compliance.md`. The essentials:

- **Authenticate the domain: SPF, DKIM, DMARC** on the sending domain before any real send. Without
  these you go to spam. This is a DNS task and is the owner's to run (DNS changes are a human-only
  action).
- **Marketing email is legally regulated** (CAN-SPAM in the US): a working unsubscribe, a real physical
  postal address, a truthful subject and from-name, and honoring opt-outs promptly. Transactional email
  (a sign-in link someone just requested) is exempt from the unsubscribe requirement but must not carry
  a marketing payload.
- **Only email people with a relationship** (an SSO account, an opt-in). Never scrape or buy a list.
- **Warm up a new sending domain** gradually; do not blast the whole list on day one from a cold domain.

## Preview before send (always)

Never send a template you have not rendered. Two ways:

1. **Artifact preview (fastest for review):** assemble a single HTML file that renders each template
   with sample content filled in, and publish it as an Artifact to eyeball and share. (This is how the
   MySheetAI templates were reviewed.) Replace real merge tags with sample values in the preview so it
   renders.
2. **Real-client test:** send a test to a seed inbox and open it in Gmail (web + app), Apple Mail, and
   Outlook. A tool like a litmus/email-preview service can substitute, but a couple of real clients
   catch most breakage.

Pre-send checklist: preheader set, one primary CTA and its URL correct, all links absolute and pointing
at the right environment, images have alt text and the email reads without them, unsubscribe present on
marketing, from-name and reply-to correct, renders on mobile width, no em-dash anywhere.

## Launch-day email set (what every product needs)

At launch, a product needs, minimally:

1. **Magic-link** live in Supabase Auth (blocks sign-in if missing).
2. **Welcome** on first sign-in.
3. **The weekly changelog** cadence set up in the ESP (even if the first send is a few weeks out), with
   the matching `/changelog` page live.

And around a migration/relaunch specifically: **a customer-notice email BEFORE any cutover** (the owner
sends it; it announces the change and sets expectations). Never deploy a breaking change to existing
customers before that notice has gone out.

## Gotchas learned the hard way

- The app's beautiful display font is the wrong choice for email. System stack only.
- A `<div>` styled as a button vanishes in Outlook. Use the table-cell + `bgcolor` pattern.
- Leaving out the preheader lets Gmail show a raw URL or "View in browser" as the snippet.
- Forgetting the unsubscribe tag on a marketing send is both a legal problem and a spam-score problem.
- Merge tags are provider-specific. A Supabase `{{ .ConfirmationURL }}` pasted into a Brevo campaign is
  just literal text, and vice versa. Keep transactional templates in Supabase, marketing in the ESP.
