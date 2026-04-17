---
title: Component — ScoreInput
tags: [component, prediction, score]
updated: 2026-04-17
---

# ScoreInput

**Arquivo:** `components/AppComponents/ScoreInput/index.tsx`

## Propósito

Componente especializado para entrada de placar de partida (gols casa × gols fora). Composto por dois `AppNumberInput` com lógica de bloqueio por status da partida.

## Props

```ts
interface ScoreInputProps {
  homeScore: number | undefined;
  awayScore: number | undefined;
  onChangeHome: (value: number) => void;
  onChangeAway: (value: number) => void;
  disabled?: boolean;   // true quando matchStatus !== 'SCHEDULED'
}
```

## Comportamento

- Aceita apenas inteiros ≥ 0
- `disabled=true` quando a partida já começou ou foi concluída
- Usado internamente por [[Components/PoolPredictionMatchCard]]

## Usado Em

- [[Screens/Screen-PoolPredict]]
- [[Components/PoolPredictionMatchCard]]
