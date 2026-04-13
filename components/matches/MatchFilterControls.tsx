import React from 'react';
import { Pressable, ScrollView } from 'react-native';
import styled, { type DefaultTheme, useTheme } from 'styled-components/native';

import AppText from '@/components/AppComponents/AppText';
import SegmentedControl, { type Segment } from '@/components/AppComponents/SegmentedControl';
import { BorderRadius, Spaces } from '@/constants/tokens';
import type { Match } from '@/domain/entities/Match';
import { MatchStage, STAGE_LABELS } from '@/domain/enums/MatchStage';

export type MatchFilterMode = 'group-stage' | 'by-date';

export const MATCH_FILTER_MODE_SEGMENTS: Segment<MatchFilterMode>[] = [
  { label: 'Por Grupo / Etapa', value: 'group-stage' },
  { label: 'Por Data', value: 'by-date' },
];

export const GROUP_LETTERS = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
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

export const ALL_MATCH_FILTER_CHIPS: {
  label: string;
  value: MatchFilterChipValue;
}[] = [
  ...GROUP_LETTERS.map((group) => ({
    label: `Grupo ${group}`,
    value: group as MatchFilterChipValue,
  })),
  ...KNOCKOUT_STAGES.map((stage) => ({
    label: STAGE_LABELS[stage],
    value: stage as MatchFilterChipValue,
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
};

type ActiveProps = { $active: boolean; theme: DefaultTheme };

const ChipItem = styled(Pressable)<{ $active: boolean }>`
  height: 36px;
  align-items: center;
  justify-content: center;
  padding-horizontal: ${Spaces.md}px;
  border-radius: ${BorderRadius.xlg}px;
  border-width: 1px;
  border-color: ${(p: ActiveProps) =>
    p.$active ? p.theme.colors.primary : p.theme.colors.border};
  background-color: ${(p: ActiveProps) =>
    p.$active ? p.theme.colors.primary : p.theme.colors.white};
  margin-right: ${Spaces.xsm}px;
`;

const DatePill = styled(Pressable)<{ $active: boolean }>`
  width: 44px;
  height: 56px;
  align-items: center;
  justify-content: center;
  padding-vertical: ${Spaces.sm}px;
  border-radius: ${BorderRadius.md}px;
  border-width: 1px;
  border-color: ${(p: ActiveProps) =>
    p.$active ? p.theme.colors.primary : p.theme.colors.border};
  background-color: ${(p: ActiveProps) =>
    p.$active ? p.theme.colors.primary : p.theme.colors.white};
  margin-right: ${Spaces.xsm}px;
`;

const ChipRow = styled.View`
  height: 52px;
`;

const DateRow = styled.View`
  height: 72px;
`;

const CHIP_SCROLL_CONTENT = {
  paddingHorizontal: Spaces.md,
  paddingVertical: Spaces.sm,
  alignItems: 'center' as const,
} as const;

const GROUP_SCROLL_STYLE = {
  flexGrow: 0,
  height: 52,
  maxHeight: 52,
} as const;

const DATE_SCROLL_STYLE = {
  flexGrow: 0,
  height: 72,
  maxHeight: 72,
} as const;

export function isGroupChip(value: MatchFilterChipValue): value is GroupLetter {
  return (GROUP_LETTERS as readonly string[]).includes(value);
}

export function getDefaultMatchDate(matches: Match[]): string {
  const dates = getAvailableDates(matches);
  return (
    dates.find((date) =>
      matches.some(
        (match) =>
          match.matchDatetime.startsWith(date) &&
          match.matchStatus !== 'COMPLETED',
      ),
    ) ??
    dates[0] ??
    ''
  );
}

export function getAvailableDates(matches: Match[]): string[] {
  const dates = matches.map((match) => match.matchDatetime.slice(0, 10));
  return [...new Set(dates)].sort();
}

function formatPill(dateStr: string): { weekday: string; day: string } {
  const date = new Date(`${dateStr}T12:00:00`);
  const raw = date
    .toLocaleDateString('pt-BR', { weekday: 'short' })
    .replace('.', '');
  return {
    weekday: raw.charAt(0).toUpperCase() + raw.slice(1),
    day: String(date.getDate()),
  };
}

export default function MatchFilterControls({
  mode,
  selectedChip,
  selectedDate,
  availableDates,
  onModeChange,
  onChipChange,
  onDateChange,
}: MatchFilterControlsProps) {
  const theme = useTheme();

  return (
    <>
      <SegmentedControl
        segments={MATCH_FILTER_MODE_SEGMENTS}
        selected={mode}
        onChange={onModeChange}
      />

      {mode === 'group-stage' ? (
        <ChipRow>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={GROUP_SCROLL_STYLE}
            contentContainerStyle={CHIP_SCROLL_CONTENT}
          >
            {ALL_MATCH_FILTER_CHIPS.map(({ label, value }) => {
              const active = value === selectedChip;
              return (
                <ChipItem key={value} $active={active} onPress={() => onChipChange(value)}>
                  <AppText
                    size="xsm"
                    bold={active}
                    color={active ? theme.colors.white : theme.colors.text_gray}
                  >
                    {label}
                  </AppText>
                </ChipItem>
              );
            })}
          </ScrollView>
        </ChipRow>
      ) : (
        <DateRow>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={DATE_SCROLL_STYLE}
            contentContainerStyle={CHIP_SCROLL_CONTENT}
          >
            {availableDates.map((date) => {
              const active = date === selectedDate;
              const { weekday, day } = formatPill(date);
              return (
                <DatePill key={date} $active={active} onPress={() => onDateChange(date)}>
                  <AppText size="xsm" color={active ? theme.colors.white : theme.colors.text_gray}>
                    {weekday}
                  </AppText>
                  <AppText
                    size="sm"
                    bold
                    color={active ? theme.colors.white : theme.colors.text_gray}
                  >
                    {day}
                  </AppText>
                </DatePill>
              );
            })}
          </ScrollView>
        </DateRow>
      )}
    </>
  );
}
