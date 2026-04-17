---
title: Domain Entities
tags: [domain, entities, typescript]
updated: 2026-04-17
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

Entidade de domínio para partidas. Derivada de `MatchDTO` via `matchMapper.ts`.

Campos principais: `id`, `homeTeam`, `awayTeam`, `homeTeamScore`, `awayTeamScore`, `matchStatus`, `matchDatetime`, `round`, `group`, `stadium`, campos de pênalti e tempo extra.

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
