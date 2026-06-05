---
title: Design Tokens — Source of Truth
tags: [design, tokens, colors, typography, spacing]
updated: 2026-05-27
---

# Design Tokens — Source of Truth

> [!note] This file is generated from the actual source code.
> `constants/theme.ts` → colors, fonts, radii
> `constants/tokens.ts` → typography families, text sizes, spaces, icon sizes, border radius

See [[Design-System-Pitch-Night]] for design rationale and usage rules.

---

## Colors (`constants/theme.ts → theme.colors`)

### Ink Scale — backgrounds and surfaces

| Token | Hex | Role |
|---|---|---|
| `ink950` | `#0D0D0D` | App background |
| `ink900` | `#141414` | Deep surface (`shape_dark`) |
| `ink850` | `#1C1C1C` | Card / sheet surface (`shape`) |
| `ink800` | `#242424` | Elevated card, secondary button bg |
| `ink700` | `#303030` | Borders, dividers |
| `ink600` | `#404040` | Disabled borders |
| `ink500` | `#5E5E5E` | Placeholder text |
| `ink400` | `#8C8C8C` | Secondary text, icons |
| `ink300` | `#BEBEBE` | Ghost button label, captions |
| `ink100` | `#EAEAEA` | Primary text, headings |
| `ink50`  | `#F7F7F7` | High-contrast labels (rare) |

### Pitch Accent

| Token | Hex | Role |
|---|---|---|
| `pitch` | `#C8FF3E` | Primary CTA background, active state |
| `pitchSoft` | `#9AD500` | Pressed / hover state |
| `pitchInk` | `#0E1B00` | Text on pitch-colored backgrounds |

### Signal Tokens

| Token | Hex | Role |
|---|---|---|
| `signalLive` | `#FF5A5F` | Live match indicator |
| `signalWin` | `#4ADE80` | Correct prediction, win state |
| `signalAmber` | `#FFB020` | Attention, pending, partial match |
| `signalLose` | `#F04A50` | Wrong prediction, destructive action |

### Semantic Aliases (legacy compat)

| Alias | Hex | Maps to |
|---|---|---|
| `primary` | `#C8FF3E` | `pitch` |
| `primary_dark` | `#9AD500` | `pitchSoft` |
| `primary_light` | `#89CBFB` | — |
| `background` | `#0D0D0D` | `ink950` |
| `text` | `#EAEAEA` | `ink100` |
| `text_dark` | `#0C1E29` | — |
| `text_gray` | `#8C8C8C` | `ink400` |
| `text_disabled` | `#B2B2B2` | — |
| `heading` | `#EAEAEA` | `ink100` |
| `shape` | `#1C1C1C` | `ink850` |
| `shape_dark` | `#141414` | `ink900` |
| `shape_light` | `#EAEAEA` | `ink100` |
| `secondary` | `#FFB020` | `signalAmber` |
| `secondary_dark` | `rgba(255,135,44,0.3)` | — |
| `positive` | `#4ADE80` | `signalWin` |
| `positive_light` | `rgba(18,164,84,0.1)` | — |
| `negative` | `#F04A50` | `signalLose` |
| `negative_light` | `rgba(232,63,91,0.1)` | — |
| `attention` | `#FFB020` | `signalAmber` |
| `attention_dark` | `#B07800` | — |
| `attention_light` | `rgba(176,120,0,0.1)` | — |
| `border` | `#C4C4C4` | — |
| `white` | `#FFFFFF` | — |
| `primary_bg` | `rgba(6,88,148,0.08)` | — |

---

## Typography

### New Typography Families (`constants/tokens.ts → TypographyFamilies`)

Use these on new screens composing raw `<Text>` with `fontFamily`.

| Key | Font name | Use |
|---|---|---|
| `display` | `BricolageGrotesque-Bold` | Screen titles, hero headings |
| `displayItalic` | `BricolageGrotesque-SemiBoldItalic` | Stylised callouts |
| `sans` | `Geist-Regular` | Body copy, descriptions |
| `sansMedium` | `Geist-Medium` | UI labels, secondary actions |
| `sansSemi` | `Geist-SemiBold` | Buttons, emphasized labels |
| `mono` | `GeistMono-Medium` | Scores, numeric data, timers |

All loaded from `assets/fonts/` (local TTF) in `app/_layout.tsx`.

> [!note] `BricolageGrotesque-SemiBoldItalic` points at the same TTF as `BricolageGrotesque-SemiBold` — the font has no true italic variant.

### Legacy Inter Families (`constants/theme.ts → theme.fonts`)

Still used by [[AppText]] via styled-components theme.

| Key | Font name |
|---|---|
| `light` | `Inter_300Light` |
| `regular` | `Inter_400Regular` |
| `semi` | `Inter_500Medium` |
| `bold` | `Inter_700Bold` |
| `black` | `Inter_900Black` |
| `display` | `BarlowCondensed_700Bold` |

Loaded via `@expo-google-fonts/inter` and `@expo-google-fonts/barlow-condensed`.

### Text Sizes (`constants/tokens.ts → TextSizes`)

All values pass through `RFValue()` from `react-native-responsive-fontsize`.

| Key | px |
|---|---|
| `xlg` | 32 |
| `lg` | 23 |
| `md` | 18 |
| `sm` | 14 |
| `xsm` | 11 |

---

## Spacing (`constants/tokens.ts → Spaces`)

| Key | px |
|---|---|
| `xlg` | 20 |
| `lg` | 16 |
| `md` | 12 |
| `sm` | 8 |
| `xsm` | 4 |

---

## Border Radius

Two systems exist in parallel:

### `theme.radii` — for styled-components (`constants/theme.ts`)

| Key | px | Use |
|---|---|---|
| `xs` | 8 | Small chips, tags |
| `sm` | 12 | Inputs, small cards |
| `md` | 18 | Standard cards |
| `lg` | 24 | Large sheets, bottom panels |
| `xl` | 32 | Full-bleed hero cards |

### `BorderRadius` — for StyleSheet screens (`constants/tokens.ts`)

| Key | px |
|---|---|
| `xlg` | 20 |
| `lg` | 16 |
| `md` | 12 |
| `sm` | 8 |
| `xsm` | 4 |

---

## Icon Sizes (`constants/tokens.ts → IconSizes`)

| Key | px |
|---|---|
| `xlg` | 40 |
| `lg` | 32 |
| `md` | 24 |
| `sm` | 16 |
| `xsm` | 8 |

---

## Logo Sizes (`constants/tokens.ts → LogoSizes`)

| Key | px |
|---|---|
| `xlg` | 140 |
| `lg` | 100 |
| `md` | 60 |
| `sm` | 20 |
| `xsm` | 8 |
