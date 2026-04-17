---
title: Screen — Profile (Perfil)
tags: [screen, tabs, profile]
updated: 2026-04-17
---

# Screen — Profile

**Arquivo:** `app/(tabs)/profile.tsx`
**Rota:** `/(tabs)/profile`

## Propósito

Exibe e permite editar os dados do perfil do usuário logado. Permite também fazer logout.

## Dados Exibidos

- Nome completo (`apiUser.fullName`)
- E-mail (`apiUser.email`)
- Avatar (`apiUser.profileImageUrl`)
- Role (`USER` / `ADMIN`)

## Ações

| Ação | Implementação |
|------|---------------|
| Editar nome | `useUpdateProfile` mutation |
| Logout | `signOut()` via [[State-Management/SessionContext]] |

## Componentes Usados

- [[Components/AppAvatar]]
- [[Components/AppInput]]
- [[Components/AppButton]]

## Links Relacionados

- [[Hooks/Hooks-Registry]] → useUpdateProfile
- [[State-Management/SessionContext]]
- [[API/Endpoints-Users]]
