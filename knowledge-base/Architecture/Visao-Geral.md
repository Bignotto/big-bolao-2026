---
title: Visão Geral do Projeto
tags: [architecture, overview]
updated: 2026-05-20
---

# Big Bolão 2026 — Visão Geral

> [!note] Resumo
> Aplicativo mobile de bolões para a Mundial 2026. Usuários criam ou entram em bolões, fazem palpites de placar e competem no ranking.

## Propósito

- Criar e gerenciar **bolões** (grupos de apostas) temáticos do Mundial 2026
- Fazer **palpites de placar** em partidas do torneio
- Acompanhar o **ranking** (leaderboard) do bolão em tempo real
- Suporte a **convite por código** para bolões privados

## Plataformas

| Plataforma | Status | Identificador |
|------------|--------|---------------|
| iOS | **Publicado na App Store** (desde 2026-05-20) | `com.bignotto.bigbolao2026`, iOS 16+ |
| Android | **Publicado na Google Play Store** (desde 2026-05-20) | `com.bignotto.bigbolao2026` |
| Web | Static (Metro bundler) | — |

> [!important] Política OTA
> O app está em produção. Toda alteração em código JS/TS/assets deve ser entregue via **EAS Update (OTA)** — sem novo binário nativo. Um novo `eas build` só é necessário quando há mudanças em módulos nativos, configurações nativas do `app.json`, ou versão do SDK Expo.
> Ver: [[Architecture/Deploy-Mobile]]

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
