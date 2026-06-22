---
title: Component — MatchOddsBar
tags: [component, match, predictions, odds]
updated: 2026-06-22
---

# Component — MatchOddsBar

**Arquivo:** `components/matches/MatchOddsBar.tsx`

## Propósito

Exibe a distribuição de palpites de uma partida (vitória mandante / empate / vitória visitante) como uma barra segmentada proporcional. Permite alternar entre escopo **TODOS** (global) e **GRUPO** (bolão).

## Props

```ts
interface MatchOddsBarProps {
  homeName: string;              // nome do time mandante
  awayName: string;              // nome do time visitante
  pool?: MatchPredictionBreakdown;   // contagens do bolão
  global?: MatchPredictionBreakdown; // contagens globais
  myPick?: 'HOME' | 'DRAW' | 'AWAY'; // destaca o palpite do usuário nas legendas
  isLoading?: boolean;           // mostra skeleton de carregamento
}
```

## Comportamento

- Toggle `TODOS / GRUPO` no cabeçalho troca a fonte de dados sem nova requisição
- Segmento **dominante** (maior %) recebe cor sólida; os demais ficam em versão translúcida
- Cores semânticas: verde (`positive`) para o favorito, vermelho (`negative`) para o azarão
- Empate sempre em âmbar (`secondary`)
- Quando `total === 0`: exibe mensagem vazia adequada ao escopo
- Quando `total < 5`: exibe aviso "Poucos palpites ainda"
- `flex` mínimo de 6 por segmento para que fatias muito pequenas ainda sejam visíveis
- Percentuais calculados com largest-remainder rounding via `toPercentages()` (soma sempre = 100)

## Estados

| Estado | Comportamento |
|--------|---------------|
| `isLoading` | Três blocos cinza (skeleton) |
| `total === 0` | `EmptyBar` com texto contextual |
| `total > 0` | Barra proporcional + legendas |
| `total < 5` | Barra + aviso de amostra pequena |

## Dependências

- [[Utils/Domain-Entities]] — `MatchPredictionBreakdown`
- `domain/helpers/predictionOutcome.ts` — `toPercentages()`
- `constants/tokens.ts` — `TypographyFamilies`
- Theme: `theme.colors.positive`, `negative`, `secondary`, `ink*`

## Onde é Usado

- [[Screens/Screen-PoolMatch]] — entre o cabeçalho da partida e a lista de palpites
- [[Screens/Screen-PoolPredict]] — na tela de submissão de palpite

## Links Relacionados

- [[Hooks/useMatchPredictionBreakdown]]
- [[API/Endpoints-Pools]]
