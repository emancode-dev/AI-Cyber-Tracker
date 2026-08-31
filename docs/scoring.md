# Deterministic scoring — Days 25–27

The score is product logic, not AI logic.

## Direct scanner penalty

Only findings with `needs_attention` or `manual_review` contribute a direct penalty. Passed/observed findings contribute zero.

Base severity weights:
- info: 0
- low: 4
- medium: 9
- high: 18

Status factor:
- needs_attention: 1.0
- manual_review: 0.6
- passed / observed: 0

Confidence factor:
- high: 1.0
- medium: 0.7
- low: 0.4

The direct scanner penalty is capped at 70 points.

## Owner-context penalty

Controlled questionnaire answers can add context penalties, capped at 30 total points. Examples include an admin area without MFA, personal-data storage without backups, full card-data storage, or missing cookie protection in an application with user login.

Eman's cross-teach context rule is `CTX_LOGIN_COOKIE_CONTROLS`.

## Final score

```text
score = 100 - min(100, scannerPenalty + contextPenalty)
```

Risk levels:
- 80–100: low
- 60–79: medium
- 0–59: high

The score is reproducible and useful for prioritization, but it is not an absolute statement that a website is secure or insecure.
