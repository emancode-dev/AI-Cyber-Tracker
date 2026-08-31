# Architecture through Day 30

```text
React + Vite
  ├─ Supabase Auth (signup/login/session)
  └─ Bearer JWT → Express API
                    ├─ requireAuth / ownership
                    ├─ request limits + scan rate limit + safe logs
                    ├─ PostgreSQL + RLS
                    │    ├─ websites
                    │    ├─ scans → findings
                    │    └─ questions → answers
                    ├─ Safe passive scanner
                    │    URL validation → pinned requests → redirects
                    │    → headers/cookies/TLS/metadata → normalized findings
                    ├─ Questionnaire engine
                    │    fixed bank → conditional branching → validated answers
                    ├─ Deterministic risk engine
                    │    findings + owner context → score/category priorities
                    └─ AI foundation (not product-integrated until Day 31)
                         safe context → constrained prompt → OpenRouter client
```

## Real product flow through Day 27

```text
User confirms authorization
→ POST /api/websites/:id/scans
→ safe passive scan
→ findings saved
→ adaptive controlled questions
→ answers saved/resumable
→ deterministic score
→ latest score appears on dashboard
```

## Day 30 AI boundary

OpenRouter has a server-only client and test harness, but there is no production report endpoint yet. The deterministic findings and score remain fully usable with AI unavailable.
