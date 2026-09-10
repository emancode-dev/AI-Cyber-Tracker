# Deterministic scoring — reliability hardening v2.1

AI Cyber Tracker separates **externally observed technical posture** from **owner-reported context**.

## External posture score

Only confirmed `needs_attention` findings reduce the number. `passed`, `observed`, and `manual_review` findings contribute zero numeric penalty. Manual review is shown separately so uncertainty is not converted into fake precision.

Severity weights:

- info: 0
- low: 4
- medium: 9
- high: 18

For an actionable finding:

```text
round(severityWeight × confidenceFactor)
```

Confidence factors remain deterministic product weights (high 1.0, medium 0.7, low 0.4), not statistical probabilities. The total external penalty is capped at 100 and `externalScore = 100 - penalty`.

Risk bands: 80–100 low, 60–79 medium, 0–59 high.

## Owner-context risk

Deterministic questionnaire rules produce a **separate** context penalty/risk. Owner assertions never rewrite scanner observations. Only scanner findings already classified `needs_attention` can amplify a context rule such as login + confirmed cookie-control weakness; manual-review heuristics do not.

Context bands: 0–4 low, 5–14 medium, 15+ high. `overallPriority` is the higher of external risk and context risk.

## Assessment coverage

Coverage states which declared control groups were actually evaluated. Inconclusive observations do not count as independently assessed. Coverage is never a “percentage secure.”

## Immutability and methodology

A completed assessment stores its deterministic `analysis_snapshot`, score and scanner/rule/risk/questionnaire versions. Reopening it returns that immutable snapshot; a real rescan creates a new assessment. History should claim improvement/regression only when methodology versions are comparable.

## AI boundary

The AI receives minimized deterministic facts and may explain/prioritize them, but cannot change the score or cite unknown finding/context codes. Every roadmap action is grounded to a supplied source code. Invalid/provider-failed output falls back to deterministic code-only reporting.
