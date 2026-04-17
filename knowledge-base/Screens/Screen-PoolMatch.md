---
title: Screen — Pool Match (Palpites de Partida)
tags: [screen, pool, match, predictions]
updated: 2026-04-17
---

# Screen — Pool Match

**Arquivo:** `app/pool/[id]/match/[matchId].tsx`
**Rota:** `/pool/[id]/match/[matchId]`
**Parâmetros:** `id` = poolId, `matchId` = matchId

## Propósito

Exibe todos os palpites dos participantes do bolão para uma partida específica. Útil para comparar palpites e ver pontuação após o resultado.

## Dados Exibidos

- Informações da partida (times, placar, horário)
- Palpite de cada participante (homeScore × awayScore)
- Pontos ganhos por participante (`pointsEarned`)

## Hooks

- [[Hooks/usePoolMatchPredictions]] → `GET /pools/:poolId/matches/:matchId/predictions`

## Componentes Usados

- [[Components/MatchCard]] — cabeçalho com info da partida
- [[Components/MatchPredictionStatusCard]] — palpite por usuário

## Links Relacionados

- [[Screens/Screen-PoolDetail]]
- [[API/Endpoints-Predictions]]
