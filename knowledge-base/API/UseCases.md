---
title: API — Use Cases
tags: [api, use-cases, business-logic]
updated: 2026-04-17
---

# API — Catálogo de Use Cases

Todos em `src/useCases/`. Cada use case:
1. Recebe repositórios via construtor (DI via factory)
2. Implementa regras de negócio — sem I/O HTTP direto
3. Lança erros de domínio tipados (não HTTP codes)

---

## Pools

### createPoolUseCase
**Regras:**
- Pool privado obriga `inviteCode` → `InviteCodeRequiredError`
- Nome único no sistema → `PoolNameInUseError`
- Creator e Tournament devem existir → `ResourceNotFoundError`
- Cria `ScoringRule` automaticamente com defaults
- Creator vira participante automaticamente

**ScoringRule defaults:**
```
exactScorePoints: 3  |  correctWinnerGoalDiffPoints: 2  |  correctWinnerPoints: 1
correctDrawPoints: 1  |  specialEventPoints: 5
knockoutMultiplier: 1.5  |  finalMultiplier: 2.0
```

### getPoolUseCase
Busca pool por ID com participants e scoringRules (`PoolCompleteInfo`).

### listPublicPoolsUseCase
Pools públicos com paginação (`page`, `perPage`, `name?`).

### updatePoolUseCase
Atualiza nome/descrição. Requer ser o criador.

### getPoolByInviteUseCase
Busca pool pelo `inviteCode` (preview antes de entrar).

### joinPoolByIdUseCase
Entrar em pool público por ID.
- Não pode exceder `maxParticipants` → `MaxParticipantsError`
- Prazo não pode ter passado → `DeadlineError`

### joinPoolByInviteUseCase
Entrar em pool via `inviteCode`.

### leavePoolUseCase
Sair do pool.
- Criador não pode sair → `UnauthorizedError`
- Usuário deve ser participante → `NotParticipantError`

### removeUserFromPoolUseCase
Dono remove outro participante.
- Requer ser criador → `NotPoolCreatorError`

### getPoolUsersUseCase
Lista participantes. Requer ser participante.

### getPoolStandingsUseCase
Ranking via view `pool_standings`.

### getUserPoolsUseCase
Pools em que o usuário participa.

### getPoolMatchPredictionsUseCase
Palpites de todos no pool para uma partida.

### getPoolsPredictionsUseCase
Todos os palpites de um pool (todas as partidas).

### updateScoringRulesUseCase
Atualiza regras. Requer ser criador.
> [!warning] Retroativo — recalcula pontos históricos imediatamente via view SQL.

---

## Matches

### getMatchUseCase
Busca partida por ID.

### updateMatchUseCase
Atualiza resultado. **Requer `role === ADMIN`.**

### getMatchPredictionsUseCase
Palpites de todos os usuários numa partida.

---

## Users

### createUserUseCase
Cria usuário no banco da aplicação (primeiro login via Supabase).

### getLoggedUserInfoUseCase / getUserUseCase
Busca dados do usuário logado ou por ID.

### updateUserUseCase
Atualiza `fullName` e/ou `profileImageUrl`.

### getUserPredictionsUseCase
Lista palpites do usuário com info do pool.

### getUserPoolsStandingsUseCase
Standings do usuário em todos os seus pools.

---

## Predictions

### createPredictionUseCase
Cria palpite.
- Partida deve estar `SCHEDULED` → erro se já iniciada
- Usuário deve ser participante → `NotParticipantError`
- Constraint única `(userId + poolId + matchId)` → 409 se duplicado

### updatePredictionUseCase
Atualiza palpite. Partida ainda deve ser `SCHEDULED`.

### getPredictionUseCase
Busca palpite por ID.

### getMyMatchPredictionsUseCase
Palpites do usuário logado para uma partida em todos os seus pools.

---

## Tabela de Erros

| Erro | Módulo | HTTP |
|------|--------|------|
| `ResourceNotFoundError` | global | 404 |
| `PoolNameInUseError` | pools | 409 |
| `InviteCodeRequiredError` | pools | 422 |
| `MaxParticipantsError` | pools | 409 |
| `DeadlineError` | pools | 409 |
| `NotParticipantError` | pools | 403 |
| `NotPoolCreatorError` | pools | 403 |
| `UnauthorizedError` | pools | 403 |
| `MatchUpdateError` | matches | 400 |

## Links Relacionados

- [[API/Architecture]]
- [[API/Database]]
- [[API/Endpoints-Pools]]
- [[API/Endpoints-Predictions]]
