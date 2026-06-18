---
title: Screen — Pool Predict (Palpite de Partida)
tags: [screen, pool, predictions]
updated: 2026-06-14
---

# Screen — Pool Predict

**Arquivo:** `app/pool/[id]/predict.tsx`
**Rota:** `/pool/[id]/predict?matchId=[matchId]`

## Propósito

Tela de palpite por partida. Abre como modal a partir da tela de pool detail. O usuário define o placar usando `ScoreStepper` e salva/atualiza o palpite.

## Parâmetros de rota

| Param | Tipo | Origem |
|-------|------|--------|
| `id` | string | poolId |
| `matchId` | string | matchId |

## Seções da tela

### Top bar
- Botão de fechar (chevron) → `router.back()`
- Nome do bolão em eyebrow centralizado

### Eyebrow de partida
- Stage + grupo/rodada (ex: `GRUPO A · RODADA 1`)
- Data/hora/estádio

### Steppers
- `ScoreStepper` para cada time (casa e visitante)
- Desabilitado quando `isMatchLocked(match) === true`

### Interpretation card (pré-jogo)
- Mostra o resultado do palpite atual: "Vitória de X · saldo N" ou "Empate"
- Exibe pontos possíveis baseados em `pool.scoringRules`
- Oculto quando o jogo está bloqueado

### Result card (pós-jogo)
- Exibido quando `matchStatus === COMPLETED` e há palpite existente
- Mostra `homeTeamScore–awayTeamScore`, pontos ganhos e o palpite feito

### "Como pontua" (collapsible)
- Painel recolhível com a tabela de pontuação do bolão
- Aberto por padrão; oculto quando jogo já começou
- Exibe: Placar exato, Vencedor + saldo, Vencedor, Empate

### CTA (sticky)
- **Desbloqueado:** `AppButton` "Salvar palpite · X–Y →" ou "Atualizar palpite · X–Y →"
- **Bloqueado:** banner com `Ionicons lock-closed` + horário de bloqueio + palpite salvo

## Lógica de bloqueio

```
isMatchLocked(match) — compara matchDatetime (horário SP) com now (SP)
→ true: steppers desabilitados, CTA vira banner, panels ocultos
```

> [!warning]
> `isMatchLocked` compara como naive string no fuso de São Paulo. Não usar `.getTime()` ou UTC diretamente.

## Easter egg — Brasil perde

Se o palpite implica derrota do Brasil, exibe `Alert.alert('🇧🇷 Eita...')` pedindo confirmação antes de salvar.

## Hooks

| Hook | Uso |
|------|-----|
| `useMatch(matchId)` | dados da partida |
| `usePool(poolId)` | nome e `scoringRules` do bolão |
| `usePredictions(poolId, [matchId], userId)` | palpite existente |
| `useUpsertPrediction(poolId)` | criar/atualizar palpite |

## Componentes Usados

- `ScoreStepper` — `components/AppComponents/ScoreStepper`
- [[Components/AppButton]]

## Regras de Negócio

> [!warning]
> - Palpite bloqueado após início da partida (via `isMatchLocked`, não `matchStatus`)
> - `pointsEarned === null` não significa 0 — significa pendente
> - `pool.scoringRules` deve estar disponível para exibir a tabela "Como pontua"

## Links Relacionados

- [[API/Endpoints-Predictions]]
- [[Utils/Domain-Entities]] → `isMatchLocked`
- [[Hooks/useUpsertPrediction]]
- [[Architecture/Fluxos-Principais]]
