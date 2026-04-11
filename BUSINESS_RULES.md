# Big Bolão — Business Rules & Errors

Business Rules:

- One prediction per match per pool (poolId + matchId + userId unique)
- Predictions editable only before match starts
- Pool owner can remove participants; users can only leave
- inviteCode must be unique
- ScoringRule created automatically on pool creation
- Scoring rule changes are retroactive
- pointsEarned = null until match COMPLETED
- Knockout/final multipliers applied
- ADMIN role required to update match results

Error Format (all errors):
{
"message": "Human-readable error description"
}
Status codes: 400, 401, 403, 404, 409, 422, 500
