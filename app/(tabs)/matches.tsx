import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  SectionList,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import styled, { useTheme, type DefaultTheme } from 'styled-components/native';

import { useMatches } from '@/hooks/useMatches';
import type { Match } from '@/domain/entities/Match';
import { MatchStage, STAGE_LABELS } from '@/domain/enums/MatchStage';
import {
  filterByGroup,
  filterByStage,
  filterByDate,
  getAvailableDates,
  groupByRound,
} from '@/domain/helpers/matchFilters';

import AppText from '@/components/AppComponents/AppText';
import AppSpacer from '@/components/AppComponents/AppSpacer';
import AppButton from '@/components/AppComponents/AppButton';
import MatchCard from '@/components/matches/MatchCard';
import SegmentedControl, { Segment } from '@/components/AppComponents/SegmentedControl';
import { BorderRadius, Spaces } from '@/constants/tokens';

// ─── Chip config ──────────────────────────────────────────────────────────────

type Mode = 'group-stage' | 'by-date';

const MODE_SEGMENTS: Segment<Mode>[] = [
  { label: 'Por Grupo / Etapa', value: 'group-stage' },
  { label: 'Por Data', value: 'by-date' },
];

const GROUP_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'] as const;
type GroupLetter = (typeof GROUP_LETTERS)[number];

const KNOCKOUT_STAGES = [
  MatchStage.ROUND_OF_16,
  MatchStage.QUARTER_FINAL,
  MatchStage.SEMI_FINAL,
  MatchStage.THIRD_PLACE,
  MatchStage.FINAL,
] as const;

type ChipValue = GroupLetter | MatchStage;

const ALL_CHIPS: { label: string; value: ChipValue }[] = [
  ...GROUP_LETTERS.map((g) => ({ label: `Grupo ${g}`, value: g as ChipValue })),
  ...KNOCKOUT_STAGES.map((s) => ({ label: STAGE_LABELS[s], value: s as ChipValue })),
];

function isGroupChip(v: ChipValue): v is GroupLetter {
  return (GROUP_LETTERS as readonly string[]).includes(v);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDDMM(datetime: string): string {
  return new Date(datetime).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
}

function formatPill(dateStr: string): { weekday: string; day: string } {
  const d = new Date(`${dateStr}T12:00:00`);
  const raw = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
  return {
    weekday: raw.charAt(0).toUpperCase() + raw.slice(1),
    day: String(d.getDate()),
  };
}

function getModeBSubtext(match: Match): string {
  if (match.stage === MatchStage.GROUP) return `Grupo ${match.group ?? ''}`;
  return STAGE_LABELS[match.stage as MatchStage] ?? match.stage;
}

// ─── Styled ───────────────────────────────────────────────────────────────────

const Root = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.background};
`;

const FixedTop = styled.View`
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.white};
`;

const TitleArea = styled.View`
  padding-horizontal: ${Spaces.md}px;
  padding-top: ${Spaces.md}px;
`;

const ChipItem = styled(Pressable)<{ $active: boolean }>`
  padding-horizontal: ${Spaces.md}px;
  padding-vertical: ${Spaces.sm}px;
  border-radius: ${BorderRadius.xlg}px;
  border-width: 1px;
  border-color: ${({ theme, $active }: { $active: boolean; theme: DefaultTheme }) =>
    $active ? theme.colors.primary : theme.colors.border};
  background-color: ${({ theme, $active }: { $active: boolean; theme: DefaultTheme }) =>
    $active ? theme.colors.primary : theme.colors.white};
  margin-right: ${Spaces.xsm}px;
`;

const DatePill = styled(Pressable)<{ $active: boolean }>`
  width: 44px;
  align-items: center;
  padding-vertical: ${Spaces.sm}px;
  border-radius: ${BorderRadius.md}px;
  border-width: 1px;
  border-color: ${({ theme, $active }: { $active: boolean; theme: DefaultTheme }) =>
    $active ? theme.colors.primary : theme.colors.border};
  background-color: ${({ theme, $active }: { $active: boolean; theme: DefaultTheme }) =>
    $active ? theme.colors.primary : theme.colors.white};
  margin-right: ${Spaces.xsm}px;
`;

const SectionHeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${Spaces.sm}px;
  padding-horizontal: ${Spaces.md}px;
  padding-top: ${Spaces.md}px;
  padding-bottom: ${Spaces.sm}px;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.background};
`;

const SectionLine = styled.View`
  flex: 1;
  height: 1px;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
`;

const CenteredFill = styled.View`
  align-items: center;
  justify-content: center;
  padding-horizontal: ${Spaces.md}px;
  margin-top: 60px;
`;

const LIST_CONTENT = {
  paddingHorizontal: Spaces.md,
  paddingBottom: Spaces.lg,
} as const;

const CHIP_SCROLL_CONTENT = {
  paddingHorizontal: Spaces.md,
  paddingVertical: Spaces.sm,
} as const;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MatchesScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>('group-stage');
  const [selectedChip, setSelectedChip] = useState<ChipValue>('A');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { matches, isLoading, isError, refetch } = useMatches();

  // Default date: earliest date with at least one non-completed match
  const defaultDate = useMemo(() => {
    const dates = getAvailableDates(matches);
    return (
      dates.find((date) =>
        matches.some((m) => m.matchDatetime.startsWith(date) && m.matchStatus !== 'COMPLETED')
      ) ?? dates[0] ?? ''
    );
  }, [matches]);

  const effectiveDate = selectedDate ?? defaultDate;

  // Mode A: build SectionList sections
  const sections = useMemo(() => {
    if (isGroupChip(selectedChip)) {
      return groupByRound(filterByGroup(matches, selectedChip)).map(
        ({ round, matches: roundMatches }) => ({
          title: `Grupo ${selectedChip} · Rodada ${round}`,
          data: roundMatches,
        })
      );
    }
    const stage = selectedChip as MatchStage;
    return [{ title: STAGE_LABELS[stage], data: filterByStage(matches, stage) }];
  }, [matches, selectedChip]);

  // Mode B: filtered matches + date list
  const dateMatches = useMemo(
    () => filterByDate(matches, effectiveDate),
    [matches, effectiveDate]
  );
  const availableDates = useMemo(() => getAvailableDates(matches), [matches]);

  // ── Loading ──────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <Root>
        <CenteredFill>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </CenteredFill>
      </Root>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────

  if (isError) {
    return (
      <Root>
        <CenteredFill>
          <AppText size="sm" color={theme.colors.text_gray} align="center">
            Erro ao carregar partidas.
          </AppText>
          <AppSpacer verticalSpace="md" />
          <AppButton title="Tentar novamente" variant="transparent" onPress={() => refetch()} />
        </CenteredFill>
      </Root>
    );
  }

  // ── Shared pieces ─────────────────────────────────────────────────────────────

  const refreshControl = (
    <RefreshControl
      refreshing={false}
      onRefresh={refetch}
      colors={[theme.colors.primary]}
      tintColor={theme.colors.primary}
    />
  );

  const emptyComponent = (
    <CenteredFill>
      <AppText size="sm" color={theme.colors.text_gray} align="center">
        Nenhuma partida encontrada
      </AppText>
    </CenteredFill>
  );

  // ── Fixed top area ────────────────────────────────────────────────────────────

  const fixedTop = (
    <FixedTop>
      <TitleArea>
        <AppText size="lg" bold>
          Partidas
        </AppText>
        <AppText size="sm" color={theme.colors.text_gray}>
          Copa do Mundo 2026
        </AppText>
      </TitleArea>

      <SegmentedControl segments={MODE_SEGMENTS} selected={mode} onChange={setMode} />

      {mode === 'group-stage' ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={CHIP_SCROLL_CONTENT}
        >
          {ALL_CHIPS.map(({ label, value }) => {
            const active = value === selectedChip;
            return (
              <ChipItem key={value} $active={active} onPress={() => setSelectedChip(value)}>
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
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={CHIP_SCROLL_CONTENT}
        >
          {availableDates.map((date) => {
            const active = date === effectiveDate;
            const { weekday, day } = formatPill(date);
            return (
              <DatePill key={date} $active={active} onPress={() => setSelectedDate(date)}>
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
      )}
    </FixedTop>
  );

  // ── Mode A ────────────────────────────────────────────────────────────────────

  if (mode === 'group-stage') {
    return (
      <Root>
        {fixedTop}
        <SectionList
          sections={sections}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={LIST_CONTENT}
          stickySectionHeadersEnabled
          refreshControl={refreshControl}
          ListEmptyComponent={emptyComponent}
          ItemSeparatorComponent={() => <AppSpacer verticalSpace="xsm" />}
          renderSectionHeader={({ section }) => (
            <SectionHeaderRow>
              <AppText size="xsm" bold color={theme.colors.text_gray}>
                {section.title.toUpperCase()}
              </AppText>
              <SectionLine />
            </SectionHeaderRow>
          )}
          renderItem={({ item }) => (
            <MatchCard
              match={item}
              centerSubtext={formatDDMM(item.matchDatetime)}
              onPress={() => router.push(`/match/${item.id}`)}
            />
          )}
        />
      </Root>
    );
  }

  // ── Mode B ────────────────────────────────────────────────────────────────────

  return (
    <Root>
      {fixedTop}
      <FlatList<Match>
        data={dateMatches}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={LIST_CONTENT}
        refreshControl={refreshControl}
        ListEmptyComponent={emptyComponent}
        ItemSeparatorComponent={() => <AppSpacer verticalSpace="xsm" />}
        renderItem={({ item }) => (
          <MatchCard
            match={item}
            centerSubtext={getModeBSubtext(item)}
            onPress={() => router.push(`/match/${item.id}`)}
          />
        )}
      />
    </Root>
  );
}
