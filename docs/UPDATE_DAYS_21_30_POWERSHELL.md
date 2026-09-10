# Apply the Days 21–30 ZIP over the existing Windows project

Assumed layout:

```text
C:\projects\AI-Cyber-Tracker\
├─ AI-Cyber-Tracker\                       # your existing Git repo
└─ AI-Cyber-Tracker-Days-1-30-updated.zip # downloaded update
```

## 1. Protect your current work first

```powershell
cd C:\projects\AI-Cyber-Tracker\AI-Cyber-Tracker
git status
git add .
git commit -m "Checkpoint before Days 21-30 update"
git switch -c feature/eman-days-21-30
```

If Git says there is nothing to commit, that is fine. If the branch already exists, use:

```powershell
git switch feature/eman-days-21-30
```

## 2. Extract the update to a temporary folder

```powershell
cd C:\projects\AI-Cyber-Tracker
Remove-Item .\days21-30-update -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive -Path .\AI-Cyber-Tracker-Days-1-30-updated.zip -DestinationPath .\days21-30-update -Force
```

## 3. Overlay code while preserving Git history, secrets and installed packages

```powershell
robocopy .\days21-30-update\AI-Cyber-Tracker-main .\AI-Cyber-Tracker /E /XD .git node_modules .supabase /XF .env
```

`robocopy` exit codes 0–7 normally mean the copy operation completed successfully.

Then remove the temporary extracted folder:

```powershell
Remove-Item .\days21-30-update -Recurse -Force
cd .\AI-Cyber-Tracker
```

## 4. Add new server environment values

Keep your existing Supabase values. Open:

```powershell
notepad .\server\.env
```

Add any missing values from `server/.env.example`, especially:

```text
API_JSON_LIMIT=64kb
SCAN_RATE_LIMIT_MAX=3
SCAN_RATE_LIMIT_WINDOW_MS=600000
OPENROUTER_API_KEY=
OPENROUTER_MODEL=google/gemma-4-26b-a4b-it:free
OPENROUTER_TIMEOUT_MS=30000
OPENROUTER_TEST_ENABLED=false
```

Do not put `OPENROUTER_API_KEY` in `client/.env`.

## 5. Install/update dependencies

```powershell
npm run install:all
```

## 6. Apply only the new Supabase migrations

Preview:

```powershell
npx supabase db push --dry-run
```

If Days 11–20 were already applied, the dry run should show only:

```text
202608300005_scan_finding_display_fields.sql
202608300006_questionnaire_schema.sql
```

Then:

```powershell
npx supabase db push
npx supabase migration list
```

## 7. Run tests

```powershell
npm test
```

## 8. Run the application

Terminal 1:

```powershell
cd C:\projects\AI-Cyber-Tracker\AI-Cyber-Tracker
npm run server
```

Terminal 2:

```powershell
cd C:\projects\AI-Cyber-Tracker\AI-Cyber-Tracker
npm run client
```

## 9. Verify the Days 21–27 flow

Register/login → add authorized website → start authorized scan → real findings → adaptive questions → deterministic score → dashboard latest score.

## 10. Review and push to GitHub

```powershell
cd C:\projects\AI-Cyber-Tracker\AI-Cyber-Tracker
git status
git diff --stat
git add .
git commit -m "Implement Days 21-30 scanner questionnaire risk and AI foundation"
git push -u origin feature/eman-days-21-30
```

Then open a pull request into your team's integration branch (normally `develop`, if that is the branch your team is using).
