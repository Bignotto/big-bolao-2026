---
title: Component — MatchCard
tags: [component, match, card]
updated: 2026-04-17
---

# MatchCard

**Arquivos:**
- `components/AppComponents/MatchCard/index.tsx` (versão design system)
- `components/matches/MatchCard.tsx` (versão de listagem)

## Propósito

Exibe informações resumidas de uma partida: times, placar (ou horário se não iniciada), status e fase.

## Props (aproximado)

```ts
interface MatchCardProps {
  match: Match;
  onPress?: () => void;
}
```

## Indicadores Visuais

| Status | Exibição |
|--------|----------|
| `SCHEDULED` | Data/hora da partida |
| `IN_PROGRESS` | "Ao vivo" + placar parcial |
| `COMPLETED` | Placar final |

## Usado Em

- [[Screens/Screen-Matches]]
- [[Screens/Screen-MatchDetail]]
- [[Screens/Screen-PoolMatch]]

## Relacionados

- [[Components/MatchPredictionStatusCard]]
- [[Components/PoolPredictionMatchCard]]
- [[API/Endpoints-Matches]]
