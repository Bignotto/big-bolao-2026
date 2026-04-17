# Big Bolão 2026 — Agent Context

World Cup 2026 sports prediction app built with Expo + React Native.

## Tech Stack

Expo ~54, Expo Router ~6, TypeScript ~5.9 (strict), React Native 0.81.5, React 19.1.0,
styled-components ^6.3.9, TanStack Query ^5.96, Supabase Auth (SecureStore),
@expo/vector-icons, Inter fonts, react-native-reanimated ~4.1, RFValue, polished.
Flags: `newArchEnabled: true`, `typedRoutes: true`.

## Project Structure

```
app/_layout.tsx · (auth)/login.tsx · (tabs)/(index,matches,profile,create-pool,find-pool)
app/match/[id].tsx · app/pool/[id]/(index,predict,settings).tsx
components/AppComponents/ · context/SessionContext.tsx
data/(api,dto,mappers)/ · domain/(entities,enums,helpers)/ · hooks/ · constants/
```

## AppComponents API

AppText(size,bold,color,align) · AppSpacer(h/vSpace) · AppContainer(direction,justify,align,padding)
AppButton(variant,outline,isLoading,size,leftIcon,rightIcon) · AppInput(label,error,color)
AppNumberInput(label,error,currency,unit) · AppPasswordInput(label,error) · AppAvatar(imagePath,size)
LeaderboardRow(entry,rank,isCurrentUser) · MatchCard(match,prediction,onPress)
MatchPredictionStatusCard · ScoreInput · SegmentedControl

## Key Conventions

- Path alias `@/` = project root; styled-components/native everywhere (no StyleSheet.create)
- AppButton uses Pressable; both `isLoading` and `disabled` block interaction
- Use theme/tokens, not hard-coded colors
- `npx tsc --noEmit` for static checks; Conventional Commits

## Data-Loading Rules

- Global matches tab: fetch once via GET /tournaments/:id/matches, filter client-side — no predictions
- Global match detail: GET /matches/:matchId/predictions/me (user prediction across pools)
- Pool detail: GET /users/me/predictions?poolId=... (avoids per-match N+1)
- Prediction mutations invalidate pool-prediction + match-detail predictions-me queries

## Current State

Login/session, dashboard, create/find/join pool, match agenda, match detail, pool detail
(predictions/standings/matches), predict/update, scoring-rules settings, profile name update
— all TypeScript-clean.
