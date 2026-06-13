---
title: useShareRanking
tags: [hooks, ui, sharing]
updated: 2026-06-09
---

# useShareRanking

**Arquivo:** `hooks/useShareRanking.ts`

## Propósito

Hook utilitário para capturar um componente de ranking como imagem PNG e compartilhá-lo (via share sheet do SO) ou salvá-lo na galeria do dispositivo.

## Assinatura

```ts
function useShareRanking(cardRef: RefObject<View | null>): {
  shareRanking: () => Promise<void>;
  saveToGallery: () => Promise<boolean>;
  sharing: boolean;
}
```

## Parâmetro

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `cardRef` | `RefObject<View \| null>` | Ref do componente React Native a ser capturado como imagem |

## Retorno

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `shareRanking` | `() => Promise<void>` | Captura o card e abre o share sheet nativo |
| `saveToGallery` | `() => Promise<boolean>` | Solicita permissão e salva na galeria; retorna `false` se negado |
| `sharing` | `boolean` | `true` durante a captura/compartilhamento |

## Comportamento

- `shareRanking`: usa `captureRef` (react-native-view-shot) + `expo-sharing`
- `saveToGallery`: solicita `MediaLibrary.requestPermissionsAsync(true)` antes de salvar
- `sharing` é gerenciado com `useState`; sempre retorna a `false` no `finally`

> [!note] Permissão de galeria
> `saveToGallery` retorna `false` silenciosamente se a permissão for negada. A UI deve tratar esse retorno e exibir feedback adequado ao usuário.

## Uso

```tsx
const cardRef = useRef<View>(null);
const { shareRanking, saveToGallery, sharing } = useShareRanking(cardRef);

return (
  <View ref={cardRef}>
    <RankingCard ... />
  </View>
);
```

## Dependências

- `react-native-view-shot` — captura do componente
- `expo-sharing` — share sheet nativo
- `expo-media-library` — acesso à galeria
