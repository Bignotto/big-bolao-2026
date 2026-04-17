---
title: Estrutura de Navegação
tags: [navigation, expo-router, routes]
updated: 2026-04-17
---

# Estrutura de Navegação

O app usa **Expo Router v6** com roteamento file-based. Todas as rotas derivam da estrutura de pastas em `app/`.

## Árvore de Rotas

```
Stack (Root)
├── (auth)          → Stack sem header
│   └── login       → [[Screens/Screen-Login]]
│
├── (tabs)          → Tab Navigator
│   ├── index       → [[Screens/Screen-Dashboard]]        (tab: Home)
│   ├── matches     → [[Screens/Screen-Matches]]          (tab: Partidas)
│   ├── create-pool → [[Screens/Screen-CreatePool]]       (tab: Criar)
│   ├── find-pool   → [[Screens/Screen-FindPool]]         (tab: Buscar)
│   └── profile     → [[Screens/Screen-Profile]]          (tab: Perfil)
│
├── pool/[id]       → Stack sem header
│   ├── index       → [[Screens/Screen-PoolDetail]]
│   ├── predict     → [[Screens/Screen-PoolPredict]]
│   ├── settings    → [[Screens/Screen-PoolSettings]]
│   └── match/[matchId] → [[Screens/Screen-PoolMatch]]
│
├── match/[id]      → [[Screens/Screen-MatchDetail]]
└── modal           → Apresentação modal genérica
```

## Configuração Root (`app/_layout.tsx`)

```tsx
<Stack>
  <Stack.Screen name="(auth)"     options={{ headerShown: false }} />
  <Stack.Screen name="(tabs)"     options={{ headerShown: false }} />
  <Stack.Screen name="modal"      options={{ presentation: 'modal' }} />
  <Stack.Screen name="pool/[id]"  options={{ headerShown: false }} />
  <Stack.Screen name="match/[id]" options={{ headerShown: false }} />
</Stack>
```

## Providers no Root Layout

A ordem importa — cada provider depende dos externos:

```
ThemeProvider (styled-components)
  └── NavThemeProvider (react-navigation dark/light)
        └── QueryClientProvider (TanStack Query)
              └── SessionProvider (auth + apiUser)
                    └── Stack (rotas)
```

## Redirecionamento por Auth

Gerenciado pelo [[State-Management/SessionContext]]:

| Estado | Destino |
|--------|---------|
| Sem sessão, fora de `(auth)` | `/(auth)/login` |
| Com sessão, dentro de `(auth)` | `/(tabs)` |

## Deep Links

- Scheme: `bigbolao2026://`
- Exemplo: `bigbolao2026://pool-invites/CODE` → join por convite

## TypedRoutes

`typedRoutes: true` em `app.json`. Use `router.push('/pool/[id]')` com tipagem automática.

## Links Relacionados

- [[Navigation/Root-Layout]]
- [[Screens/Screen-Login]]
- [[Screens/Screen-Dashboard]]
