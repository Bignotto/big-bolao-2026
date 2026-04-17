---
title: Component — MatchPredictionStatusCard
tags: [component, prediction, match]
updated: 2026-04-17
---

# MatchPredictionStatusCard

**Arquivo:** `components/AppComponents/MatchPredictionStatusCard/index.tsx`

## Propósito

Card que exibe o status do palpite de um usuário para uma partida específica. Mostra palpite feito, resultado real e pontos ganhos.

## Props

```ts
interface MatchPredictionStatusCardProps {
  match: Match;
  prediction?: Prediction | null;
}
```

## Estados Visuais

| Estado | Exibição |
|--------|----------|
| Sem palpite + SCHEDULED | "Palpite pendente" |
| Com palpite + SCHEDULED | Placar do palpite |
| Com palpite + IN_PROGRESS | Palpite + "em andamento" |
| Com palpite + COMPLETED | Palpite vs Resultado + pontos |
| Sem palpite + COMPLETED | "Sem palpite" + 0 pts |

## Usado Em

- [[Screens/Screen-PoolDetail]]
- [[Screens/Screen-PoolMatch]]
