-- In-house error log (feld-labs observability standard). Apply as the next migration in the project.
-- Errors go to a table you own; lib/monitor.js writes here via the log_error() RPC. External
-- forwarders (Sentry/webhook/OTel) stay optional. Grouped by fingerprint so a burst of one error is
-- ONE row with a count, not thousands.
create table if not exists error_log (
  id           bigint generated always as identity primary key,
  project      text not null default 'app',            -- override per app; monitor passes PROJECT_NAME
  environment  text not null default 'production',
  kind         text,                                    -- category: 'express', 'worker', '<surface>', ...
  severity     text not null default 'error',           -- 'warn' | 'error' | 'fatal'
  message      text not null,
  stack        text,
  context      jsonb not null default '{}'::jsonb,      -- PII-free structured attributes (path, method, opaque ids)
  fingerprint  text,                                    -- hash(kind + normalized message) for grouping/dedup
  count        integer not null default 1,              -- occurrences of this fingerprint
  resolved     boolean not null default false,
  resolved_at  timestamptz,
  first_seen   timestamptz not null default now(),
  last_seen    timestamptz not null default now()
);
create index if not exists error_log_last_seen_idx on error_log (last_seen desc);
create index if not exists error_log_open_idx on error_log (resolved, last_seen desc);
create unique index if not exists error_log_fingerprint_key on error_log (fingerprint) where fingerprint is not null;

-- Grouped upsert: same fingerprint bumps count + last_seen (and reopens a resolved error if it
-- recurs) instead of inserting a new row. Bounded cardinality, keeps the table small.
create or replace function log_error(
  p_project text, p_environment text, p_kind text, p_severity text,
  p_message text, p_stack text, p_context jsonb, p_fingerprint text
) returns void language plpgsql as $$
begin
  if p_fingerprint is null then
    insert into error_log (project, environment, kind, severity, message, stack, context, fingerprint)
    values (p_project, p_environment, p_kind, p_severity, p_message, p_stack, coalesce(p_context, '{}'::jsonb), null);
    return;
  end if;
  insert into error_log (project, environment, kind, severity, message, stack, context, fingerprint)
  values (p_project, p_environment, p_kind, p_severity, p_message, p_stack, coalesce(p_context, '{}'::jsonb), p_fingerprint)
  on conflict (fingerprint) where fingerprint is not null
  do update set count = error_log.count + 1, last_seen = now(), resolved = false, resolved_at = null,
    severity = excluded.severity, message = excluded.message, stack = excluded.stack, context = excluded.context;
end;
$$;
-- Only the service role (used by the server) may write errors; never expose to browser roles.
revoke all on function log_error(text, text, text, text, text, text, jsonb, text) from public, anon, authenticated;
