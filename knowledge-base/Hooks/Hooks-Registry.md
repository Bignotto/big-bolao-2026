---
title: Registry de Hooks
tags: [hooks, react-query, data-fetching]
updated: 2026-04-17
---

# Registry de Hooks

Todos os hooks de dados em `hooks/`. Usam TanStack Query v5.

## Convenções

- Arquivos `*Keys.ts` exportam query keys tipadas (ex: `predictionKeys`, `poolKeys`)
- Hooks de leitura: `useQuery` → retornam `{ data, isLoading, error }`
- Hooks de mutação: `useMutation` → retornam `{ mutate, isPending, error }`

---

## useCreatePool

**Arquivo:** `hooks/useCreatePool.ts`
**Tipo:** Mutation
**Endpoint:** `POST /pools`
**Uso:** Criar novo bolão

```ts
const { mutate: createPool, isPending } = useCreatePool();
createPool({ name, tournamentId, isPrivate, ... });
```

Ver: [[Screens/Screen-CreatePool]], [[API/Endpoints-Pools]]

---

## useSearchPools

**Arquivo:** `hooks/useSearchPools.ts`
**Tipo:** Query
**Endpoint:** `GET /pools?name=...`
**Uso:** Buscar bolões públicos para entrar

Ver: [[Screens/Screen-FindPool]]

---

## usePoolStandings

**Arquivo:** `hooks/usePoolStandings.ts`
**Tipo:** Query
**Endpoint:** `GET /pools/:poolId/standings`
**Uso:** Ranking/leaderboard do bolão

Ver: [[Screens/Screen-PoolDetail]], [[Components/LeaderboardRow]]

---

## usePoolMembers

**Arquivo:** `hooks/usePoolMembers.ts`
**Tipo:** Query
**Endpoint:** `GET /pools/:poolId/users`
**Uso:** Lista de participantes do bolão

---

## useUpsertPrediction

**Arquivo:** `hooks/useUpsertPrediction.ts`
**Tipo:** Mutation
**Endpoint:** `POST /predictions` ou `PUT /predictions/:id`
**Uso:** Criar ou atualizar palpite de placar

> [!tip] Upsert logic
> Verifica se já existe palpite para (poolId + matchId). Se sim, faz PUT; caso contrário, POST.

Ver: [[Screens/Screen-PoolPredict]], [[API/Endpoints-Predictions]]

---

## usePredictions

**Arquivo:** `hooks/usePredictions.ts`
**Tipo:** Query
**Endpoint:** `GET /predictions?poolId&matchId`
**Uso:** Lista palpites do usuário

---

## useMyMatchPredictions

**Arquivo:** `hooks/useMyMatchPredictions.ts`
**Tipo:** Query
**Endpoint:** `GET /predictions`
**Uso:** Palpites do usuário logado para partidas de um bolão

---

## usePoolMatchPredictions

**Arquivo:** `hooks/usePoolMatchPredictions.ts`
**Tipo:** Query
**Endpoint:** `GET /pools/:poolId/matches/:matchId/predictions`
**Uso:** Palpites de todos os participantes do bolão para uma partida específica

Ver: [[Screens/Screen-PoolMatch]]

---

## useUpdateProfile

**Arquivo:** `hooks/useUpdateProfile.ts`
**Tipo:** Mutation
**Endpoint:** `PUT /users/me`
**Uso:** Atualizar nome e foto do perfil

Ver: [[Screens/Screen-Profile]]

---

## useUpdateScoringRules

**Arquivo:** `hooks/useUpdateScoringRules.ts`
**Tipo:** Mutation
**Endpoint:** `PUT /pools/:poolId/scoring-rules`
**Uso:** Dono do bolão altera regras de pontuação

Ver: [[Screens/Screen-PoolSettings]], [[API/Endpoints-Pools]]
