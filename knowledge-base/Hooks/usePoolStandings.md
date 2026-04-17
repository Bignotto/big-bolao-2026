---
title: usePoolStandings
tags: [hooks, standings, query]
updated: 2026-04-17
---

# usePoolStandings

**Arquivo:** `hooks/usePoolStandings.ts`

## Propósito

Busca o ranking (leaderboard) do bolão via `GET /pools/:poolId/standings`.

## Retorno

Lista de `StandingsEntry` ordenada por `ranking` (1 = primeiro colocado).

```ts
{
  ranking: number;
  fullName: string;
  profileImageUrl: string | null;
  userId: string;
  totalPoints: number;
  totalPredictions: number;
  exactScoreCount: number;
  pointsRatio: number;
}
```

## Uso

```tsx
const { data, isLoading } = usePoolStandings(poolId);
// data.standings: StandingsEntry[]
```

## Nota

Inclui **todos** os participantes, mesmo os sem palpites (totalPoints = 0).

## Dependências

- [[API/Endpoints-Pools]]
- [[Components/LeaderboardRow]]
- [[Screens/Screen-PoolDetail]]
