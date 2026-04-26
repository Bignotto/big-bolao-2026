# P0 — Orient

You are about to redesign the "Palpites" tab inside the Pool
Detail screen of this React Native (Expo) app. Before writing
any code, read these files and report back a 5-bullet summary
of what each does and how they connect:

app/pool/[id]/index.tsx
components/AppComponents/PoolPredictionMatchCard/index.tsx
components/matches/MatchFilterControls.tsx
components/AppComponents/SegmentedControl/index.tsx
theme.ts
constants/tokens.ts
domain/helpers/matchFilters.ts

Then read the visual target:

palpites.html — side-by-side before/after
screens/PalpitesTabScreen.jsx — the new design
app.jsx — Pitch Night system writeup

Do not modify any files in this phase. Just summarise.

# P1 — Pitch Night palette

Extend theme.ts with a new palpitesNight sub-object.
Mirror the tokens defined in palpites.html:

ink-950 / 900 / 850 / 800 / 700 / 600 / 500 / 400 / 300 / 100 / 50
pitch (#C8FF3E)
pitch-soft (#9AD500)
pitch-ink (#0E1B00)
live (#FF5A5F)
win (#4ADE80)
amber (#FFB020)
lose (#F04A50)

Keep all existing keys untouched. Export the new palette from
theme.ts as theme.palpitesNight. If styled.d.ts
exists, extend the DefaultTheme interface to include the new
group. Do not yet wire it into any component.

Show me a diff and run tsc --noEmit to confirm no type
regressions.

# P2 — Load display + mono fonts

Find the useFonts hook (likely in \_layout.tsx).
Add these via @expo-google-fonts/bricolage-grotesque
and @expo-google-fonts/geist-mono:

BricolageGrotesque_700Bold
GeistMono_500Medium
GeistMono_600SemiBold
GeistMono_700Bold

Update theme.ts → fonts with:

display : 'BricolageGrotesque_700Bold'
monoMedium : 'GeistMono_500Medium'
monoSemiBold : 'GeistMono_600SemiBold'
monoBold : 'GeistMono_700Bold'

Add the npm install commands to a comment at the top of
\_layout.tsx so I can run them. Do not change any
existing screens to use the new fonts yet.

# P3 — Header & tabs

Reference: palpites.html → "02 · Redesign" artboard,
top ~280px of the device frame.

1. Create components/pool/PoolDetailHeader.tsx with this
   exact stack:
   • Top bar — back chevron · "DETALHES DO GRUPO" eyebrow · menu
   • Eyebrow — "{n} participantes · {role}" (mono 9, ink-500)
   • Title — {pool.name} (Bricolage 30, ink-100)
   • Scoreboard — 3 inline tiles: SUA POS / PTS / EXATOS
   pos tile uses pitch bg + pitch-ink fg;
   others are ink-850 with ink-800 border.
   Inline label-left, big number-right (Bricolage 26).

   Props: pool, currentUserEntry, onBack, onMenu.

2. Create components/pool/PoolDetailTabs.tsx as an underline
   tab strip (no pill bg). Active tab gets a 2px pitch-green
   bottom border. Same MAIN_TABS values as today.

3. In app/pool/[id]/index.tsx, replace the existing
   HeaderArea + SegmentedControl with these two components.
   Set the screen background to palpitesNight.ink-950.
   Do not redesign the lists yet — they will look broken
   on the dark canvas; that's expected for now.

   # P4 — Filter controls redesign

Reference: palpites.html → "Por grupo · etapa / Por data"
toggle and the GRP-A chip with its 4/6 progress count.

1. ModeToggle — single rounded container (ink-900 bg,
   ink-800 border, 12px radius, 3px inner padding). Two
   pressable items: 4×4 grid icon + "Por grupo · etapa", calendar
   icon + "Por data". Active item: pitch bg, pitch-ink text.

2. StageChip — pill with three slots:
   • mono "GRP" or "ETP" prefix (size 10, op 0.55–0.7)
   • the letter / stage label
   • only on active chip — a "{predicted} / {total}"
   progress badge (mono 9, on-pitch chip uses pitch-ink/18%
   overlay).

   Active chip = pitch bg + pitch border. Inactive = transparent
   bg + ink-700 border + ink-300 text.

3. Update MatchFilterControls.tsx to compose these two and
   accept a new predictionProgressByChip: Map<ChipValue, {done, total}>
   prop. Compute it in app/pool/[id]/index.tsx from the
   existing predictionMap + matches.

Keep the existing public API otherwise unchanged so the dates
mode keeps working untouched.

# P5 — Match row rewrite

Reference: screens/PalpitesTabScreen.jsx → PalpiteRow
and OutcomeChip (lines ~250–360). Mirror the layout exactly.

Grid (RN flexDirection: 'row'):
52px time / live cluster
flex team lines (stacked, flag + name)
auto score column (stacked, right-aligned)
76px outcome chip

State machine (derive from match + prediction):
• empty — no prediction, match SCHEDULED
→ dashed pitch border, "PALPITAR" + "+"
• pending — prediction exists, match SCHEDULED
→ ink-850 chip, "PALPITADO", "1–1"
• live-exact | live-winner | live-miss
— match LIVE, prediction exists
→ matching tone (win/amber/lose) + small
pulsing red dot prefix on the chip label.
Show live.minute' under the LIVE pill.
• exact | winner | miss
— match FINISHED, prediction exists
→ tone, pred score in display font, "+N pts"
in mono micro-label.

Score column: two stacked numbers in Bricolage 18, right-
aligned. Winning side = ink-100; losing side = ink-600;
no-score = ink-600 "·".

TeamLine: 22px flag (existing FlagPlaceholder semantics
or your real flag asset) + team short name.
Bold the winning side, mute (ink-500) the losing side.

Add onPress that calls the existing handler in
app/pool/[id]/index.tsx — we keep deeplinks to
predict / match screens unchanged.

Write a unit test in **tests**/PoolPredictionMatchCard.test.tsx
covering all five states.

# P6 — Round headers

Reference: screens/PalpitesTabScreen.jsx → RoundHeader.

In app/pool/[id]/index.tsx, when building sections
inside PredictionMatchPanel, attach to each section:

done: number of matches with a settled prediction (FINISHED)
total: matches in this round
pts: sum of points earned this round
upcoming: every match in the round is SCHEDULED

Build a RoundSectionHeader component that renders:
• mono "GRUPO {x} · RODADA {n}" eyebrow (ink-400, 10px)
• flex 1px ink-800 rule
• right side:
– upcoming → amber dot + "ABERTO"
– else → mono "{done}/{total} · +{pts} pts"
(pitch when pts > 0, ink-500 otherwise)

Also: if any match in the visible list is LIVE, render
a sticky "AO VIVO" banner at the top of the SectionList header
showing the live match's score and the user's predicted result.
Tap dismisses (local state, no persistence).

# P7 — Final pass

1. Skeletons: replace the centered ActivityIndicator on the
   Palpites tab with 6 skeleton rows shaped like the new
   PoolPredictionMatchCard (ink-850 bg, shimmer via Moti).

2. Empty state: when matches.length === 0, show
   "Nenhuma partida neste filtro" in ink-400, centered, with a
   ghost button "Limpar filtros".

3. Accessibility:
   • Every chip / tab has accessibilityRole="button"
   and a clear label.
   • Outcome chips announce "Acertou placar exato, três a dois,
   cinco pontos" via accessibilityLabel.
   • LIVE pulse respects useReducedMotion() (Moti).

4. Side-by-side QA: open palpites.html in the
   browser at 420×900 and compare against an iOS sim screenshot
   at the same dimensions for these states:
   – default (Grupo A)
   – round 2 (one EXATO live, one prior result)
   – round 3 (one PALPITADO, one empty)
   – Por Data mode
   Diff < 4px on any element. Attach the screenshots to the PR.

5. Smoke test: npx expo start, walk the full flow
   (login → pool list → pool detail → predict from empty chip →
   confirm chip flips to PALPITADO).

Deliver one PR per phase if possible; otherwise a single PR
with phases as commit boundaries.
