'use strict';
/**
 * In-house error monitoring (feld-labs observability standard). Copy to the app's lib/monitor.js.
 *
 * Every captured error is (1) logged to the console ALWAYS, and (2) written to your own Supabase
 * `error_log` table via the log_error() RPC, on by default, no third party required. Optional
 * forwarders stay dormant until keyed: Sentry (SENTRY_DSN) and/or a JSON webhook (ERROR_WEBHOOK_URL,
 * e.g. Slack/Discord). Set ERROR_LOG_DISABLED=1 to turn the Supabase sink off. Set PROJECT_NAME.
 *
 * Dependency-free (fetch, not an SDK). The monitor never throws: it must not break the code it observes.
 *
 * Usage:
 *   const monitor = require('./lib/monitor'); monitor.init();     // process handlers
 *   app.use(monitor.expressErrorHandler());                       // last middleware
 *   monitor.captureError(err, { kind: 'worker', jobId });         // manual capture
 */
const crypto = require('crypto');

let dsn = null;
function parseDsn(s) {
  try { const u = new URL(s); return { key: u.username, host: u.host, projectId: u.pathname.replace(/^\//, '') }; }
  catch { return null; }
}

// PII-safe: keep only known low-cardinality / opaque keys, drop everything else. Extend per project,
// but never add names, emails, tokens, or free user text.
const CONTEXT_ALLOW = ['kind', 'path', 'method', 'status', 'code', 'eventId', 'accountId', 'userId', 'orgId', 'jobId', 'sku', 'severity'];
function safeContext(context) {
  const out = {};
  if (context) for (const k of CONTEXT_ALLOW) if (context[k] != null) out[k] = context[k];
  return out;
}

// Group the same error together: hash(kind + message with volatile ids/numbers normalized out).
function fingerprint(err, context) {
  const kind = (context && context.kind) || 'error';
  const msg = (err && err.message) ? String(err.message) : String(err);
  const norm = msg.replace(/[0-9a-f]{8,}/gi, '#').replace(/\d+/g, '#').slice(0, 300);
  return crypto.createHash('sha1').update(kind + '|' + norm).digest('hex').slice(0, 16);
}

// In-house sink: your own Supabase error_log table via the log_error() RPC. On by default.
async function toSupabase(err, context) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key || process.env.ERROR_LOG_DISABLED === '1') return;
  const payload = {
    p_project: process.env.PROJECT_NAME || 'app',
    p_environment: process.env.NODE_ENV || 'production',
    p_kind: (context && context.kind) || null,
    p_severity: (context && context.severity) || 'error',
    p_message: ((err && err.message) ? String(err.message) : String(err)).slice(0, 2000),
    p_stack: (err && err.stack) ? String(err.stack).slice(0, 8000) : null,
    p_context: safeContext(context),
    p_fingerprint: fingerprint(err, context),
  };
  try {
    await fetch(url + '/rest/v1/rpc/log_error', {
      method: 'POST',
      headers: { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch { /* the monitor must never throw */ }
}

async function toSentry(err, context) {
  if (!dsn) return;
  const event_id = crypto.randomBytes(16).toString('hex');
  const event = {
    event_id,
    timestamp: new Date().toISOString(),
    platform: 'node',
    level: 'error',
    environment: process.env.NODE_ENV || 'production',
    server_name: process.env.HOSTNAME || undefined,
    exception: { values: [{ type: (err && err.name) || 'Error', value: (err && err.message) || String(err) }] },
    extra: { ...safeContext(context), stack: err && err.stack },
  };
  const url = `https://${dsn.host}/api/${dsn.projectId}/envelope/?sentry_key=${dsn.key}&sentry_version=7`;
  const body = JSON.stringify({ event_id, sent_at: new Date().toISOString() }) + '\n'
    + JSON.stringify({ type: 'event' }) + '\n' + JSON.stringify(event);
  try { await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/x-sentry-envelope' }, body }); } catch {}
}

async function toWebhook(err, context) {
  const url = process.env.ERROR_WEBHOOK_URL;
  if (!url) return;
  const text = `[${process.env.PROJECT_NAME || 'app'} error] ${(context && context.kind) || 'error'}: ${(err && err.message) || String(err)}`;
  try {
    await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, error: (err && err.stack) || String(err), context: safeContext(context) }),
    });
  } catch {}
}

function captureError(err, context = {}) {
  console.error('[monitor]', (context && context.kind) || 'error', '-', (err && err.stack) ? err.stack : err);
  toSupabase(err, context);   // in-house, on by default
  toSentry(err, context);     // optional
  toWebhook(err, context);    // optional
}

function init() {
  if (process.env.SENTRY_DSN) dsn = parseDsn(process.env.SENTRY_DSN);
  process.on('uncaughtException', (e) => captureError(e, { kind: 'uncaughtException', severity: 'fatal' }));
  process.on('unhandledRejection', (e) => captureError(e instanceof Error ? e : new Error(String(e)), { kind: 'unhandledRejection', severity: 'fatal' }));
  if (dsn) console.log('[monitor] Sentry forwarding enabled');
  else if (process.env.ERROR_WEBHOOK_URL) console.log('[monitor] error webhook enabled');
}

// Express catch-all error middleware (mount last). Safety net for errors that reach Express.
function expressErrorHandler() {
  return (err, req, res, next) => {
    captureError(err, { kind: 'express', path: req.path, method: req.method });
    if (res.headersSent) return next(err);
    res.status(500).json({ error: 'Something went wrong.' });
  };
}

module.exports = { init, captureError, expressErrorHandler };
