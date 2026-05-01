# Big Bolão 2026 — App Store Deployment Guide

> **Trademark note:** Never use "Copa do Mundo", "World Cup", "FIFA" or any official tournament branding in store copy, screenshots, or icon. Use generic football/soccer terms only.

---

## Phase 1 — Code & Config (done)

- [x] `app.json` — display name "Big Bolão 2026", `bundleIdentifier`, `buildNumber: "1"`, `versionCode: 1`, splash `#065894`, `supportsTablet: false`, `ITSAppUsesNonExemptEncryption: false`
- [x] `eas.json` — submit profile stubbed (fill `ascAppId` + `appleTeamId` after creating App Store Connect record)
- [x] `.gitignore` — `google-play-service-account.json` protected

**Remaining code step:**
- [ ] Add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` as EAS environment variables for the `production` profile (see `docs/EAS_SUBMIT.md`)

---

## Phase 2 — Assets

| Asset | Size | Status | Notes |
|---|---|---|---|
| `assets/images/icon.png` | 1024×1024 PNG, no alpha | ⬜ Replace | iOS store icon — no rounded corners |
| `assets/images/adaptive-icon.png` | 1024×1024 PNG with alpha | ⬜ Replace | Android foreground layer |
| `assets/images/splash-icon.png` | 1024×1024 PNG | ⬜ Replace | Centered logo, navy bg |
| iOS screenshots (6.7") | 1290×2796 px | ⬜ Create | Min 3, ideally 5–6 |
| Android phone screenshots | 1080×1920 (9:16) | ⬜ Create | Min 2, max 8 |
| Android feature graphic | 1024×500 | ⬜ Create | Required on Play Store |

**Suggested screenshot sequence:**
1. Login / welcome screen
2. Home / pool list
3. Match predictions interface
4. Pool leaderboard / standings
5. Profile screen

**Tools:** Rotato, AppMockUp, or Previewed for device frame mockups.

---

## Phase 3 — Store Account Setup

### Apple App Store Connect
- [ ] Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
- [ ] My Apps → "+" → New App
  - Platform: iOS
  - Name: **Big Bolão 2026**
  - Primary Language: Portuguese (Brazil)
  - Bundle ID: `com.bignotto.bigbolao2026`
  - SKU: `bigbolao2026`
- [ ] Note the numeric **Apple ID** → fill into `eas.json` `ascAppId`
- [ ] App Privacy → complete Data & Privacy questionnaire
- [ ] Age Rating → complete questionnaire (Sports, no real money → 4+)

### Google Play Console
- [ ] Go to [play.google.com/console](https://play.google.com/console)
- [ ] Create app → "Big Bolão 2026", Free, Not a game
- [ ] Complete Data safety questionnaire
- [ ] Content rating → IARC questionnaire (Sports → Everyone)
- [ ] Setup → API access → Create service account with **Release Manager** role
- [ ] Download JSON key → save as `google-play-service-account.json` at project root

---

## Phase 4 — Privacy Policy (required by both stores)

- [ ] Generate at [TermsFeed](https://www.termsfeed.com) or [Privacypolicies.com](https://www.privacypolicies.com)
- [ ] Host on GitHub Pages or any static host
- [ ] Policy must cover: email/name collection, Google/Apple auth via Supabase, user deletion rights (LGPD/GDPR), contact email

---

## Phase 5 — Store Listing Text

### App Name
**Big Bolão 2026**

### iOS Subtitle (30 chars)
`Bolão de futebol com amigos`

### Google Play Short Description (80 chars)
`Bolão de previsões de futebol 2026 para jogar com amigos e família.`

### Full Description
```
Big Bolão 2026 é o jeito mais divertido de acompanhar o maior torneio de futebol
do mundo com as pessoas que você gosta.

Crie seu grupo, faça suas previsões de placar antes de cada jogo e veja quem
acerta mais. Pontos pela vitória, pelo placar exato, pelo time vencedor — cada
detalhe conta na hora de subir na classificação.

• Crie bolões privados e convide amigos e família
• Preveja o placar de cada partida
• Acompanhe a tabela de pontuação em tempo real
• Veja as previsões dos outros jogadores após o início da partida
• Login simples com Google ou Apple
• Disponível para iOS e Android
```

### iOS Keywords (100 chars)
`bolão,futebol,previsão,palpite,2026,torneio,amigos,grupo,placar,apostas esportivas`

### Category
iOS: **Sports** | Android: **Sports**

---

## Phase 6 — EAS Build & Submit

See `docs/EAS_SUBMIT.md` for the full step-by-step EAS workflow.

```bash
# Build both platforms
eas build --platform all --profile production

# Submit after builds complete
eas submit --platform ios --profile production
eas submit --platform android --profile production
```

**iOS flow:** EAS Submit → TestFlight → internal testing → App Review
**Android flow:** EAS Submit → Internal track → Closed testing → Production

---

## Checklist Before Submitting for Review

- [ ] Icons and splash replaced with branded assets
- [ ] All screenshots prepared
- [ ] Privacy Policy URL live and accessible
- [ ] Store listings filled in (name, subtitle, description, keywords, screenshots)
- [ ] App tested on real device (not Simulator) — especially Apple Sign-In
- [ ] Production EAS build succeeds with no errors
- [ ] Version and build numbers match what's in App Store Connect / Play Console
