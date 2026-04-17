---
title: useUpsertPrediction
tags: [hooks, predictions, mutation]
updated: 2026-04-17
---

# useUpsertPrediction

**Arquivo:** `hooks/useUpsertPrediction.ts`

## Propósito

Cria ou atualiza o palpite de placar de um usuário em uma partida dentro de um bolão. É o hook central da tela de palpites.

## Comportamento

1. Verifica se existe palpite para `(poolId + matchId)` do usuário
2. Se **não existe** → `POST /predictions`
3. Se **existe** → `PUT /predictions/:id`

## Uso

```tsx
const { mutate: upsertPrediction, isPending } = useUpsertPrediction();

upsertPrediction({
  poolId: 1,
  matchId: 42,
  homeTeamScore: 2,
  awayTeamScore: 1,
});
```

## Invalidação de Cache

Após sucesso, invalida as query keys de predições e standings do bolão para sincronizar dados.

## Regras de Negócio

> [!warning]
> - Palpites são bloqueados quando `matchStatus !== 'SCHEDULED'`
> - A UI deve desabilitar `ScoreInput` quando partida já começou
> - `pointsEarned` fica `null` até `matchStatus === 'COMPLETED'`

## Dependências

- [[API/Endpoints-Predictions]]
- [[Components/ScoreInput]]
- [[Screens/Screen-PoolPredict]]
