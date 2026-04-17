---
title: usePoolMembers
tags: [hooks, pools, query]
updated: 2026-04-17
---

# usePoolMembers

**Arquivo:** `hooks/usePoolMembers.ts`

## Propósito

Lista participantes de um bolão via `GET /pools/:poolId/users`.

## Uso

```tsx
const { data, isLoading } = usePoolMembers(poolId);
```

## Permissões

- Dono do bolão pode remover membros (`DELETE /pools/:poolId/users/:userId`)
- Membro comum pode sair (`DELETE /pools/:poolId/users/me`)

## Dependências

- [[API/Endpoints-Pools]]
- [[Screens/Screen-PoolDetail]]
- [[Screens/Screen-PoolSettings]]
