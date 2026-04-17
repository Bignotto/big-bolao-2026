---
title: Screen — Matches (Partidas)
tags: [screen, tabs, matches]
updated: 2026-04-17
---

# Screen — Matches

**Arquivo:** `app/(tabs)/matches.tsx`
**Rota:** `/(tabs)/matches`

## Propósito

Lista todas as partidas do torneio com filtros por fase, grupo e status.

## Componentes Usados

- `components/matches/MatchFilterControls.tsx` — filtros (fase, grupo, status)
- `components/matches/MatchHeader.tsx` — cabeçalho da rodada
- `components/matches/MatchCard.tsx` — card de cada partida
- [[Components/SegmentedControl]] — controle de abas de filtro

## Filtros Disponíveis

| Filtro | Valores |
|--------|---------|
| Fase | GROUP, ROUND_OF_16, QUARTER_FINAL, SEMI_FINAL, FINAL |
| Status | SCHEDULED, IN_PROGRESS, COMPLETED |
| Grupo | A–H |

## Comportamento

- Toca em `MatchCard` → navega para `match/[id]`
- Dados via endpoint `GET /matches` com filtros aplicados

## Links Relacionados

- [[Components/MatchCard]]
- [[Screens/Screen-MatchDetail]]
- [[API/Endpoints-Matches]]
