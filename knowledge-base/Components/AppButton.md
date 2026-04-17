---
title: Component — AppButton
tags: [component, design-system, button]
updated: 2026-04-17
---

# AppButton

**Arquivo:** `components/AppComponents/AppButton/index.tsx`
**Estilos:** `components/AppComponents/AppButton/styles.ts`

## Propósito

Botão primário do design system. Usa `styled-components` e o tema global.

## Props

```ts
// Inferido do código — verificar arquivo para props exatas
interface AppButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}
```

## Uso

```tsx
<AppButton title="Salvar palpite" onPress={handleSave} loading={isPending} />
```

## Estilo

Cores e espaçamentos via `theme` (styled-components). Ver [[Utils/Constants]].

## Usado Em

- [[Screens/Screen-Login]]
- [[Screens/Screen-CreatePool]]
- [[Screens/Screen-PoolPredict]]
- [[Screens/Screen-Profile]]
