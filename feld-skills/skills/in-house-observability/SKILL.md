---
name: in-house-observability
description: Read when adding error monitoring and observability to a product, or when defining/identifying/fixing bugs during a build or bug-squash phase. Establishes a lightweight in-house standard where errors go to a Supabase table you own (no third-party service required), with a consistent cross-project schema, fingerprint grouping, PII-safe context, and a define-identify-fix triage workflow. External backends (Sentry, OpenTelemetry, a webhook) stay optional forwarders. Use to add error tracking to a new app, standardize it across the portfolio, or triage production errors.
---

# In-house observability: own your error data

Error monitoring you control, with no new service to sign up for or pay for. Every captured error is
logged to the console AND written to a Supabase `error_log` table you own. Third-party backends
(Sentry, OpenTelemetry, Slack/Discord webhook) are optional forwarders that stay dormant until keyed,
same dormant-until-keyed discipline as [[optional-integrations]]. Because the data lives in your own
database, you (or an agent) can query it directly to triage bugs during the build and bug-squash
phases.

This is deliberately lighter than a full OpenTelemetry stack. It borrows the highest-leverage ideas
from observability practice and drops the heavy machinery, which is the right altitude for a small
product. When a product outgrows it, the same capture points forward to OTel or a vendor (see
Graduation).

## The rules (what makes this a standard, not a one-off)

1. **Own the sink.** The default, always-on destination is your Supabase `error_log` table via the
   `log_error()` RPC. No account, no key, no bill. It works the moment the app has its Supabase
   service key, which it already does.
2. **One consistent schema across every project.** This is the single highest-leverage thing:
   standardized fields mean the same queries, dashboards, and instincts work on every product.
   The shape is `project, environment, kind, severity, message, stack, context (jsonb), fingerprint,
   count, resolved, first_seen, last_seen`. Do not rename these per project.
3. **Group by fingerprint; never let the table explode.** Each error gets a `fingerprint` =
   hash(kind + message with volatile ids/numbers normalized out). The RPC upserts on fingerprint and
   bumps `count` + `last_seen` instead of inserting a new row, so a burst of one bug is a single row
   with a count, not ten thousand rows. A resolved error that recurs re-opens automatically.
4. **PII-safe context, always.** `context` is an allow-list of low-cardinality / opaque keys only
   (`path`, `method`, `status`, `code`, `eventId`, `accountId`, `userId`, `jobId`, ...). Never write
   names, emails, photos, tokens, or free user text into it. This mirrors the privacy-first payload
   rule for any integration.
5. **The monitor must never throw.** It observes the code path; it must not be able to break it.
   Every sink is wrapped in try/catch that swallows, and the Supabase write is fire-and-forget
   (not awaited into the request path).
6. **Callers never branch on configuration.** They call `monitor.captureError(err, { kind, ... })`.
   The module decides where it goes. Turning the in-house sink off is one env var
   (`ERROR_LOG_DISABLED=1`); adding a forwarder is one env var (`SENTRY_DSN` or `ERROR_WEBHOOK_URL`).
7. **Set `PROJECT_NAME`.** So a shared or per-product database still attributes each error to the
   right app.

## Wire it in (three call sites)

```js
const monitor = require('./lib/monitor');
monitor.init();                                    // 1. process-level handlers (uncaught/unhandled)
// ... your routes ...
app.use(monitor.expressErrorHandler());            // 2. last middleware, catches route errors
// 3. capture at any point you handle a failure yourself, with a kind + safe context:
try { ... } catch (e) { monitor.captureError(e, { kind: 'drive-index', eventId, accountId }); }
```

Capture on purpose, not just on crash. The most useful signals are the ones you add at the exact spot
a thing can silently go wrong (a third-party call returns empty, a job finds nothing, a webhook
mismatches). A silent zero is worse than an error: surface it AND capture it.

## The triage workflow: define, identify, fix

The point of owning the data is a tight loop during the build and bug-squash phases:

- **Define** what "broken" means for a surface, then make failures loud: at each risky call site,
  distinguish the failure from a benign empty result and `captureError` the failure with a `kind`.
- **Identify**: query the table (directly, or via the Supabase MCP). Start with what is open and
  recent, grouped by fingerprint:
  ```sql
  select kind, severity, message, count, last_seen, context
  from error_log where resolved = false
  order by last_seen desc limit 50;
  ```
  The `count` tells you impact; the `context` (path, ids) tells you where; the `fingerprint`
  collapses noise so you see distinct bugs, not repeats.
- **Fix**, then close the loop: `update error_log set resolved = true, resolved_at = now() where
  fingerprint = '...';`. If it recurs, the RPC re-opens it, so a reopened row means the fix did not
  hold.

## Add it to a new project (checklist)

1. Copy `references/monitor.js` to the app's `lib/monitor.js` (dependency-free, no install).
2. Apply `references/error_log.sql` as the next migration (creates the table + `log_error()` RPC +
   revokes it from browser roles). Verify with [[supabase-migration-verify]] if you only have the
   REST key.
3. Wire the three call sites above; set `PROJECT_NAME` in the server env.
4. Add capture at each surface's risky call sites as you build them.
5. Note the optional keys (`SENTRY_DSN`, `ERROR_WEBHOOK_URL`, `ERROR_LOG_DISABLED`) in the project's
   resume/TODO doc, same as any other integration.

## Graduation (when this is not enough)

This standard suits products below roughly a few requests/second and a human-scale error volume.
When a product needs distributed traces, metrics, SLOs, or cross-service correlation, keep the same
`captureError` call sites and add an OpenTelemetry exporter as another forwarder (vendor-neutral OTLP,
then any backend: Jaeger/Tempo/Prometheus self-hosted, or a vendor). The in-house table can stay as
the cheap, always-on baseline underneath. Do not reach for the heavy stack before the product's scale
actually demands it.

## Anti-patterns
- Sending user PII, tokens, or free text to any sink (in-house or third party).
- A new row per occurrence (table explosion). Always fingerprint-and-count.
- `await`-ing the error write in the request path, or letting the monitor throw.
- Renaming the schema per project (breaks the "one query works everywhere" payoff).
- Adding Sentry/Datadog/OTel by default "to be safe" before the scale needs it. Own the baseline first.
