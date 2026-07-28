# Deliverability and sending-law compliance

Two failure modes to avoid: landing in spam (deliverability) and breaking sending law (compliance).
Both are the difference between an email that works and one that quietly does nothing or creates legal
exposure.

## Domain authentication (do this before any real send)

Unauthenticated mail goes to spam. Authenticate the SENDING domain with all three:

- **SPF** a DNS TXT record listing the servers allowed to send for the domain (the ESP gives you the
  include).
- **DKIM** a DNS record with the ESP's public key so receivers can verify the signature (the ESP gives
  you the CNAME/TXT records).
- **DMARC** a DNS TXT record (`_dmarc.domain`) that tells receivers what to do with mail failing SPF/
  DKIM, and where to send reports. Start at `p=none` to monitor, tighten to `quarantine`/`reject`.

These are DNS changes and are a **human-only action** (the owner runs them; a model does not touch DNS).
The ESP's sender-authentication wizard (Brevo -> Senders, Domains & Dedicated IPs) generates the exact
records. Verify all three show "authenticated" before sending to real users.

Use a subdomain for bulk marketing if you want to protect the root domain's reputation (e.g.
`mail.brand.com` for campaigns), while transactional stays on the main domain.

## New-domain warm-up

A brand-new sending domain has no reputation. Do not blast the whole list on day one. Ramp volume over
days/weeks, starting with the most-engaged users, so mailbox providers build trust gradually. Sudden
high volume from a cold domain is the fastest way into spam.

## Sending law (US: CAN-SPAM; know your recipients' jurisdictions)

**Marketing email** is legally regulated. Every marketing send must have:
- A **working unsubscribe** honored promptly (the ESP `{{ unsubscribe }}` tag handles the mechanism;
  do not defeat it). Once someone opts out, stop.
- A **real physical postal address** in the footer.
- A **truthful subject line and from-name**; no deceptive headers.
- Clear identification that it is from your product.

**Transactional email** (a magic-link the user just requested, a receipt for a purchase they made) is
exempt from the unsubscribe requirement because it is a response to the user's own action. But it must
not carry a marketing payload. The moment you bolt a promo onto a receipt, it can be treated as
marketing. Keep the lanes clean.

If you have EU/UK/Canada recipients, stricter opt-in regimes apply (GDPR/PECR, CASL): send marketing
only to people who have a lawful basis (an account relationship or explicit opt-in), and keep proof of
consent. This ties to the Feld master rule on ToS/retention/sending-law compliance.

## Content-level deliverability

- Include a **plain-text alternative** (the ESP builds it if the content is clean). Text-only-image
  emails and heavy HTML with no text part score badly.
- Keep a sane **text-to-image ratio**; do not send one big image.
- Avoid spam-trigger patterns: ALL CAPS subjects, excessive punctuation, "FREE!!!", misleading
  preheaders.
- Use a **consistent from-address** so recipients (and filters) learn to trust it.
- Set a monitored **reply-to**; our templates invite replies, so replies must reach a human.
- Prune hard bounces and long-term non-openers; a dirty list drags reputation down.

## Pre-send checklist (also in SKILL.md)

- [ ] SPF, DKIM, DMARC authenticated on the sending domain
- [ ] Preheader set (not empty)
- [ ] Exactly one primary CTA, correct URL, correct environment (prod vs staging)
- [ ] All links absolute; images have alt text; the email reads with images OFF
- [ ] Unsubscribe present on marketing; physical address in footer
- [ ] From-name and reply-to correct; reply-to is monitored
- [ ] Renders on mobile width and in dark mode (CTA contrast holds)
- [ ] Tested in at least Gmail + Apple Mail (+ Outlook if the audience uses it)
- [ ] No em-dash anywhere
- [ ] For a migration/relaunch: the customer notice goes out BEFORE any breaking cutover
