---
title: Constants
tags: [constants, theme, tokens, colors]
updated: 2026-04-17
---

# Constants

Localizados em `constants/`.

## Colors.ts

Paleta de cores com suporte a light/dark mode.

```ts
// Padrão de acesso:
Colors.light.tint
Colors.dark.background
```

Usado pelo `useColorScheme` para adaptar o `NavThemeProvider`.

## theme.ts

Tema principal do `styled-components`. Importado no `ThemeProvider` em [[Navigation/Root-Layout]].

```ts
// Exemplo de acesso em styled-component:
const Button = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.primary};
  padding: ${({ theme }) => theme.spacing.md}px;
`;
```

## tokens.ts

Design tokens — valores base de espaçamento, tamanhos de fonte, border radius, etc.

```ts
// Exemplo:
tokens.spacing.sm  // 8
tokens.spacing.md  // 16
tokens.fontSize.body
tokens.radius.card
```

## tournament.ts

Dados estáticos do torneio Mundial 2026.

```ts
TOURNAMENT_ID              // número lido de EXPO_PUBLIC_TOURNAMENT_ID (default 1)
OTA_LABEL                  // label da versão OTA atual (ex: 'OTA 2') — incrementar a cada eas update
TOURNAMENT_START_DATE      // new Date('2026-06-11T21:00:00-04:00') — abertura (México vs Canadá)
TOURNAMENT_OPENING_MATCHUP // 'México — Canadá'
TOURNAMENT_OPENING_DATE_LABEL // '11 jun'
```

> [!tip] OTA_LABEL
> Incrementar `OTA_LABEL` a cada `eas update --branch production` facilita identificar qual versão o usuário está rodando.

Usado quando não é necessário buscar da API (ex: labels, filtros, UI de contagem regressiva).

## styled.d.ts

**Arquivo:** `styles/styled.d.ts`

Declaração de tipos do tema para TypeScript:

```ts
// Garante tipagem ao acessar theme em styled-components
declare module 'styled-components/native' {
  export interface DefaultTheme {
    colors: { ... };
    spacing: { ... };
  }
}
```

## Links Relacionados

- [[Architecture/Stack-Tecnologica]]
- [[Navigation/Root-Layout]]
