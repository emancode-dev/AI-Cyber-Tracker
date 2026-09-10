# AI Cyber Tracker — Emerald Edition

This build extends the 40-day learn-by-building project with a trust-focused refinement: backend-only assessment writes, sanitized evidence provenance, stronger scanner correlation, separate external-posture/context risk, scope coverage, finding lifecycle history, validated OpenRouter explanations and privacy-first retention.

## What is implemented

- Reference-led emerald landing page with a real animated COBE globe, continuously moving signal rail, world activity map, cursor-reactive cards and responsive dashboard preview.
- Branded signup/login pages, protected routes, dashboard navigation, account/privacy card, charts, report history and settings.
- Supabase Auth, ownership checks in Express, RLS for owner-scoped reads, and backend-only trusted writes for scanner-generated facts.
- Passive SSRF-hardened scanner with normalized findings, sanitized observations, rule provenance, deterministic remediation, stronger header/cookie classification, timeouts, redirect validation, body limits and scan rate limiting.
- Controlled 15–25 question adaptive questionnaire; deterministic external-posture score; separate owner-context risk, overall priority and assessment coverage.
- Server-only OpenRouter request using minimized facts, strict score/finding validation, timeout/retry and deterministic fallback. The model is an explanation layer, never the score authority.
- Today / This Week / This Month report, local JSON export, Delete Now, 48-hour detailed-data expiry, lightweight score history, and durable new/existing/resolved/regressed finding lifecycle comparison.

The public `/preview/dashboard` route uses realistic illustrative data so the visual frontend can be reviewed without a configured account. Authenticated `/dashboard` uses live API data.

## Quick start

```bash
npm run install:all
cp client/.env.example client/.env
cp server/.env.example server/.env
npm run client
```

In another terminal:

```bash
npm run server
```

Local frontend: `http://localhost:5173`

## Supabase

Preview and apply all unapplied migrations, through `202609090011_dashboard_pending_scan_state.sql`:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push --dry-run
npx supabase db push
```

Migration 010 schedules cleanup/recovery with Supabase Cron automatically on the hosted project. Migration 011 adds live pending-scan status without replacing durable retained scores. Verify the jobs after `db push`; do not add a duplicate manual schedule.

Keep `OPENROUTER_API_KEY` and `SUPABASE_SECRET_KEY` only in `server/.env` or the backend host's encrypted environment. Never use either secret in the Vite frontend.

## Verification

```bash
npm test
npm run test:ui-design
npm --prefix client run lint
npm --prefix client run build
```

## Documentation

- `docs/FINAL_HARDENING_2026-09-02.md`
- `docs/REFINEMENT_IMPLEMENTATION_2026-09.md`
- `docs/IMPLEMENTATION_EVALUATION_2026-09.md`
- `docs/IMPLEMENTATION_AND_HANDOFF.md`
- `docs/LOCAL_SETUP_SUPABASE_DEPLOY_GIT.md`
- `docs/emerald-ui-library-research.md`
- `docs/emerald-implementation-plan-three-pass-review.md`
- `docs/scanner-security.md`
- `docs/scoring.md`
- `shared/api-contract.md`

Only scan websites you own or have explicit authorization to assess.
