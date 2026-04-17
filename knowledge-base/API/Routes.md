---
title: API — Rotas Completas
tags: [api, routes, endpoints, http]
updated: 2026-04-17
---

# API — Tabela Completa de Rotas

Todas as rotas exigem `Authorization: Bearer <supabase_token>`.
Swagger UI disponível em `/docs`.

---

## Users (`user.routes.ts`)

| Método | Path | Descrição |
|--------|------|-----------|
| `POST` | `/users` | Criar usuário (primeiro login) |
| `GET` | `/users/me` | Dados do usuário logado |
| `GET` | `/users/:userId` | Dados de um usuário por ID |
| `PUT` | `/users/me` | Atualizar perfil |
| `GET` | `/users/me/predictions` | Palpites do usuário logado |
| `GET` | `/users/me/pools/standings` | Standings do usuário em todos os pools |

---

## Pools (`pools.routes.ts`)

| Método | Path | Descrição |
|--------|------|-----------|
| `POST` | `/pools` | Criar pool |
| `GET` | `/pools` | Listar pools públicos (`?page&perPage&name`) |
| `GET` | `/pools/:poolId` | Detalhes do pool |
| `PUT` | `/pools/:poolId` | Atualizar pool (criador only) |
| `GET` | `/pools/:poolId/users` | Listar participantes |
| `POST` | `/pools/:poolId/users` | Entrar no pool (público) |
| `DELETE` | `/pools/:poolId/users/me` | Sair do pool |
| `DELETE` | `/pools/:poolId/users/:userId` | Remover participante (criador only) |
| `GET` | `/pools/:poolId/matches/:matchId/predictions` | Palpites de uma partida dentro do pool |
| `GET` | `/pools/:poolId/predictions` | Todos os palpites do pool (todas as partidas) |
| `GET` | `/pools/:poolId/standings` | Ranking do pool |
| `PUT` | `/pools/:poolId/scoring-rules` | Atualizar regras (criador only) |
| `GET` | `/pool-invites/:inviteCode` | Preview pelo código de convite |
| `POST` | `/pool-invites/:inviteCode` | Entrar pelo código de convite |

---

## Matches (`matches.routes.ts`)

| Método | Path | Auth Especial | Descrição |
|--------|------|---------------|-----------|
| `GET` | `/matches` | — | Listar (`?tournamentId&stage&status&group`) |
| `GET` | `/matches/:matchId` | — | Detalhes da partida |
| `GET` | `/matches/:matchId/predictions` | — | Palpites de todos na partida |
| `GET` | `/matches/:matchId/predictions/me` | — | Meus palpites (todos os pools) |
| `PUT` | `/matches/:matchId` | **ADMIN** | Atualizar resultado |

---

## Predictions (`predictions.routes.ts`)

| Método | Path | Descrição |
|--------|------|-----------|
| `POST` | `/predictions` | Criar palpite |
| `GET` | `/predictions/:predictionId` | Detalhes do palpite |
| `PUT` | `/predictions/:predictionId` | Atualizar palpite |

---

## Tournaments (`tournaments.routes.ts`)

| Método | Path | Descrição |
|--------|------|-----------|
| `GET` | `/tournaments` | Listar torneios |
| `GET` | `/tournaments/:tournamentId` | Detalhes do torneio |
| `GET` | `/tournaments/:tournamentId/matches` | Partidas do torneio |

---

## Formato de Erro

```json
{ "message": "Human-readable error description" }
```

| Status | Causa |
|--------|-------|
| 400 | Bad request |
| 401 | Token ausente/inválido |
| 403 | Sem permissão (não participante, não criador) |
| 404 | Recurso não encontrado |
| 409 | Conflito (nome duplicado, já participante, limite) |
| 422 | Erro de validação Zod |
| 500 | Erro interno |

## Links Relacionados

- [[API/Endpoints-Pools]] — Payloads detalhados de pools
- [[API/Endpoints-Matches]] — Payloads de partidas
- [[API/Endpoints-Predictions]] — Payloads de palpites
- [[API/Endpoints-Users]] — Payloads de usuários
- [[API/Auth]]
