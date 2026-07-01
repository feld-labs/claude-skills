---
name: optional-integrations
description: Read when adding any optional third-party integration to an app (transactional email, product analytics, error monitoring, feature flags, webhooks) that should be wired in now but stay inert until its credentials exist. Covers the dependency-free "dormant until keyed" module pattern, no-op-when-unconfigured guards, privacy-first payloads, healthchecks, and the test/live split. Use so a feature can ship its integration points before the vendor account or API key is ready, then go live by setting one env var.
---

# Optional Integrations: dormant until keyed

Ship the wiring before the account exists. Every optional third-party integration is a small,
dependency-free module that **does nothing until its env key is set**, so you can build and deploy the
integration points without blocking on signups, verified domains, or keys, then flip it live later by
setting a single environment variable. This is the base pattern that specific integration skills
(e.g. [[saas-billing]]'s Stripe client) are instances of.

## The rules
1. **No-op guard at the top.** The first line of every entry point is `if (!process.env.X_KEY) return;`
   (or return a benign default). Unkeyed = silent success, **never** a thrown error or a broken caller.
2. **Dependency-free.** Talk to the provider's HTTP API with `fetch`, not their SDK. No `npm install`, no
   version churn, no supply-chain surface, no build step. A REST call and a JSON body is enough for email
   (Resend), analytics (PostHog), monitoring (Sentry/webhook), and most others.
3. **One tiny module per integration**, same shape. `lib/email.js`, `lib/monitor.js`, `lib/analytics.js`:
   an `init()` (optional) plus one or two verb functions (`sendEmail`, `capture`, `captureError`). Single
   responsibility, easy to read, easy to delete.
4. **Callers never branch on configuration.** They just call `sendEmail(...)`. The module decides whether
   to act. This keeps feature code clean and the on/off decision in one place.
5. **Privacy-first payloads.** Never send user PII, photos, faces, names, or emails to a third party beyond
   what is strictly required. Use opaque IDs (a UUID) as the distinct id. Prefer self-hosted/regional
   endpoints where the vendor offers them (e.g. analytics region choice).
6. **Add a liveness probe** (`GET /healthz`) that works regardless of which integrations are keyed, for
   uptime monitors.
7. **Test/live split by key prefix** where the provider has one (e.g. `sk_test` vs `sk_live`); select the
   right endpoint/manifest from the key itself, so the same code runs in both.

## Shape (sketch)
```js
// lib/email.js  (dependency-free, dormant until RESEND_API_KEY is set)
async function sendEmail({ to, subject, text }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, skipped: true };          // dormant, no throw
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to, subject, text }),
  });
  return { ok: r.ok };
}
module.exports = { sendEmail };
```

## Payoff
- Features degrade gracefully: the invite still works before email is live; the app still runs before
  analytics is keyed.
- Deploy is decoupled from vendor setup. You are never blocked waiting on a key.
- Going live is one env var on the server, no code change, no redeploy of logic.
- Nothing to break when a key is absent, and nothing to leak because unkeyed means no calls.

## Document each one
Keep a short setup doc per integration (the env vars, where to get the key, the ~5-minute steps) so the
human can flip it on without reading code. List them in the project's resume/TODO doc as "optional keys."
