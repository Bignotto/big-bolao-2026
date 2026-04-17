---
title: Fluxos Principais do Usuário
tags: [architecture, flows, UX]
updated: 2026-04-17
---

# Fluxos Principais do Usuário

## 1. Autenticação

```
App abre
  └─> SplashScreen visível
  └─> _layout.tsx carrega fontes
      └─> SessionProvider monta
          └─> supabase.auth.onAuthStateChange
              ├── Sem sessão → redirect /(auth)/login
              │     ├── Login e-mail/senha
              │     ├── Google OAuth (expo-auth-session)
              │     └── Apple Sign In (expo-apple-authentication)
              └── Com sessão → fetchOrCreateApiUser(session)
                    ├── GET /users/me (200 OK) → usa ApiUser existente
                    └── GET /users/me (404) → POST /users → cria ApiUser
                          └── redirect /(tabs)
```

Ver: [[State-Management/SessionContext]], [[Screens/Screen-Login]]

---

## 2. Criar Bolão

```
(tabs)/create-pool.tsx
  └─> useCreatePool() mutation
      └─> POST /pools
          └─> 201 Created
              └─> navigate pool/[id]/index
```

Campos: nome, descrição, torneio, público/privado, código de convite, máx. participantes, prazo de inscrição.

Ver: [[Screens/Screen-CreatePool]], [[Hooks/useCreatePool]], [[API/Endpoints-Pools]]

---

## 3. Entrar em Bolão

```
(tabs)/find-pool.tsx
  └─> useSearchPools() → GET /pools?name=...
      └─> Seleciona bolão
          └─> POST /pools/:poolId/users (bolão público)
              └─> navigate pool/[id]/index

-- OU via link de convite --
deep link: bigbolao2026://pool-invites/CODE
  └─> GET /pool-invites/:code (preview)
  └─> POST /pool-invites/:code (join)
      └─> navigate pool/[id]/index
```

Ver: [[Screens/Screen-FindPool]], [[Hooks/useSearchPools]], [[API/Endpoints-Pools]]

---

## 4. Fazer Palpite

```
pool/[id]/predict.tsx
  └─> useMyMatchPredictions() → lista palpites existentes
  └─> usePoolMatchPredictions() → partidas com status
      └─> ScoreInput (gols casa / gols fora)
          └─> useUpsertPrediction() mutation
              └─> POST /predictions (novo) ou PUT /predictions/:id (editar)
```

> [!warning] Regra de negócio
> Palpites são bloqueados após o início da partida (`matchStatus !== 'SCHEDULED'`).
> `pointsEarned` permanece `null` até `matchStatus === 'COMPLETED'`.

Ver: [[Screens/Screen-PoolPredict]], [[Hooks/useUpsertPrediction]], [[API/Endpoints-Predictions]]

---

## 5. Acompanhar Ranking

```
pool/[id]/index.tsx
  └─> usePoolStandings() → GET /pools/:poolId/standings
      └─> LeaderboardRow (posição, avatar, pontos)
```

Ver: [[Screens/Screen-PoolDetail]], [[Hooks/usePoolStandings]], [[Components/LeaderboardRow]]

---

## 6. Ver Partidas

```
(tabs)/matches.tsx
  └─> MatchFilterControls (fase, grupo, status)
  └─> MatchCard (times, placar, horário)
      └─> navigate match/[id]
```

Ver: [[Screens/Screen-Matches]], [[Components/MatchCard]]
