---
name: trust-and-verification
description: Read when a product must verify people or their right to act before a high-stakes action (identity verification, right-to-list/right-to-sell attestation, ownership or document checks, KYC-lite). Covers the gate pattern (mock in dev, HARD-BLOCK in prod), identity via a provider (e.g. Stripe Identity), click-through attestations with recorded consent, private document uploads, and gating publish/checkout on verification. Use for marketplaces, rentals, or any two-sided platform where one side lists/sells and both sides need to be trustworthy.
---

# Trust and Verification Playbook

On a two-sided platform, both sides need to be trustworthy before money or a listing goes live. Verify
the person, verify their right to act, and gate the sensitive action on it, without ever silently
skipping a check.

## 1. The gate: mock in dev, HARD-BLOCK in prod (never silent-skip)
A verification/agreement gate has three provider modes:
- `live` when the provider is configured (real call),
- `mock` in development when it is not (stamp the gate so the flow is testable locally),
- `blocked` in production when it is not (refuse, 503, rather than bypass).
Encode this in one pure helper (`gateMode({ configured, isProd })`) so a missing key can NEVER skip a
gate in production. Keep the decision core I/O-free and unit-test it.

## 2. Verify identity through a provider
- Use a provider (e.g. Stripe Identity): government ID + a matching selfie / live capture. You receive a
  verification RESULT and status, never store the raw ID document yourself.
- Stamp a durable timestamp on success (`identity_verified_at`). A webhook is the durable backstop; a
  post-modal server check stamps synchronously, whichever lands first wins (idempotent).
- Verify BOTH sides where relevant: guests before payment, and **hosts/sellers before their listing goes
  live** (host verification is the one teams forget).

## 3. Right-to-act attestation with recorded consent
Beyond identity, capture that the person is authorized to do the thing (right-to-list, right-to-sell,
terms acceptance). A **click-through attestation** is legally meaningful when you record consent:
stamp `attestation_signed_at` + the connecting IP (prefer the proxy-set `x-real-ip`, not a spoofable
`x-forwarded-for` head). Use a formal e-signature (e.g. Dropbox Sign) only when a countersigned document
is actually required.

## 4. Sensitive documents go in a PRIVATE bucket
Ownership/verification documents (deed, tax bill, ID scans) are PII. Store them in a **private** bucket,
not the public media bucket: upload via the service role, and let admins read via short-lived **signed
URLs**. A leaked object path must not be enough to read someone's documents. Cap size + validate MIME.

## 5. Writes go through the service role; the user only reads
So a user cannot self-stamp "verified", verification records are written server-side by the service role
only. RLS lets the owner READ their own verification row; no client write path can set the status.
Resolve the record from the caller's own org/account so a user can only act on their own.

## 6. Gate the sensitive action on the decision core
Put the pass/fail logic in one pure function (`evaluate({...}) -> { ok, missing[] }`) and call it from
the server route that performs the action:
- **Publish gate:** a listing can't move to review/live until the host cleared identity + attestation
  (+ any permit/payout-readiness the product requires). Exempt first-party/internal orgs.
- **Checkout gate:** a booking can't reach payment until the guest cleared identity + signed the
  agreement. Re-check server-side at the point of charge, never trust the UI's word.
Return a 422 listing exactly which steps are still missing, so the UI can guide the user.

## Checklist
- [ ] One gate helper: live / mock(dev) / blocked(prod); missing key never skips in prod
- [ ] Identity via provider; durable timestamp; webhook backstop + sync check; idempotent
- [ ] Both sides verified where relevant (guest AND host/seller)
- [ ] Attestation records consent (timestamp + trusted IP); e-sign only when a document is required
- [ ] Sensitive docs in a private bucket; service-role upload; signed-URL reads; size/MIME validated
- [ ] Verification writes are service-role only; user reads own record via RLS
- [ ] Sensitive action gated by a pure decision core; re-checked server-side; 422 lists missing steps
