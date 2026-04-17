---
title: API — Testes
tags: [api, testing, vitest, e2e]
updated: 2026-04-17
---

# API — Estratégia de Testes

**Framework:** Vitest + Supertest
**Config unit:** `vitest.config.ts`
**Config e2e:** `vitest.config.e2e.ts`

## Dois Tipos de Teste

### 1. Unitários (`useCases/**/*.spec.ts`)

Testam lógica de negócio dos use cases isolada:
- Usam **In-Memory Repositories** (sem banco, sem HTTP)
- Rápidos, rodados em cada PR via CI

```bash
npm run test:run
npm run test:run -- path/to/test.spec.ts
```

### 2. E2E (`http/**/*.spec.ts`)

Testam controllers e rotas HTTP completos:
- Banco real (`.env.test`)
- `createTestApp()` de `src/test/helper-e2e.ts`
- Supertest simula requests HTTP reais
- Requerem `TEST_USER_EMAIL` e `TEST_USER_PASSWORD`

```bash
npm run test:e2e
npm run test:e2e -- path/to/test.spec.ts
```

## Helpers

| Arquivo | Papel |
|---------|-------|
| `src/test/helper-e2e.ts` | `createTestApp()` — instância Fastify de teste |
| `src/test/mockJwt.ts` | Gera JWT mock (sem Supabase real) |
| `src/test/setup-e2e.ts` | Setup global de banco de teste |
| `src/test/mocks/match.ts` | Factory de partida mock |
| `src/test/mocks/predictions.ts` | Factory de palpites mock |
| `src/test/mocks/teams.ts` | Factory de times mock |
| `src/test/mocks/tournament.ts` | Factory de torneio mock |
| `src/test/mocks/users.ts` | Factory de usuários mock |

## In-Memory Repositories

Cada módulo implementa a interface do repositório em memória:
- `InMemoryMatchesRepository.ts`
- `InMemoryPoolsRepository.ts`
- `InMemoryPredictionsRepository.ts`
- `InMemoryTournamentsRepository.ts`
- `InMemoryUsersRepository.ts`

Mesma interface dos repositórios Prisma → use cases 100% testáveis sem banco.

## Padrão de Teste

```ts
// Use case (unit):
const poolsRepo = new InMemoryPoolsRepository();
const useCase = new CreatePoolUseCase(poolsRepo, usersRepo, tournamentsRepo);
const pool = await useCase.execute({ name: 'My Pool', ... });
expect(pool.id).toBeDefined();

// Controller (e2e):
const app = await createTestApp();
const res = await supertest(app.server)
  .post('/pools')
  .set('Authorization', `Bearer ${mockToken}`)
  .send({ name: 'Test Pool', tournamentId: 1 });
expect(res.status).toBe(201);
```

## Cobertura

```bash
npm run test:coverage       # unit
npm run test:e2e:coverage   # e2e
npm run test:ui             # Vitest UI interativo
```

## CI/CD

`.github/workflows/ci.yml` — roda `test:all` em cada PR.
