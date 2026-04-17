---
title: Component — PoolPredictionMatchCard
tags: [component, prediction, pool, match]
updated: 2026-04-17
---

# PoolPredictionMatchCard

**Arquivo:** `components/AppComponents/PoolPredictionMatchCard/index.tsx`

## Propósito

Card de palpite na tela de palpites do bolão. Combina informações da partida com o [[Components/ScoreInput]] para entrada ou visualização do palpite.

## Props

```ts
interface PoolPredictionMatchCardProps {
  match: Match;
  prediction?: Prediction | null;
  onSave: (homeScore: number, awayScore: number) => void;
  isSaving?: boolean;
}
```

## Comportamento

- Partida SCHEDULED: mostra `ScoreInput` habilitado
- Partida IN_PROGRESS/COMPLETED: mostra palpite e desabilita input
- Após salvar: exibe feedback de sucesso

## Usado Em

- [[Screens/Screen-PoolPredict]]

## Relacionados

- [[Components/ScoreInput]]
- [[Hooks/useUpsertPrediction]]
