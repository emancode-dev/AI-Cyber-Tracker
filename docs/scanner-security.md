# Passive scanner security boundary — hardened refinement

AI Cyber Tracker is an **authorized passive external posture assessor**, not an exploitation engine.

## Network safety

Implemented controls:

- HTTP/HTTPS only.
- Embedded URL credentials rejected.
- Port allow-list (default 80/443).
- DNS resolution before requests.
- Private, loopback, link-local, multicast, documentation and other non-public address classes blocked.
- Selected validated IP pinned into the Node request lookup callback for that request.
- Every redirect destination is independently validated again.
- Redirect-count cap.
- Per-request timeout.
- Response-body byte cap.
- Passive GET observation only: no form submission, credential testing, brute force, destructive actions or exploit attempts.

## Trusted write boundary

Scanner-produced facts are now treated differently from user-owned CRUD data.

Browser-authenticated users may read their own scans/findings through RLS, but the new hardening migration revokes authenticated INSERT/UPDATE/DELETE on:

```text
scans
findings
ai_reports
score_history
```

Trusted assessment mutations require the Express backend's server-only Supabase secret key. The secret key must never be placed in `client/.env` or browser code.

User-controlled data such as website records, profile fields and questionnaire answers remains user-scoped through RLS.

## Evidence provenance

The scanner now stores two layers:

1. **normalized findings** — human-readable security assessment results;
2. **sanitized observations** — minimal machine-readable facts explaining what the scanner actually saw.

Examples of safe observation fields:

```text
header present/not observed
HTTP status code
redirect count
HSTS max-age integer
cookie count + whether all observed cookies had Secure/HttpOnly/SameSite
TLS authorization boolean + protocol + expiry
```

The observation layer intentionally does **not** persist:

- raw cookie values
- Authorization headers
- tokens or credentials
- response bodies
- full target URLs/query strings

## Correlation / false-positive reduction

The scanner distinguishes observations from conclusions. Examples:

- `X-Frame-Options` absence alone is not enough to say frame protection is missing; CSP `frame-ancestors` is checked first.
- HSTS is classified as missing, weak, or present instead of presence-only.
- Referrer-Policy distinguishes absent from explicitly permissive values.
- Missing Permissions-Policy and COOP are surfaced as application-dependent manual-review observations with informational severity, so they do not automatically lower the external score.
- Cookie attributes are parsed with whitespace/case-tolerant attribute matching.

## What remains outside the passive scope

The external scanner does not independently verify items such as:

- server-side authorization correctness
- database access controls
- internal/private APIs
- dependency/supply-chain vulnerabilities
- admin MFA configuration
- backup restore effectiveness

Those boundaries are exposed through assessment coverage instead of being silently treated as “passed.”

## Future browser mode

A Playwright/browser observation worker is intentionally **not** part of the default scanner yet. A browser automatically creates many secondary requests, so equivalent SSRF/request interception controls must exist before enabling it. This is a later optional tier, not a dependency of the trustworthy HTTP/TLS core.

Only scan websites you own or have explicit permission to assess.
