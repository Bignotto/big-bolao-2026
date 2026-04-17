---
title: Data Models
tags: [api, types, typescript, domain]
updated: 2026-04-17
---

# Data Models — Tipos TypeScript

## Pool

```ts
type Pool = {
  id: number;
  name: string;
  description: string | null;
  tournamentId: number;
  ownerId: string;
  isPrivate: boolean;
  inviteCode: string | null;
  maxParticipants: number | null;
  registrationDeadline: string | null;
  participantsCount: number;
  isParticipant: boolean;
  scoringRules: ScoringRules;
  createdAt: string;
};
```

## ScoringRules

```ts
type ScoringRules = {
  exactScorePoints: number;            // padrão: 3
  correctWinnerGoalDiffPoints: number; // padrão: 2
  correctWinnerPoints: number;         // padrão: 1
  correctDrawPoints: number;           // padrão: 1
  specialEventPoints: number;          // padrão: 5
  knockoutMultiplier: number;          // padrão: 1.5
  finalMultiplier: number;             // padrão: 2.0
};
```

> [!note] Fonte
> Defaults confirmados em `createPoolUseCase.ts` (API). Campos `correctDrawPoints` e `specialEventPoints` existem no banco mas podem não ser expostos na UI ainda.

## Match (ver [[API/Endpoints-Matches]])

## Prediction (ver [[API/Endpoints-Predictions]])

## Standings Entry

```ts
type StandingsEntry = {
  ranking: number;
  fullName: string;
  profileImageUrl: string | null;
  userId: string;
  poolId: number;
  totalPredictions: number;
  totalPoints: number;
  exactScoreCount: number;
  pointsRatio: number;
  guessRatio: number;
  predictionsRatio: number;
};
```

## ApiUser (ver [[State-Management/SessionContext]])

## Entidades de Domínio

Ver [[Utils/Domain-Entities]] para `Match`, `PoolMatchPrediction`, `MatchPredictionStatus` e demais entidades do layer `domain/`.
