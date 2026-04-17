---
title: "ADR-003: Supabase para Autenticação"
tags: [adr, auth, supabase]
updated: 2026-04-17
---

# ADR-003 — Supabase para Autenticação

**Status:** Aceito
**Data:** 2026

## Contexto

O app precisa de autenticação com múltiplos providers (email/senha, Google, Apple) e geração de JWT para autenticar chamadas à API REST.

## Decisão

Usar **Supabase Auth** como identity provider. O JWT do Supabase é usado como Bearer token em todas as chamadas à API.

## Justificativa

- Suporte nativo a email/senha, OAuth (Google) e Apple Sign In
- JWT seguro usado como Bearer token para a API REST
- `onAuthStateChange` evita race conditions no carregamento inicial
- `expo-secure-store` para persistência segura de tokens
- Criação automática de usuário na API no primeiro login (pattern fetch-or-create)

## Fluxo de Identidade Dupla

```
Supabase User (identity provider)
    └─> JWT access_token
        └─> POST /users (primeiro acesso)
            └─> ApiUser (usuário no banco da aplicação)
```

## Consequências

- `EXPO_PUBLIC_API_URL` + `EXPO_PUBLIC_SUPABASE_*` necessários em `.env`
- Todos os requests da API precisam do `Authorization: Bearer <token>`
- Token refresh gerenciado pelo Supabase SDK automaticamente

## Providers Suportados

| Provider | Implementação |
|----------|---------------|
| Email/Senha | `supabase.auth.signInWithPassword` |
| Google | `expo-auth-session` + `expo-web-browser` |
| Apple | `expo-apple-authentication` |

## Links

- [[State-Management/SessionContext]]
- [[Screens/Screen-Login]]
- [[API/Endpoints-Users]]
