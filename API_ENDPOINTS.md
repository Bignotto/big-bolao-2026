# Big Bolão — API Endpoints

All endpoints (except GET /health) require Authorization: Bearer <supabase_token>.

### Users

- POST /users → create account (no auth required)
- GET /users/me
- GET /users/:userId
- PUT /users/:userId
- GET /users/:userId/pools
- GET /users/me/pools/standings
- GET /users/me/predictions (?poolId=) → user's predictions; use for pool detail to avoid per-match N+1

### Pools

- GET /pools (?page&perPage&name) — paginated public pools
- POST /pools
- GET /pools/:poolId
- PUT /pools/:poolId (owner)
- GET /pools/:poolId/users
- POST /pools/:poolId/users (join public)
- DELETE /pools/:poolId/users/me (leave)
- DELETE /pools/:poolId/users/:userId (owner only)
- GET /pools/:poolId/predictions
- GET /pools/:poolId/standings → all participants including those with 0 predictions
- PUT /pools/:poolId/scoring-rules (owner; retroactive — warn user)
- GET /pool-invites/:inviteCode → preview pool
- POST /pool-invites/:inviteCode → join by invite code

### Predictions

- POST /predictions
- GET /predictions/:predictionId
- PUT /predictions/:predictionId (locked once match starts)

### Matches

- GET /matches/:matchId
- GET /matches/:matchId/predictions
- GET /matches/:matchId/predictions/me → user's prediction status across their pools (prediction: null = not submitted)
- PUT /matches/:matchId (ADMIN only) → update result + matchStatus

### Tournaments

- GET /tournaments
- GET /tournaments/:tournamentId
- GET /tournaments/:tournamentId/matches (?stage&status&group&limit&offset)

### Health

- GET /health (no auth)
