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

- getMatches
- getMatchDetails

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
['matches', tournamentId]
['match', id]
['predictions', poolId]

---

## Estratégia

- Revalidar ao focar tela
- Pull-to-refresh
- Polling leve (30–60s)

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
- MatchCard
- LeaderboardRow
- ScoreInput
- PredictionCard

---

# ⚠️ Regras de UI

- Nunca confiar direto na API
- Sempre tratar `null`
- Mostrar estado "pendente" para pontos
- Mostrar regras de pontuação sempre

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
