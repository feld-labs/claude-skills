---
name: multi-tenant-isolation
description: Read when building or modifying a multi-tenant app (accounts, orgs, workspaces, events). Covers scoping every query by tenant, session-held active context, legacy single-tenant compatibility, and the isolation test that gates release. Use when adding tenant-scoped data, endpoints, or migrations.
---

# Multi-Tenant Isolation Playbook

The number-one risk in a multi-tenant app is one tenant reading another's data. This playbook makes
isolation the default and provable.

## 1. Scope every read and write by tenant id
- Every query filters by the tenant key (`account_id` / `org_id` / `event_id`). No exceptions.
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

## 6. Common leaks to check
- An endpoint that forgot the tenant filter (the classic).
- A share/public link whose id can be swapped to reach another tenant.
- A cache keyed without the tenant id (one tenant's cached data served to another).
- Aggregate/admin queries that span tenants.

## Checklist
- [ ] Tenant id denormalized onto child tables; every query filters by it
- [ ] Active context from session; membership re-validated each request
- [ ] Writes set tenant id; deletes are tenant-scoped
- [ ] Legacy record (if any) gated by a single `isLegacy()` guard
- [ ] Automated 2-tenant isolation test exists and passes (release gate)
- [ ] Caches and share links are tenant-scoped
