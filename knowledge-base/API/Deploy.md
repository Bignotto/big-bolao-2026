---
title: API — Deploy & Produção
tags: [api, deploy, production, ci-cd]
updated: 2026-04-17
---

# API — Deploy & Produção

## Build

```bash
npm run build
# → build/server.cjs (CommonJS via tsup)
```

**Por que CJS?** `tsup` converte o código ESM/TypeScript para CommonJS na saída, compatível com Node.js em produção sem flags experimentais.

## Startup em Produção

**Script:** `scripts/start.sh`

```bash
npx prisma migrate deploy   # aplica migrations pendentes
node build/server.cjs       # inicia o servidor
```

> [!warning] Seed nunca é executado em produção
> O script ignora `prisma db seed` intencionalmente para não resetar dados reais.

## Variáveis de Ambiente (Produção)

```env
NODE_ENV=production
PORT=3333
HOST=0.0.0.0
LOG_LEVEL=info
THE_APP_NAME=big-bolao-api
THE_APP_SECRET=<segredo_forte>

SUPABASE_URL=https://<project>.supabase.co
SUPABASE_ANON_KEY=<anon_key>

DATABASE_URL=postgresql://<user>:<pass>@<host>:5432/<db>
```

## CI/CD — GitHub Actions

| Workflow | Trigger | Ação |
|----------|---------|------|
| `ci.yml` | push / PR | lint + `test:all` |
| `deploy.yml` | push main | build + deploy |
| `claude.yml` | issues / PR | Claude Code agent |
| `claude-code-review.yml` | PR | Code review automatizado |

## Logs

Usa **Pino** (logger padrão do Fastify) com `pino-pretty` em dev.

```env
LOG_LEVEL=info   # debug | info | warn | error
```

## Swagger / OpenAPI

- UI disponível em `/docs` (`@fastify/swagger-ui`)
- Spec gerada em `openapi.json` na raiz
- Atualizada automaticamente via schemas nas rotas

## Banco em Container (Dev)

```
DATABASE_URL=postgresql://docker:docker@localhost:5432/bolao
```

PostgreSQL rodando em Docker local.

## Links Relacionados

- [[API/Overview]]
- [[API/Database]]
