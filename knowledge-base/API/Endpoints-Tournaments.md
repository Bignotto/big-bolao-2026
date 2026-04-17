---
title: Endpoints — Tournaments
tags: [api, tournaments, endpoints]
updated: 2026-04-17
---

# API — Tournaments

| Método | Path | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/tournaments` | Sim | Lista torneios disponíveis |
| `GET` | `/tournaments/:id` | Sim | Detalhe do torneio |

## Tipo Tournament

```ts
{
  id: number;
  name: string;
  year: number;
  totalMatches: number;
  completedMatches: number;
}
```

## Dados Estáticos

O arquivo `constants/tournament.ts` contém dados estáticos do torneio (grupos, seleções, etc.) usados para UI quando não é necessário hit na API.

Ver: [[Utils/Constants]]
