---
title: API — Visão Geral
tags: [api, fastify, overview, mobile-client]
updated: 2026-04-17
---

# Big Bolão API — Visão Geral

Documentação completa da API REST do Big Bolão 2026, cobrindo tanto a perspectiva do **servidor** (Fastify/Node.js) quanto do **cliente** (app mobile Expo).

---

## Repositório Backend

**Path:** `C:\Users\Thiago\Projects\big-bolao-api`
**Entry point:** `src/server.ts` → `createServer()` em `src/app.ts`
**Porta:** `3333` (default)

## Stack Backend

| Tecnologia | Versão | Papel |
|------------|--------|-------|
| Node.js | ≥ 20 | Runtime |
| TypeScript | ^5.8 | Linguagem |
| Fastify | ^5.2.1 | HTTP framework |
| Prisma ORM | ^6.4.1 | Database ORM |
| PostgreSQL | — | Banco de dados |
| Supabase | ^2.49.1 | Identity provider (auth) |
| Zod | ^3.24.2 | Validação de schemas |
| Vitest | ^3.0.7 | Testes unit + e2e |
| tsup | ^8.4.0 | Build (esm → cjs) |

## Plugins Fastify

| Plugin | Papel |
|--------|-------|
| `@fastify/cors` | CORS para o app mobile/web |
| `@fastify/jwt` | JWT plugin interno |
| `@fastify/swagger` | Geração do OpenAPI spec |
| `@fastify/swagger-ui` | UI do Swagger em `/docs` |

## Arquitetura em Camadas

```
HTTP Request
  └─> Routes (src/http/routes/)
      └─> Middleware: verifySupabaseToken
          └─> Controller (src/http/controllers/)
              └─> UseCase (src/useCases/)
                  └─> Repository Interface
                      └─> Prisma Repository (src/repositories/)
                          └─> PostgreSQL
```

Ver detalhes em [[API/Architecture]].

---

## Perspectiva Mobile (Cliente)

### Base URL

```
process.env.EXPO_PUBLIC_API_URL
```

Configurado via variável de ambiente Expo (`EXPO_PUBLIC_*`).

### Autenticação

Todas as rotas requerem JWT Bearer do Supabase:

```
Authorization: Bearer <supabase_access_token>
```

O token vem de `session.access_token` via [[State-Management/SessionContext]].  
O cliente REST em `lib/apiClient.ts` injeta o token automaticamente.

### Formato de Erro (todos os endpoints)

```json
{ "message": "Human-readable error description" }
```

| Status | Significado |
|--------|-------------|
| 400 | Bad request / validation error |
| 401 | Token ausente ou inválido |
| 403 | Permissão insuficiente |
| 404 | Recurso não encontrado |
| 409 | Conflito (ex: já participante, email em uso) |
| 422 | Falha de validação Zod |
| 500 | Erro interno do servidor |

### TanStack Query Config (mobile)

```ts
// lib/queryClient.ts
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,   // 30 segundos
      retry: 2,
      refetchOnWindowFocus: true,
    },
    mutations: { retry: 0 },
  },
})
```

`lib/useAppFocusRefetch.ts` — invalida todas as queries quando o app volta ao foco.

---

## Configuração Backend (.env)

```env
NODE_ENV=dev
PORT=3333
HOST=0.0.0.0
LOG_LEVEL=info
THE_APP_SECRET=<jwt_secret>

SUPABASE_URL=
SUPABASE_ANON_KEY=

DATABASE_URL=postgresql://docker:docker@localhost:5432/bolao

# Apenas em test
TEST_USER_EMAIL=
TEST_USER_PASSWORD=
```

## Scripts Backend

| Comando | Ação |
|---------|------|
| `npm run dev` | Dev com watch (`tsx watch`) |
| `npm run build` | Build tsup → `build/server.cjs` |
| `npm run start` | Produção (`node build/server.cjs`) |
| `npm run test:run` | Unit tests (use cases) |
| `npm run test:e2e` | E2E tests (HTTP controllers) |
| `npm run test:all` | Unit + E2E |
| `npm run test:coverage` | Cobertura |
| `npx prisma db seed` | Seed do banco |
| `npx prisma migrate reset` | Reset + migrate + seed |

## Import Alias (backend)

```ts
// tsconfig.json: "@/*" → "./src/*"
import { verifySupabaseToken } from '@/http/middlewares/verifySupabaseToken';
```

---

## Índice de Documentação

- [[API/Auth]] — Autenticação end-to-end
- [[API/Routes]] — Tabela completa de rotas
- [[API/Architecture]] — Clean Architecture, erros de domínio
- [[API/Database]] — Prisma schema, models, views SQL
- [[API/UseCases]] — Catálogo de use cases e regras de negócio
- [[API/Testing]] — Estratégia de testes
- [[API/Deploy]] — Build, produção, CI/CD
- [[API/Endpoints-Pools]] — Payloads detalhados de pools
- [[API/Endpoints-Predictions]] — Payloads de palpites
- [[API/Endpoints-Matches]] — Payloads de partidas
- [[API/Endpoints-Users]] — Payloads de usuários
- [[API/Data-Models]] — Tipos TypeScript
