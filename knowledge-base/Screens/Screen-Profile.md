---
title: Screen — Profile (Perfil)
tags: [screen, tabs, profile]
updated: 2026-06-14
---

# Screen — Profile

**Arquivo:** `app/(tabs)/profile.tsx`
**Rota:** `/(tabs)/profile`

## Propósito

Exibe os dados do perfil do usuário, estatísticas (placeholder), conquistas (placeholder), edição de nome de exibição, atalho para ajuda e ações de conta (logout / exclusão).

## Seções da tela

### Identity card
- `AppAvatar` com fallback por nome
- Nome completo, e-mail, origem do avatar (`GOOGLE` / `APPLE` / `CONTA DE LOGIN`) detectada via `profileImageUrl`
- Data de entrada formatada como `MMM/AA` no breadcrumb

### Stats card (placeholder)
- Pontos, Palpites, % Acerto — exibidos como `–` até API expor endpoint de estatísticas

### Conquistas (placeholder)
- Array estático `ACHIEVEMENTS` com 3 badges bloqueados
- Layout horizontal com `ScrollView`

### Nome de exibição
- `TextInput` inline; toggle EDITAR / SALVAR
- Mutation `useUpdateProfile` envia `{ fullName: trimmed }`
- Não salva se o nome não mudou

### Aplicativo
- Botão "Como usar · Sobre" → `/help`

### Conta
- Botão "Sair da conta" → `Alert` de confirmação → `useLogout()`
- Botão "Excluir conta" → `Alert` com aviso detalhado → `useDeleteAccount()`

### Footer
- `BIG BOLÃO · V{APP_VERSION} · {OTA_LABEL}   BOLÃO 2026`
- `OTA_LABEL` vem de `constants/tournament.ts` para rastrear qual OTA está ativa

## Hooks usados

| Hook | Origem |
|------|--------|
| `useMe()` | dados do usuário logado |
| `useUpdateProfile(userId)` | atualiza `fullName` |
| `useLogout()` | faz logout via Supabase |
| `useDeleteAccount()` | exclui conta permanentemente |

## Regras de negócio

> [!warning]
> - Usa `user.fullName` (campo do backend), não um campo `name` local
> - `useDeleteAccount` remove palpites, participações e histórico — irreversível
> - `OTA_LABEL` deve ser atualizado em `constants/tournament.ts` a cada `eas update`

## Links Relacionados

- [[Components/AppAvatar]]
- [[Components/AppButton]]
- [[Hooks/Hooks-Registry]] → useUpdateProfile, useLogout, useDeleteAccount
- [[State-Management/SessionContext]]
- [[API/Endpoints-Users]]
