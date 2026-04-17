---
title: Screen — Pool Detail (Detalhe do Bolão)
tags: [screen, pool, leaderboard]
updated: 2026-04-17
---

# Screen — Pool Detail

**Arquivo:** `app/pool/[id]/index.tsx`
**Rota:** `/pool/[id]`
**Parâmetro:** `id` = poolId

## Propósito

Tela central do bolão. Exibe ranking, participantes e permite navegar para palpites e configurações.

## Seções

| Seção | Descrição |
|-------|-----------|
| Header | Nome do bolão, status, dono |
| Ranking | Leaderboard com posição, avatar, pontos |
| Partidas | Lista de partidas com status de palpite |
| Ações | Botão "Fazer palpites", botão de configurações (dono) |

## Componentes Usados

- [[Components/LeaderboardRow]] — linha do ranking
- [[Components/MatchPredictionStatusCard]] — status de palpite por partida
- [[Components/AppAvatar]]

## Hooks

- [[Hooks/usePoolStandings]] → `GET /pools/:id/standings`
- [[Hooks/usePoolMembers]] → `GET /pools/:id/users`

## Navegação a Partir Daqui

| Destino | Condição |
|---------|----------|
| `pool/[id]/predict` | Botão "Palpitar" |
| `pool/[id]/settings` | Dono do bolão |
| `pool/[id]/match/[matchId]` | Toca em partida |

## Links Relacionados

- [[Screens/Screen-PoolPredict]]
- [[Screens/Screen-PoolSettings]]
- [[API/Endpoints-Pools]]
