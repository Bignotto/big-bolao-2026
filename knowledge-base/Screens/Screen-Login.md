---
title: Screen — Login
tags: [screen, auth, login]
updated: 2026-04-17
---

# Screen — Login

**Arquivo:** `app/(auth)/login.tsx`
**Rota:** `/(auth)/login`
**Grupo:** `(auth)` (sem tab bar, sem header)

## Propósito

Tela inicial para usuários não autenticados. Oferece três métodos de login:
1. E-mail e senha (Supabase Auth)
2. Google OAuth (`expo-auth-session` + `expo-web-browser`)
3. Apple Sign In (`expo-apple-authentication`)

## Fluxo

```
Usuário preenche credenciais
  └─> supabase.auth.signInWithPassword(email, password)
      └─> SessionContext.onAuthStateChange dispara
          └─> fetchOrCreateApiUser(session)
              └─> router.replace('/(tabs)')
```

## Componentes Usados

- [[Components/AppInput]] — campo e-mail
- [[Components/AppPasswordInput]] — campo senha
- [[Components/AppButton]] — botão de login

## Redirecionamento

Gerenciado pelo [[State-Management/SessionContext]]: ao autenticar, redireciona automaticamente para `/(tabs)`.

## Links Relacionados

- [[Navigation/Estrutura-de-Navegacao]]
- [[Architecture/Fluxos-Principais]]
