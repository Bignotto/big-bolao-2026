---
title: Screen — Pool Detail (Detalhe do Bolão)
tags: [screen, pool, leaderboard]
updated: 2026-04-18
---

# Screen — Pool Detail

**Arquivo:** `app/pool/[id]/index.tsx`
**Rota:** `/pool/[id]`
**Parâmetro:** `id` = poolId

## Propósito

Tela central do bolão. Exibe ranking, palpites e informações do grupo (regras + participantes).

## Abas (SegmentedControl)

| Aba | Valor | Descrição |
|-----|-------|-----------|
| Ranking | `standings` | Leaderboard com posição, avatar, pontos e placar exatos |
| Palpites | `predictions` | Partidas filtradas por grupo/fase/data com status de palpite |
| Grupo | `info` | Regras de pontuação + lista de participantes com ações |

### Aba "Grupo" — detalhes

- **Regras de pontuação:** exibe os campos de `ScoringRule` (placar exato, vencedor, empate, multiplicadores).
- **Participantes:** lista com avatar + nome, no mesmo estilo visual da tabela de ranking.
  - **Admin (isCreator):** botão de lixeira por participante → `Alert` de confirmação → `DELETE /pools/:poolId/users/:userId` → remove da lista.
  - **Membro comum:** botão "Sair do Grupo" no rodapé → `Alert` → `DELETE /pools/:poolId/users/me` → navega para `/(tabs)`.

> [!note] userId no backend
> O endpoint `DELETE /pools/:poolId/users/:userId` valida `userId` como UUID (Supabase). Versões anteriores do backend usavam `.cuid()` — foi corrigido para `.uuid()`.

## Componentes Usados

- [[Components/LeaderboardRow]] — linha do ranking
- [[Components/AppAvatar]] — avatar nos rankings e na lista de participantes
- `SegmentedControl` — seletor de abas principal
- `MatchFilterControls` — filtros da aba Palpites

## Hooks

- [[Hooks/usePoolStandings]] → `GET /pools/:id/standings`
- [[Hooks/usePoolMembers]] → `GET /pools/:id/users`
- [[Hooks/useRemovePoolMember]] → `DELETE /pools/:id/users/:userId`
- [[Hooks/useLeavePool]] → `DELETE /pools/:id/users/me`

## Navegação a Partir Daqui

| Destino | Condição |
|---------|----------|
| `pool/[id]/predict` | Toca em partida agendada na aba Palpites |
| `pool/[id]/match/[matchId]` | Toca em partida encerrada/ao vivo na aba Palpites |
| `pool/[id]/settings` | Botão de engrenagem (dono do bolão) |
| `/(tabs)` | Após sair do grupo com sucesso |

## Links Relacionados

- [[Screens/Screen-PoolPredict]]
- [[Screens/Screen-PoolSettings]]
- [[API/Endpoints-Pools]]
