---
title: "ADR-005: Clean Architecture na API Fastify"
tags: [adr, architecture, api-backend, clean-architecture]
updated: 2026-04-17
---

# ADR-005 — Clean Architecture na API Fastify

**Status:** Aceito
**Data:** 2026

## Contexto

A API precisa ser testável, manutenível e com separação clara entre lógica de negócio, acesso a dados e protocolo HTTP.

## Decisão

Usar **Clean Architecture** com camadas bem definidas:
- **Controllers** — recebe HTTP, valida com Zod, chama use case
- **Use Cases** — lógica de negócio pura, sem dependências de HTTP ou banco
- **Repositories** — interfaces de dados, implementadas com Prisma
- **Factories** — instancia use cases com dependências concretas

## Justificativa

- Use cases testáveis com repositórios in-memory (sem banco)
- Lógica de negócio isolada de Fastify e Prisma
- Troca de ORM não quebra os use cases
- Factory pattern permite DI manual sem framework de IoC
- Erros de domínio (`NotParticipantError`, etc.) são classes TypeScript — não HTTP status codes

## Consequências

- Cada feature cria: controller + use case + factory + (opcional) in-memory repo
- Convenções de nomenclatura estritas (ver [[API/Architecture]])
- Testes unitários dos use cases são rápidos (sem I/O)
- Testes E2E dos controllers testam a integração completa

## Alternativas Consideradas

- Fastify com queries Prisma diretamente nas rotas: mais simples mas não testável isoladamente
- NestJS com DI automático: mais estrutura mas mais complexidade de setup

## Links

- [[API/Architecture]]
- [[API/Testing]]
