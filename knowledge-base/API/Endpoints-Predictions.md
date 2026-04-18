---
title: Endpoints — Predictions
tags: [api, predictions, endpoints]
updated: 2026-04-18
---

# API — Predictions (Palpites)

| Método | Path | Auth | Descrição |
|--------|------|------|-----------|
| `POST` | `/predictions` | Sim | Cria novo palpite |
| `GET` | `/predictions/:id` | Sim | Retorna palpite por ID |
| `PUT` | `/predictions/:id` | Sim | Atualiza palpite existente |
| `GET` | `/users/me/predictions` | Sim | Palpites do usuário (`?poolId=`) |

## POST /predictions — Criar Palpite

```json
// Request body
{
  "poolId": 1,
  "matchId": 42,
  "predictedHomeScore": 2,
  "predictedAwayScore": 1,
  "predictedHasExtraTime": false,
  "predictedHasPenalties": false
}
// Response 201
{ "prediction": Prediction }
```

> [!warning] Campos opcionais de pênalti
> `predictedPenaltyHomeScore` e `predictedPenaltyAwayScore` são **opcionais** no schema Zod do backend.
> **NÃO envie `null`** — omita os campos completamente quando não aplicável.
> Enviar `null` causa erro 422 Validation error.

## PUT /predictions/:id — Atualizar Palpite

```json
// Request body — não incluir poolId, matchId nem predictionId
{
  "predictedHomeScore": 1,
  "predictedAwayScore": 0,
  "predictedHasExtraTime": false,
  "predictedHasPenalties": false
}
// Response 200
{ "prediction": Prediction }
```

> [!note] Campos no corpo do PUT
> Enviar apenas os campos de placar/resultado. O backend identifica o palpite pelo `:id` na URL.
> `poolId`, `matchId` e `predictionId` **não devem** estar no corpo — causam erro de validação se o schema for estrito.

## Tipo Prediction (resposta)

```ts
{
  id: number;
  userId: string;          // Supabase UUID
  poolId: number;
  matchId: number;
  predictedHomeScore: number;
  predictedAwayScore: number;
  predictedHasExtraTime: boolean;
  predictedHasPenalties: boolean;
  predictedPenaltyHomeScore: number | null;
  predictedPenaltyAwayScore: number | null;
  submittedAt: string;
  updatedAt: string | null;
  pointsEarned: number | null;  // null até matchStatus === 'COMPLETED'
}
```

## Regras de Negócio

> [!warning] Regras críticas
> - Apenas **um palpite por (poolId + matchId + userId)** — constraint única no banco
> - Palpites só editáveis antes do início da partida (`matchStatus === 'SCHEDULED'`)
> - `pointsEarned` é `null` até `matchStatus === 'COMPLETED'`
> - Multiplicador de fase mata-mata: `knockoutMultiplier`
> - Multiplicador de final: `finalMultiplier`

## Hooks Relacionados

- [[Hooks/useUpsertPrediction]] — cria ou atualiza via POST/PUT
- [[Hooks/usePredictions]] — lista palpites do usuário por bolão
