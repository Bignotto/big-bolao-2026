---
title: Screen — Pool Match (Palpites de Partida)
tags: [screen, pool, match, predictions]
updated: 2026-06-22
---

# Screen — Pool Match

**Arquivo:** `app/pool/[id]/match/[matchId].tsx`
**Rota:** `/pool/[id]/match/[matchId]`
**Parâmetros:** `id` = poolId, `matchId` = matchId

## Propósito

Exibe todos os palpites dos participantes do bolão para uma partida específica. Útil para comparar palpites e ver pontuação após o resultado.

## Dados Exibidos

- Cabeçalho da partida: times, placar ao vivo/final, estádio, status
- **`MatchOddsBar`** — barra de distribuição de palpites (casa/empate/fora) com toggle entre escopo bolão e global
- Palpite de cada participante (homeScore × awayScore)
- Pontos ganhos por participante (calculado localmente se `pointsEarned` ainda não foi apurado)

## Hooks

- [[Hooks/usePoolMatchPredictions]] → `GET /pools/:poolId/matches/:matchId/predictions`
- [[Hooks/useMatchPredictionBreakdown]] → `GET /pools/:poolId/matches/:matchId/odds`
- `usePool` → regras de pontuação para cálculo local de pontos
- `usePoolMembers` → resolve nomes/avatares dos participantes

## Componentes Usados

- [[Components/MatchOddsBar]] — barra de odds com toggle pool/global (adicionado 2026-06-22)

## Cálculo de Pontos Local

A tela recalcula pontos localmente quando `pointsEarned` ainda não foi preenchido pelo backend (partida recém-encerrada). Usa `scoringRules` do pool e `phaseMultiplier` baseado no `stage` da partida.

## Links Relacionados

- [[Screens/Screen-PoolDetail]]
- [[API/Endpoints-Pools]]
- [[API/Endpoints-Predictions]]
