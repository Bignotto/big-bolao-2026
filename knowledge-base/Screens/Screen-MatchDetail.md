---
title: Screen — Match Detail (Detalhe de Partida)
tags: [screen, match]
updated: 2026-04-17
---

# Screen — Match Detail

**Arquivo:** `app/match/[id].tsx`
**Rota:** `/match/[id]`
**Parâmetro:** `id` = matchId

## Propósito

Exibe detalhes completos de uma partida: placar, times, estádio, fase, horário, e resultado de prorrogação/pênaltis se aplicável.

## Dados da Partida

- Times (casa / fora) com nomes
- Placar (`homeTeamScore`, `awayTeamScore`)
- Placar de pênaltis (`penaltyHomeScore`, `penaltyAwayScore`)
- Status (`SCHEDULED`, `IN_PROGRESS`, `COMPLETED`)
- Fase (`round`) e grupo
- Estádio e data/hora

## Componentes Usados

- `components/matches/MatchHeader.tsx`
- [[Components/MatchCard]]

## Admin Panel

Se `apiUser.role === 'ADMIN'`, exibe controles para atualizar resultado via `PUT /matches/:id`.

## Links Relacionados

- [[Screens/Screen-Matches]]
- [[API/Endpoints-Matches]]
