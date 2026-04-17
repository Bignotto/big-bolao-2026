---
title: Component — LeaderboardRow
tags: [component, leaderboard, standings]
updated: 2026-04-17
---

# LeaderboardRow

**Arquivo:** `components/AppComponents/LeaderboardRow/index.tsx`

## Propósito

Linha do ranking do bolão. Exibe posição, avatar, nome e pontuação do participante.

## Props

```ts
interface LeaderboardRowProps {
  entry: StandingsEntry;
  isCurrentUser?: boolean;
}
```

## Dados Exibidos

| Campo | Origem |
|-------|--------|
| Posição | `entry.ranking` |
| Avatar | `entry.profileImageUrl` (nullable) |
| Nome | `entry.fullName` |
| Pontos | `entry.totalPoints` |
| Palpites | `entry.totalPredictions` |
| Acertos exatos | `entry.exactScoreCount` |

## Usado Em

- [[Screens/Screen-PoolDetail]]

## Relacionados

- [[Hooks/usePoolStandings]]
- [[API/Endpoints-Pools]]
