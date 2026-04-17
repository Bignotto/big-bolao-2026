---
title: Component — AppAvatar
tags: [component, avatar, profile]
updated: 2026-04-17
---

# AppAvatar

**Arquivo:** `components/AppComponents/AppAvatar/index.tsx`

## Propósito

Exibe avatar de usuário. Suporta imagem via URL ou fallback com iniciais do nome.

## Props

```ts
interface AppAvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
}
```

## Comportamento

- Se `uri` presente → exibe imagem remota
- Se `uri` null/undefined → exibe iniciais do `name`

## Usado Em

- [[Components/LeaderboardRow]]
- [[Screens/Screen-Profile]]
- [[Screens/Screen-PoolDetail]]
