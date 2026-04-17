---
title: "ADR-004: Styled Components"
tags: [adr, styling, styled-components]
updated: 2026-04-17
---

# ADR-004 — Styled Components vs StyleSheet

**Status:** Aceito
**Data:** 2026

## Contexto

O app precisa de um sistema de estilos consistente com suporte a theming (light/dark), tokens de design e componentes reutilizáveis.

## Decisão

Usar **styled-components v6** (`styled-components/native`) com tema global.

## Justificativa

- Tema tipado (`styled.d.ts`) garante type-safety ao usar `theme` em qualquer componente
- Tokens centralizados em `constants/theme.ts` e `constants/tokens.ts`
- Colocação de estilos junto ao componente (arquivo `styles.ts` ao lado do `index.tsx`)
- Suporte a variantes de estilo via props

## Estrutura de Cada Componente

```
ComponentName/
  index.tsx   ← lógica e JSX
  styles.ts   ← styled-components
```

## Consequências

- `ThemeProvider` necessário no [[Navigation/Root-Layout]]
- `styles/styled.d.ts` deve ser mantido atualizado com o shape do tema
- Não misturar `StyleSheet.create` com styled-components nos mesmos componentes

## Regra

> Preferir `theme` e `tokens` a cores/tamanhos hard-coded em qualquer novo código.

## Alternativas Consideradas

- StyleSheet nativo: sem theming, mais boilerplate
- Tailwind (NativeWind): boa opção, mas mudança grande de paradigma

## Links

- [[Utils/Constants]]
- [[Navigation/Root-Layout]]
