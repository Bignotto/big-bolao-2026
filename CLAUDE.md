# Big Bolão — Mobile App Claude Code System Prompt (REDUCED)

You are assisting with the development of the **Big Bolão** mobile app — a sports prediction pool (bolão) application. This is the canonical reference for the backend API.

Always consult the knowledge-base/ folder to understand the architecture, technical decisions, components, and screens.
Use the wikilinks and the Obsidian structure as a reference.
Before proposing changes, check if documentation already exists in knowledge-base/

The knowledge-base/ foder is an Obsidian Vault.

**Use the split files below (token-efficient):**

- DATA_MODELS.md
- API_ENDPOINTS.md
- SCORING_LOGIC.md
- BUSINESS_RULES.md

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
10. Pool detail prediction status uses GET /users/me/predictions?poolId=...; do not reintroduce per-match N+1 prediction requests
11. Profile updates use backend `fullName`, not a UI-only `name` field

## Backend Stack

Node.js + TypeScript (ESM), Fastify v5, Prisma v6 (PostgreSQL), Supabase JWT, Zod validation, Render.com.

## Design Context

### Users
Friend groups and families running private World Cup prediction pools together. They open the app during weekends, around match kick-off times, and at social gatherings. Casual and social — not hardcore bettors. Emotional goals: anticipation before matches, delight when predictions land, friendly competitiveness, a sense of belonging.

### Brand Personality
Three words: **refined, social, confident**. Like a well-designed fintech applied to sports — calm and purposeful, never noisy.

### Aesthetic Direction
- Both light and dark modes (system default). Light is primary for social/daytime; dark for late-night match sessions.
- Understated confidence: clean layouts, generous whitespace, typography-driven hierarchy.
- Orange (#FF872C) is a precious accent — use it sparingly for the single most important action. Navy/blue (#065894) is the dominant brand color.
- Tint all neutrals slightly toward the brand blue.
- Avoid Inter for new screens (too generic). Prefer a condensed/variable display face for scores and headings paired with a refined humanist sans for body.

### Anti-References
- **No gambling aesthetics**: no neon, heavy green/gold, aggressive CTAs, or visual noise.
- **No generic social app look**: no algorithm-feed layouts or Facebook-blue palettes.

### Design Principles
1. Friends first, sports second — the social connection is the product.
2. Restraint with the accent — orange is precious; everything else is navy and warm neutral.
3. Score as art — match scores and predictions are hero data; make them feel significant.
4. No gambling energy — zero tolerance for anything that makes a casual user feel like they're in a bookmaker's shop.
5. Works at a glance — users are watching a match; hierarchy must be brutal and clear.
