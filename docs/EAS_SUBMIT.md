# Big Bolão 2026 — EAS Build & Submit Guide

Everything you need to do on expo.dev and with the EAS CLI to get builds into both stores.

---

## Prerequisites

```bash
npm install -g eas-cli
eas whoami          # confirm you're logged in as bignotto@gmail.com
eas project:info    # confirm project 8cbe7c5b-47a7-4835-b02c-bbe4e981e2c4 is linked
```

---

## Step 1 — Set Environment Variables on EAS

The app embeds three build-time env vars. They must be registered in EAS so production builds pick them up (the local `.env` file is not used by EAS Build).

### Option A — expo.dev dashboard (easier)

1. Go to [expo.dev](https://expo.dev) → Your project → **Environment Variables**
2. Add each variable, set visibility to **Secret**, and check the **production** profile:

| Name | Value |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | `https://kmqurfaofmowoonastqb.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | your anon key from `.env` |
| `EXPO_PUBLIC_API_URL` | `https://big-bolao-api.onrender.com` |

### Option B — EAS CLI

```bash
eas env:create --scope project --name EXPO_PUBLIC_SUPABASE_URL \
  --value "https://kmqurfaofmowoonastqb.supabase.co" \
  --environment production --visibility secret

eas env:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY \
  --value "<your_anon_key>" \
  --environment production --visibility secret

eas env:create --scope project --name EXPO_PUBLIC_API_URL \
  --value "https://big-bolao-api.onrender.com" \
  --environment production --visibility secret
```

Verify: `eas env:list --environment production`

---

## Step 2 — Configure Credentials

### iOS Credentials

EAS can auto-manage iOS certificates and provisioning profiles. You need an active Apple Developer account.

```bash
eas credentials --platform ios
```

Choose **"Manage credentials"** → **"Add new credentials"** → let EAS auto-generate:
- Apple Distribution Certificate
- Provisioning Profile (with Sign in with Apple entitlement — automatic because `usesAppleSignIn: true`)

> This step requires your Apple Developer account to be active (your renewal from 2026-05-01).

### Android Credentials

EAS auto-generates a keystore for Android. It stores it securely on EAS servers.

```bash
eas credentials --platform android
```

Choose **"Set up a new keystore"** → EAS generates and stores it.

> **Critical:** After the first successful Android production build, download and back up your keystore. If it's ever lost, you cannot publish updates to that Play Store listing.
>
> ```bash
> eas credentials --platform android
> # Choose: Download keystore
> ```

### App Store Connect API Key (recommended for iOS submit)

Using an API key avoids Apple ID 2FA prompts during `eas submit`.

1. In App Store Connect → Users and Access → Integrations → **App Store Connect API**
2. Create a key → Role: **App Manager** → Download `.p8`
3. Note the **Key ID** and **Issuer ID**
4. Upload to EAS:

```bash
eas credentials --platform ios
# Choose: App Store Connect API Key → Add new
# Paste Key ID, Issuer ID, and the .p8 file path
```

Or set directly in `eas.json` (less secure — the `.p8` would be on disk):

```json
"ios": {
  "appleId": "bignotto@gmail.com",
  "ascAppId": "YOUR_APP_ID",
  "appleTeamId": "YOUR_TEAM_ID",
  "ascApiKeyPath": "./AuthKey_XXXXXXXX.p8",
  "ascApiKeyId": "XXXXXXXX",
  "ascApiIssuerId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

---

## Step 3 — Run Production Builds

```bash
# Both platforms in one command (queued in parallel on EAS servers)
eas build --platform all --profile production
```

Or separately:

```bash
eas build --platform ios --profile production
eas build --platform android --profile production
```

EAS will output a URL to track build progress on expo.dev. iOS builds take ~15 min, Android ~10 min.

**What EAS produces:**
- iOS → `.ipa` file (uploaded directly to App Store Connect via `eas submit`)
- Android → `.aab` file (Android App Bundle, required by Play Store)

---

## Step 4 — Fill `eas.json` with Real Values

Before submitting, replace the placeholders set in Phase 1:

```json
"submit": {
  "production": {
    "ios": {
      "appleId": "bignotto@gmail.com",
      "ascAppId": "XXXXXXXXXX",     ← numeric ID from App Store Connect app record
      "appleTeamId": "XXXXXXXXXX"   ← 10-char team ID from Apple Developer portal
    },
    "android": {
      "serviceAccountKeyPath": "./google-play-service-account.json",
      "track": "internal"           ← start with internal, promote manually in Play Console
    }
  }
}
```

---

## Step 5 — Submit to Stores

### iOS → App Store Connect (TestFlight)

```bash
eas submit --platform ios --profile production
```

This uploads the `.ipa` to TestFlight. From there:
1. Go to App Store Connect → TestFlight → add internal testers and test
2. When ready: App Store → click "+" next to iOS App → select the build → Submit for Review

### Android → Google Play (Internal Track)

```bash
eas submit --platform android --profile production
```

This uploads the `.aab` to the Internal testing track. From there in Play Console:
1. Internal testing → promote to **Closed testing** (add your Google account as tester)
2. Test the production build
3. Promote to **Production** when ready → Google reviews (typically 1–3 days for first submission)

---

## Step 6 — OTA Updates (post-launch)

For JS-only fixes after launch — no app review required.

First, configure `eas.json` build profiles to use EAS Update channel:

```json
"production": {
  "autoIncrement": true,
  "channel": "production"
}
```

Then to push an update:

```bash
eas update --branch production --message "fix: prediction submit crash"
```

> OTA updates only work for JS changes. Native code changes (new permissions, new native modules) still require a full store build.

---

## Quick Reference — Full Command Sequence

```bash
# 1. Verify login and project
eas whoami
eas project:info

# 2. Set env vars (first time only)
eas env:list --environment production

# 3. Configure credentials (first time only)
eas credentials --platform ios
eas credentials --platform android

# 4. Build
eas build --platform all --profile production

# 5. Submit
eas submit --platform ios --profile production
eas submit --platform android --profile production
```
