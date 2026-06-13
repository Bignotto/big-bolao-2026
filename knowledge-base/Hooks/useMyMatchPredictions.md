---
title: useMyMatchPredictions
tags: [hooks, predictions, query]
updated: 2026-06-09
---

# useMyMatchPredictions

**Arquivo:** `hooks/useMyMatchPredictions.ts`

## Propósito

Busca os palpites do usuário logado para uma partida específica, em todos os bolões em que ele participa. Retorna um array com o palpite por bolão (ou `null` se o usuário ainda não palpitou naquele bolão).

## Assinatura

```ts
function useMyMatchPredictions(matchId: number | undefined): UseQueryResult<MyMatchPredictionEntry[]>
```

## Retorno

Array de `MyMatchPredictionEntry` (definido em `@/domain/entities/MatchPredictionStatus`):

```ts
type MyMatchPredictionEntry = {
  poolId: number;
  poolName: string;
  userRank: number | null;
  prediction: { ... } | null;  // null = sem palpite ainda
};
```

## Comportamento

- Desabilitado (`enabled: false`) enquanto `matchId` for `undefined`
- `staleTime: 30_000` — evita re-fetch agressivo ao navegar entre telas
- Usado como base por [[useMatchPoolPredictions]] (refetch on focus) e [[useLiveMatches]] (polling 30s)

## Endpoint

`GET /matches/:matchId/predictions/me`  
(via `fetchMyMatchPredictions` em `@/data/api/matches`)

## Uso

```tsx
const { data: predictions, isLoading } = useMyMatchPredictions(matchId);
```

## Dependências

- `matchKeys.predictionsMe(matchId)` — query key
- [[useLiveMatches]] — usa em paralelo para múltiplas partidas via `useQueries`
- [[useMatchPoolPredictions]] — wrapper que adiciona refetch on focus
