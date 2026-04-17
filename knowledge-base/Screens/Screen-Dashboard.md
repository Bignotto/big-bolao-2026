---
title: Screen — Dashboard (Home)
tags: [screen, tabs, home, dashboard]
updated: 2026-04-17
---

# Screen — Dashboard

**Arquivo:** `app/(tabs)/index.tsx`
**Rota:** `/(tabs)/` (tab ativo: Home)

## Propósito

Tela principal após login. Exibe:
- Bolões do usuário (lista com acesso rápido)
- Próximas partidas ou status de palpites
- Atalho para criar/entrar em bolão

## Navegação a partir daqui

- `pool/[id]` → Detalhe de um bolão
- `/(tabs)/create-pool` → Criar bolão
- `/(tabs)/find-pool` → Buscar bolão

## Dependências Prováveis

- Hooks de listagem de bolões do usuário
- [[State-Management/SessionContext]] para `apiUser`

## Links Relacionados

- [[Screens/Screen-PoolDetail]]
- [[Screens/Screen-CreatePool]]
- [[Screens/Screen-FindPool]]
- [[Navigation/Estrutura-de-Navegacao]]
