# Production Hardening Checklist

The deeper, boring-but-load-bearing controls that a launch checklist needs beyond the Tier 0-2 holes
in `SKILL.md`. Run this before calling any SaaS "production-grade." Grouped so you can skip sections
that do not apply. Most of these are one-time configuration that blocks whole classes of attack.

Adapted for Feld Labs from the `seatrial` audit skill-set (saas-production-security lens, MIT,
James Swift) and OWASP practice. Rephrased and trimmed to our stack; credit to the source.

## Transport and headers (one-time, high leverage)
- [ ] HTTPS on every endpoint. HSTS with max-age >= 1 year. TLS 1.2 minimum, 1.3 preferred.
- [ ] Cert renewal automated and monitored.
- [ ] All security headers set: `Strict-Transport-Security`, `Content-Security-Policy` (strict, no
      `unsafe-inline` for scripts), `X-Content-Type-Options: nosniff`, `X-Frame-Options`/frame-ancestors,
      `Referrer-Policy`, `Permissions-Policy`.
- [ ] CORS is a specific origin allowlist. No wildcard on authenticated endpoints (see the [[security-review]]
      note that a missing CORS config is an accidental mitigation, not a designed one).

## Authentication hardening
Feld standard is SSO/OIDC only (see `SKILL.md` Tier 2). If any password auth exists at all, it is a
finding, and until it is removed these apply:
- [ ] Passwords hashed with bcrypt (cost 12+) or Argon2id; checked against a breach list (HIBP).
- [ ] MFA (TOTP minimum) available, enforced for admin accounts.
- [ ] OAuth/OIDC: `state` validated on callback; `id_token` signature and claims verified.
- [ ] Reset tokens cryptographically random, hashed at rest, single-use, 15-30 min expiry, delivered
      out-of-band only (never in the API response).
- [ ] Account enumeration prevented: generic messages on login, reset, and registration.
- [ ] Lockout / progressive delay after ~5 failed attempts.
- [ ] Auth events (login, logout, MFA, password/credential changes, lockouts) logged with IP + UA.

## Sessions
- [ ] Session IDs cryptographically random (128+ bits) or JWTs short-lived (15-30 min) with refresh
      rotation and server-side revocation.
- [ ] Cookie flags: `HttpOnly`, `Secure`, `SameSite=Lax` (or Strict). `Secure` derived from the
      framework's trusted-proxy mechanism, not a raw `x-forwarded-proto` header.
- [ ] Session rotation on privilege change (login, password/plan change).
- [ ] Idle timeout (~30 min) and absolute timeout (~24 hr).

## Input protection
- [ ] CSRF tokens on all state-changing endpoints (or `SameSite=Strict`).
- [ ] Every database query parameterised. No string concatenation into SQL, ever. Same discipline for
      NoSQL, command execution, and template rendering (template injection).
- [ ] Input validation on every endpoint: type, length, format.
- [ ] RLS / Firestore rules / tenant filters written AND tested for every collection or table you rely
      on (see [[multi-tenant-isolation]]).
- [ ] File uploads: validate MIME by magic bytes (not extension), size-limit, sanitise the filename,
      store outside the web root, serve through an authenticated endpoint, AV-scan if feasible.
- [ ] Archive/spreadsheet parsers (zip, xlsx, docx) have a **decompression-bomb guard** (check the
      declared uncompressed size / inflation ratio and a raw-byte ceiling BEFORE inflating), on **every
      surface that parses**. Moving a parse from server to client for privacy or cost does NOT carry the
      server's guard with it: **port the guard, do not assume it.** Whenever the same operation exists on
      two surfaces, diff their guards. (Feld scar: MySheetAI moved XLSX parsing to the browser and the
      client copy shipped with no bomb guard the server had; a client-side bomb is a self-DoS, still a
      hole to close before the path goes live.)

## Output protection
- [ ] XSS: encode all dynamic content for its context (HTML, attribute, JS, URL). Sanitise
      user-generated AND AI-generated content before render (DOMPurify or equivalent).
- [ ] Error messages reveal no internals (stack traces, queries, internal URLs, provider names).

## Secrets and dependencies
- [ ] No secrets in source. Pre-commit scanning (trufflehog / git-secrets). Check history, not just HEAD.
- [ ] Separate secrets per environment. Production secrets in a manager, not on dev machines.
- [ ] For Next.js: verify no secret is behind a `NEXT_PUBLIC_` var (it ships to the browser).
- [ ] `npm audit` / `pip-audit` in CI, failing on critical. Lockfiles committed. New deps reviewed.
- [ ] **When the published package is stuck on an unfixed CVE, check whether upstream ships a fixed build
      outside the registry, and vendor it.** (Feld scar: npm's `xlsx@0.18.5` carries unpatched HIGH CVEs;
      SheetJS ships fixes only via their own CDN tarball. Pin to that tarball or vendor it into the repo,
      and set a re-check cadence, e.g. Dependabot plus a scheduled audit job.) Do not ship a known-vuln
      version just because it is the newest one npm serves.
- [ ] **Kill transitive vulns you cannot upgrade with npm `overrides`** (pin the safe nested version),
      rather than accepting the whole tree's youngest release. Residual dev-only advisories with no fix
      available get documented, not silently carried.
- [ ] **Bump to the minimal patched version that clears the advisory, not blindly to latest** (Feld:
      Next 14.2.x had no clean patch, so 15.5.x, not 16.x). Smaller blast radius, and you still re-run the
      full gate (tsc + tests + build + real-DB suites) because even a minimal bump moves framework APIs.

## Database
- [ ] App connects with a minimum-privilege DB user. DB not reachable from the public internet.
- [ ] Encryption at rest on. Application-level encryption on PII and on provider secret keys (see the
      `SKILL.md` scar: plaintext Stripe keys). Connections use TLS.
- [ ] Automated backups, restoration tested (a backup never restored is a file, not a backup),
      stored cross-region and encrypted.

## Logging and audit
- [ ] Log auth events, admin actions, access-denied events, and data-export/bulk-access.
- [ ] Logs append-only with independent access control. No passwords, card numbers, or tokens in logs.
- [ ] Security-log retention >= 1 year. Structured logs with trace IDs, not `console.log` prose.

## Business-logic abuse (the checks scanners miss)
- [ ] Subscription/entitlement can't be manipulated client-side; feature access is server-verified
      against the plan, not a client flag.
- [ ] Coupon / referral / trial abuse bounded (one per customer, server-enforced).
- [ ] Rate-limit circumvention closed: limits keyed so account-cycling or header-spoofing doesn't reset
      them (see `ai-endpoint-security.md`).
- [ ] Full subscription state machine exists (trial -> active -> past_due -> suspended -> cancelled ->
      churned), not just "free" and "paid." Payment failure has a grace/retry path, not instant lockout.
- [ ] Idempotency keys on every state-changing money operation. Stripe webhook signatures verified on
      every event (see [[saas-billing]]).

## Compliance and lifecycle
- [ ] Privacy policy published; cookie consent where applicable.
- [ ] Self-service data export (portability) and account deletion (soft-delete recovery window).
- [ ] DPAs with third-party processors; documented breach-notification process.

## Deployment
- [ ] CI/CD is the only path to production. SAST + dependency audit run in the pipeline.
- [ ] Staging mirrors prod and is access-protected. Rollback documented and tested.
- [ ] Feature flags for major features, including a global kill switch (tested).
- [ ] Annual third-party penetration test once there is anything worth attacking.
