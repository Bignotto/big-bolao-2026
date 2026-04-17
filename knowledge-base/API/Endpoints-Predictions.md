---
title: Endpoints — Predictions
tags: [api, predictions, endpoints]
updated: 2026-04-17
---

# API — Predictions (Palpites)

| Método | Path | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/predictions` | Sim | Lista palpites do usuário (`?poolId&matchId`) |
| `POST` | `/predictions` | Sim | Cria novo palpite |
| `PUT` | `/predictions/:id` | Sim | Atualiza palpite existente |

## POST /predictions — Criar Palpite

```json
// Request
{
  "poolId": 1,
  "matchId": 42,
  "homeTeamScore": 2,
  "awayTeamScore": 1
}
// Response 201
{ "prediction": Prediction }
```

## PUT /predictions/:id — Atualizar Palpite

```json
// Request
{ "homeTeamScore": 1, "awayTeamScore": 0 }
// Response 200
{ "prediction": Prediction }
```

## Regras de Negócio

> [!warning] Regras críticas
> - Apenas **um palpite por (poolId + matchId + userId)** — constraint única
> - Palpites só editáveis antes do início da partida (`matchStatus === 'SCHEDULED'`)
> - `pointsEarned` é `null` até `matchStatus === 'COMPLETED'`
> - Multiplicador de fase mata-mata: `knockoutMultiplier`
> - Multiplicador de final: `finalMultiplier`

## Tipo Prediction

```ts
{
  id: number;
  userId: string;
  poolId: number;
  matchId: number;
  homeTeamScore: number;
  awayTeamScore: number;
  pointsEarned: number | null;  // null = partida não finalizada
  createdAt: string;
  updatedAt: string;
}
```

## Hooks Relacionados

- [[Hooks/useUpsertPrediction]] — cria ou atualiza via POST/PUT
- [[Hooks/usePredictions]] — lista palpites do usuário
- [[Hooks/useMyMatchPredictions]] — palpites do usuário em partidas específicas
- [[Hooks/usePoolMatchPredictions]] — palpites do bolão por partida
