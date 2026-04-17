---
title: useSearchPools
tags: [hooks, pools, query]
updated: 2026-04-17
---

# useSearchPools

**Arquivo:** `hooks/useSearchPools.ts`

## Propósito

Busca bolões públicos por nome via `GET /pools?name=...`. Suporta paginação.

## Parâmetros

```ts
useSearchPools(name: string, page?: number, perPage?: number)
```

## Retorno

```ts
{ pools: Pool[], total: number }
```

## Notas

- Implementar debounce no input para não disparar query a cada tecla
- Suporte a paginação via `page` e `perPage`

## Dependências

- [[API/Endpoints-Pools]]
- [[Screens/Screen-FindPool]]
