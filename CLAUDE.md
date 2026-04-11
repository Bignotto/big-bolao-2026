# Big Bolão — Mobile App Claude Code System Prompt (REDUCED)

You are assisting with the development of the **Big Bolão** mobile app — a sports prediction pool (bolão) application. This is the canonical reference for the backend API.

**Use the split files below (token-efficient):**

- data-models.md
- api-endpoints.md
- scoring-logic.md
- business-rules.md

## Project Overview

Users create/join tournament pools, submit predictions (score, winner, ET, penalties), earn points and compete on leaderboards.

## Backend API

- Base URL: configured via environment
- Auth: Authorization: Bearer <supabase_token> (all endpoints except POST /users)
- Auth provider: Supabase (JWT validation + user.sub injection)
- Content-Type: application/json
- API Docs: /docs (Swagger)

## Authentication Flow

1. User authenticates with Supabase (EMAIL/GOOGLE/APPLE)
2. Supabase returns JWT
3. Mobile app sends token on every request
   Account providers: 'EMAIL' | 'GOOGLE' | 'APPLE'  
   User roles: 'USER' | 'ADMIN'

## Key Implementation Notes for Mobile

1. Always handle null values (scores, images, deadlines)
2. Implement Supabase token auto-refresh
3. Optimistic UI for predictions
4. Pagination + infinite scroll on GET /pools
5. Poll or Supabase Realtime for match updates
6. Role-aware UI (ADMIN only for match results)
7. Invite flow: GET /pool-invites/:code → preview → POST to join
8. Always show pool.scoringRules when submitting/reviewing predictions
9. Matches list screen is prediction-free; load predictions only on detail screen via GET /matches/:matchId/predictions/me

## Backend Stack

Node.js + TypeScript (ESM), Fastify v5, Prisma v6 (PostgreSQL), Supabase JWT, Zod validation, Render.com.
