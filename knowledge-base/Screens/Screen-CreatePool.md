---
title: Screen — Create Pool (Criar Bolão)
tags: [screen, tabs, pools]
updated: 2026-04-17
---

# Screen — Create Pool

**Arquivo:** `app/(tabs)/create-pool.tsx`
**Rota:** `/(tabs)/create-pool`

## Propósito

Formulário para criação de novo bolão. Cria o bolão e redireciona para a tela de detalhe.

## Campos do Formulário

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| Nome | texto | Sim |
| Descrição | texto | Não |
| Torneio | seleção | Sim |
| Público/Privado | toggle | Sim |
| Código de convite | texto | Não |
| Máx. participantes | número | Não |
| Prazo de inscrição | data | Não |

## Fluxo

```
Preenche formulário
  └─> useCreatePool() → POST /pools
      └─> Sucesso: navigate pool/[id]/index
      └─> Erro: exibe mensagem (409 = código já usado)
```

## Regras

- `inviteCode` deve ser único no sistema
- `ScoringRules` criadas automaticamente com valores padrão
- Após criar, o usuário vira automaticamente participante e dono

## Componentes Usados

- [[Components/AppInput]]
- [[Components/AppNumberInput]]
- [[Components/AppButton]]

## Links Relacionados

- [[Hooks/useCreatePool]]
- [[API/Endpoints-Pools]]
- [[Screens/Screen-PoolDetail]]
