# Local setup, Supabase, deployment and Git commands

Replace capitalized placeholders before running commands. Do not paste private keys into Git-tracked files.

## 1. Copy the update into your existing repository

If this extracted folder is beside your current repository, preview the copy first:

```bash
rsync -avn --exclude node_modules --exclude dist --exclude .env ./AI-Cyber-Tracker-Emerald/ ./YOUR_MAIN_REPOSITORY/
```

Then apply it:

```bash
rsync -av --exclude node_modules --exclude dist --exclude .env ./AI-Cyber-Tracker-Emerald/ ./YOUR_MAIN_REPOSITORY/
cd ./YOUR_MAIN_REPOSITORY
git status --short
```

This preserves your existing `.git` directory and local `.env` files. Review overlapping application changes before committing.

## 2. Install and configure locally

```bash
npm run install:all
cp -n client/.env.example client/.env
cp -n server/.env.example server/.env
```

Set these client values:

```text
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

Set these server values:

```text
CLIENT_ORIGIN=http://localhost:5173
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
OPENROUTER_API_KEY=YOUR_SERVER_ONLY_KEY
OPENROUTER_MODEL=openrouter/free
OPENROUTER_TIMEOUT_MS=30000
```

Start both processes:

```bash
npm run server
```

In a second terminal:

```bash
npm run client
```

Review `/`, `/login`, `/register` and `/preview/dashboard` before connecting production data.

## 3. Apply Supabase migrations

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push --dry-run
npx supabase db push
```

The new Day 31–40 migration is:

```text
supabase/migrations/202608300007_ai_reports_history_retention.sql
```

It creates `ai_reports`, `score_history`, indexes, owner-scoped RLS policies and `cleanup_expired_assessment_data()`.

Enable Supabase Cron in the Dashboard, then run this in the SQL Editor:

```sql
select cron.schedule(
  'cleanup-expired-cyber-assessments',
  '17 * * * *',
  $$select public.cleanup_expired_assessment_data();$$
);
```

Confirm it exists:

```sql
select jobid, jobname, schedule, command, active
from cron.job
where jobname = 'cleanup-expired-cyber-assessments';
```

## 4. Run release checks

```bash
npm test
npm run test:ui-design
npm --prefix client run lint
npm --prefix client run build
```

## 5. Deploy frontend to Vercel

Set the Vercel project's Root Directory to `client`. Add production values for `VITE_API_BASE_URL`, `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Project Settings. Then:

```bash
cd client
npx vercel link
npx vercel deploy
```

Use the preview URL for the full UI smoke test. Promote the exact tested artifact when ready:

```bash
npx vercel promote YOUR_PREVIEW_DEPLOYMENT_URL
```

Keep the Express API on a backend host that supports outbound network access and set `CLIENT_ORIGIN` to the deployed frontend origin. Never place `OPENROUTER_API_KEY` in the Vercel frontend project.

## 6. Smoke test production

```bash
curl -fsS https://YOUR_BACKEND_HOST/api/health
```

In the browser test: signup → login → add authorized website → scan → questionnaire → score → report → export → history → rescan → Delete Now → logout. Confirm another account cannot read IDs created by the first account.

## 7. Commit and push

```bash
git status --short
git diff --check
git add README.md package.json client server shared supabase docs scripts
git commit -m "feat: ship emerald CyberTracker and Days 31-40"
git push origin HEAD
```

If this is a brand-new repository, add the remote once before pushing:

```bash
git init
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git add .
git commit -m "feat: ship emerald CyberTracker and Days 31-40"
git push -u origin main
```
