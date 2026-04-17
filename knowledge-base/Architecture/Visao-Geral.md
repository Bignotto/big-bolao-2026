---
title: Visão Geral do Projeto
tags: [architecture, overview]
updated: 2026-04-17
---

# Big Bolão 2026 — Visão Geral

> [!note] Resumo
> Aplicativo mobile de bolões para a Copa do Mundo FIFA 2026. Usuários criam ou entram em bolões, fazem palpites de placar e competem no ranking.

## Propósito

- Criar e gerenciar **bolões** (grupos de apostas) temáticos da Copa 2026
- Fazer **palpites de placar** em partidas do torneio
- Acompanhar o **ranking** (leaderboard) do bolão em tempo real
- Suporte a **convite por código** para bolões privados

## Plataformas

- iOS (inclui Sign in with Apple)
- Android (Edge-to-edge, adaptive icon)
- Web (static, Metro bundler)

## Arquitetura em Camadas

```
┌─────────────────────────────────────────────────┐
│  Presentation  │  app/ + components/             │
├─────────────────────────────────────────────────┤
│  Application   │  hooks/ (TanStack Query)        │
├─────────────────────────────────────────────────┤
│  Domain        │  domain/entities|enums|helpers  │
├─────────────────────────────────────────────────┤
│  Data          │  data/api|dto|mappers + lib/    │
├─────────────────────────────────────────────────┤
│  Infrastructure│  Supabase, SecureStore, QC      │
└─────────────────────────────────────────────────┘
```

### Regras de camada

- Não usar DTO direto na tela quando houver entidade/mapeador local
- Sempre tratar `null` vindo da API
- Lógica de domínio fora dos componentes visuais
- Preferir `theme` e `tokens` a cores hard-coded

## Links Relacionados

- [[Architecture/Stack-Tecnologica]]
- [[Architecture/Fluxos-Principais]]
- [[Architecture/Estrutura-de-Pastas]]
- [[Navigation/Estrutura-de-Navegacao]]
- [[State-Management/SessionContext]]
