---
title: Screen — Pool Settings (Configurações)
tags: [screen, pool, settings, owner]
updated: 2026-04-17
---

# Screen — Pool Settings

**Arquivo:** `app/pool/[id]/settings.tsx`
**Rota:** `/pool/[id]/settings`
**Acesso:** Apenas dono do bolão

## Propósito

Gerenciar configurações do bolão e regras de pontuação. Exclusivo do dono.

## Funcionalidades

| Ação | Endpoint |
|------|----------|
| Editar nome/descrição | `PUT /pools/:id` |
| Alterar regras de pontuação | `PUT /pools/:id/scoring-rules` |
| Remover participante | `DELETE /pools/:id/users/:userId` |
| Ver código de convite | Exibição do `inviteCode` |

## Regras de Pontuação Editáveis

| Campo | Padrão | Descrição |
|-------|--------|-----------|
| `exactScorePoints` | **3** | Acerta placar exato |
| `correctWinnerGoalDiffPoints` | **2** | Acerta vencedor e diferença de gols |
| `correctWinnerPoints` | 1 | Acerta apenas o vencedor |
| `correctDrawPoints` | 1 | Acerta empate |
| `specialEventPoints` | 5 | Evento especial |
| `knockoutMultiplier` | **1.5** | Multiplicador fase mata-mata |
| `finalMultiplier` | **2.0** | Multiplicador da final |

> [!note] Fonte dos defaults
> Confirmados no `createPoolUseCase.ts` da API. Os valores foram corrigidos nesta documentação.

> [!warning] Retroativo
> Mudanças nas regras recalculam pontos de **todos** os palpites históricos imediatamente.

## Hooks

- [[Hooks/useUpdateScoringRules]]
- [[Hooks/usePoolMembers]]

## Links Relacionados

- [[Screens/Screen-PoolDetail]]
- [[API/Endpoints-Pools]]
- [[API/Data-Models]]
