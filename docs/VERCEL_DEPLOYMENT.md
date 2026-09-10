# Vercel deployment

The production layout uses two Vercel projects from the same repository:

- `client` is a Vite static deployment.
- the repository root is an Express application running as a Node.js Function;
  it includes the shared deterministic finding catalog used by the server.

This keeps the existing browser-to-API contract intact and leaves Supabase as
the durable authorization, quota, scan-state, and report store.

## Secrets and public configuration

Never upload or commit `client/.env`, `server/.env`, or a service-role/secret
key. Add runtime values through **Vercel > Project > Settings > Environment
Variables**. Mark backend credentials as sensitive.

Browser-visible values (expected in the client project):

| Key | Value |
| --- | --- |
| `VITE_API_BASE_URL` | Backend production URL followed by `/api` |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable/anon key, never the secret/service-role key |

Server-only values (expected in the server project):

| Key | Required | Notes |
| --- | --- | --- |
| `CLIENT_ORIGIN` | Yes | Exact frontend origin, without a trailing slash |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Yes | Publishable/anon key used for user-scoped RLS requests |
| `SUPABASE_SECRET_KEY` | Yes | Sensitive backend-only key for trusted writes |
| `OPENROUTER_API_KEY` | No | Sensitive; deterministic fallback reports work without it |
| `OPENROUTER_HTTP_REFERER` | No | Frontend production origin |
| `OPENROUTER_APP_TITLE` | No | `AI Cyber Tracker` |

The scanner, JSON-size, rate-limit, and OpenRouter timing variables in
`server/.env.example` are optional. Their hardened defaults remain active when
they are not set. Do not set `PORT` on Vercel.

## Deployment order

1. Push this branch to GitHub.
2. In Vercel, import the repository and create the backend project with Root
   Directory left blank (the repository root). Select the Express framework
   preset. Leave Build Command and Output Directory at their detected defaults;
   `vercel.json` securely installs only the server package for this project.
3. Add all required server variables except `CLIENT_ORIGIN`, then deploy once
   to reserve the backend URL. The API will intentionally fail closed until all
   required server variables are present.
4. Import the same repository as a second project with Root Directory `client`.
   Select Vite, use Build Command `npm run build`, and Output Directory `dist`.
5. Add the three client variables. Set `VITE_API_BASE_URL` to the backend URL
   followed by `/api`, then deploy the frontend.
6. Return to the backend project, set `CLIENT_ORIGIN` to the exact frontend
   production origin, and redeploy.
7. In Supabase Authentication URL Configuration, set the Site URL to the
   frontend production origin and add any exact callback URLs the app uses.

Use Production scope for production values. For Preview deployments, use an
explicit stable preview origin or a separate preview backend; do not weaken
CORS with a wildcard merely to accept changing preview URLs.

## Verification

After both deployments are ready:

1. Open `https://BACKEND_HOST/api/health` and confirm a JSON response with
   `status: "ok"`.
2. Register or sign in through the frontend.
3. Add a website you own or are authorized to assess.
4. Run a passive scan and verify it reaches `waiting_for_answers`.
5. Complete the questionnaire and verify dashboard, history, and report pages.
6. Confirm the browser Network panel contains no service-role key or OpenRouter
   key and that API responses include no raw cookie values or response bodies.

## Local checks

From the repository root:

```powershell
npm test
npm run test:ui-design
npm --prefix client run lint
npm --prefix client run build
```

Local development remains unchanged: run the server and client in separate
terminals with `npm run server` and `npm run client`.
