---
title: Endpoints — Users
tags: [api, users, endpoints]
updated: 2026-04-17
---

# API — Users

| Método | Path | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/users/me` | Sim | Retorna dados do usuário autenticado |
| `POST` | `/users` | Sim | Cria novo usuário (chamado automaticamente no primeiro login) |
| `PUT` | `/users/me` | Sim | Atualiza perfil (nome, foto) |

## GET /users/me

```json
// Response 200
{
  "id": "uuid",
  "fullName": "João Silva",
  "email": "joao@email.com",
  "profileImageUrl": "https://...",
  "role": "USER"
}
```

Chamado pelo [[State-Management/SessionContext]] em `fetchOrCreateApiUser`.

## POST /users

Chamado automaticamente quando `/users/me` retorna 404 (primeiro acesso).

```json
// Request
{
  "id": "supabase_user_id",
  "fullName": "Nome do OAuth",
  "email": "email@provider.com",
  "passwordHash": null,
  "profileImageUrl": "https://..."
}
// Response 201
{ "user": ApiUser }
```

Provedores de conta: `EMAIL` | `GOOGLE` | `APPLE`

## PUT /users/me

```json
// Request
{ "fullName": "Novo Nome", "profileImageUrl": "..." }
// Response 200
{ "user": ApiUser }
```

Hook: [[Hooks/useUpdateProfile]]

## Roles

| Role | Permissões |
|------|------------|
| `USER` | Criar bolão, palpitar, participar |
| `ADMIN` | Tudo + atualizar resultados de partidas (`PUT /matches/:matchId`) |
