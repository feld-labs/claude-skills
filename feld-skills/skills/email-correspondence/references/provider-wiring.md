# Provider wiring

Two lanes, two systems. Keep them separate: a merge tag from one system is literal text in the other.

## Lane 1: transactional / auth email (Supabase Auth + SMTP)

Auth emails (magic-link, and any confirm/change-email flows) are sent by Supabase Auth using whatever
SMTP you configure. We point Supabase's SMTP at the ESP's transactional SMTP relay (Brevo) so all mail
leaves from one authenticated domain.

Setup:
1. Supabase Dashboard -> Project -> Authentication -> Emails / SMTP Settings -> enable Custom SMTP.
   Fill host, port, user, password from the ESP (Brevo -> SMTP & API). Set a sender name and a sender
   address on the authenticated domain.
2. Authentication -> Email Templates. Paste the transactional templates from `../templates/` into the
   matching template (e.g. `magic-link.html` into "Magic Link").
3. Keep the Supabase variables EXACTLY:
   - `{{ .ConfirmationURL }}` the action link (magic-link, confirm, recovery). Most common.
   - `{{ .Token }}` / `{{ .TokenHash }}` the raw OTP code, if you show a code instead of a link.
   - `{{ .SiteURL }}`, `{{ .Email }}` context values.
   The leading dot matters: `{{ .ConfirmationURL }}` is a Supabase variable; `{{APP_URL}}` (no dot) is
   one of OUR brand tokens to find-and-replace before pasting.

SSO-only house rule: we do NOT use password auth, so there is NO "Reset Password" email. The only
email-auth path is magic-link. Do not wire a password-reset template.

Dormant-until-keyed: with no custom SMTP set, Supabase either uses its low-rate built-in mailer or does
not send. Nothing in the app breaks; sign-in via Google SSO still works. Configure SMTP before relying
on magic-link at volume.

## Lane 2: marketing email (ESP campaigns, Brevo)

Marketing / lifecycle sends (the weekly changelog, announcements) go through the ESP's campaign tool,
not Supabase.

Setup:
1. Brevo -> Campaigns -> Email -> create. Paste the marketing template HTML (e.g.
   `../templates/weekly-changelog.html`) into the code/paste-HTML editor, or save it as a reusable
   template.
2. Keep the Brevo merge tags:
   - `{{ unsubscribe }}` the one-click unsubscribe link. REQUIRED on every marketing send.
   - `{{ contact.FIRSTNAME }}` etc. personalization from contact attributes, optional.
3. Set the from-name, from-address (authenticated domain), reply-to (a real inbox you monitor, since
   the templates invite replies), and the physical postal address in the footer/settings.
4. Send a test to a seed inbox first (see the preview step in SKILL.md), then send to the list.

## Which system sends which email

| Email | System | Key variable |
|---|---|---|
| Magic-link sign-in | Supabase Auth | `{{ .ConfirmationURL }}` |
| Welcome (first login) | ESP trigger, or Supabase if sent from auth | app deep link |
| Weekly changelog | ESP campaign | `{{ unsubscribe }}` |
| Announcement | ESP campaign | `{{ unsubscribe }}` |
| Receipt / seat invite / expiry | ESP transactional API, or app-side | app deep link |
| Customer migration notice | ESP campaign (owner sends) | `{{ unsubscribe }}` |

## Contacts / list source

The list is your product's real users (SSO accounts, opt-ins), synced or exported to the ESP. Never
scrape or buy contacts. Respect the account's email preferences; an unsubscribe from marketing must not
stop transactional auth mail (they are different categories and different legal treatment).
