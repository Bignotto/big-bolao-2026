---
title: Component — SegmentedControl
tags: [component, filter, tabs]
updated: 2026-04-17
---

# SegmentedControl

**Arquivo:** `components/AppComponents/SegmentedControl/index.tsx`

## Propósito

Controle de seleção segmentada (tipo tabs). Usado para filtros e seleção de opções mutuamente exclusivas.

## Props

```ts
interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
}
```

## Usado Em

- [[Screens/Screen-Matches]] — filtro de fase/grupo/status
- [[Screens/Screen-PoolDetail]] — abas de conteúdo

## Notas

Implementação própria (não usa `@react-native-segmented-control`), compatível com o tema do app.
