import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from 'styled-components/native';

import type { Match } from '@/domain/entities/Match';
import { MatchStage, STAGE_LABELS } from '@/domain/enums/MatchStage';
import { TypographyFamilies } from '@/constants/tokens';

export type MatchFilterMode = 'group-stage' | 'by-date';

// Kept for any callers that still reference this constant
export const MATCH_FILTER_MODE_SEGMENTS = [
  { label: 'Por Grupo / Etapa', value: 'group-stage' as MatchFilterMode },
  { label: 'Por Data', value: 'by-date' as MatchFilterMode },
];

export const GROUP_LETTERS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
] as const;

export type GroupLetter = (typeof GROUP_LETTERS)[number];

export const KNOCKOUT_STAGES = [
  MatchStage.ROUND_OF_16,
  MatchStage.QUARTER_FINAL,
  MatchStage.SEMI_FINAL,
  MatchStage.THIRD_PLACE,
  MatchStage.FINAL,
] as const;

export type MatchFilterChipValue = GroupLetter | MatchStage;

export type PredictionProgress = { done: number; total: number };

export const ALL_MATCH_FILTER_CHIPS: { label: string; value: MatchFilterChipValue }[] = [
  ...GROUP_LETTERS.map((g) => ({ label: g, value: g as MatchFilterChipValue })),
  ...KNOCKOUT_STAGES.map((s) => ({
    label: STAGE_LABELS[s],
    value: s as MatchFilterChipValue,
  })),
];

type MatchFilterControlsProps = {
  mode: MatchFilterMode;
  selectedChip: MatchFilterChipValue;
  selectedDate: string;
  availableDates: string[];
  onModeChange: (mode: MatchFilterMode) => void;
  onChipChange: (chip: MatchFilterChipValue) => void;
  onDateChange: (date: string) => void;
  predictionProgressByChip?: Map<MatchFilterChipValue, PredictionProgress>;
};

export function isGroupChip(value: MatchFilterChipValue): value is GroupLetter {
  return (GROUP_LETTERS as readonly string[]).includes(value);
}

export function getDefaultMatchDate(matches: Match[]): string {
  const dates = getAvailableDates(matches);
  return (
    dates.find((date) =>
      matches.some(
        (m) => m.matchDatetime.startsWith(date) && m.matchStatus !== 'COMPLETED',
      ),
    ) ??
    dates[0] ??
    ''
  );
}

export function getAvailableDates(matches: Match[]): string[] {
  const dates = matches.map((m) => m.matchDatetime.slice(0, 10));
  return [...new Set(dates)].sort();
}

function formatPill(dateStr: string): { weekday: string; day: string } {
  const date = new Date(`${dateStr}T12:00:00`);
  const raw = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
  return {
    weekday: raw.charAt(0).toUpperCase() + raw.slice(1),
    day: String(date.getDate()),
  };
}

function chipPrefix(value: MatchFilterChipValue): string {
  return isGroupChip(value) ? 'GRP' : 'ETP';
}

function chipLabel(value: MatchFilterChipValue): string {
  if (isGroupChip(value)) return value;
  return STAGE_LABELS[value as MatchStage] ?? String(value);
}

export default function MatchFilterControls({
  mode,
  selectedChip,
  selectedDate,
  availableDates,
  onModeChange,
  onChipChange,
  onDateChange,
  predictionProgressByChip,
}: MatchFilterControlsProps) {
  const theme = useTheme();

  return (
    <View style={s.wrapper}>
      {/* ── Mode toggle ─────────────────────────────────────────────────────── */}
      <View
        style={[
          s.modeToggle,
          { backgroundColor: theme.colors.ink900, borderColor: theme.colors.ink800 },
        ]}
      >
        {(['group-stage', 'by-date'] as MatchFilterMode[]).map((m) => {
          const active = mode === m;
          return (
            <Pressable
              key={m}
              onPress={() => onModeChange(m)}
              style={[s.modeItem, active && { backgroundColor: theme.colors.pitch }]}
              accessibilityRole="button"
              accessibilityLabel={m === 'group-stage' ? 'Por grupo e etapa' : 'Por data'}
            >
              <Ionicons
                name={m === 'group-stage' ? 'apps-outline' : 'calendar-outline'}
                size={14}
                color={active ? theme.colors.pitchInk : theme.colors.ink400}
              />
              <Text
                style={[
                  s.modeLabel,
                  { color: active ? theme.colors.pitchInk : theme.colors.ink400 },
                ]}
              >
                {m === 'group-stage' ? 'Por grupo · etapa' : 'Por data'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* ── Chip / date row ─────────────────────────────────────────────────── */}
      {mode === 'group-stage' ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.chipScroll}
        >
          {ALL_MATCH_FILTER_CHIPS.map(({ value }) => {
            const active = value === selectedChip;
            const progress = predictionProgressByChip?.get(value);
            return (
              <Pressable
                key={String(value)}
                onPress={() => onChipChange(value)}
                style={[
                  s.stageChip,
                  active
                    ? { backgroundColor: theme.colors.pitch, borderColor: theme.colors.pitch }
                    : { backgroundColor: 'transparent', borderColor: theme.colors.ink700 },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`${chipPrefix(value)} ${chipLabel(value)}`}
              >
                <Text
                  style={[
                    s.chipPrefix,
                    { color: active ? theme.colors.pitchInk : theme.colors.ink500 },
                    { opacity: active ? 0.7 : 0.55 },
                  ]}
                >
                  {chipPrefix(value)}
                </Text>
                <Text
                  style={[
                    s.chipLetter,
                    { color: active ? theme.colors.pitchInk : theme.colors.ink300 },
                  ]}
                >
                  {chipLabel(value)}
                </Text>
                {active && progress != null && (
                  <View
                    style={[
                      s.progressBadge,
                      { backgroundColor: 'rgba(14,27,0,0.18)' },
                    ]}
                  >
                    <Text style={[s.progressText, { color: theme.colors.pitchInk }]}>
                      {progress.done}/{progress.total}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.chipScroll}
        >
          {availableDates.map((date) => {
            const active = date === selectedDate;
            const { weekday, day } = formatPill(date);
            return (
              <Pressable
                key={date}
                onPress={() => onDateChange(date)}
                style={[
                  s.datePill,
                  active
                    ? { backgroundColor: theme.colors.pitch, borderColor: theme.colors.pitch }
                    : { backgroundColor: 'transparent', borderColor: theme.colors.ink700 },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`${weekday} ${day}`}
              >
                <Text
                  style={[
                    s.datePillWeekday,
                    { color: active ? theme.colors.pitchInk : theme.colors.ink500 },
                  ]}
                >
                  {weekday}
                </Text>
                <Text
                  style={[
                    s.datePillDay,
                    { color: active ? theme.colors.pitchInk : theme.colors.ink100 },
                  ]}
                >
                  {day}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
  },

  // Mode toggle
  modeToggle: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
    gap: 2,
  },
  modeItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 9,
  },
  modeLabel: {
    fontFamily: TypographyFamilies.sansMedium,
    fontSize: 12,
    includeFontPadding: false,
  },

  // Chip scroll
  chipScroll: {
    gap: 6,
    paddingVertical: 2,
  },
  stageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 100,
    borderWidth: 1,
  },
  chipPrefix: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 10,
    includeFontPadding: false,
    letterSpacing: 0.3,
  },
  chipLetter: {
    fontFamily: TypographyFamilies.sansSemi,
    fontSize: 13,
    includeFontPadding: false,
  },
  progressBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 100,
    marginLeft: 2,
  },
  progressText: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 9,
    includeFontPadding: false,
  },

  // Date pills
  datePill: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 2,
  },
  datePillWeekday: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 10,
    includeFontPadding: false,
  },
  datePillDay: {
    fontFamily: TypographyFamilies.display,
    fontSize: 16,
    includeFontPadding: false,
  },
});
