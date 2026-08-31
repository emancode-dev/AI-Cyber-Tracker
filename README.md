# AI Cyber Tracker — Emerald Edition

This build completes the 40-day learn-by-building plan with a redesigned dark-emerald React experience, Supabase Auth/PostgreSQL/RLS, protected passive scanning, an adaptive questionnaire, deterministic scoring, validated OpenRouter explanations, score history and privacy-first retention.

## What is implemented

- Reference-led emerald landing page with a real animated COBE globe, continuously moving signal rail, world activity map, cursor-reactive cards and responsive dashboard preview.
- Branded signup/login pages, protected routes, dashboard navigation, account/privacy card, charts, report history and settings.
- Supabase Auth, ownership checks in Express and row-level security in PostgreSQL.
- Passive SSRF-hardened scanner with normalized findings, timeouts, redirect validation, body limits and scan rate limiting.
- Controlled 15–25 question adaptive questionnaire and reproducible deterministic risk engine.
- Server-only OpenRouter request using minimized evidence, JSON Schema output, strict score/finding validation, timeout/retry and deterministic fallback.
- Today / This Week / This Month report, local JSON export, Delete Now, 48-hour detailed-data expiry, lightweight score history and before/after category comparison.

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

Preview and apply all unapplied migrations, including `202608300007_ai_reports_history_retention.sql`:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push --dry-run
npx supabase db push
```

Schedule the included cleanup function after enabling Supabase Cron:

```sql
select cron.schedule(
  'cleanup-expired-cyber-assessments',
  '17 * * * *',
  $$select public.cleanup_expired_assessment_data();$$
);
```

Keep `OPENROUTER_API_KEY` only in `server/.env` or the backend host's encrypted environment. Never use it in the Vite frontend.

## Verification

```bash
npm test
npm run test:ui-design
npm --prefix client run lint
npm --prefix client run build
```

## Documentation

- `docs/IMPLEMENTATION_AND_HANDOFF.md`
- `docs/LOCAL_SETUP_SUPABASE_DEPLOY_GIT.md`
- `docs/emerald-ui-library-research.md`
- `docs/emerald-implementation-plan-three-pass-review.md`
- `docs/scanner-security.md`
- `docs/scoring.md`
- `shared/api-contract.md`

Only scan websites you own or have explicit authorization to assess.
