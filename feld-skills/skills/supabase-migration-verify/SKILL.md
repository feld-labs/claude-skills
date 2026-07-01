---
name: supabase-migration-verify
description: Read when you need to confirm which database migrations are actually applied to a live Supabase or PostgREST-backed Postgres, especially when you only have the service (REST) key and no psql or direct DB connection. Covers probing a distinctive column or table per migration through the REST API, reading the "column does not exist" errors, verifying storage buckets, and safely closing a gap. Use before trusting any feature that depends on a recent migration (billing grants, new columns, new tables).
---

# Verify Database Migrations Against a Live Supabase

Migrations that are applied by hand (Supabase SQL editor) get **skipped, run out of order, or half-applied**
and nobody notices until the dependent feature breaks in QA or, worse, in front of a customer. "Migrations
through N" in a doc is an assumption, not proof. This playbook proves it against the live database.

## The key insight
You usually cannot run DDL (`ALTER TABLE`) through the service key, and often there is no `psql` or direct
DB connection on the box. But the **service key can read the schema**: select a distinctive column or table
that each migration adds, and let PostgREST tell you whether it exists.
- Column present -> HTTP 200 (returns `[]` or rows).
- Column missing -> HTTP 400, body code `42703` ("column X does not exist").
- Table missing -> HTTP 404 / PostgREST `PGRST205` ("Could not find the table").

## Procedure
1. **List the migration files** and, for each, pick ONE distinctive object it adds (a new column or a new
   table). One probe per migration is enough.
2. **Get creds without leaking them.** Read `SUPABASE_URL` (or the code's fallback URL) and
   `SUPABASE_SECRET_KEY` from the server's `.env` on the box. Extract with `awk` (leading whitespace and
   quoting break naive `grep|cut`); never echo the key.
3. **Probe each object** via REST (run it on the box, or anywhere the key is available):
   ```bash
   probe() { # $1 label  $2 table  $3 column
     code=$(curl -s -o /tmp/pr -w "%{http_code}" \
       "$URL/rest/v1/$2?select=$3&limit=1" -H "apikey: $KEY" -H "Authorization: Bearer $KEY")
     [ "$code" = "200" ] && echo "OK   $1" || echo "MISS $1 [HTTP $code] $(head -c 90 /tmp/pr)"
   }
   probe "32 events.scan_cap" events scan_cap
   ```
   For **storage buckets** (e.g. a migration that creates one): `GET $URL/storage/v1/bucket/<id>` -> 200 = exists.
4. **Report a table**: migration -> applied? Flag any `MISS`.

## Closing a gap
- DDL must run in the **Supabase SQL editor** (the REST key can't do it, and the box usually has no psql).
- Hand the human the **exact idempotent SQL** from the migration file (`add column if not exists ...`), which
  is safe to run even if part already applied.
- After they run it, **re-probe** to confirm the columns/tables now exist. Do not mark it done on their word.

## Gotchas
- `SUPABASE_URL` may be absent from `.env` if the code hard-codes a fallback project URL; read it from the code.
- SSH + shell quoting for the key is painful; pipe a script over `ssh host bash <<'REMOTE' ... REMOTE`
  (quoted heredoc) so nothing expands locally, and extract the key with `awk -F=`.
- Beware two different `/tmp` resolutions between tools; prefer absolute paths when assembling files.

## Why it matters
A silently-skipped migration breaks exactly the feature that depends on it (a purchase webhook that patches a
missing column errors; a scan that writes a missing column fails) and stays invisible until someone exercises
that path. Verify the schema before trusting the money path or any migration-dependent release gate. Pairs
with the release gates in [[release-qa-plan]].
