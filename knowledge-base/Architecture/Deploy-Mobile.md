---
title: Deploy Mobile — EAS Build & OTA Update
tags: [deploy, eas, ota, production, stores]
updated: 2026-05-20
---

# Deploy Mobile — EAS Build & OTA Update

> [!success] App em produção desde 2026-05-20
> Disponível na **App Store (iOS)** e **Google Play Store (Android)**.

## Identificadores

| Campo | Valor |
|-------|-------|
| Bundle ID / Package | `com.bignotto.bigbolao2026` |
| EAS Project ID | `8cbe7c5b-47a7-4835-b02c-bbe4e981e2c4` |
| iOS mínimo | 16.0 |
| Android versionCode | 1 |
| Versão inicial | 1.0.0 |

---

## Política de Entrega — OTA-first

> [!important] Regra fundamental
> O app está em produção com usuários reais. **Nunca submeta um novo binário nativo para mudanças que podem ser entregues via OTA.**

| Tipo de mudança | Método | Comando |
|-----------------|--------|---------|
| JS, TS, TSX, assets, imagens | **OTA** (EAS Update) | `eas update --branch production` |
| Novos módulos nativos | **Novo build** (EAS Build) | `eas build --platform all` |
| Mudanças em `app.json` (native config) | **Novo build** (EAS Build) | `eas build --platform all` |
| Upgrade de Expo SDK | **Novo build** (EAS Build) | `eas build --platform all` |
| Mudança de permissões nativas | **Novo build** (EAS Build) | `eas build --platform all` |

---

## EAS Update (OTA)

Usa o **Expo Updates** para entregar JS/assets sem passar pelas lojas.

```bash
# publicar atualização OTA para produção
eas update --branch production --message "descrição da mudança"

# publicar para canal de preview/staging
eas update --branch preview --message "descrição da mudança"
```

> [!note] Latência de adoção
> Usuários recebem o update quando abrem o app (ao fundo). A maioria adota em 24–48h.

---

## EAS Build (novo binário)

Necessário apenas quando há mudanças nativas.

```bash
# build para ambas as plataformas (produção)
eas build --platform all --profile production

# build apenas iOS
eas build --platform ios --profile production

# build apenas Android
eas build --platform android --profile production
```

---

## EAS Submit (envio às lojas)

Após um novo build, enviar às lojas:

```bash
# submeter para App Store e Google Play
eas submit --platform all --latest
```

---

## Checklist para cada entrega

### OTA (JS/asset change)
- [ ] Testar localmente com `expo start`
- [ ] Verificar que não há mudanças nativas
- [ ] `eas update --branch production --message "..."`
- [ ] Confirmar update visível no dashboard EAS

### Novo build nativo
- [ ] Bump `version` e `buildNumber` / `versionCode` no `app.json`
- [ ] `eas build --platform all --profile production`
- [ ] Aguardar build concluir no dashboard EAS
- [ ] `eas submit --platform all --latest`
- [ ] Aguardar review Apple (~24h) / Google (~algumas horas)

---

## Links Relacionados

- [[Architecture/Stack-Tecnologica]]
- [[Architecture/Visao-Geral]]
- [[API/Deploy]]
