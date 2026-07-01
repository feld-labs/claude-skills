---
name: shipping-nextjs-app
description: Read before declaring a Next.js (App Router) milestone done or preparing to deploy. Covers the discipline of running a real production build (tsc + unit tests do NOT catch build/prerender errors) and the recurring App Router gotchas that only surface at build time, static generation calling request-scoped APIs, useSearchParams needing a Suspense boundary, and why per-request/per-tenant pages must be dynamic. Use when finishing a feature, before a PR, or when `next build` fails but tests pass.
---

# Shipping a Next.js App (App Router)

`tsc --noEmit` and a green unit suite do NOT prove the app builds. Static generation runs page code at
BUILD time (no request scope) and prerenders client components, so build-only errors slip past types and
tests. **Run `next build` before calling a milestone done or opening a deploy PR.**

## 1. Run the production build as a gate
- Add `next build` to your "definition of done" and to CI, not just `tsc` + `vitest`.
- A build error aborts at the FIRST failing route, later failures are masked until you fix the first, so
  re-run after each fix until it exits 0 and reports the full route table.

## 2. Do not call request-scoped APIs at build time
- `cookies()` / `headers()` (and cookie-based DB clients built on them) throw
  "cookies was called outside a request scope" when called from `generateStaticParams` or during static
  prerender. `generateStaticParams` runs at build, there is no request.
- Fix: don't fetch with the request-scoped client in `generateStaticParams`; use a context-free client,
  or drop `generateStaticParams` and render the route dynamically.

## 3. Multi-tenant-by-domain pages cannot be statically pre-rendered
- If content depends on the request domain (white-label, per-tenant), there is no domain at build time,
  so the page can't be prerendered or shared across tenants. Mark it `export const dynamic = 'force-dynamic'`
  and remove `generateStaticParams`. It renders per request, where the tenant header + RLS apply.

## 4. useSearchParams needs a Suspense boundary
- A `'use client'` page that calls `useSearchParams()` fails static generation with a CSR-bailout error
  ("useSearchParams() should be wrapped in a suspense boundary").
- Fix: wrap the component that reads params in `<Suspense>` (rename the page body to an inner component
  and have the default export render `<Suspense><Inner/></Suspense>`).
- Note: `export const dynamic = 'force-dynamic'` is NOT honored for this bailout on a client page, the
  Suspense boundary is the real fix. (`force-dynamic` is the right tool for #2/#3, not this.)

## 5. Static vs dynamic, on purpose
- Public, cacheable, request-independent pages: static / ISR (`revalidate`).
- Per-user, per-tenant, or query-param-driven pages: dynamic. Reading `cookies()`/`headers()` already
  forces dynamic; declaring it explicitly avoids surprise build attempts.

## Checklist
- [ ] `next build` runs green (exit 0) locally and in CI, not just tsc + tests
- [ ] No request-scoped API (`cookies`/`headers`/cookie client) called in `generateStaticParams`
- [ ] Per-domain/per-tenant pages are `force-dynamic`, not statically pre-rendered
- [ ] Every `useSearchParams()` in a client page sits inside a `<Suspense>` boundary
- [ ] Static vs dynamic chosen deliberately per route
