---
title: Domain Entities
tags: [domain, entities, typescript]
updated: 2026-06-14
---

# Entidades de Domínio

Localizadas em `domain/entities/`, `domain/enums/` e `domain/helpers/`.

## Arquitetura

```
data/dto/MatchDTO.ts          ← shape bruto da API
data/mappers/matchMapper.ts   ← converte DTO → entidade
domain/entities/Match.ts      ← entidade de domínio tipada
```

> [!note] Regra de camadas
> Nunca use DTOs diretamente nas telas. Sempre mapeie para entidades de domínio via `mappers/`.

## Match

**Arquivo:** `domain/entities/Match.ts`

Entidade de domínio para partidas.

Campos principais: `id`, `tournamentId`, `homeTeam`, `awayTeam`, `homeTeamScore`, `awayTeamScore`, `matchStatus`, `matchDatetime`, `stage`, `group` (string | null), `stadium` (string | null), `hasExtraTime`, `hasPenalties`, `penaltyHomeScore`, `penaltyAwayScore`, `createdAt`, `updatedAt`.

### `isMatchLocked(match)`

```ts
export function isMatchLocked(match: Pick<Match, 'matchDatetime'>): boolean
```

Retorna `true` se o horário de início já passou. Compara como naive string no fuso de São Paulo (`America/Sao_Paulo`) — não usa UTC. Usar para bloquear steppers e formulário de palpite antes de checar `matchStatus`.

> [!warning]
> `matchDatetime` é armazenado como horário local de São Paulo sem offset. Não compare com `new Date()` direto — use `toLocaleString('sv', { timeZone: 'America/Sao_Paulo' })`.

## MatchPredictionStatus

**Arquivo:** `domain/entities/MatchPredictionStatus.ts`

Representa o status de um palpite em relação a uma partida (sem palpite, palpite feito, acertou, etc.).

## PoolMatchPrediction

**Arquivo:** `domain/entities/PoolMatchPrediction.ts`

Agrega dados de partida + palpite do usuário para exibição na tela de palpites do bolão.

## MatchFilters

**Arquivo:** `domain/entities/MatchFilters.ts`

Filtros aplicáveis na listagem de partidas (fase, status, grupo).

## PredictionKeys

**Arquivo:** `domain/entities/PredictionKeys.ts` (ou `hooks/predictionKeys.ts`)

Query keys tipadas para TanStack Query.

## Enums e Helpers

- `domain/enums/` — `MatchStatus`, `UserRole`, etc.
- `domain/helpers/` — funções puras como `isMatchEditable(match)`, `calculatePoints(...)`, etc.

## Links Relacionados

- [[API/Data-Models]]
- [[API/Endpoints-Matches]]
- [[API/Endpoints-Predictions]]
