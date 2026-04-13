import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  SectionList,
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
  groupByRound,
} from '@/domain/helpers/matchFilters';
import MatchFilterControls, {
  getAvailableDates,
  getDefaultMatchDate,
  isGroupChip,
  type MatchFilterChipValue,
  type MatchFilterMode,
} from '@/components/matches/MatchFilterControls';

import AppText from '@/components/AppComponents/AppText';
import AppSpacer from '@/components/AppComponents/AppSpacer';
import AppButton from '@/components/AppComponents/AppButton';
import MatchCard from '@/components/matches/MatchCard';
import { Spaces } from '@/constants/tokens';

// ─── Chip config ──────────────────────────────────────────────────────────────

function formatDDMM(datetime: string): string {
  return new Date(datetime).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
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

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MatchesScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [mode, setMode] = useState<MatchFilterMode>('group-stage');
  const [selectedChip, setSelectedChip] = useState<MatchFilterChipValue>('A');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { matches, isLoading, isError, refetch } = useMatches();

  // Default date: earliest date with at least one non-completed match
  const defaultDate = useMemo(() => {
    return getDefaultMatchDate(matches);
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

      <MatchFilterControls
        mode={mode}
        selectedChip={selectedChip}
        selectedDate={effectiveDate}
        availableDates={availableDates}
        onModeChange={setMode}
        onChipChange={setSelectedChip}
        onDateChange={setSelectedDate}
      />
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
