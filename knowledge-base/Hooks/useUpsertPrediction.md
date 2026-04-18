---
title: useUpsertPrediction
tags: [hooks, predictions, mutation]
updated: 2026-04-18
---

# useUpsertPrediction

**Arquivo:** `hooks/useUpsertPrediction.ts`

## Propósito

Cria ou atualiza o palpite de placar de um usuário em uma partida dentro de um bolão. É o hook central da tela de palpites.

## Assinatura

```ts
function useUpsertPrediction(poolId: number): UseMutationResult<Prediction, Error, PredictionPayload>
```

## Payload

```ts
type PredictionPayload = {
  poolId: number;
  matchId: number;
  predictedHomeScore: number;
  predictedAwayScore: number;
  predictedHasExtraTime: boolean;
  predictedHasPenalties: boolean;
  predictedPenaltyHomeScore: number | null;  // null = omitido no body
  predictedPenaltyAwayScore: number | null;  // null = omitido no body
  predictionId?: number;  // presente ao atualizar palpite existente
};
```

## Comportamento

1. Se `payload.predictionId` existe → `PUT /predictions/:id` com apenas os campos de placar
2. Se não existe → `POST /predictions` com `poolId`, `matchId` + campos de placar
3. Aplica **optimistic update** antes da resposta do servidor
4. Em erro, reverte o cache ao estado anterior

> [!warning] Campos nulos de pênalti
> `predictedPenaltyHomeScore` e `predictedPenaltyAwayScore` são omitidos do body quando `null`.
> O schema Zod do backend usa `.optional()` (não `.nullable()`) — enviar `null` causa **422**.
> O hook usa spread condicional para omiti-los: `...(value !== null && { field: value })`

> [!note] Separação POST vs PUT
> - **POST body**: inclui `poolId` e `matchId` (necessários para criar)
> - **PUT body**: inclui apenas campos de placar (sem `poolId`, `matchId`, `predictionId`)

## Uso

```tsx
const mutation = useUpsertPrediction(poolId);

mutation.mutate(
  {
    poolId,
    matchId,
    predictedHomeScore: 2,
    predictedAwayScore: 1,
    predictedHasExtraTime: false,
    predictedHasPenalties: false,
    predictedPenaltyHomeScore: null,
    predictedPenaltyAwayScore: null,
    predictionId: existingPrediction?.id,  // undefined para novo palpite
  },
  {
    onSuccess: () => router.back(),
    onError: (err) => Alert.alert('Erro', err.message),
  }
);
```

## Invalidação de Cache

Após `onSettled` (sucesso ou erro), invalida:
- `predictionKeys.byPool(poolId)` — lista de palpites do bolão
- `matchKeys.predictionsMe(matchId)` — status de palpite por partida

## Regras de Negócio

> [!warning]
> - Palpites são bloqueados quando `matchStatus !== 'SCHEDULED'`
> - A UI deve desabilitar `ScoreInput` quando partida já começou
> - `pointsEarned` fica `null` até `matchStatus === 'COMPLETED'`

## Dependências

- [[API/Endpoints-Predictions]]
- [[Components/ScoreInput]]
- [[Screens/Screen-PoolPredict]]
