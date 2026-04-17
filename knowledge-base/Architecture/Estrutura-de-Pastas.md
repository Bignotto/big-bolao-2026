---
title: Estrutura de Pastas
tags: [architecture, structure]
updated: 2026-04-17
---

# Estrutura de Pastas

```
big-bolao-2026/
├── app/                        # Rotas Expo Router
│   ├── _layout.tsx             # Root layout (providers)
│   ├── +html.tsx               # HTML shell (web)
│   ├── +not-found.tsx          # 404
│   ├── modal.tsx               # Modal genérico
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   └── login.tsx           # Tela de login
│   ├── (tabs)/
│   │   ├── _layout.tsx         # Tab bar
│   │   ├── index.tsx           # Dashboard
│   │   ├── matches.tsx         # Partidas
│   │   ├── profile.tsx         # Perfil
│   │   ├── create-pool.tsx     # Criar bolão
│   │   ├── find-pool.tsx       # Buscar bolão
│   │   └── components.tsx      # Dev: showcase de componentes
│   ├── match/
│   │   └── [id].tsx            # Detalhe de partida
│   └── pool/[id]/
│       ├── _layout.tsx
│       ├── index.tsx           # Detalhe do bolão / ranking
│       ├── predict.tsx         # Palpites
│       ├── settings.tsx        # Configurações do bolão
│       └── match/[matchId].tsx # Palpites de uma partida no bolão
│
├── components/
│   ├── AppComponents/          # Design system próprio
│   │   ├── AppAvatar/
│   │   ├── AppButton/
│   │   ├── AppContainer/
│   │   ├── AppInput/
│   │   ├── AppNumberInput/
│   │   ├── AppPasswordInput/
│   │   ├── AppSpacer/
│   │   ├── AppStarsScore/
│   │   ├── AppText/
│   │   ├── LeaderboardRow/
│   │   ├── MatchCard/
│   │   ├── MatchPredictionStatusCard/
│   │   ├── PoolPredictionMatchCard/
│   │   ├── ScoreInput/
│   │   └── SegmentedControl/
│   └── matches/
│       ├── MatchCard.tsx
│       ├── MatchFilterControls.tsx
│       └── MatchHeader.tsx
│
├── context/
│   └── SessionContext.tsx      # Auth + ApiUser
│
├── data/
│   ├── api/
│   │   └── matches.ts          # Chamadas REST de partidas
│   ├── dto/
│   │   └── MatchDTO.ts         # Shape da API (bruto)
│   └── mappers/
│       └── matchMapper.ts      # DTO → Entidade de domínio
│
├── domain/
│   ├── entities/               # Match, PoolMatchPrediction, etc.
│   ├── enums/                  # MatchStatus, etc.
│   └── helpers/                # Funções puras de domínio
│
├── hooks/
│   ├── *Keys.ts                # Query keys (predictionKeys, etc.)
│   ├── useCreatePool.ts
│   ├── useMyMatchPredictions.ts
│   ├── usePoolMatchPredictions.ts
│   ├── usePoolMembers.ts
│   ├── usePoolStandings.ts
│   ├── usePredictions.ts
│   ├── useSearchPools.ts
│   ├── useUpdateProfile.ts
│   ├── useUpdateScoringRules.ts
│   └── useUpsertPrediction.ts
│
├── lib/
│   ├── apiClient.ts            # fetch wrapper com Bearer token
│   ├── queryClient.ts          # TanStack QueryClient config
│   ├── supabase.ts             # Cliente Supabase
│   └── useAppFocusRefetch.ts   # Refetch ao focar o app
│
├── constants/
│   ├── Colors.ts               # Paleta de cores (light/dark)
│   ├── theme.ts                # Tema styled-components
│   ├── tokens.ts               # Spacing, fontSize, radius…
│   └── tournament.ts           # Dados estáticos do torneio
│
├── styles/
│   └── styled.d.ts             # Tipagem do tema styled-components
│
├── assets/images/              # Ícones, splash, favicon
│
└── docs (raiz do projeto):
    ├── API_ENDPOINTS.md
    ├── NEW-BACKEND-ENDPOINTS.md
    ├── DATA_MODELS.md
    ├── BUSINESS_RULES.md
    └── BIG-BOLAO-MOBILE-ARCHITECTURE.md
```
