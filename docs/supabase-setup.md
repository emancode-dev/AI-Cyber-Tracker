# Supabase setup — through Day 30

The real project schema lives in `supabase/migrations/`. Use the SQL Editor for learning/temporary experiments, but keep real schema changes in versioned migrations so both teammates share the same history.

## Existing project that already applied Days 11–20

If your hosted project already has migrations `202608290001`–`202608290004`, this update adds:

```text
202608300005_scan_finding_display_fields.sql
202608300006_questionnaire_schema.sql
```

From the repository root:

```bash
npx supabase db push --dry-run
```

You should see the two new migrations only. If the dry run looks correct:

```bash
npx supabase db push
npx supabase migration list
```

Do not paste the same migration SQL into the Dashboard after `db push`.

## Clean/local database

With the local Supabase stack available:

```bash
npx supabase start
npx supabase db reset
```

`db reset` rebuilds the local DB from every migration in order and then applies local seed data.

## What the new migrations add

### Day 21
The existing `findings` table gains `title` and `why_it_matters` so the exact normalized scanner presentation can be persisted and rendered after refresh.

### Days 22–24
Adds:

```text
questions
answers
```

with RLS ownership rules for answers and a controlled adaptive question bank. The question bank has 15 always-applicable questions and up to 10 conditional follow-ups (maximum 25).

## Auth URLs

In Supabase Dashboard → Authentication → URL Configuration, keep local development URLs such as `http://localhost:5173` allowed while developing.

## Environment

Create/keep:

```text
client/.env
server/.env
```

Client needs only public browser-safe values:

```text
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

Server needs Supabase plus scanner/runtime configuration. Compare your existing file with `server/.env.example` and add the new Day 21/28 values rather than replacing your real secrets.

The OpenRouter key is server-only and must never be placed in `client/.env`.

## Verify after migration

1. Register/login.
2. Add an owned/authorized website.
3. Start an authorized passive scan.
4. Confirm `scans` and `findings` rows appear.
5. Continue to questionnaire and answer several questions.
6. Refresh the questionnaire and confirm answers resume.
7. Complete applicable questions and calculate the deterministic score.
8. Return to the dashboard and confirm the latest score appears.
9. Use a second user to verify they cannot read the first user's website, scan, or answers.

## Future DB changes

Never rewrite an already-applied migration. Create a new migration:

```bash
npx supabase migration new descriptive_change_name
```

Then test and push it normally.
