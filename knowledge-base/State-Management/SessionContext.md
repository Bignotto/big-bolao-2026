---
title: SessionContext
tags: [state, auth, context, supabase]
updated: 2026-04-17
---

# SessionContext — `context/SessionContext.tsx`

## Propósito

Gerencia o estado de autenticação do app. Responsável por:
- Observar mudanças de sessão do Supabase (`onAuthStateChange`)
- Buscar (ou criar) o usuário na API REST ao autenticar
- Redirecionar para login/tabs conforme estado da sessão
- Expor `session`, `user`, `apiUser`, `loading` e `signOut` para toda a árvore

## Tipo `ApiUser`

```ts
type ApiUser = {
  id: string;
  fullName: string;
  email: string;
  profileImageUrl: string | null;
  role: 'USER' | 'ADMIN';
};
```

Diferente do `User` do Supabase (auth), o `ApiUser` é o registro no banco da aplicação.

## Valor do Context

```ts
type SessionContextValue = {
  session: Session | null;   // JWT Supabase completo
  user: User | null;         // User Supabase (metadata de auth)
  apiUser: ApiUser | null;   // User do banco da aplicação
  loading: boolean;          // true até onAuthStateChange disparar
  signOut: () => Promise<void>;
};
```

## Fluxo de Autenticação

```
onAuthStateChange (INITIAL_SESSION + mudanças futuras)
  ├── session != null
  │     └── fetchOrCreateApiUser(session)
  │           ├── GET /users/me → 200 → retorna ApiUser existente
  │           └── GET /users/me → 404 → POST /users → cria e retorna ApiUser
  └── session == null
        └── setApiUser(null)
```

> [!warning] Race condition evitada
> Apenas `onAuthStateChange` é usado (não `getSession` separado). Isso evita dois disparos simultâneos que chamariam `POST /users` duas vezes.

## Redirecionamento

```ts
// Após loading === false:
if (!session && !inAuthGroup) → router.replace('/(auth)/login')
if (session && inAuthGroup)  → router.replace('/(tabs)')
```

## Como Usar

```tsx
import { useContext } from 'react';
import { SessionContext } from '@/context/SessionContext';

const { session, apiUser, loading, signOut } = useContext(SessionContext);
```

## Links Relacionados

- [[Navigation/Root-Layout]] — onde `SessionProvider` é montado
- [[Screens/Screen-Login]] — destino quando sem sessão
- [[API/Overview]] — endpoint `/users/me` e `/users`
