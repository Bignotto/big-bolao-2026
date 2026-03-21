# Big Bolão 2026 — Agent Context

World Cup 2026 sports prediction app ("Bolão") built with Expo + React Native.

## Tech Stack

| Layer      | Technology                                                         |
| ---------- | ------------------------------------------------------------------ |
| Framework  | Expo ~54, Expo Router ~6 (file-based routing)                      |
| Language   | TypeScript ~5.9                                                    |
| UI         | React Native 0.81.5, React 19.1.0                                  |
| Styling    | styled-components ^6.3.9 via `styled-components/native`            |
| Navigation | expo-router Stack + Tabs, @react-navigation/native ^7              |
| Fonts      | Inter (light/regular/semi/bold/black) via @expo-google-fonts/inter |
| Icons      | @expo/vector-icons (FontAwesome, Ionicons)                         |
| Scaling    | react-native-responsive-fontsize (`RFValue`)                       |
| Helpers    | polished (`rgba`)                                                  |
| Animation  | react-native-reanimated ~4.1                                       |
| Web        | react-native-web, Metro static output                              |

**Flags:** New Architecture enabled (`newArchEnabled: true`), Typed Routes enabled (`typedRoutes: true`).

## Project Structure

```
app/
  _layout.tsx           # Root: loads Inter fonts, ThemeProvider + NavThemeProvider
  (tabs)/
    _layout.tsx         # Tab navigator
    index.tsx           # Home tab
    two.tsx             # Placeholder tab
    components.tsx      # Design system showcase (test screen)
  modal.tsx

components/
  AppComponents/        # Design system — all use styled-components/native
    AppText/
    AppSpacer/
    AppContainer/
    AppButton/
    AppInput/
    AppNumberInput/
    AppPasswordInput/
    AppAvatar/
    AppStarsScore/

constants/
  theme.ts              # DefaultTheme: colors + font names
  tokens.ts             # Scale tokens: TextSizes, Spaces, BorderRadius, IconSizes, LogoSizes
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

| Component          | Key Props                                                                                                |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| `AppText`          | `size`, `bold`, `color`, `align`                                                                         |
| `AppSpacer`        | `horizontalSpace`, `verticalSpace`                                                                       |
| `AppContainer`     | `direction`, `justify`, `align`, `padding`                                                               |
| `AppButton`        | `variant` (solid/positive/negative/transparent), `outline`, `isLoading`, `size`, `leftIcon`, `rightIcon` |
| `AppInput`         | `label`, `error`, `color`                                                                                |
| `AppNumberInput`   | `label`, `error`, `currency`, `unit`                                                                     |
| `AppPasswordInput` | `label`, `error`                                                                                         |
| `AppAvatar`        | `imagePath`, `size`                                                                                      |
| `AppStarsScore`    | `scoreTotal`, `reviewCount`, `format` (stars/numbers), `size`                                            |

### Key Conventions

- Path alias `@/` maps to the project root
- All new components use `styled-components/native` — no `StyleSheet.create`
- `AppButton` uses `Pressable` (not RectButton); `isLoading` and `disabled` both block interaction
- Platform-specific overrides use `.web.ts` file suffix

## Contributing

- **Commits**: use [Conventional Commits](https://www.conventionalcommits.org/) (`type: short description`)

## Current State

UI/UX setup phase complete. The design system is fully ported and testable via the **Components** tab in the app.

## Next

- Domain screens: match list, betting form (score prediction per match)
- Domain components: `MatchCard`, `ScoreInput`, `LeaderboardRow`
