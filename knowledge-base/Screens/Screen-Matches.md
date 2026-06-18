---
title: Screen — Matches (Partidas)
tags: [screen, tabs, matches]
updated: 2026-06-14
---

# Screen — Matches

**Arquivo:** `app/(tabs)/matches.tsx`
**Rota:** `/(tabs)/matches`

## Propósito

Lista todas as partidas do torneio com dois modos de navegação: por grupo (fase de grupos + mata-mata) ou por data.

## Modos de Exibição

| Modo | Chip seletor | Conteúdo |
|------|-------------|----------|
| `group-stage` | Grupos A–H + fases mata-mata | `GroupView` ou `KnockoutView` |
| `by-date` | Pills de data | `DateView` (FlatList filtrada por dia) |

O switcher "Por grupo / Por data" controla o `mode` local. Dentro do modo `group-stage`, os chips determinam se o view é `GroupView` (grupo A–H) ou `KnockoutView` (fase mata-mata).

## Sub-componentes internos

### `GroupView`
- Cabeçalho com letra do grupo + contagem de jogos/rodadas
- `GroupStandingsTable` — mini tabela de classificação calculada localmente com `computeGroupStandings()`
- Seções de rodada com label `RODADA N · SEG DD MMM`, agrupadas por `groupByRound()`
- Cards agrupados em `roundCard` usando `MatchCard`

### `KnockoutView`
- `FlatList` filtrada por `MatchStage` via `filterByStage()`
- Pull-to-refresh via `RefreshControl`

### `DateView`
- `FlatList` filtrada por data local via `filterByDate()`
- Pull-to-refresh via `RefreshControl`
- Data padrão: o próximo dia com partidas (`getDefaultMatchDate()`)

### `GroupStandingsTable`
- Calculada em `computeGroupStandings(matches, group)` — lógica local, sem API
- Ordena por pontos, depois saldo de gols
- Top 2 posições destacadas com `theme.colors.pitch`

### `Flag`
- Imagem da bandeira via `team.flagUrl`; fallback com `countryCode.slice(0,2)`

## State local

| Estado | Tipo | Descrição |
|--------|------|-----------|
| `mode` | `MatchFilterMode` | `'group-stage'` ou `'by-date'` |
| `selectedChip` | `MatchFilterChipValue` | Grupo A–H ou `MatchStage` |
| `selectedDate` | `string \| null` | Data ISO selecionada (null = defaultDate) |

## Helpers / Imports-chave

- `filterByGroup`, `filterByStage`, `filterByDate`, `groupByRound` — `domain/helpers/matchFilters`
- `getAvailableDates`, `getDefaultMatchDate`, `isGroupChip`, `ALL_MATCH_FILTER_CHIPS` — `components/matches/MatchFilterControls`
- `MatchCard` — `components/AppComponents/MatchCard`
- `useMatches` — hook de dados

## Comportamento

- Toca em `MatchCard` → navega para `match/[id]`
- Dados via `useMatches()` (GET /matches)
- Classificação do grupo calculada localmente (sem endpoint dedicado)

## Links Relacionados

- [[Components/MatchCard]]
- [[Screens/Screen-MatchDetail]]
- [[API/Endpoints-Matches]]
