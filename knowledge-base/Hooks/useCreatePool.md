---
title: useCreatePool
tags: [hooks, pools, mutation]
updated: 2026-04-17
---

# useCreatePool

**Arquivo:** `hooks/useCreatePool.ts`

## Propósito

Mutation para criar um novo bolão via `POST /pools`.

## Uso

```tsx
const { mutate: createPool, isPending, error } = useCreatePool();

createPool({
  name: "Meu Bolão",
  tournamentId: 1,
  isPrivate: false,
  inviteCode: "MYCODE",         // opcional
  maxParticipants: 20,          // opcional
  registrationDeadline: "...",  // opcional
  description: "...",           // opcional
});
```

## Após sucesso

Navega para `pool/[id]/index` (detalhe do bolão criado).

## Regras

- `inviteCode` deve ser único
- `ScoringRule` é criada automaticamente com valores padrão

## Dependências

- [[API/Endpoints-Pools]]
- [[Screens/Screen-CreatePool]]
