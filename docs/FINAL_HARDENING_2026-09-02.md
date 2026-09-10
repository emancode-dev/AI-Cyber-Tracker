# AI Cyber Tracker — reliability hardening release (2026-09-02)

This release fixes the integration/state-consistency issues found during the post-refinement audit. The product remains an **authorized passive external security posture assessment**, not a penetration-testing engine.

## Core reliability changes

- Questionnaire answers are backend-written and revision-locked. A completed assessment is immutable; changing owner context requires a fresh assessment.
- `save_questionnaire_answers()` locks the scan row and increments `answers_revision` atomically.
- `finalize_scan_analysis()` verifies that exact revision, then atomically commits the completed scan, durable score history and finding lifecycle events.
- `commit_scan_results()` atomically persists findings, safe observations and the `waiting_for_answers` transition.
- Completed scans retain a temporary `analysis_snapshot` so re-opening an assessment does not silently recalculate it with a newer risk engine.
- Dashboard current scores come from durable `score_history`; detailed scan/report evidence may expire while the retained score remains visible.
- Shared scan quotas are database-backed rather than per-Node-process only. In-process concurrency still protects each worker's outbound capacity.
- Supabase Cron schedules detailed-data cleanup and stale-scan recovery.

## Scanner accuracy changes

- Non-representative responses (challenge/error pages, JSON, unresolved redirects) do not receive normal document-header scoring.
- CSP presence is recorded without claiming the policy is strong.
- `frame-ancestors` is interpreted: wildcard/broad schemes are not treated as protection; malformed policies require review.
- Referrer-Policy/COOP values are parsed rather than passed on mere presence.
- Cookie attributes are parsed safely and cookie names/values are not persisted. `HttpOnly`/`SameSite` findings are contextualized by likely cookie role.
- Manual-review findings no longer reduce the external numeric score.
- robots.txt, sitemap.xml and security.txt require content matching their expected formats rather than HTTP 200 alone.
- SSRF address checks cover common IPv4 private/special ranges plus IPv6 mapped/compatible, NAT64, Teredo, 6to4, site-local, documentation, discard-only and other special-purpose ranges. Every redirect is still re-resolved and validated.
- Per-request deadlines, a whole-scan deadline and worker concurrency/queue controls limit slow-target resource use.

## AI/report changes

- Report cache reuse is fingerprinted to immutable assessment inputs and methodology versions.
- AI roadmap steps must cite a verified scanner finding code or deterministic owner-context code.
- Temporary OpenRouter provider failures store a retryable deterministic fallback rather than pretending AI succeeded.
- Retry handling uses bounded backoff and respects short `Retry-After` delays; long waits fall back immediately.

## Required environment

Server-only:

```text
SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SECRET_KEY=sb_secret_...
OPENROUTER_API_KEY=...          # optional; deterministic fallback works without it
OPENROUTER_MODEL=google/gemma-4-26b-a4b-it:free
```

Never expose `SUPABASE_SECRET_KEY` or `OPENROUTER_API_KEY` to Vite/browser variables.

## Required migrations

Apply all migrations through `202609090011_dashboard_pending_scan_state.sql`:

```bash
npx supabase db push --dry-run
npx supabase db push
npx supabase migration list
```

Migration 010 installs/schedules the Cron jobs itself on Supabase hosted Postgres; do not create duplicate cleanup schedules manually.
Migration 011 keeps retained scores authoritative while reporting a newer in-progress assessment to the dashboard.

## Release verification

```bash
npm ci
npm test
npm run test:ui-design
npm --prefix client run lint
npm --prefix client run build
```

Then perform a two-account Supabase integration smoke test: owner A scan flow, direct Data API mutation denial, owner B isolation, concurrent answer/analyze conflict, completed-scan immutability, 48-hour cleanup semantics, retained score/dashboard behavior, and fresh-rescan lifecycle behavior.
