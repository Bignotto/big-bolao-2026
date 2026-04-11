# Big Bolão 2026 — Agent Context

World Cup 2026 sports prediction app ("Bolão") built with Expo + React Native.

## Tech Stack

| Layer      | Technology                                                         |
| ---------- | ------------------------------------------------------------------ |
| Framework  | Expo ~54, Expo Router ~6 (file-based routing)                      |
| Language   | TypeScript ~5.9 with `strict` enabled                              |
| UI         | React Native 0.81.5, React 19.1.0                                  |
| Styling    | styled-components ^6.3.9 via `styled-components/native`            |
| Data/cache | TanStack Query ^5.96                                               |
| Auth       | Supabase Auth with SecureStore persistence                         |
| Navigation | expo-router Stack + Tabs, @react-navigation/native ^7              |
| Fonts      | Inter (light/regular/semi/bold/black) via @expo-google-fonts/inter |
| Icons      | @expo/vector-icons (FontAwesome, Ionicons)                         |
| Scaling    | react-native-responsive-fontsize (`RFValue`)                       |
| Helpers    | polished (`rgba`)                                                  |
| Animation  | react-native-reanimated ~4.1                                       |
| Web        | react-native-web, Metro static output                              |

**Flags:** New Architecture enabled (`newArchEnabled: true`), Typed Routes enabled (`typedRoutes: true`).

## Project Structure

```text
app/
  _layout.tsx           # Root: fonts, ThemeProvider, QueryClientProvider, SessionProvider
  (auth)/
    _layout.tsx
    login.tsx           # Google/Apple Supabase login
  (tabs)/
    _layout.tsx         # Visible tabs: Grupos, Partidas, Perfil
    index.tsx           # Dashboard / my pools
    matches.tsx         # Global read-only match agenda
    profile.tsx         # Profile editor and logout
    create-pool.tsx     # Hidden route for pool creation
    find-pool.tsx       # Hidden route for name/code pool discovery
    two.tsx             # Hidden placeholder route
    components.tsx      # Hidden design-system showcase route
  match/[id].tsx        # Global match detail + my predictions by pool
  pool/[id]/
    _layout.tsx
    index.tsx           # Pool tabs: predictions, standings, matches
    predict.tsx         # Create/edit prediction for one pool + match
    settings.tsx        # Owner-only scoring rules
  modal.tsx

components/
  AppComponents/        # Design system and pool-scoped domain components
  matches/              # Global match-list/detail components

context/
  SessionContext.tsx    # Supabase session + API user bootstrap

data/
  api/
  dto/
  mappers/

domain/
  entities/
  enums/
  helpers/

hooks/                  # TanStack Query hooks and query keys

constants/
  theme.ts              # DefaultTheme: colors + font names
  tokens.ts             # Scale tokens: TextSizes, Spaces, BorderRadius, IconSizes, LogoSizes
  tournament.ts         # Fixed tournament id for World Cup 2026
  Colors.ts             # Legacy nav theme tokens (light/dark)

styles/
  styled.d.ts           # TypeScript DefaultTheme declaration for styled-components/native
```

## Design System

### Theme (`constants/theme.ts`)

Single source of truth for styled-components. Accessed via `useTheme()` hook.

- **colors**: `primary`, `secondary`, `positive`, `negative`, `background`, `text`, `text_gray`, `border`, `white`, and variants
- **fonts**: `light`, `regular`, `semi`, `bold`, `black` — mapped to Inter font family names

### Tokens (`constants/tokens.ts`)

Scale keys: `xsm | sm | md | lg | xlg`

- `TextSizes` — font sizes in px
- `Spaces` — spacing values
- `BorderRadius` — corner radii
- `IconSizes` — icon sizes
- `LogoSizes` — logo sizes

### AppComponents API

| Component | Key Props |
| --- | --- |
| `AppText` | `size`, `bold`, `color`, `align` |
| `AppSpacer` | `horizontalSpace`, `verticalSpace` |
| `AppContainer` | `direction`, `justify`, `align`, `padding` |
| `AppButton` | `variant`, `outline`, `isLoading`, `size`, `leftIcon`, `rightIcon` |
| `AppInput` | `label`, `error`, `color` |
| `AppNumberInput` | `label`, `error`, `currency`, `unit` |
| `AppPasswordInput` | `label`, `error` |
| `AppAvatar` | `imagePath`, `size` |
| `AppStarsScore` | `scoreTotal`, `reviewCount`, `format`, `size` |
| `LeaderboardRow` | `entry`, `rank`, `isCurrentUser` |
| `MatchCard` | `match`, `prediction`, `onPress` |
| `MatchPredictionStatusCard` | `poolName`, `poolId`, `matchId`, `matchStatus`, `prediction`, `userRank`, team codes, `onPressBet` |
| `ScoreInput` | team names, score values, change handlers, `locked` |
| `SegmentedControl` | `segments`, `selected`, `onChange` |

## Key Conventions

- Path alias `@/` maps to the project root
- All new components use `styled-components/native` — no `StyleSheet.create`
- `AppButton` uses `Pressable`; `isLoading` and `disabled` both block interaction
- Use `theme` and tokens instead of adding new hard-coded colors where practical
- With `strict` TypeScript, type styled-components interpolation props explicitly when destructuring (`DefaultTheme`, transient props, etc.)
- Platform-specific overrides use `.web.ts` file suffix
- `npx tsc --noEmit` is the required static check
- Commits use Conventional Commits (`type: short description`)

## Data-Loading Rules

- The global matches tab is an agenda only: it fetches tournament matches once via `GET /tournaments/:id/matches` and filters client-side.
- Do not load predictions from the global matches tab.
- Global match detail loads `GET /matches/:matchId/predictions/me` to show the user's prediction status across pools.
- Pool detail uses `GET /users/me/predictions?poolId=...` for the user's pool predictions, avoiding per-match N+1 requests.
- Prediction mutations invalidate both the pool prediction query and the match-detail `predictions-me` query.
- `pointsEarned` remains `null` until the match is completed.

## Current State

Core mobile flows are implemented and TypeScript-clean:

- Supabase login/session bootstrap with API user creation/fetch
- Dashboard of user's pools, create pool, find/join pool by name or invite code
- Global read-only match agenda with group/stage and date modes
- Global match detail screen with missing-prediction banner
- Pool detail screen with predictions, standings, and read-only match tabs
- Prediction create/update flow with score validation and visible scoring rules
- Owner-only scoring-rules settings with retroactive-change warning
- Profile name update using backend `fullName`

## Next

- Manually smoke test the main flows on device/web after each API-affecting change
- Continue UX polish on pool cards, prediction states, and profile/avatar handling
- Consider moving hooks/screens into `features/*` once the current flat structure becomes hard to navigate
