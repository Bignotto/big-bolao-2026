---
title: API — Database & Schema Prisma
tags: [api, database, prisma, postgresql, schema]
updated: 2026-04-17
---

# API — Database & Schema Prisma

**Banco:** PostgreSQL
**ORM:** Prisma v6
**Schema:** `prisma/schema.prisma`

## Enums

```prisma
enum AccountProvider  { GOOGLE | APPLE | EMAIL }
enum AccountRole      { USER | ADMIN }
enum MatchStage       { GROUP | ROUND_OF_16 | QUARTER_FINAL | SEMI_FINAL | THIRD_PLACE | FINAL }
enum MatchStatus      { SCHEDULED | IN_PROGRESS | COMPLETED }
enum TournamentStatus { UPCOMING | ACTIVE | COMPLETED }
```

---

## Modelos

### User (`users`)

```prisma
model User {
  id              String           @id @default(cuid())
  fullName        String
  email           String           @unique
  passwordHash    String?
  profileImageUrl String?
  createdAt       DateTime         @default(now())
  lastLogin       DateTime?
  accountId       String?
  accountProvider AccountProvider? @default(EMAIL)
  role            AccountRole?     @default(USER)

  pools              PoolParticipant[]
  createdPools       Pool[]              @relation("PoolCreator")
  predictions        Prediction[]
  leaderboardEntries Leaderboard[]
}
```

### Tournament (`tournaments`)

```prisma
model Tournament {
  id        Int              @id @default(autoincrement())
  name      String
  startDate DateTime
  endDate   DateTime
  logoUrl   String?
  status    TournamentStatus @default(UPCOMING)
  teams     TournamentTeam[]
  matches   Match[]
  pools     Pool[]
}
```

### Team (`teams`) + TournamentTeam (junção)

```prisma
model Team {
  id          Int     @id @default(autoincrement())
  name        String
  countryCode String? @db.Char(3)
  flagUrl     String?
}

model TournamentTeam {
  tournamentId Int
  teamId       Int
  groupName    String?   // Grupo A–H; null para fase mata-mata
  @@id([tournamentId, teamId])
}
```

### Match (`matches`)

```prisma
model Match {
  id               Int         @id @default(autoincrement())
  tournamentId     Int
  homeTeamId       Int
  awayTeamId       Int
  matchDatetime    DateTime
  stadium          String?
  stage            MatchStage  @default(GROUP)
  group            String?     // null em fases eliminatórias
  homeTeamScore    Int?
  awayTeamScore    Int?
  matchStatus      MatchStatus @default(SCHEDULED)
  hasExtraTime     Boolean?
  hasPenalties     Boolean?
  penaltyHomeScore Int?
  penaltyAwayScore Int?
  completedAt      DateTime?
}
```

### Pool (`pools`)

```prisma
model Pool {
  id                   Int       @id @default(autoincrement())
  tournamentId         Int
  name                 String
  description          String?
  isPrivate            Boolean   @default(false)
  inviteCode           String?   @unique   // único globalmente
  maxParticipants      Int?
  registrationDeadline DateTime?
  creatorId            String
}
```

### ScoringRule (`scoring_rules`)

```prisma
model ScoringRule {
  poolId                      Int   @unique
  exactScorePoints            Float @default(3)
  correctWinnerGoalDiffPoints Float @default(2)
  correctWinnerPoints         Float @default(1)
  correctDrawPoints           Float @default(1)
  specialEventPoints          Float @default(5)
  knockoutMultiplier          Float @default(1.5)
  finalMultiplier             Float @default(2.0)
}
```

> [!important] Defaults confirmados em `createPoolUseCase.ts`
> Criadas automaticamente ao criar um pool.

### Prediction (`predictions`)

```prisma
model Prediction {
  id                        Int       @id @default(autoincrement())
  userId                    String
  poolId                    Int
  matchId                   Int
  predictedHomeScore        Int
  predictedAwayScore        Int
  predictedHasExtraTime     Boolean   @default(false)
  predictedHasPenalties     Boolean   @default(false)
  predictedPenaltyHomeScore Int?
  predictedPenaltyAwayScore Int?
  pointsEarned              Float?    // null até matchStatus = COMPLETED
  submittedAt               DateTime  @default(now())
  updatedAt                 DateTime?

  @@unique([userId, poolId, matchId])  // constraint: 1 palpite por (user+pool+match)
}
```

### PoolParticipant (`pool_participants`)

```prisma
model PoolParticipant {
  poolId   Int
  userId   String
  joinedAt DateTime @default(now())
  @@id([poolId, userId])
}
```

---

## Views PostgreSQL

Criadas em `prisma/migrations/20250420092255_add_pool_standings_views/`.

### `prediction_points`

Calcula pontos por palpite aplicando as regras do pool:

```sql
-- Lógica de basePoints:
CASE
  WHEN placar exato                     → exactScorePoints
  WHEN vencedor + diferença corretos    → correctWinnerGoalDiffPoints
  WHEN apenas vencedor correto (casa)   → correctWinnerPoints
  WHEN apenas vencedor correto (fora)   → correctWinnerPoints
  WHEN empate correto                   → correctDrawPoints
  ELSE 0
END

-- Multiplicador de fase:
CASE
  WHEN stage = 'FINAL'   → finalMultiplier    (2.0)
  WHEN stage != 'GROUP'  → knockoutMultiplier  (1.5)
  ELSE 1
END

TotalPoints = basePoints * stageMultiplier
```

Filtra apenas partidas `matchStatus = 'COMPLETED'`.

### `tournament_statistics`

Conta partidas por fase e calcula o máximo de pontos possíveis por pool.

### `pool_standings`

Ranking completo com:

| Campo | Descrição |
|-------|-----------|
| `ranking` | Posição (por totalPoints + exactScoreCount) |
| `totalPredictions` | Quantidade de palpites feitos |
| `totalPoints` | Pontos acumulados |
| `exactScoreCount` | Acertos de placar exato |
| `pointsRatio` | % dos pontos máximos possíveis |
| `guessRatio` | % de acertos exatos / total de partidas |
| `predictionsRatio` | % de partidas com palpite |

---

## Migrations

| Migration | Mudança |
|-----------|---------|
| `20250303185023_init` | Schema inicial |
| `20250306090513` | Melhorias tabela users |
| `20250401084811` | Enum MatchStage |
| `20250404093639` | Coluna role em users |
| `20250415090053` | Prep para standings |
| `20250416085855` | group → default NULL |
| `20250420092255` | Views de standings |
| `20250627094458` | inviteCode UNIQUE constraint |

---

## Seeds

**Entry:** `prisma/seed.ts`
**Ordem:** tournament → teams → groupMatches → knockoutMatches → users → scoringRules → predictions

**CSVs em `prisma/data/`:** `teams.csv`, `subsolo2_final_standings.csv`, `subsolo2_guesses.csv`, `user_groups_rows.csv`

> [!note] ESM-safe paths em seeds
> Usar `fileURLToPath(new URL(path, import.meta.url))` — não usar `__dirname`.

---

## Links Relacionados

- [[API/Overview]]
- [[API/Data-Models]]
- [[API/UseCases]]
