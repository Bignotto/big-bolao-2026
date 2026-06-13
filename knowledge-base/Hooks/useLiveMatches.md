---
title: useLiveMatches
tags: [hooks, matches, real-time, query]
updated: 2026-06-09
---

# useLiveMatches

**Arquivo:** `hooks/useLiveMatches.ts`

## Propósito

Busca partidas `IN_PROGRESS` do torneio e, para cada uma, os palpites do usuário em todos os seus bolões. Calcula o `currentPointsSwing` (pontos que o usuário está ganhando/perdendo em tempo real) e expõe o bolão onde a performance atual é melhor.

## Assinatura

```ts
function useLiveMatches(): {
  liveMatchesWithMyPredictions: LiveMatchEntry[];
  isLoading: boolean;
}
```

## Tipo de Retorno

```ts
type LiveMatchEntry = {
  match: Match;
  poolId: number | null;          // null = usuário não tem palpite
  poolName: string | null;
  participantsCount: number | null;
  userRank: number | null;
  predictedHomeScore: number | null;
  predictedAwayScore: number | null;
  currentPointsSwing: number | null;
};
```

## Comportamento

1. Usa `useFocusEffect` para ativar polling apenas quando a tela está em foco
2. Busca partidas `IN_PROGRESS` via `GET /tournaments/:id/matches?status=IN_PROGRESS`
3. Para cada partida, busca palpites do usuário em paralelo (`useQueries`)
4. Ambas as queries têm `refetchInterval: 30_000` enquanto focadas e `staleTime: 0`
5. Se o usuário tem palpites em vários bolões para a mesma partida, seleciona o bolão onde o `computeSwing` atual é maior
6. Usa `DEFAULT_SCORING_RULES` para calcular o swing (não as regras específicas de cada bolão)

> [!note] Polling condicionado ao foco
> O `refetchInterval` é `false` quando a tela perde foco, evitando requests desnecessários em background.

> [!warning] DEFAULT_SCORING_RULES
> O cálculo de swing usa as regras padrão, não as regras customizadas de cada bolão. Para exibição na live card isso é aceitável, mas não reflete customizações do organizador.

## Query Keys

- `matchKeys.byTournament(TOURNAMENT_ID, { status: 'IN_PROGRESS' })`
- `matchKeys.predictionsMe(matchId)` — uma por partida ao vivo

## Uso

```tsx
const { liveMatchesWithMyPredictions, isLoading } = useLiveMatches();
```

## Dependências

- [[useMyMatchPredictions]] — chamado via `useQueries` para cada partida
- `computeSwing` + `DEFAULT_SCORING_RULES` em `@/lib/scoring`
- `mapMatch` em `@/data/mappers/matchMapper`
