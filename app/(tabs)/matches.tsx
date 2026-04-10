import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import styled, { useTheme } from 'styled-components/native';

import { useMatches } from '@/hooks/useMatches';
import type { MatchFilters } from '@/hooks/matchKeys';
import type { Match, MatchStage } from '@/domain/entities/Match';

import AppText from '@/components/AppComponents/AppText';
import AppSpacer from '@/components/AppComponents/AppSpacer';
import AppButton from '@/components/AppComponents/AppButton';
import MatchCard from '@/components/AppComponents/MatchCard';
import SegmentedControl, {
  Segment,
} from '@/components/AppComponents/SegmentedControl';
import { Spaces } from '@/constants/tokens';

// ─── Filter types ─────────────────────────────────────────────────────────────

type StageFilter = MatchStage | 'all';

const STAGE_SEGMENTS: Segment<StageFilter>[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Grupos', value: 'GROUP' },
  { label: 'Oitavas', value: 'ROUND_OF_16' },
  { label: 'Quartas', value: 'QUARTER_FINAL' },
  { label: 'Semis', value: 'SEMI_FINAL' },
  { label: '3º Lugar', value: 'THIRD_PLACE' },
  { label: 'Final', value: 'FINAL' },
];

// ─── Styled ───────────────────────────────────────────────────────────────────

const Root = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Header = styled.View`
  padding-top: ${Spaces.md}px;
  padding-horizontal: ${Spaces.md}px;
`;

const FiltersArea = styled.View`
  gap: ${Spaces.sm}px;
`;

const CenteredFill = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding-horizontal: ${Spaces.md}px;
`;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MatchesScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [selectedStage, setSelectedStage] = useState<StageFilter>('all');

  // Build query filters
  const filters = useMemo<MatchFilters>(() => {
    const f: MatchFilters = {};
    if (selectedStage !== 'all') f.stage = selectedStage;
    return f;
  }, [selectedStage]);

  // Match list — read-only agenda, no predictions loaded here (N+1 prevention)
  const {
    data: matches,
    isFetching,
    isError,
    error,
    refetch,
  } = useMatches(filters);

  // ── Loading ──────────────────────────────────────────────────────────────────

  if (matches === undefined && isFetching) {
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
            {(error as Error)?.message ?? 'Erro ao carregar partidas.'}
          </AppText>
          <AppSpacer verticalSpace="md" />
          <AppButton
            title="Tentar novamente"
            variant="transparent"
            onPress={() => refetch()}
          />
        </CenteredFill>
      </Root>
    );
  }

  // ── Main ─────────────────────────────────────────────────────────────────────

  return (
    <Root>
      <Header>
        <AppText bold size="lg">
          Partidas
        </AppText>
      </Header>

      <FiltersArea>
        <SegmentedControl
          segments={STAGE_SEGMENTS}
          selected={selectedStage}
          onChange={setSelectedStage}
        />
      </FiltersArea>

      <FlatList<Match>
        data={matches ?? []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{
          paddingHorizontal: Spaces.md,
          paddingBottom: Spaces.lg,
        }}
        ItemSeparatorComponent={() => <AppSpacer verticalSpace="xsm" />}
        ListEmptyComponent={
          <CenteredFill>
            <AppText size="sm" color={theme.colors.text_gray} align="center">
              Nenhuma partida encontrada
            </AppText>
          </CenteredFill>
        }
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        renderItem={({ item: match }) => (
          <MatchCard
            match={match}
            onPress={() => router.push(`/match/${match.id}`)}
          />
        )}
      />
    </Root>
  );
}
