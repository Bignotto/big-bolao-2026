---
title: Endpoints — Matches
tags: [api, matches, endpoints]
updated: 2026-04-17
---

# API — Matches (Partidas)

| Método | Path | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/matches` | Sim | Lista partidas (`?tournamentId&round&status&group`) |
| `GET` | `/matches/:matchId` | Sim | Detalhe de uma partida |
| `PUT` | `/matches/:matchId` | Sim (ADMIN) | Atualiza resultado da partida |

## GET /matches

```json
// Response 200
{
  "matches": Match[]
}
```

Filtros via query string: `tournamentId`, `round`, `status`, `group`.

## PUT /matches/:matchId (ADMIN only)

```json
// Request
{
  "homeTeamScore": 2,
  "awayTeamScore": 1,
  "matchStatus": "COMPLETED",
  "hasPenalties": false,
  "hasExtraTime": false
}
```

> [!warning]
> Requer `role === 'ADMIN'`. Visível na UI apenas para admins.

## Tipo Match (domínio)

```ts
{
  id: number;
  tournamentId: number;
  homeTeam: string;
  awayTeam: string;
  homeTeamScore: number | null;
  awayTeamScore: number | null;
  matchDatetime: string;
  stadium: string | null;
  round: string;        // 'GROUP' | 'ROUND_OF_16' | 'QUARTER_FINAL' | ...
  group: string | null;
  matchStatus: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
  hasExtraTime: boolean | null;
  hasPenalties: boolean | null;
  penaltyHomeScore: number | null;
  penaltyAwayScore: number | null;
}
```

## Rounds / Fases

| Valor | Fase |
|-------|------|
| `GROUP` | Fase de grupos |
| `ROUND_OF_16` | Oitavas |
| `QUARTER_FINAL` | Quartas |
| `SEMI_FINAL` | Semifinal |
| `THIRD_PLACE` | Terceiro lugar |
| `FINAL` | Final |
| `LOSERS_MATCH` | Repescagem |

## Componentes Relacionados

- [[Components/MatchCard]]
- [[Screens/Screen-Matches]]
- [[Screens/Screen-MatchDetail]]
