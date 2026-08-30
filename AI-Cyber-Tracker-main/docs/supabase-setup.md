# Supabase setup — Days 11–15

The project keeps the real schema in `supabase/migrations/`. Use the SQL Editor only for learning/temporary experiments; apply project schema changes through migrations so both teammates share the same database history.

## 1. Create a Supabase project
Create a hosted project in the Supabase Dashboard and save the project reference, project URL, and publishable key. The code also accepts the legacy anon key as a fallback, but new projects should prefer the current publishable key.

## 2. Install and initialize the CLI
From the repository root:

```bash
npm install supabase --save-dev
npx supabase init
```

If `supabase/config.toml` already exists, do not overwrite your team's config blindly.

## 3. Optional local stack
Docker (or another Docker-compatible container runtime) is required for the local Supabase stack:

```bash
npx supabase start
npx supabase db reset
```

`db reset` rebuilds the local DB from all migration files and then applies seed data.

## 4. Log in and link the hosted project

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
```

## 5. Preview and apply the migrations

```bash
npx supabase db push --dry-run
npx supabase db push
```

Do not use `--include-seed` on production. For a throwaway dev project only, you may use `npx supabase db push --include-seed`.

## 6. Configure Auth URLs
In Supabase Dashboard → Authentication → URL Configuration, set your local Site URL to `http://localhost:5173` and add the same URL to allowed redirect URLs while developing. Decide as a team whether email confirmation is enabled.

## 7. Copy environment variables
Create `client/.env` from `client/.env.example` and `server/.env` from `server/.env.example`.

Frontend needs:

```text
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Backend needs:

```text
SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

The backend deliberately does not require a service-role key for Days 11–20. It forwards the authenticated user's JWT into a user-scoped Supabase client, so RLS remains active.

## 8. Run both apps

```bash
cd server
npm install
npm run dev
```

In another terminal:

```bash
cd client
npm install
npm run dev
```

## 9. Verify the Day 15 flow
1. Register a user.
2. Confirm email if your project requires it.
3. Log in.
4. Add an owned/authorized website.
5. Refresh the dashboard.
6. Restart Express and refresh again — the website should still exist because it is stored in PostgreSQL.
7. Create a second account and confirm it cannot read the first account's website.

## 10. Future database changes
Never edit a migration already used by your teammate. Create a new one:

```bash
npx supabase migration new descriptive_change_name
```

Write the new SQL, test locally with `npx supabase db reset`, then push it with `npx supabase db push`.
