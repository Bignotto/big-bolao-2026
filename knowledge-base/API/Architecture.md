---
title: API — Arquitetura (Clean Architecture)
tags: [api, architecture, clean-architecture, fastify]
updated: 2026-04-17
---

# API — Arquitetura

## Padrão: Clean Architecture

```
src/
├── http/
│   ├── controllers/        ← Camada HTTP (recebe request, retorna response)
│   │   ├── matches/
│   │   ├── pools/
│   │   ├── predictions/
│   │   ├── tournaments/
│   │   └── user/
│   ├── middlewares/        ← Auth guards
│   │   ├── verifyJwt.ts
│   │   └── verifySupabaseToken.ts
│   ├── routes/             ← Registro de rotas Fastify
│   │   ├── index.ts
│   │   ├── matches.routes.ts
│   │   ├── pools.routes.ts
│   │   ├── predictions.routes.ts
│   │   ├── tournaments.routes.ts
│   │   └── user.routes.ts
│   └── schemas/            ← Schemas Zod/JSON para Swagger
│       ├── common.schemas.ts
│       ├── match.schemas.ts
│       ├── pool.schemas.ts
│       ├── prediction.schemas.ts
│       ├── tournament.schemas.ts
│       └── user.schemas.ts
│
├── useCases/               ← Lógica de negócio pura (sem I/O direto)
│   ├── matches/
│   ├── pools/
│   │   └── errors/         ← Erros de domínio de pools
│   ├── predictions/
│   └── users/
│
├── repositories/           ← Contratos + implementações de dados
│   ├── matches/
│   │   ├── IMatchesRepository.ts
│   │   ├── InMemoryMatchesRepository.ts  ← Testes unitários
│   │   └── PrismaMatchesRepository.ts
│   ├── pools/
│   ├── predictions/
│   ├── tournaments/
│   └── users/
│
├── services/
│   └── pools/
│       └── PoolAuthorizationService.ts
│
├── global/
│   ├── errors/             ← ResourceNotFoundError
│   └── types/              ← PoolStandings, PoolParticipant
│
├── lib/
│   ├── prisma.ts           ← PrismaClient singleton
│   └── supabase.ts         ← Supabase client
│
└── test/
    ├── helper-e2e.ts        ← createTestApp()
    ├── mockJwt.ts
    ├── setup-e2e.ts
    └── mocks/              ← Factories de dados para testes
```

## Fluxo de uma Requisição

```
POST /pools
  │
  ├─ [Hook] verifySupabaseToken → valida JWT Supabase → seta request.user.sub
  │
  ├─ createPoolController
  │     └─ Extrai body, valida com Zod
  │         └─ makeCreatePoolUseCase() → instancia CreatePoolUseCase
  │               com PrismaPoolsRepository + PrismaUsersRepository + PrismaTournamentsRepository
  │
  └─ CreatePoolUseCase.execute()
        ├─ Verifica nome único → PoolNameInUseError
        ├─ Verifica creator existe → ResourceNotFoundError
        ├─ Verifica tournament existe → ResourceNotFoundError
        ├─ Pool privado sem code → InviteCodeRequiredError
        ├─ poolsRepo.create(...)
        ├─ poolsRepo.createScoringRules(...)  ← defaults automáticos
        └─ poolsRepo.addParticipant(...)      ← creator vira participante
```

## Factory Pattern

```ts
// useCases/pools/factory/makeCreatePoolUseCase.ts
export function makeCreatePoolUseCase() {
  return new CreatePoolUseCase(
    new PrismaPoolsRepository(),
    new PrismaUsersRepository(),
    new PrismaTournamentsRepository()
  );
}
```

Cada use case tem uma factory que injeta os repositórios Prisma concretos.

## PoolAuthorizationService

`src/services/pools/PoolAuthorizationService.ts` — serviço centralizado para autorização em pools:

| Método | Verifica |
|--------|---------|
| `checkUserPoolAccess()` | Se user é participante ou criador |
| `validateUserPoolAccess()` | Idem, lança `NotParticipantError` se não |
| `validatePoolCreatorAccess()` | Se user é o criador, lança `NotPoolCreatorError` |
| `validateParticipantAccess()` | Se user é participante |
| `validateParticipantCanLeave()` | Criador não pode sair do próprio pool |

## Erros de Domínio

### Pools (`useCases/pools/errors/`)

| Erro | Causa | HTTP |
|------|-------|------|
| `DeadlineError` | Prazo de inscrição expirado | 409 |
| `InviteCodeRequiredError` | Pool privado sem invite code | 422 |
| `MaxParticipantsError` | Limite de participantes atingido | 409 |
| `NotParticipantError` | Usuário não é participante | 403 |
| `NotPoolCreatorError` | Requer ser dono do pool | 403 |
| `PoolNameInUseError` | Nome de pool já existe | 409 |
| `UnauthorizedError` | Criador tentou sair do próprio pool | 403 |

### Global (`global/errors/`)

| Erro | Causa | HTTP |
|------|-------|------|
| `ResourceNotFoundError` | User, pool ou tournament não encontrado | 404 |

### Matches (`useCases/matches/errors/`)

| Erro | Causa | HTTP |
|------|-------|------|
| `MatchUpdateError` | Falha ao atualizar partida | 400 |

## Convenções de Código

| Item | Convenção |
|------|-----------|
| Controllers | `camelCase` terminados em `Controller` |
| Use cases | `PascalCase` terminados em `UseCase` |
| Factories | `camelCase` prefixados em `make` |
| Route functions | `camelCase` terminados em `Routes` |
| Imports | Libs externas → internos `@/` (alfabetizados, newline entre grupos) |
| Formato | Prettier: ponto-e-vírgula, aspas simples, 100 chars |

## Links Relacionados

- [[API/Overview]]
- [[API/Database]]
- [[API/UseCases]]
- [[API/Auth]]
