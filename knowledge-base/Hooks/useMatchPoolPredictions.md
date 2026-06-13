---
title: useMatchPoolPredictions
tags: [hooks, matches, predictions, query, composition]
updated: 2026-06-09
---

# useMatchPoolPredictions

**Arquivo:** `hooks/useMatchPoolPredictions.ts`

## Propósito

Hook de composição que agrega dados de partida, palpites do usuário e informações dos bolões em uma única interface. Usado na tela de detalhe de partida para exibir o palpite do usuário em cada bolão que ele participa.

## Assinatura

```ts
function useMatchPoolPredictions(matchId: number | undefined): {
  match: Match | undefined;
  poolPredictions: PoolPredictionItem[];
  isLoading: boolean;
  refetch: () => void;
}
```

## Tipo de Retorno (PoolPredictionItem)

```ts
type PoolPredictionItem = {
  poolId: number;
  poolName: string;
  participantsCount: number | null;
  userRank: number | null;
  prediction: MyMatchPredictionEntry['prediction'];  // null = sem palpite
  scoringRules: ScoringRules | null;
};
```

## Comportamento

1. Compõe três hooks: `useMatch`, `useMyMatchPredictions`, `usePools`
2. Usa `useFocusEffect` para fazer `refetch` dos palpites toda vez que a tela recebe foco — garante que edições feitas na tela de palpite sejam refletidas ao voltar
3. Cruza `predsQuery.data` com `poolsById` (Map por ID) para enriquecer cada palpite com `participantsCount` e `scoringRules` do bolão
4. `isLoading` é `true` enquanto qualquer um dos três hooks estiver carregando

> [!tip] Refetch on focus
> O `useFocusEffect` aqui é essencial: sem ele, o usuário palpitaria, voltaria à tela de partida e veria o estado antigo (sem o palpite recém-criado).

## Uso

```tsx
const { match, poolPredictions, isLoading } = useMatchPoolPredictions(matchId);
```

## Dependências

- [[useMyMatchPredictions]] — palpites do usuário por bolão para a partida
- `useMatch` — dados da partida
- `usePools` — lista de bolões do usuário (para enriquecer com `scoringRules` e `participantsCount`)
