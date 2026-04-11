# Big Bolão — Scoring Logic

Base Points (priority order):

- Exact score → exactScorePoints (default 5)
- Correct winner + correct goal diff → correctWinnerGoalDiffPoints (default 3)
- Correct winner only → correctWinnerPoints (default 2)
- Correct draw → correctDrawPoints (default 2)
- None → 0

Stage Multipliers:

- GROUP → 1×
- Knockout (ROUND_OF_32 … THIRD_PLACE) → knockoutMultiplier (default 1.5)
- FINAL → finalMultiplier (default 2.0)

Example: predict 2-1, actual 3-1 in SEMI_FINAL → 3 pts × 1.5 = 4.5 pts

UI Guidance:

- Always show scoringRules when submitting/reviewing predictions
- pointsEarned is null until matchStatus === "COMPLETED"
- specialEventPoints stored but not used in current scoring
- Changing scoring rules is retroactive (warn user)

Pool Settings Screen (owner only):

1. Load from pool.scoringRules
2. Editable fields
3. Confirmation: "Changing scoring rules will recalculate ALL points immediately"
4. PUT /pools/:poolId/scoring-rules (only changed fields)
5. Refresh leaderboard after save
