# Big Bolão — API Endpoints

All endpoints (except POST /users) require Authorization: Bearer <supabase_token>.

### Users

- POST /users → create (no auth)
- GET /users/me
- GET /users/:userId
- PUT /users/:userId
- GET /users/:userId/pools
- GET /users/me/pools/standings
- GET /users/me/predictions (?poolId=)

### Pools

- GET /pools (public, ?page&limit&name)
- POST /pools
- GET /pools/:poolId
- PUT /pools/:poolId (owner)
- GET /pools/:poolId/users
- POST /pools/:poolId/users (join public)
- DELETE /pools/:poolId/users/me (leave)
- DELETE /pools/:poolId/users/:userId (owner only)
- GET /pools/:poolId/predictions
- GET /pools/:poolId/standings
- PUT /pools/:poolId/scoring-rules (owner)
- GET /pool-invites/:inviteCode
- POST /pool-invites/:inviteCode (join)

### Predictions

- POST /predictions
- GET /predictions/:predictionId
- PUT /predictions/:predictionId

### Matches

- GET /matches/:matchId
- GET /matches/:matchId/predictions
- GET /matches/:matchId/predictions/me (returns array, null = no prediction yet)
- PUT /matches/:matchId (ADMIN only)

### Tournaments

- GET /tournaments
- GET /tournaments/:tournamentId
- GET /tournaments/:tournamentId/matches (?stage&status)

### Health

- GET /health (no auth)

(Full request/response JSON examples are in the original CLAUDE.md — preserved verbatim in this file if needed.)
