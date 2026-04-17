---
title: Component — AppText
tags: [component, typography, text]
updated: 2026-04-17
---

# AppText

**Arquivo:** `components/AppComponents/AppText/index.tsx`
**Estilos:** `components/AppComponents/AppText/styles.ts`

## Propósito

Componente de texto tipografado com variantes de estilo baseadas no tema. Substitui `<Text>` nativo com consistência visual.

## Props

```ts
interface AppTextProps {
  variant?: 'title' | 'subtitle' | 'body' | 'caption' | 'label';
  color?: string;
  children: React.ReactNode;
}
```

## Fonte

Usa Inter (carregada em [[Navigation/Root-Layout]]):
- `Inter_300Light`, `Inter_400Regular`, `Inter_500Medium`, `Inter_700Bold`, `Inter_900Black`

## Responsividade

Usa `react-native-responsive-fontsize` para escalar tamanhos conforme a tela.
