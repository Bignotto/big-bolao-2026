---
title: Screen — Find Pool (Buscar Bolão)
tags: [screen, tabs, pools]
updated: 2026-04-17
---

# Screen — Find Pool

**Arquivo:** `app/(tabs)/find-pool.tsx`
**Rota:** `/(tabs)/find-pool`

## Propósito

Busca bolões públicos por nome ou permite entrar via código de convite.

## Fluxo — Busca por Nome

```
Digita nome no campo de busca (debounced)
  └─> useSearchPools(name) → GET /pools?name=...
      └─> Lista de bolões públicos
          └─> Toca no bolão → POST /pools/:poolId/users
              └─> navigate pool/[id]/index
```

## Fluxo — Código de Convite

```
Digita código de convite
  └─> GET /pool-invites/:code (preview do bolão)
  └─> Confirma entrada → POST /pool-invites/:code
      └─> navigate pool/[id]/index
```

## Componentes Usados

- [[Components/AppInput]] — busca / código de convite
- [[Components/AppButton]] — confirmar entrada

## Links Relacionados

- [[Hooks/useSearchPools]]
- [[API/Endpoints-Pools]]
- [[Screens/Screen-PoolDetail]]
