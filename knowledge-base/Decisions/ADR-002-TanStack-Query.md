---
title: "ADR-002: TanStack Query para Server State"
tags: [adr, state-management, react-query]
updated: 2026-04-17
---

# ADR-002 — TanStack Query (React Query v5)

**Status:** Aceito
**Data:** 2026

## Contexto

O app consome uma API REST com múltiplos recursos (bolões, partidas, palpites, ranking). Os dados precisam de cache, invalidação e refetch automático.

## Decisão

Usar **TanStack Query v5** (`@tanstack/react-query`) como solução de server state.

## Justificativa

- Cache automático com `staleTime` configurável (30s padrão)
- Mutations com invalidação de queries relacionadas
- `refetchOnWindowFocus: true` + `useAppFocusRefetch` para dados frescos
- Separação clara entre server state (React Query) e UI state (useState/Context)
- Query keys tipadas em `hooks/*Keys.ts`

## Configuração

```ts
new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30000, retry: 2, refetchOnWindowFocus: true },
    mutations: { retry: 0 },
  },
})
```

## Consequências

- Todos os hooks de dados estão em `hooks/use*.ts`
- Nenhum Redux/Zustand necessário para dados do servidor
- `QueryClientProvider` montado no [[Navigation/Root-Layout]]

## Alternativas Consideradas

- SWR: menos recursos para mutations
- Redux Toolkit Query: maior overhead de configuração
- Zustand puro: sem cache de servidor built-in

## Links

- [[Hooks/Hooks-Registry]]
- [[API/Overview]]
