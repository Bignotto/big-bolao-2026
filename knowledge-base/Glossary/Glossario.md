---
title: Glossário
tags: [glossary, domain, terminology]
updated: 2026-04-17
---

# Glossário — Big Bolão 2026

## Termos de Domínio

### Bolão (Pool)
Grupo de apostas criado por um usuário. Pode ser público (qualquer um entra) ou privado (apenas por convite). Cada bolão tem suas próprias regras de pontuação e um ranking independente.

### Palpite (Prediction)
Aposta de placar feita por um usuário para uma partida dentro de um bolão. Único por (usuário + partida + bolão). Bloqueado após o início da partida.

### Placar (Score)
Resultado de uma partida — `homeTeamScore × awayTeamScore`. Pode incluir pênaltis (`penaltyHomeScore`) e tempo extra.

### Ranking / Leaderboard (Standings)
Classificação dos participantes de um bolão ordenada por `totalPoints`. Atualizada automaticamente após cada partida concluída.

### Dono do Bolão (Pool Owner)
Usuário que criou o bolão. Pode remover participantes e alterar regras de pontuação.

### Código de Convite (Invite Code)
Código único que permite entrar em bolões privados. Deve ser único no sistema.

### Regras de Pontuação (Scoring Rules)
Configuração de pontos por tipo de acerto:
- **Placar exato**: acerta o placar exato
- **Vencedor + diferença**: acerta vencedor e diferença de gols
- **Apenas vencedor**: acerta só quem venceu
- **Multiplicador mata-mata**: fases eliminatórias
- **Multiplicador final**: jogo da final

### ApiUser
Usuário registrado no banco da aplicação (diferente do `User` do Supabase que é o identity provider).

## Termos Técnicos

### New Architecture
`newArchEnabled: true` — Nova arquitetura React Native com JSI/Fabric. Habilitada neste projeto.

### Typed Routes
`typedRoutes: true` no `app.json` — garante type-safety nas chamadas de navegação com Expo Router.

### upsert
Operação que cria um registro se não existir ou atualiza se já existir. Usado em [[Hooks/useUpsertPrediction]].

### staleTime
Tempo (em ms) que uma query é considerada "fresca" no TanStack Query. Após este período, um novo fetch é disparado. Configurado em 30 segundos.

### Bearer Token
Token JWT incluído no header `Authorization: Bearer <token>` para autenticar requisições à API.

### PKCE
Proof Key for Code Exchange — mecanismo de segurança usado no OAuth flow com `expo-crypto`.
