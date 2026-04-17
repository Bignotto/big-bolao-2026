---
title: Screen — Pool Predict (Palpites)
tags: [screen, pool, predictions]
updated: 2026-04-17
---

# Screen — Pool Predict

**Arquivo:** `app/pool/[id]/predict.tsx`
**Rota:** `/pool/[id]/predict`

## Propósito

Permite ao usuário fazer ou editar palpites de placar para as partidas do bolão.

## Lógica de UI

```
Para cada partida:
  ├── matchStatus === 'SCHEDULED'  → ScoreInput habilitado
  ├── matchStatus === 'IN_PROGRESS' → ScoreInput bloqueado (em andamento)
  └── matchStatus === 'COMPLETED'  → Exibe resultado + pontos ganhos
```

## Indicadores de Palpite

| Estado | Descrição |
|--------|-----------|
| Sem palpite | Input vazio, botão salvar |
| Com palpite | Input preenchido, editável se SCHEDULED |
| Partida iniciada | Input desabilitado |
| Partida concluída | Placar real + `pointsEarned` (null até COMPLETED) |

## Componentes Usados

- [[Components/ScoreInput]] — entrada de gols casa/fora
- [[Components/PoolPredictionMatchCard]] — card de palpite com status
- [[Components/AppButton]] — salvar palpite

## Hooks

- [[Hooks/useUpsertPrediction]] — criar/atualizar palpite
- [[Hooks/useMyMatchPredictions]] — palpites existentes do usuário
- [[Hooks/usePoolMatchPredictions]] — partidas do bolão com status

## Regras de Negócio

> [!warning]
> - Palpite bloqueado após início da partida
> - `pointsEarned === null` não significa 0 — significa pendente
> - Fase mata-mata: `knockoutMultiplier` aplicado
> - Final: `finalMultiplier` aplicado

## Links Relacionados

- [[API/Endpoints-Predictions]]
- [[Architecture/Fluxos-Principais]]
