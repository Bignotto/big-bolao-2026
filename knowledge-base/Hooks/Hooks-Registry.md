---
title: Registry de Hooks
tags: [hooks, react-query, data-fetching]
updated: 2026-06-09
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

---

## useRemovePoolMember

**Arquivo:** `hooks/useRemovePoolMember.ts`
**Tipo:** Mutation
**Endpoint:** `DELETE /pools/:poolId/users/:userId`
**Uso:** Admin remove um participante do bolão

```ts
const removeMutation = useRemovePoolMember(poolId);
removeMutation.mutate(userId);
```

> [!warning] userId deve ser UUID
> O backend valida `userId` como UUID (Supabase). Não enviar CUID.

Invalida: `poolKeys.members`, `poolKeys.detail`
Ver: [[Screens/Screen-PoolDetail]]

---

## useLeavePool

**Arquivo:** `hooks/useLeavePool.ts`
**Tipo:** Mutation
**Endpoint:** `DELETE /pools/:poolId/users/me`
**Uso:** Usuário sai do bolão (apenas membros não-admin)

```ts
const leaveMutation = useLeavePool(poolId);
await leaveMutation.mutateAsync();
```

> [!note] Sem corpo na requisição
> O `apiFetch` omite o header `Content-Type` quando não há body — necessário para que o backend aceite o DELETE.

Invalida: `poolKeys.all`
Ver: [[Screens/Screen-PoolDetail]]

---

## useLiveMatches

**Arquivo:** `hooks/useLiveMatches.ts`
**Tipo:** Query (polling)
**Endpoint:** `GET /tournaments/:id/matches?status=IN_PROGRESS` + `GET /matches/:id/predictions/me`
**Uso:** Partidas em andamento com palpites e pontuação em tempo real

- Polling a cada 30s enquanto a tela estiver em foco (`useFocusEffect`)
- Retorna `LiveMatchEntry[]` com swing de pontos calculado via `computeSwing`
- Seleciona o bolão de melhor performance quando o usuário tem palpites em múltiplos bolões

Ver: [[Hooks/useLiveMatches]], [[Hooks/useMyMatchPredictions]]

---

## useMyMatchPredictions

**Arquivo:** `hooks/useMyMatchPredictions.ts`
**Tipo:** Query
**Endpoint:** `GET /matches/:matchId/predictions/me`
**Uso:** Palpites do usuário logado para uma partida, em todos os seus bolões

- Desabilitado enquanto `matchId` for `undefined`
- `staleTime: 30_000`

Ver: [[Hooks/useMyMatchPredictions]]

---

## useMatchPoolPredictions

**Arquivo:** `hooks/useMatchPoolPredictions.ts`
**Tipo:** Query (composição)
**Endpoints:** `useMatch` + `useMyMatchPredictions` + `usePools`
**Uso:** Agrega dados de partida + palpites + bolões para a tela de detalhe de partida

- Refetch on focus via `useFocusEffect` para refletir edições da tela de palpite
- Retorna `PoolPredictionItem[]` enriquecido com `scoringRules` e `participantsCount`

Ver: [[Hooks/useMatchPoolPredictions]]

---

## useShareRanking

**Arquivo:** `hooks/useShareRanking.ts`
**Tipo:** UI utility (sem query/mutation)
**Uso:** Captura card de ranking como PNG e compartilha via share sheet ou salva na galeria

```ts
const { shareRanking, saveToGallery, sharing } = useShareRanking(cardRef);
```

- Requer `react-native-view-shot`, `expo-sharing`, `expo-media-library`
- `saveToGallery` solicita permissão antes de salvar; retorna `false` se negado

Ver: [[Hooks/useShareRanking]]
