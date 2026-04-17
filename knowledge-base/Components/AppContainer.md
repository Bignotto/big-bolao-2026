---
title: Component — AppContainer
tags: [component, layout, safe-area]
updated: 2026-04-17
---

# AppContainer

**Arquivo:** `components/AppComponents/AppContainer/index.tsx`
**Estilos:** `components/AppComponents/AppContainer/styles.ts`

## Propósito

Container padrão de tela. Envolve o conteúdo com `SafeAreaView` e aplica padding/background do tema.

## Uso

```tsx
<AppContainer>
  {/* conteúdo da tela */}
</AppContainer>
```

## Comportamento

- Aplica `SafeAreaView` (respeita notch e home bar)
- Background do tema (`theme.colors.background`)
- Flex: 1 por padrão

## Usado Em

Todas as telas principais como wrapper de conteúdo.
