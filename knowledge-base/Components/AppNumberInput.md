---
title: Component — AppNumberInput
tags: [component, input, number]
updated: 2026-04-17
---

# AppNumberInput

**Arquivo:** `components/AppComponents/AppNumberInput/index.tsx`
**Estilos:** `components/AppComponents/AppNumberInput/styles.ts`

## Propósito

Input numérico com teclado numérico forçado. Usado para entrada de gols no [[Components/ScoreInput]].

## Props

```ts
interface AppNumberInputProps {
  value: number | undefined;
  onChange: (value: number) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
}
```

## Comportamento

- `keyboardType="number-pad"`
- Aceita apenas inteiros
- `disabled` aplica estilo visual de desabilitado

## Usado Em

- [[Components/ScoreInput]]
