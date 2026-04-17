---
title: Root Layout
tags: [navigation, layout, providers]
updated: 2026-04-17
---

# Root Layout — `app/_layout.tsx`

## Propósito

Ponto de entrada do app. Responsável por:
1. Carregar fontes Inter (300–900) antes de renderizar qualquer tela
2. Controlar a `SplashScreen` (visível até fontes carregadas)
3. Montar a cadeia de providers globais
4. Configurar o Stack navegador raiz

## Fontes Carregadas

```ts
Inter_300Light, Inter_400Regular, Inter_500Medium,
Inter_700Bold, Inter_900Black
```
Fonte: `@expo-google-fonts/inter`

## Cadeia de Providers

```tsx
ThemeProvider theme={theme}          // styled-components: tema de cores/espaçamentos
  NavThemeProvider                   // react-navigation: DarkTheme / DefaultTheme
    QueryClientProvider              // TanStack Query: cache global
      SessionProvider                // auth + apiUser + redirects
        Stack                        // Expo Router
```

## Comportamento de SplashScreen

```ts
SplashScreen.preventAutoHideAsync(); // chamado no módulo (antes do render)
// Esconde assim que fontsLoaded === true
useEffect(() => {
  if (fontsLoaded) SplashScreen.hideAsync();
}, [fontsLoaded]);
```

## useAppFocusRefetch

Chamado dentro de `RootLayoutNav`. Quando o app volta ao foco (app background → foreground), invalida as queries ativas do TanStack Query, garantindo dados frescos.

Ver: [[API/Overview]]

## Configurações especiais

```ts
export const unstable_settings = {
  initialRouteName: '(tabs)',
};
```

Garante que a rota inicial do Stack seja sempre `(tabs)`, evitando flash antes do redirect de auth.

## Arquivos Relacionados

- `lib/queryClient.ts` → [[API/Overview]]
- `constants/theme.ts` → [[Utils/Constants]]
- `context/SessionContext.tsx` → [[State-Management/SessionContext]]
