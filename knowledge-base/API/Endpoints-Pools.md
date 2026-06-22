---
title: Endpoints — Pools
tags: [api, pools, endpoints]
updated: 2026-06-22
---

# API — Pools & Pool Invites

## Pools

| Método | Path | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/pools` | Sim | Lista bolões públicos (`?page&perPage&name`) |
| `POST` | `/pools` | Sim | Cria novo bolão |
| `GET` | `/pools/:poolId` | Sim | Detalhe do bolão |
| `PUT` | `/pools/:poolId` | Sim | Atualiza bolão (apenas dono) |
| `GET` | `/pools/:poolId/users` | Sim | Participantes |
| `POST` | `/pools/:poolId/users` | Sim | Entrar em bolão público |
| `DELETE` | `/pools/:poolId/users/me` | Sim | Sair do bolão |
| `DELETE` | `/pools/:poolId/users/:userId` | Sim | Remover participante (apenas dono) |
| `GET` | `/pools/:poolId/matches/:matchId/predictions` | Sim | Palpites de uma partida específica dentro do bolão |
| `GET` | `/pools/:poolId/predictions` | Sim | Todos os palpites do bolão (todas as partidas) |
| `GET` | `/pools/:poolId/standings` | Sim | Ranking do bolão |
| `PUT` | `/pools/:poolId/scoring-rules` | Sim | Atualizar regras de pontuação (apenas dono) |
| `GET` | `/pools/:poolId/odds` | Sim | Distribuição de palpites para todas as partidas (pool + global) |
| `GET` | `/pools/:poolId/matches/:matchId/odds` | Sim | Distribuição de palpites para uma partida (pool + global) |

## Pool Invites

| Método | Path | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/pool-invites/:inviteCode` | Sim | Preview do bolão pelo código |
| `POST` | `/pool-invites/:inviteCode` | Sim | Entrar no bolão pelo código |

## POST /pools — Criar Bolão

```json
// Request
{
  "name": "Meu Bolão",
  "description": "opcional",
  "tournamentId": 1,
  "isPrivate": false,
  "inviteCode": "MYCODE",
  "maxParticipants": 20,
  "registrationDeadline": "2026-06-01T00:00:00Z"
}
// Response 201
{ "pool": Pool }
```

## GET /pools/:poolId/standings — Ranking

```json
// Response 200
{
  "standings": [{
    "ranking": 1,
    "fullName": "João",
    "profileImageUrl": "...",
    "userId": "uuid",
    "poolId": 1,
    "totalPredictions": 4,
    "totalPoints": 22,
    "exactScoreCount": 2,
    "pointsRatio": 0.88,
    "guessRatio": 0.5,
    "predictionsRatio": 1.0
  }]
}
```

> [!note]
> Inclui todos os participantes, mesmo sem palpites. Ideal para tela de leaderboard e lista de membros.

## PUT /pools/:poolId/scoring-rules

```json
// Request (todos os campos opcionais — defaults abaixo são os valores iniciais)
{
  "exactScorePoints": 3,
  "correctWinnerGoalDiffPoints": 2,
  "correctWinnerPoints": 1,
  "correctDrawPoints": 1,
  "specialEventPoints": 5,
  "knockoutMultiplier": 1.5,
  "finalMultiplier": 2.0
}
```

> [!warning] Regra de negócio
> Alterações nas regras de pontuação são **retroativas** — pontos históricos são recalculados imediatamente.

## GET /pools/:poolId/matches/:matchId/predictions — Palpites de uma Partida

```json
// Response 200
{
  "predictions": [{
    "id": 1,
    "homeTeamScore": 2,
    "awayTeamScore": 1,
    "pointsEarned": 3,
    "createdAt": "2026-06-10T18:00:00Z",
    "user": {
      "id": "uuid",
      "fullName": "João Silva",
      "profileImageUrl": "https://..."
    },
    "match": {
      "id": 42,
      "homeTeamId": 1,
      "awayTeamId": 2,
      "homeTeamScore": 2,
      "awayTeamScore": 1,
      "status": "FINISHED"
    }
  }]
}
```

> [!note]
> Retorna apenas palpites dos participantes **deste bolão** para a partida especificada. Requer que o usuário autenticado seja participante do bolão.

## GET /pools/:poolId/matches/:matchId/odds — Distribuição de Palpites

Requer que o usuário autenticado seja participante ou criador do bolão.

```json
// Response 200
{
  "matchId": 42,
  "global": {
    "total": 150,
    "homeWinsPercentage": 45.33,
    "drawPercentage": 22.0,
    "awayWinsPercentage": 32.67
  },
  "pool": {
    "total": 12,
    "homeWinsPercentage": 50.0,
    "drawPercentage": 16.67,
    "awayWinsPercentage": 33.33
  }
}
```

> [!note]
> `GET /pools/:poolId/odds` retorna a mesma estrutura para **todas** as partidas do torneio em um array.
> Partidas sem palpites retornam `total: 0` e todos os percentuais `0`.

- **Response 403** — Usuário não é participante do bolão
- **Response 404** — Bolão ou partida não encontrada

## Hooks Relacionados

- [[Hooks/useCreatePool]]
- [[Hooks/useSearchPools]]
- [[Hooks/usePoolStandings]]
- [[Hooks/usePoolMembers]]
- [[Hooks/useUpdateScoringRules]]
- [[Hooks/useMatchPredictionBreakdown]]
