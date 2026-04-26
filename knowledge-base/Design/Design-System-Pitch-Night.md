---
title: Design System — Pitch Night
tags: [design, tokens, theme, typography, components]
updated: 2026-04-26
---

# Design System — Pitch Night

The Pitch Night theme was introduced in the April 2026 redesign (commit `52b81ca`). It replaces the earlier navy/orange palette with a dark, stadium-inspired aesthetic built around an electric-lime accent.

## Design Direction

**Three words:** focused, alive, social.

The app is used at night, around kick-off, with friends present. The interface should feel like sitting in a well-lit luxury box above the pitch — dark surroundings, sharp contrast, one glowing accent that tells you where to act.

### Anti-patterns
- No neon greens or gambling-app aggression — the lime is precise, not garish.
- No light-mode-first assumptions — dark is the primary experience.
- No orange/gold as primary CTA — those are now demoted to signal tokens.

---

## Color Tokens

All tokens live in `constants/theme.ts`.

### Ink Scale (background & surface hierarchy)

| Token | Hex | Role |
|---|---|---|
| `ink950` | `#0A0D10` | App background |
| `ink900` | `#0F1317` | Deep surface (shape_dark) |
| `ink850` | `#151A1F` | Card / sheet surface (shape) |
| `ink800` | `#1C2228` | Elevated card, secondary button bg |
| `ink700` | `#262E36` | Borders, dividers |
| `ink600` | `#3A434D` | Disabled borders |
| `ink500` | `#5B6670` | Placeholder text |
| `ink400` | `#8A949E` | Secondary text, icons |
| `ink300` | `#B8C1CA` | Ghost button label, captions |
| `ink100` | `#EAEEF2` | Primary text, headings |
| `ink50`  | `#F7F9FB` | High-contrast labels (rare) |

### Pitch Accent

| Token | Hex | Role |
|---|---|---|
| `pitch` | `#C8FF3E` | Primary CTA background, active state |
| `pitchSoft` | `#9AD500` | Pressed/hover state of pitch |
| `pitchInk` | `#0E1B00` | Text rendered on pitch background |

> **Rule:** Use `pitch` for one action per screen — the most important tap. Everything else is ink.

### Signal Tokens

| Token | Hex | Role |
|---|---|---|
| `signalLive` | `#FF5A5F` | Live match indicator |
| `signalWin` | `#4ADE80` | Correct prediction, win state |
| `signalAmber` | `#FFB020` | Attention, pending, partial match |
| `signalLose` | `#F04A50` | Wrong prediction, destructive action |

### Semantic Aliases (legacy compat)

These still exist but now point at Pitch Night values:

| Alias | Resolves to |
|---|---|
| `primary` | `#C8FF3E` (= `pitch`) |
| `background` | `#0A0D10` (= `ink950`) |
| `text` | `#EAEEF2` (= `ink100`) |
| `shape` | `#151A1F` (= `ink850`) |
| `positive` | `#4ADE80` (= `signalWin`) |
| `negative` | `#F04A50` (= `signalLose`) |
| `attention` | `#FFB020` (= `signalAmber`) |

---

## Typography

Two systems exist in parallel. New screens use `TypographyFamilies`; legacy `AppText` still uses Inter via the theme.

### New Typography Families (`constants/tokens.ts → TypographyFamilies`)

| Key | Font | Use |
|---|---|---|
| `display` | `BricolageGrotesque-Bold` | Screen titles, hero headings |
| `displayItalic` | `BricolageGrotesque-SemiBoldItalic` | Stylised callouts (mapped to SemiBold TTF) |
| `sans` | `Geist-Regular` | Body copy, descriptions |
| `sansMedium` | `Geist-Medium` | UI labels, secondary actions |
| `sansSemi` | `Geist-SemiBold` | Buttons, emphasized labels |
| `mono` | `GeistMono-Medium` | Scores, numeric data, timer |

All fonts are bundled locally under `assets/fonts/` and loaded in `app/_layout.tsx`.

### Legacy Inter Families (`theme.fonts`)

Still loaded and used by `AppText`:

| Key | Font |
|---|---|
| `light` | `Inter_300Light` |
| `regular` | `Inter_400Regular` |
| `semi` | `Inter_500Medium` |
| `bold` | `Inter_700Bold` |
| `black` | `Inter_900Black` |
| `display` | `BarlowCondensed_700Bold` |

> `AppText` uses Inter by default. New screens composing raw `Text` should use `TypographyFamilies`.

---

## Border Radius (`theme.radii`)

| Key | Value | Use |
|---|---|---|
| `xs` | 8px | Small chips, tags |
| `sm` | 12px | Inputs, small cards |
| `md` | 18px | Standard cards |
| `lg` | 24px | Large sheets, bottom panels |
| `xl` | 32px | Full-bleed hero cards |

---

## Spacing & Size Tokens (`constants/tokens.ts`)

### TextSizes

| Key | px |
|---|---|
| `xlg` | 32 |
| `lg` | 23 |
| `md` | 18 |
| `sm` | 14 |
| `xsm` | 11 |

All values pass through `RFValue()` from `react-native-responsive-fontsize` for display scaling.

### Spaces

| Key | px |
|---|---|
| `xlg` | 20 |
| `lg` | 16 |
| `md` | 12 |
| `sm` | 8 |
| `xsm` | 4 |

### IconSizes

| Key | px |
|---|---|
| `xlg` | 40 |
| `lg` | 32 |
| `md` | 24 |
| `sm` | 16 |
| `xsm` | 8 |

---

## AppButton Redesign

`AppButton` was fully rewritten. It no longer uses styled-components; all styles are in `StyleSheet.create` inside `index.tsx`.

### Variants

| Variant | Background | Text | Border |
|---|---|---|---|
| `primary` | `pitch` (#C8FF3E) | `pitchInk` | `pitch` |
| `secondary` | `ink800` | `ink100` | `ink700` |
| `destructive` | `signalLose` | `#fff` | `signalLose` |
| `ghost` | transparent | `ink300` | transparent |

### Sizes

| Size | Height | Radius | Font size |
|---|---|---|---|
| `lg` | 52px | 14px | 16px |
| `md` | 44px | 12px | 14px |
| `sm` | 36px | 10px | 14px |

### Interactions
- Spring press animation: scales to 0.97 on press, bounces back on release (`tension: 400, friction: 30`).
- Android ripple: `rgba(255,255,255,0.12)`.
- Disabled state: opacity 0.35.
- Loading state: label hidden, `ActivityIndicator` centered via `absoluteFill`.

### Legacy Variant Map

Old variant names still work but log a DEV warning:

| Old | New |
|---|---|
| `solid` | `primary` |
| `outline` | `secondary` |
| `text` | `ghost` |
| `transparent` | `ghost` |
| `positive` | `primary` |
| `negative` | `destructive` |

---

## New Components (April 2026)

### ScoreStepper
`components/AppComponents/ScoreStepper/`
Stepper control for entering a numeric score (increment/decrement). Used on predict screens.

### LiveMatchCard
`components/LiveMatchCard/`
Specialised card for matches currently in progress. Displays live score, team names, and a pulsing `signalLive` indicator.

### SegmentedControl
`components/AppComponents/SegmentedControl/`
Tab-style toggle for switching views within a screen (e.g. predictions vs standings).

---

## Font Loading

`app/_layout.tsx` loads all fonts before rendering:

```
Inter family          → @expo-google-fonts/inter
BarlowCondensed_700Bold → @expo-google-fonts/barlow-condensed
BricolageGrotesque-Bold / SemiBold → assets/fonts/ (local TTF)
Geist-Regular / Medium / SemiBold → assets/fonts/ (local TTF)
GeistMono-Medium → assets/fonts/ (local TTF)
```

Note: `BricolageGrotesque-SemiBoldItalic` is registered pointing at the same TTF as `BricolageGrotesque-SemiBold` because the font has no true italic variant.

---

## Layout Rules

1. **Background is always `ink950`** (`#0A0D10`). Never use pure black.
2. **Cards sit on `ink850`** (`#151A1F`). Elevated cards use `ink800`.
3. **One pitch action per screen.** The primary CTA uses `pitch`; all others use `secondary` or `ghost`.
4. **Signal colors are read-only.** Never use `signalWin`/`signalLose` as interactive buttons — only as status indicators.
5. **Score data uses mono font.** Any numeric score, time, or stat uses `GeistMono-Medium`.
6. **Display font for headings only.** `BricolageGrotesque-Bold` on screen titles and hero text; `Geist` everywhere else.
7. **Generous dark padding.** Dark surfaces need more breathing room than light ones — minimum 16px horizontal padding on cards.
