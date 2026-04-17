---
title: API — Autenticação
tags: [api, auth, supabase, jwt, middleware]
updated: 2026-04-17
---

# API — Autenticação

## Estratégia

A API **não gerencia credenciais de usuário**. Todo o processo de autenticação é delegado ao **Supabase Auth**. A API valida o token JWT emitido pelo Supabase em cada requisição.

---

## Fluxo End-to-End

```
Mobile App
  └─> Supabase Auth (login email / Google / Apple)
      └─> Recebe access_token (JWT)
          └─> Inclui em toda requisição:
              Authorization: Bearer <access_token>
                  └─> API: verifySupabaseToken (onRequest hook)
                      └─> supabase.auth.getUser(token)
                          └─> Valida com Supabase
                              └─> request.user.sub = supabaseUserId
                                  └─> Controller acessa userId autenticado
```

---

## Middleware: `verifySupabaseToken`

**Arquivo:** `src/http/middlewares/verifySupabaseToken.ts`

Registrado via `app.addHook('onRequest', verifySupabaseToken)` em **todas** as route functions.

```ts
export async function verifySupabaseToken(request, reply) {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    return reply.status(401).send({ message: 'Unauthorized.' });
  }

  request.user = { sub: data.user.id };  // userId injetado em todos os controllers
}
```

## Middleware: `verifyJwt`

**Arquivo:** `src/http/middlewares/verifyJwt.ts`

Middleware adicional usando `@fastify/jwt` (JWT interno da aplicação), para rotas que precisam de verificação adicional além do Supabase.

---

## Níveis de Autorização

| Nível | Como é verificado |
|-------|-------------------|
| Autenticado | `verifySupabaseToken` (todas as rotas) |
| Participante do pool | `PoolAuthorizationService.validateUserPoolAccess()` |
| Dono do pool | `PoolAuthorizationService.validatePoolCreatorAccess()` |
| ADMIN | `user.role === 'ADMIN'` verificado no use case |

---

## Primeiro Acesso (Registro Automático)

Quando um usuário autentica pelo Supabase pela primeira vez, o mobile app detecta o 404 e cria o registro:

```
GET /users/me → 404 (usuário não existe no banco da app)
  └─> POST /users (cria com metadados do OAuth: fullName, email, profileImageUrl)
      └─> Usuário criado com role USER por padrão
```

Ver [[State-Management/SessionContext]] para a implementação no mobile.

---

## ADMIN Role

- Coluna `role` na tabela `users` (`USER` | `ADMIN`)
- Apenas `ADMIN` pode chamar `PUT /matches/:matchId` para atualizar resultados
- A UI mobile deve ocultar controles de admin para usuários normais (`apiUser.role !== 'ADMIN'`)

---

## Configuração Supabase

```ts
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);
```

```ts
// lib/supabase.ts (mobile)
// Usa EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY
```

---

## Providers de Login Suportados

| Provider | Implementação Mobile |
|----------|---------------------|
| Email/Senha | `supabase.auth.signInWithPassword` |
| Google | `expo-auth-session` + `expo-web-browser` |
| Apple | `expo-apple-authentication` |

---

## Links Relacionados

- [[State-Management/SessionContext]]
- [[Screens/Screen-Login]]
- [[API/Architecture]] — PoolAuthorizationService
- [[Decisions/ADR-003-Supabase-Auth]]
