# 📱 Big Bolão 2026 — Mobile Architecture

## 🎯 Objetivo

Este documento define a arquitetura completa do app mobile **Big Bolão 2026**, incluindo:

- Estrutura de código
- Camadas arquiteturais
- Fluxos principais
- Regras de negócio
- Padrões de implementação

Este documento deve ser usado como **fonte única de verdade** para desenvolvimento (Claude Code, Codex e humano).

---

# 🧠 Visão Geral

O app é um sistema de bolão esportivo onde usuários:

- Criam ou entram em bolões
- Fazem palpites por partida
- Acumulam pontos
- Competem em rankings

---

# 🧱 Arquitetura

## Camadas

Presentation → Application → Domain → Data → Infrastructure

### 1. Presentation

- Telas (screens)
- Navegação (Expo Router)
- Componentes visuais
- Estado de UI

### 2. Application

- Casos de uso
- Orquestração de fluxos
- Coordenação entre UI e dados

### 3. Domain

- Entidades
- Regras de negócio
- Enums
- Contratos de repositório

### 4. Data

- API REST
- Supabase Auth
- Cache
- Mapeamento de DTOs

### 5. Infrastructure

- HTTP client
- Token refresh
- Storage seguro
- Configuração de ambiente

---

# 🗂️ Estrutura de Pastas

src/
app/
router/
providers/
config/

features/
auth/
dashboard/
pools/
matches/
predictions/
profile/

domain/
entities/
enums/
helpers/
contracts/

data/
api/
client/
dto/
mappers/
repositories/
auth/
storage/

shared/
components/
theme/
utils/
types/

---

# 🔐 Autenticação

## Fluxo

1. Login via Supabase
2. Recebe JWT
3. Salva token seguro
4. Envia token para API

Authorization: Bearer <token>

## Regras

- Sempre validar sessão no boot
- Implementar refresh automático
- Logout limpa tudo (cache + storage)

---

# 🌐 API

## Base URL

Definida por ambiente

## Headers

{
"Authorization": "Bearer <token>",
"Content-Type": "application/json"
}

## Erros

{
"message": "Descrição do erro"
}

---

# 🧩 Domínio

## Entidades

- User
- Pool
- Match
- Prediction
- MatchPredictionStatus
- LeaderboardEntry
- Tournament
- Team

---

## Regras Críticas

- 1 palpite por jogo por bolão
- Palpites travam ao iniciar partida
- Pontos só existem após jogo concluído
- Regras de pontuação são retroativas
- Apenas criador edita regras
- Muitos campos podem ser `null`
- A tela de lista de jogos NÃO carrega palpites — é uma agenda read-only
- Palpites são carregados apenas na tela de detalhe do jogo

---

# ⚙️ Casos de Uso

## Auth

- signIn
- signUp
- restoreSession
- signOut

## Pools

- getMyPools
- createPool
- joinPool
- getPoolDetails
- getStandings

## Matches

- getMatches(tournamentId) — carrega todas as partidas do torneio; filtragem feita client-side
- getMatchDetails
- getMyMatchPredictions ← novo: carrega palpites do usuário para um jogo específico, agrupados por bolão

## Predictions

- createPrediction
- updatePrediction
- getMyPredictions

---

# 🔄 Fluxos Principais

## Boot do App

start
→ restore session
→ refresh token
→ get user
→ navegar para app ou login

---

## Dashboard

→ buscar meus bolões
→ listar pools
→ CTA criar/entrar

---

## Lista de Jogos (aba global)

→ carregar partidas do torneio
→ exibir agenda read-only (sem palpites)
→ ao clicar em um jogo → navegar para tela de detalhe

> ⚠️ NÃO carregar predictions nesta tela. O N+1 de predictions por jogo causa lentidão crítica.

---

## Detalhe do Jogo

→ exibir dados do jogo (já disponíveis via navegação)
→ chamar GET /matches/:matchId/predictions/me
→ para cada bolão: exibir palpite ou prompt "Você ainda não apostou neste jogo"
→ CTA para criar/editar palpite por bolão

---

## Criar Palpite

→ carregar partidas
→ carregar palpites existentes
→ validar se jogo não começou
→ salvar
→ atualizar cache

---

## Entrar em Bolão por Convite

→ buscar pool por código
→ mostrar preview
→ confirmar entrada
→ atualizar dashboard

---

# 🧠 Estado

## Server State (usar TanStack Query)

- pools
- matches
- predictions
- standings

## Client State

- auth session
- user
- settings

## UI State

- formulários
- loading
- modais

---

# 📦 Cache

## Query Keys

['me']
['my-pools']
['pool', id]
['pool-standings', id]
['matches', 'tournament', tournamentId, filters] ← carrega todas as partidas; filtragem client-side
['match', id]
['match-predictions-me', matchId] ← palpites do usuário autenticado para um jogo específico
['predictions', poolId]

---

## Estratégia

- Revalidar ao focar tela
- Pull-to-refresh
- Polling leve (30–60s)

---

# 🧩 Hook: useMyMatchPredictions

```ts
// features/matches/hooks/useMyMatchPredictions.ts

const useMyMatchPredictions = (matchId: number) =>
  useQuery({
    queryKey: ['match-predictions-me', matchId],
    queryFn: () => api.get(`/matches/${matchId}/predictions/me`),
  });

// Uso na tela de detalhe:
const { data } = useMyMatchPredictions(matchId);
const pending = data?.predictions.filter((p) => p.prediction === null) ?? [];
// pending.length > 0 → exibir alerta "Você ainda não apostou em N bolão(ões)"
```

---

# 🧪 Formulários

- react-hook-form
- zod

---

# 🎨 UI

## Base Components

- AppText
- AppButton
- AppInput
- AppAvatar

## Domain Components

- PoolCard
- MatchCard — `components/matches/MatchCard`
  - props: `match: Match`, `onPress: () => void`, `centerSubtext: string`
  - center column: time (HH:mm) + centerSubtext + separator line
  - flag image via `team.flagUrl`; when null renders a colored placeholder with countryCode initials
- TeamFlag — `components/matches/TeamFlag`
  - props: `flagUrl: string | null`, `teamName: string`, `size?: 'sm' | 'md' | 'lg'`
  - sizes: sm 32×24, md 56×42, lg 72×54; falls back to gray placeholder on null or error
- MatchHeader — `components/matches/MatchHeader`
  - props: `match: Match`
  - dark hero card (primary_dark bg): metadata line (stage · group · stadium), teams+flags row, status badge (datetime / live pill / Encerrado / Adiado)
- LeaderboardRow
- ScoreInput
- PredictionCard
- MatchPredictionStatusCard — `components/AppComponents/MatchPredictionStatusCard`
  - props: `poolName`, `poolId`, `matchId`, `matchStatus`, `prediction`, `userRank`, `homeTeamCode`, `awayTeamCode`, `onPressBet`
  - resolves one of 5 variants: no-prediction-open, prediction-open, prediction-live, no-prediction-locked, prediction-completed

---

## Tela de Partidas

Arquivo: `app/(tabs)/matches.tsx`

### Modos de visualização

**Modo A — Por Grupo / Etapa** (padrão, abre em "Grupo A")

- Chips horizontais: Grupo A–L + fases eliminatórias (Oitavas, Quartas, Semifinal, 3º lugar, Final)
- Chip de grupo → `filterByGroup` + `groupByRound` → `SectionList` com headers "Grupo X · Rodada N"
- Chip eliminatório → `filterByStage` → seção única com label de `STAGE_LABELS`
- `centerSubtext` do MatchCard: data formatada "dd/MM"

**Modo B — Por Data**

- Pills horizontais com dia abreviado (ex: "Sex / 13") derivados de `getAvailableDates`
- Data padrão: earliest date com pelo menos uma partida com `matchStatus !== COMPLETED`
- `filterByDate` → `FlatList` sem seções
- `centerSubtext` do MatchCard: `STAGE_LABELS[stage]` ou "Grupo X" para partidas de grupo

### Filtragem client-side

Toda filtragem ocorre no cliente. A API é chamada **uma única vez** com `GET /tournaments/:id/matches` (sem parâmetros de filtro). Trocar chip ou data não dispara novas requisições.

### Flag de seleção de país

- `team.flagUrl` presente → `<Image source={{ uri: flagUrl }} />`
- `team.flagUrl` null → `<View>` colorido (cor `theme.colors.border`) com texto `countryCode` centralizado

---

# ⚠️ Regras de UI

- Nunca confiar direto na API
- Sempre tratar `null`
- Mostrar estado "pendente" para pontos
- Mostrar regras de pontuação sempre
- Na tela de detalhe do jogo, `prediction: null` em um bolão deve renderizar um aviso visível e um CTA para submeter o palpite

---

# 🔐 Segurança

- Usar SecureStore
- Nunca usar AsyncStorage para tokens
- Limpar tudo no logout

---

# 🌍 Ambientes

- dev
- staging
- production

---

# 📡 Sync

## NÃO usar realtime inicialmente

## Usar:

- refetch on focus
- polling

---

# 🚨 Riscos

- misturar lógica com UI
- não tratar cache
- não tratar token expiração
- usar DTO direto na tela
- carregar predictions na lista global de jogos (N+1 crítico — ver regra na seção de fluxos)

---

# 🛠️ Stack

- Expo
- React Native
- TypeScript
- TanStack Query
- React Hook Form
- Zod
- SecureStore

---

# 🚀 Roadmap

## Fase 1

- auth
- http client
- estrutura base

## Fase 2

- pools
- matches
- predictions

## Fase 3

- criação de bolão
- convite
- perfil

## Fase 4

- refinamento
- performance
- analytics

---

# 📌 Diretriz Final

> O app deve ser orientado a domínio, não a telas.

Se precisar escolher entre rapidez e arquitetura correta, escolha arquitetura.
