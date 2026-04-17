---
title: "ADR-001: Expo Router v6"
tags: [adr, navigation, expo-router]
updated: 2026-04-17
---

# ADR-001 — Expo Router v6

**Status:** Aceito
**Data:** 2026

## Contexto

O app precisa de navegação multi-plataforma (iOS, Android, Web) com suporte a deep links e URL scheme definido (`bigbolao2026://`).

## Decisão

Usar **Expo Router v6** com roteamento file-based.

## Justificativa

- Roteamento declarativo via sistema de arquivos (sem configuração manual)
- Suporte nativo a deep links e `typedRoutes`
- Integração com Expo SDK sem configuração adicional
- Suporte a SSG/static export para web
- Grupos de rota `(auth)` e `(tabs)` permitem layouts isolados

## Consequências

- Estrutura de pastas define diretamente as rotas — convenção obrigatória
- TypedRoutes (`typedRoutes: true`) garante type-safety nas navegações
- `unstable_settings.initialRouteName` necessário para evitar flash de tela

## Alternativas Consideradas

- React Navigation manual: mais flexível mas mais boilerplate
- Expo Router v5: versão anterior, sem algumas melhorias de v6

## Links

- [[Navigation/Estrutura-de-Navegacao]]
- [[Navigation/Root-Layout]]
