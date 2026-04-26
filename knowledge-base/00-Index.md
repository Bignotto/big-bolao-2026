---
title: Big Bolão 2026 — Map of Content
tags: [index, MOC]
updated: 2026-04-17
---

# Big Bolão 2026 — Base de Conhecimento

> [!note] Sobre este vault
> Base de conhecimento gerada a partir do código-fonte real de dois repositórios:
> - **Frontend:** `big-bolao-2026` — Expo React Native + Supabase + TanStack Query
> - **Backend:** `big-bolao-api` — Node.js + Fastify + Prisma + PostgreSQL

---

## 🏗️ Arquitetura & Visão Geral

- [[Architecture/Visao-Geral]] — Propósito do app, stack e camadas
- [[Architecture/Stack-Tecnologica]] — Todas as dependências com versão e papel
- [[Architecture/Fluxos-Principais]] — Jornadas do usuário (auth, bolão, palpite)
- [[Architecture/Estrutura-de-Pastas]] — Mapa completo do projeto

---

## 🗺️ Navegação

- [[Navigation/Estrutura-de-Navegacao]] — Árvore de rotas Expo Router
- [[Navigation/Root-Layout]] — Providers e configuração do Stack raiz

---

## 📱 Telas

| Tela | Grupo | Arquivo |
|------|-------|---------|
| [[Screens/Screen-Login]] | `(auth)` | `app/(auth)/login.tsx` |
| [[Screens/Screen-Dashboard]] | `(tabs)` | `app/(tabs)/index.tsx` |
| [[Screens/Screen-Matches]] | `(tabs)` | `app/(tabs)/matches.tsx` |
| [[Screens/Screen-Profile]] | `(tabs)` | `app/(tabs)/profile.tsx` |
| [[Screens/Screen-CreatePool]] | `(tabs)` | `app/(tabs)/create-pool.tsx` |
| [[Screens/Screen-FindPool]] | `(tabs)` | `app/(tabs)/find-pool.tsx` |
| [[Screens/Screen-PoolDetail]] | `pool/[id]` | `app/pool/[id]/index.tsx` |
| [[Screens/Screen-PoolPredict]] | `pool/[id]` | `app/pool/[id]/predict.tsx` |
| [[Screens/Screen-PoolSettings]] | `pool/[id]` | `app/pool/[id]/settings.tsx` |
| [[Screens/Screen-PoolMatch]] | `pool/[id]/match` | `app/pool/[id]/match/[matchId].tsx` |
| [[Screens/Screen-MatchDetail]] | `match` | `app/match/[id].tsx` |

---

## 🧩 Componentes

- [[Components/AppButton]] — Botão primário do design system
- [[Components/AppInput]] — Input de texto padrão
- [[Components/AppNumberInput]] — Input numérico (para placar)
- [[Components/AppText]] — Texto com estilos do tema
- [[Components/AppAvatar]] — Avatar de usuário
- [[Components/AppContainer]] — Container de tela com safe area
- [[Components/ScoreInput]] — Entrada de placar de partida
- [[Components/MatchCard]] — Card de partida
- [[Components/LeaderboardRow]] — Linha do ranking
- [[Components/MatchPredictionStatusCard]] — Status do palpite na partida
- [[Components/PoolPredictionMatchCard]] — Card de palpite no bolão
- [[Components/SegmentedControl]] — Controle segmentado (filtros)

---

## 🪝 Hooks

- [[Hooks/Hooks-Registry]] — Todos os hooks com descrição e query keys
- [[Hooks/useUpsertPrediction]] — Criar/atualizar palpite
- [[Hooks/useCreatePool]] — Criar bolão
- [[Hooks/usePoolStandings]] — Ranking do bolão
- [[Hooks/usePoolMembers]] — Participantes do bolão
- [[Hooks/useSearchPools]] — Busca de bolões públicos

---

## 🗄️ Estado Global

- [[State-Management/SessionContext]] — Auth, sessão Supabase e ApiUser

---

## 🌐 API (mobile + backend)

- [[API/Overview]] — Stack, scripts, base URL, auth, erros
- [[API/Auth]] — Autenticação end-to-end (Supabase → verifySupabaseToken)
- [[API/Routes]] — Tabela completa de rotas HTTP
- [[API/Architecture]] — Clean Architecture, camadas, erros de domínio
- [[API/Database]] — Prisma schema, modelos, views SQL de standings
- [[API/UseCases]] — Catálogo de use cases e regras de negócio
- [[API/Testing]] — Vitest unit + e2e, in-memory repos
- [[API/Deploy]] — Build tsup, produção, CI/CD
- [[API/Endpoints-Users]] — Payloads `/users`
- [[API/Endpoints-Pools]] — Payloads `/pools`, `/pool-invites`
- [[API/Endpoints-Predictions]] — Payloads `/predictions`
- [[API/Endpoints-Matches]] — Payloads `/matches`
- [[API/Endpoints-Tournaments]] — Payloads `/tournaments`
- [[API/Data-Models]] — Tipos TypeScript principais

---

## 🧠 Domínio

- [[Utils/Domain-Entities]] — Match, PoolMatchPrediction, MatchPredictionStatus
- [[Utils/Constants]] — Colors, theme, tokens, tournament

---

## 🎨 Design System

- [[Design/Design-System-Pitch-Night]] — Pitch Night theme: tokens, typography, color scale, layout rules, AppButton redesign

---

## 📋 Decisões (ADR)

- [[Decisions/ADR-001-Expo-Router]] — Escolha do Expo Router v6
- [[Decisions/ADR-002-TanStack-Query]] — Server state com React Query
- [[Decisions/ADR-003-Supabase-Auth]] — Autenticação via Supabase
- [[Decisions/ADR-004-Styled-Components]] — Styled Components vs StyleSheet
- [[Decisions/ADR-005-Clean-Architecture-API]] — Clean Architecture na API Fastify

---

## 📖 Glossário

- [[Glossary/Glossario]] — Termos do domínio: bolão, palpite, placar, rodada
