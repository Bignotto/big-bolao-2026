# Big Bolão 2026 — Mobile Architecture

## Objetivo

Este documento descreve a arquitetura atual do app mobile **Big Bolão 2026** e deve ser usado como referência para Codex, Claude Code e humanos.

O app permite que usuários:

- Criem ou entrem em bolões
- Vejam a agenda da Copa do Mundo 2026
- Façam palpites por partida e por bolão
- Acompanhem pontuação e ranking
- Editem regras de pontuação quando são donos do bolão

---

## Stack Atual

- Expo + Expo Router
- React Native + TypeScript strict
- styled-components/native
- TanStack Query
- Supabase Auth
- Expo SecureStore para sessão
- Inter fonts via `@expo-google-fonts/inter`
- `@expo/vector-icons`

Verificação estática obrigatória:

```sh
npx tsc --noEmit
```

---

## Estrutura Atual

```text
app/
  _layout.tsx
  (auth)/login.tsx
  (tabs)/
    _layout.tsx
    index.tsx
    matches.tsx
    profile.tsx
    create-pool.tsx
    find-pool.tsx
    two.tsx
    components.tsx
  match/[id].tsx
  pool/[id]/
    index.tsx
    predict.tsx
    settings.tsx

components/
  AppComponents/
  matches/

context/
  SessionContext.tsx

data/
  api/
  dto/
  mappers/

domain/
  entities/
  enums/
  helpers/

hooks/
  *Keys.ts
  use*.ts

lib/
  apiClient.ts
  queryClient.ts
  supabase.ts
  useAppFocusRefetch.ts
```

Observação: a arquitetura desejada continua sendo orientada a domínio. O app ainda usa uma estrutura flat em `hooks/` e `app/`; uma migração para `features/*` deve ser feita só quando reduzir complexidade real.

---

## Camadas

- **Presentation**: rotas em `app/`, componentes em `components/`, estado local de UI
- **Application**: hooks de fluxo e TanStack Query em `hooks/`
- **Domain**: entidades, enums e helpers em `domain/`
- **Data**: DTOs, mappers e chamadas REST em `data/` e `lib/apiClient.ts`
- **Infrastructure**: Supabase, SecureStore, QueryClient e app focus refetch em `lib/` e `context/`

Regras:

- Não usar DTO direto na tela quando houver entidade/mapeador local
- Sempre tratar `null` vindo da API
- Manter lógica de domínio fora dos componentes visuais sempre que possível
- Preferir `theme` e tokens aos hard-coded colors em novos códigos

---

## Autenticação

Fluxo:

1. Login via Supabase (Google/Apple atualmente na UI)
2. Supabase persiste sessão via SecureStore
3. `SessionContext` busca `GET /users/me`
4. Se o usuário não existe, `SessionContext` cria via `POST /users`
5. O app envia `Authorization: Bearer <token>` pelo `apiFetch`
6. Logout limpa Supabase + cache do TanStack Query e volta para `/(auth)/login`

Modelo de usuário na UI deve seguir o backend:

- `fullName`
- `email`
- `profileImageUrl`
- `role`

---

## API e Cache

`apiFetch` adiciona:

```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

Query keys principais:

- `['me']`
- `['pools', 'mine']`
- `['pools', poolId]`
- `['pools', poolId, 'standings']`
- `['matches', 'tournament', tournamentId, filters]`
- `['matches', 'detail', matchId]`
- `['matches', 'predictions-me', matchId]`
- `['predictions', 'pool', poolId]`

Estratégia:

- Revalidar ao focar o app
- Pull-to-refresh em listas principais
- Ranking com polling leve
- Mutations de palpite invalidam o cache do pool e da tela de detalhe do jogo

---

## Fluxos Principais

### Dashboard

- Busca os bolões do usuário
- Exibe cards de grupo com quantidade de participantes e acesso a palpites/ranking/calendário
- CTAs para criar grupo e buscar grupo

### Lista Global de Partidas

- Arquivo: `app/(tabs)/matches.tsx`
- Busca todas as partidas com `GET /tournaments/:id/matches`
- Filtra client-side por grupo/etapa ou por data
- Não carrega palpites
- Ao tocar em uma partida, navega para `/match/:id`

Regra crítica: nunca adicionar chamadas de prediction nesta tela.

### Detalhe Global do Jogo

- Arquivo: `app/match/[id].tsx`
- Busca o jogo por id
- Busca `GET /matches/:matchId/predictions/me`
- Mostra um card por bolão do usuário
- Quando houver `prediction: null`, mostra aviso e CTA para apostar
- Exibe banner com a quantidade de bolões pendentes

### Detalhe do Bolão

- Arquivo: `app/pool/[id]/index.tsx`
- Abas: `Palpites`, `Ranking`, `Partidas`
- `Palpites` e `Partidas` usam a lista de jogos do torneio
- Palpites do usuário no bolão vêm de `GET /users/me/predictions?poolId=...`
- Partidas bloqueadas navegam para `/match/:id`
- Partidas abertas navegam para `/pool/:id/predict?matchId=:matchId`

### Criar/Editar Palpite

- Arquivo: `app/pool/[id]/predict.tsx`
- Carrega o jogo, o bolão e a predição existente
- Bloqueia edição quando `matchDatetime <= now`
- Valida placares inteiros de 0 a 99
- Mostra regras de pontuação do bolão
- Salva via `POST /predictions` ou `PUT /predictions/:predictionId`

### Criar e Encontrar Bolão

- `app/(tabs)/create-pool.tsx`: cria bolão para o torneio fixo da Copa 2026
- `app/(tabs)/find-pool.tsx`: busca por nome ou por invite code
- Fluxo de convite: `GET /pool-invites/:code` para preview, depois `POST /pool-invites/:code` para entrar

### Perfil

- Arquivo: `app/(tabs)/profile.tsx`
- Usa `GET /users/me`
- Atualiza `fullName` via `PUT /users/:userId`
- Avatar vem do provedor de login por enquanto

### Regras de Pontuação

- Arquivo: `app/pool/[id]/settings.tsx`
- Somente dono do bolão
- Mostra aviso de recálculo retroativo
- Atualiza com `PUT /pools/:poolId/scoring-rules`
- Invalida detalhe do pool e ranking

---

## Componentes de Domínio

- `components/matches/MatchCard`: card da agenda global; sem prediction
- `components/matches/MatchHeader`: hero do detalhe do jogo
- `components/matches/TeamFlag`: flag remota com fallback
- `components/AppComponents/MatchCard`: card pool-scoped com prediction/result status
- `components/AppComponents/MatchPredictionStatusCard`: status do palpite por bolão no detalhe do jogo
- `components/AppComponents/ScoreInput`: placar editável/bloqueado
- `components/AppComponents/LeaderboardRow`: linha de ranking
- `components/AppComponents/SegmentedControl`: abas/chips horizontais

---

## Regras de Negócio no Mobile

- Um palpite por partida, bolão e usuário
- Palpites só editáveis antes do início da partida
- Pontos só são definitivos após `matchStatus === 'COMPLETED'`
- `pointsEarned === null` significa pendente/apurando
- Regras de pontuação são retroativas
- Campos de score, imagem, deadline, estádio e flags podem ser `null`
- Apenas `ADMIN` atualiza resultados de partidas
- Apenas dono do bolão edita scoring rules

---

## Próximos Passos

- Smoke test manual em device/web dos fluxos críticos
- Melhorar feedback visual de estados de palpite no dashboard e pool detail
- Melhorar perfil/avatar quando houver endpoint ou upload definido
- Avaliar reorganização em `features/*` se os hooks/screens continuarem crescendo
