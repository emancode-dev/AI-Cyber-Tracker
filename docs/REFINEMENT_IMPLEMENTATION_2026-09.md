# AI Cyber Tracker — evidence and lifecycle refinement (2026-09)

## Goal

Move the project from a feature-complete student scanner toward a more defensible security-posture product without turning it into an invasive penetration-testing platform.

The implementation deliberately prioritizes:

1. integrity of scanner-produced facts;
2. reproducible and explainable evidence;
3. lower false-positive pressure;
4. clear scope/coverage limits;
5. fix → rescan → verify lifecycle;
6. deterministic scoring with owner context kept separate;
7. AI as a grounded explanation layer, not a security oracle.

## Research basis

Current external references reviewed before implementation:

- OWASP Top 10:2025 — https://owasp.org/Top10/2025/
- OWASP A02:2025 Security Misconfiguration — https://owasp.org/Top10/2025/A02_2025-Security_Misconfiguration/
- OWASP ASVS 5.0.0 — https://owasp.org/www-project-application-security-verification-standard/
- OWASP Web Security Testing Guide — https://owasp.org/www-project-web-security-testing-guide/latest/
- Mozilla HTTP Observatory docs — https://developer.mozilla.org/en-US/observatory/
- OWASP ZAP Passive Scanner — https://www.zaproxy.org/docs/desktop/addons/passive-scanner/
- Playwright network/browser-context docs — https://playwright.dev/docs/network
- Supabase API key guidance — https://supabase.com/docs/guides/api/api-keys
- Supabase RLS guidance — https://supabase.com/docs/guides/database/postgres/row-level-security
- NIST SSDF — https://csrc.nist.gov/pubs/sp/800/218/final

Research was used as guidance, not as a claim that this passive scanner certifies ASVS/OWASP compliance.

## Implemented architecture changes

### A. Trusted assessment writes

New server-side Supabase secret-key client and `requireTrustedWriter` middleware.

Authenticated browser users keep owner-scoped reads, but the migration revokes direct authenticated mutation of scanner-owned facts (`scans`, `findings`, `ai_reports`, `score_history`). This prevents a normal browser session from fabricating its own scanner result/score through Supabase CRUD.

### B. Safe provenance / observations

New `scan_observations` table and observation builder record safe facts such as:

- header present/not-observed state
- status code
- redirect count
- HSTS max-age
- cookie count and aggregate attribute booleans
- TLS validation/protocol/expiry

Raw cookies, response bodies, credentials, authorization headers and target URLs are not stored in the observation model.

### C. Rich normalized finding metadata

Findings now include:

- observation status
- assessment state
- deterministic remediation
- deterministic verification step
- standards mapping metadata
- safe evidence object
- source
- rule-pack version

### D. Scanner correctness improvements

- frame protection correlates CSP `frame-ancestors` with X-Frame-Options;
- XFO-only is separated as legacy-only review state;
- HSTS distinguishes missing / weak / present;
- Referrer-Policy distinguishes missing / permissive / present;
- cookie Secure/HttpOnly/SameSite matching is whitespace/case tolerant;
- missing COOP and Permissions-Policy are informational manual-review hardening signals, not automatic score penalties.

### E. Score/context separation

External score now uses scanner findings only.

Owner answers generate a separate `contextRiskLevel`, and `overallPriority` takes the more urgent of external risk and owner context. Owner answers no longer silently rewrite the technical score.

### F. Assessment coverage

New coverage model reports:

- automated control coverage;
- applicable owner-context completion;
- independently observed portion of declared scope;
- explicit untested areas.

Coverage is explicitly described as scope coverage, never “percent secure.”

### G. Finding lifecycle / rescan comparison

New durable `finding_history` retains minimal lifecycle facts after detailed evidence expires.

Lifecycle states:

- new
- existing
- resolved
- regressed

Score history now stores context risk, priority, coverage, scanner version and risk-engine version.

### H. AI grounding/versioning

AI receives minimized deterministic finding facts, coverage and selected owner context. It remains score-locked and finding-code-locked, with deterministic fallback.

Version markers added for scanner, rule pack, risk engine, questionnaire, prompt and report schema.

The default OpenRouter model is pinned to `google/gemma-4-26b-a4b-it:free` rather than the generic free-model router because the generic router can select a model that is unsuitable for report JSON. The backend still falls back deterministically if the provider/model is unavailable.

## Intentionally deferred

The following were researched but intentionally not embedded into the default core yet:

### Browser/Playwright scanning

Technically feasible, but a browser creates secondary network requests automatically. Equivalent SSRF/request-interception controls and a dedicated worker/container should exist first.

### Embedded ZAP

ZAP passive scanning is useful as an independent benchmark. Embedding Java/ZAP into the runtime now would add disproportionate operational complexity.

### Queue infrastructure

Supabase Queues/pgmq can be useful when concurrent/scheduled scan volume requires durable jobs. Current request-driven scans do not need it yet.

### Full active vulnerability exploitation

Explicitly outside the current defensive/passive product scope.
