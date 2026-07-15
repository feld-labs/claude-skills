---
name: multi-tenant-isolation
description: Read when building or modifying a multi-tenant app (accounts, orgs, workspaces, events, or white-label brands). Covers scoping every query by tenant, session-held active context, DOMAIN-resolved (white-label) tenancy, the Postgres RLS isolation patterns (restrictive policy layered on ownership, parent-derived tenant-id triggers, per-tenant unique namespaces), legacy single-tenant compatibility, and the isolation test that gates release. Use when adding tenant-scoped data, endpoints, migrations, or a one-deployment-many-brands setup.
---

# Multi-Tenant Isolation Playbook

The number-one risk in a multi-tenant app is one tenant reading another's data. This playbook makes
isolation the default and provable.

## 1. Scope every read and write by tenant id
- Every query filters by the tenant key (`account_id` / `org_id` / `event_id` / `brand_id`). No exceptions.
- **Denormalize the tenant id onto child tables** (tags, items, members) so you can filter without a
  join on every query, and so row-level security can be written simply.
- Writes set the tenant id on every inserted row. Deletes are tenant-scoped too.
- Thread the tenant context through one helper (e.g., `ctx(req) -> { tenantId, accountId, role }`) and
  pass it into the data layer. Do not let any query run unscoped.

## 2. Active context comes from the session, re-validated every request
- Resolve the active tenant from the server-held session, not a client-supplied id.
- On any "switch tenant" action and on every privileged request, **re-check membership** server-side.
  Never trust a tenant id in the request body or query string without a membership check.
- Store `activeTenantId` + `role` in the session at login; refresh on switch.

## 3. Defense in depth
- App-level membership checks are the primary guard. Add row-level security (RLS) as a second layer if
  the database supports it. The server's service role bypasses RLS, so RLS is backup, not the only guard.

## 4. Legacy single-tenant compatibility
- If you are retrofitting multi-tenancy onto an existing single-tenant product, keep ONE guard
  (`isLegacy(tenantId)`) that routes the original record down the old code path. This protects the live
  data while new tenants use the scoped path. Every branch between old and new behavior checks that one
  guard, so it is easy to audit and remove later.

## 5. The release gate: an automated isolation test
This is non-negotiable before real customers.
- Create two tenants, two users. Tenant A populates data (items, people, tags, files).
- Assert that **no endpoint** returns A's data to a user of B: context, lists, detail, search, share
  links, exports. Try switching active tenant across the boundary (expect 403).
- Treat any cross-read as a **release blocker**. Automate it so it runs on every change.
- If the DB enforces isolation (RLS), run the test against a **real database**, not a mock. Booting an
  in-process Postgres (e.g., `embedded-postgres`, no Docker) with every migration applied, then asserting
  cross-tenant reads return nothing, exercises the real policies and runs in CI as a hard gate.

## 6. Common leaks to check
- An endpoint that forgot the tenant filter (the classic).
- A share/public link whose id can be swapped to reach another tenant.
- A cache keyed without the tenant id (one tenant's cached data served to another).
- Aggregate/admin queries that span tenants.

## 7. Domain-resolved tenancy (white-label: one deployment, many brands)
When each tenant has its **own domain** and visitors are **anonymous** (public browse/booking), the
tenant cannot come from a login/session. Resolve it from the request host instead, safely:
- **Set an unspoofable header in middleware** from the real request host (e.g. `x-brand-domain`), and
  forward it to the data layer (both the anon client and the service client). Never resolve the tenant
  from a client-supplied body/query value; the middleware-set header is the trust anchor.
- **Fall back to a default tenant** for an unknown host so the primary brand is byte-for-byte unchanged
  and any resolver failure degrades safely.
- Cache the per-request resolve (e.g. React `cache()`) so the layout, page, and metadata resolve once.
- **The frontend must receive the tenant as data, not resolve it.** Client components have no request
  context, a hardcoded `import { brand } from config` in a client component serves the WRONG tenant on
  every other domain. Resolve on the server and pass name/content/theme down as props. (See the
  `white-label-branding` skill for the theming + content side.)

## 8. Postgres RLS patterns (when the database enforces isolation)
- **Layer a RESTRICTIVE policy on top of the existing ownership policies, never rewrite them.** Postgres
  ANDs a RESTRICTIVE policy with the permissive ones, so `create policy tenant_isolation on <t> as
  restrictive for all using (tenant_id = current_tenant()) with check (...)` adds tenancy without
  touching (and risking) a working ownership policy. Defense in depth: even a forged host can't cross the
  ownership boundary.
- **Derive the tenant id on child rows from the PARENT, in a BEFORE INSERT trigger, not from the request
  context.** If children took the tenant from the current domain, an authed user could create rows under
  another tenant by switching domains. Root rows take the current tenant; children inherit from their
  parent FK; the restrictive `WITH CHECK (= current tenant)` then rejects any mismatch.
- **Namespaces become per-tenant.** Drop global `unique(slug)` and add `unique(tenant_id, slug)` so two
  tenants can both have a "rockport" or "pro" plan.
- The service role bypasses RLS, so server-side ledger/webhook writes are unaffected; only anon/authed
  client reads become tenant-scoped.

## 9. Supabase: grants are a SEPARATE hole from RLS, and the default is wide open

RLS decides which rows a role sees. GRANTs decide whether the role can touch the table at all. They
are independent, and on Supabase the default is dangerous: **Supabase grants `anon` AND
`authenticated` ALL privileges (select/insert/update/delete/truncate/references/trigger) on every new
table in `public`, via default privileges.** You did not write that grant; Supabase did. So a fresh
table is wide open to `anon` at the grant level, and only RLS is holding the door. Two ways that bites:

- **RLS is not the only gate.** TRUNCATE (and REFERENCES/TRIGGER) are table-level and **not RLS-gated**.
  A role with the default TRUNCATE grant is a latent hole RLS never covers. (This is the specific
  cleanup the Matinee fix did: revoke TRUNCATE from anon/authenticated.)
- **Your test lies if it runs on plain Postgres.** Plain Postgres has no such default, so a local/CI
  test on vanilla Postgres reports "anon has no grants" while the live Supabase DB has given anon
  everything. That false green is the actual bug. This happened: the grant hole was invisible until
  someone queried `information_schema.role_table_grants` on the LIVE project.

**Bake the posture into table creation, do not audit it afterward.** Make securing a table one call,
so it is impossible to create a table without the correct grants. Ship these helpers in your first
migration and call one per table:

```sql
-- strip Supabase's permissive defaults on any table (universal)
create function app.lock_down_table(tbl text) returns void language plpgsql
security invoker set search_path='' as $$ begin
  execute format('revoke all on public.%I from anon', tbl);          -- SSO-only app: anon never
  execute format('revoke all on public.%I from public', tbl);
  execute format('revoke truncate, references, trigger on public.%I from authenticated', tbl);
end $$;

-- a tenant table: RLS + ownership policies + exactly the CRUD authenticated needs + lockdown
create function app.secure_tenant_table(tbl text) returns void ... -- select/insert/update/delete
-- a global reference table: RLS + read-only for authenticated + lockdown (writes via service role)
create function app.secure_global_table(tbl text) returns void ...  -- select only
```

**Make the isolation test MIRROR the Supabase default so CI catches this class.** In the test
bootstrap, before applying migrations, reproduce the hazard: `alter default privileges in schema
public grant all on tables to anon, authenticated;`. Then assert the locked-down end state after
migrations: `anon` has zero table privileges; `authenticated` has no TRUNCATE/REFERENCES/TRIGGER; no
authenticated writes on global tables; and, as the inert-RLS check, `authenticated` DOES have CRUD on
its tenant tables. Any table left with the default, or a tenant table missing its grant, fails the
build. Without this mirror the test runs on plain Postgres and never sees the hole.

Related Supabase traps to check the same day: views bypass RLS unless `security_invoker=true`; UPDATE
needs a SELECT policy or it silently affects 0 rows; `SECURITY DEFINER` functions bypass RLS and are
PUBLIC-executable in `public`; use `TO authenticated` + an ownership predicate, never `TO
authenticated` alone (IDOR).

## Checklist
- [ ] **Supabase: revoke the default anon/authenticated grants on every public table** (no anon
      anywhere; no TRUNCATE/REFERENCES/TRIGGER for authenticated); secure tables via a one-call helper
- [ ] **Isolation test mirrors the Supabase default grant** then asserts the locked-down posture, so a
      table left wide open fails CI (a plain-Postgres test will not catch it)
- [ ] Tenant id denormalized onto child tables; every query filters by it
- [ ] Active context from session (or unspoofable domain header for white-label); re-validated per request
- [ ] Writes set tenant id; deletes are tenant-scoped
- [ ] RLS (if used): restrictive policy layered on ownership; child tenant id derived from parent by trigger
- [ ] Per-tenant unique namespaces (`unique(tenant_id, slug)`), not global
- [ ] Legacy record (if any) gated by a single `isLegacy()` guard
- [ ] Automated 2-tenant isolation test exists and passes against a real DB (release gate); on
      Supabase it also asserts the grant posture, not just row visibility
- [ ] Caches and share links are tenant-scoped
- [ ] Client components receive tenant identity as props (never resolve it themselves)
