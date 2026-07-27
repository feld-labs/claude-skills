# AI Endpoint Security

Read this whenever the app sends user input to an AI provider or returns AI-generated output. AI adds
three things normal web security does not cover, and each is a first-class concern:

1. **Every request costs real money.** A normal API call costs a fraction of a cent; an AI completion
   costs cents to dollars. A bug or an attacker can burn thousands in minutes. Cost is a security concern.
2. **Input becomes instructions.** In a normal API, user input is data. In an AI call it becomes part
   of the model's instructions, so a crafted message can override your system prompt (prompt injection).
3. **Output is unpredictable.** It can contain PII, another tenant's data, your system prompt, or an XSS
   payload regardless of what was asked. Filter output as hard as you filter input.

This is the expansion of `SKILL.md` Tier 1 #3 (money pump) and #5 (prompt injection / AI-takes-actions).
General web security (auth, XSS, CSRF, headers) is assumed, see `production-hardening.md`.

Adapted for Feld Labs from the `seatrial` ai-saas-security lens (MIT, James Swift). Our own words.

## Rate limiting (count is not enough, meter tokens)
- [ ] Per-user request limits AND per-user token limits (input + output) per hour/day.
- [ ] Global request + token limits across all users.
- [ ] Concurrent-request cap per user (max simultaneous AI calls).
- [ ] Tiered by plan (free << paid << enterprise). Sliding window, not fixed window.
- [ ] Separate limits per feature (chat vs image vs embeddings vs agent).
- [ ] IP-based limits + CAPTCHA on any unauthenticated AI-adjacent endpoint.
- [ ] Bypass prevention: limits survive account-cycling and header-spoofing (key on stable identity,
      not just a client-sent id).

## Cost control (cap the worst case, don't leave it infinite)
- [ ] Per-user daily/monthly spend cap.
- [ ] Server-side `max_tokens` on every request (never trust a client value).
- [ ] A GLOBAL daily spend ceiling with an automatic circuit breaker that disables the feature.
- [ ] Token pre-estimation before sending; input length validation and truncation.
- [ ] Streaming cancellation when a budget is breached mid-response.
- [ ] Cost tracked per user / per feature / per tenant; alerts at 50 / 80 / 95 percent of budget.
- [ ] Optional auto-downgrade to a cheaper model at high spend; retry budget (max retries + backoff
      ceiling); queue-depth limits so requests don't pile up.

## Input security (the injection surface)
- [ ] Hard input length limits (characters and tokens).
- [ ] **System prompt isolation: never concatenate user input into the system prompt.** Keep user
      content in the user role.
- [ ] Prompt-injection screening (pattern + classifier) for direct injection, and for INDIRECT
      injection in RAG/document/URL content the model ingests (the document says "ignore instructions").
- [ ] Unicode normalisation (NFKC) and invisible-character stripping (encoding attacks).
- [ ] Content pre-filter to block prohibited input before it reaches the model.
- [ ] Context-window budgeting so system + history + input + output actually fit.
- [ ] Replay prevention (nonce or timestamp) on expensive calls.

## Output security (assume the model betrays you)
- [ ] PII detection and redaction on AI output before it is stored or shown.
- [ ] System-prompt leakage detection (canary tokens, substring match, behavioural checks).
- [ ] Content post-filter; output length limits (abort streams that overrun).
- [ ] Structured-output schema validation when expecting JSON.
- [ ] **Sanitise AI output before rendering (DOMPurify): the model can generate XSS payloads.**
- [ ] User-facing errors reveal nothing about provider, architecture, or prompts.
- [ ] **Topical scope boundary + fixed refusal on any open-ended surface** (see "Scope containment"
      below): the bot answers only in-domain requests and refuses everything else via a fixed message.

## Infrastructure and isolation
- [ ] Auth on EVERY AI endpoint. Zero unauthenticated AI access.
- [ ] Provider API keys in a secrets manager, rotated quarterly, never in client code.
- [ ] Multi-tenant context isolation: no other tenant's data can enter a prompt; cache keyed by tenant.
- [ ] Full audit trail per call: input hash, output hash, tokens, cost, user, tenant, timestamp.
- [ ] Anomaly detection on usage; graceful degradation when the provider is down (failover / cache /
      queue / disable). Webhook signatures verified on async AI callbacks. CORS restricted to your domains.

## Scope containment (the honest-but-off-topic gap injection defense misses)
Injection defense stops the model obeying a hostile instruction. Output filtering stops it leaking PII
or XSS. Neither stops the model from cheerfully answering a question that is simply **not what your
product does**: a data-analyst bot asked "write me a poem" or "what is the capital of France" produces a
number-free, artifact-free, non-injected reply that sails through both guards. You now run a
general-purpose LLM on your bill, off-brand, and hand every abuser a free model proxy. (Feld Labs scar:
the MySheetAI analyst follow-up passed number-grounding and content guards but had no topical boundary.)
- **A domain boundary is a separate control from injection and output filtering.** Add it explicitly.
- **The refusal-sentinel pattern (our fix):** the system prompt tells the model that if the request is
  anything other than its actual job (here: this dataset, its statistics, and how they were computed) it
  must reply with **exactly one fixed sentinel token and nothing else**. The server detects that token
  BEFORE the other guards and swaps in a fixed refusal string. The model never free-forms an off-domain
  answer, and the sentinel itself is never shown to the user. This mirrors the fixed-refusal a contained
  formula/codegen surface already uses; give every open-ended AI surface the same boundary.
- Test it the way you test injection: ask your own bot to do three things it should refuse, confirm each
  returns the fixed refusal, and confirm a legitimate in-scope request still passes unchanged.

## Minimize what leaves the client (the payload chokepoint, a positive pattern)
The cheapest data breach is the data you never sent. When a feature analyzes a user's file or record,
the raw rows do not need to reach your server or the model at all.
- **Compute locally, send only aggregates plus a bounded sample.** Parse and profile in the browser;
  send the model summary statistics plus a tiny, capped sample (e.g. <= 5 rows, <= 12 columns, <= 200
  chars/cell), never the full dataset. This makes the privacy pitch literally true, cuts the model bill,
  and shrinks what an injected prompt could ever exfiltrate.
- **Enforce it with a fail-closed assert at the boundary**, not by convention: a guard that throws if the
  outbound payload exceeds the shape/row/cell caps, so a future code change cannot silently widen it.
- **Never persist the raw rows or the sampled cells.** Store the rendered, grounded result, not the input.
  (Feld Labs pattern: MySheetAI's `assertPayloadMinimal` chokepoint plus raw rows never written to the DB.)

## AI that can DO things (tools, SQL, sends) is the sharp edge
A rule in the prompt is not a permission boundary. If the model can call a tool, query the database,
generate SQL, or send an email, assume a user can trigger that action by wording a message, and gate
every dangerous action behind a **real server-side permission check**.

For LLM-to-data features specifically (our Lucid Arc "Ask My Finances" scar):
- Prefer **parameterised, pre-vetted queries** the model only fills in over free-form SQL generation.
- If free-form is allowed: parse to an AST (never substring-match), allowlist the tables it may touch,
  enforce the tenant filter from the parsed structure, and run under a least-privilege read-only role.
- Route anything outside the pre-vetted set through a **human-in-the-loop approval** step. Never let
  raw model output reach a privileged action un-gated.

## Quick decision aids
- **Unauthenticated endpoint that reaches the model?** IP limit + CAPTCHA + aggressive caps, or move it
  behind auth. This is the money pump.
- **Agent / tool-use feature?** Step limit + total token budget + timeout + per-tool permission checks.
- **Document / URL ingestion?** Treat the fetched content as hostile: size/page limits, indirect-injection
  screening, and SSRF protection on the fetch (see `SKILL.md` Tier 1 #4).
