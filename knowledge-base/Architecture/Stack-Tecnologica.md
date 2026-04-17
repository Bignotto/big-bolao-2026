---
title: Stack Tecnológica
tags: [architecture, stack, dependencies]
updated: 2026-04-17
---

# Stack Tecnológica

## Core

| Lib | Versão | Papel |
|-----|--------|-------|
| `react-native` | 0.81.5 | Framework mobile |
| `react` | 19.1.0 | UI declarativa |
| `expo` | ~54.0.33 | Plataforma/SDK |
| `typescript` | ~5.9.2 | Tipagem estática |

> [!important] New Architecture habilitada
> `newArchEnabled: true` no `app.json`. Usa JSI/Fabric — atenção ao usar libs sem suporte.

## Navegação

| Lib | Versão | Papel |
|-----|--------|-------|
| `expo-router` | ~6.0.23 | Roteamento file-based |
| `@react-navigation/native` | ^7.1.8 | Primitivos de navegação |
| `react-native-screens` | ~4.16.0 | Otimização de telas nativas |
| `react-native-safe-area-context` | ~5.6.0 | Safe areas (notch/home bar) |

Ver: [[Navigation/Estrutura-de-Navegacao]]

## Estado & Dados

| Lib | Versão | Papel |
|-----|--------|-------|
| `@tanstack/react-query` | ^5.96.2 | Server state, cache, mutations |
| `@supabase/supabase-js` | ^2.99.1 | Auth + cliente Supabase |
| `@react-native-async-storage/async-storage` | 2.2.0 | Persistência local (Supabase session) |
| `expo-secure-store` | ~15.0.8 | Armazenamento seguro de tokens |

Ver: [[State-Management/SessionContext]], [[API/Overview]]

## Autenticação

| Lib | Versão | Papel |
|-----|--------|-------|
| `expo-apple-authentication` | ~8.0.8 | Sign in with Apple |
| `expo-auth-session` | ~7.0.10 | OAuth flows (Google) |
| `expo-web-browser` | ~15.0.10 | Browser para OAuth |
| `expo-crypto` | ~15.0.8 | Hashing para PKCE |

## UI & Estilo

| Lib | Versão | Papel |
|-----|--------|-------|
| `styled-components` | ^6.3.9 | CSS-in-JS, tema global |
| `@expo/vector-icons` | ^15.0.3 | Ícones (Ionicons, MaterialIcons…) |
| `@expo-google-fonts/inter` | ^0.4.2 | Fonte Inter (300–900) |
| `react-native-reanimated` | ~4.1.1 | Animações performáticas |
| `react-native-responsive-fontsize` | ^0.5.1 | Fonte responsiva por tela |
| `polished` | ^4.3.1 | Utilitários de cor (lighten, darken…) |

Ver: [[Utils/Constants]]

## Utilitários de Build

| Lib | Papel |
|-----|-------|
| `expo-constants` | Variáveis de ambiente/build |
| `expo-linking` | Deep links |
| `expo-font` | Carregamento de fontes |
| `expo-splash-screen` | Controle da splash |
| `expo-dev-client` | Dev build customizado |

## Dev / Qualidade

| Lib | Papel |
|-----|-------|
| `eslint` + `eslint-config-expo` | Linting |
| `prettier` | Formatação |
| `react-test-renderer` | Testes unitários |

## Alias de Imports

```json
// tsconfig.json
"paths": { "@/*": ["./*"] }
```

Usar `@/components/...`, `@/hooks/...`, `@/lib/...` etc.
