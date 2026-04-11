import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import styled, { useTheme, type DefaultTheme } from 'styled-components/native';

import { usePool } from '@/hooks/usePool';
import { usePoolStandings } from '@/hooks/usePoolStandings';
import { useMatches } from '@/hooks/useMatches';
import { usePredictions } from '@/hooks/usePredictions';
import { useSession } from '@/context/SessionContext';
import { isMatchLocked } from '@/domain/entities/Match';
import type { Match } from '@/domain/entities/Match';
import type { Prediction } from '@/domain/entities/Prediction';

import AppText from '@/components/AppComponents/AppText';
import AppSpacer from '@/components/AppComponents/AppSpacer';
import AppButton from '@/components/AppComponents/AppButton';
import MatchCard from '@/components/AppComponents/MatchCard';
import LeaderboardRow from '@/components/AppComponents/LeaderboardRow';
import type { LeaderboardEntry } from '@/components/AppComponents/LeaderboardRow';
import SegmentedControl, {
  Segment,
} from '@/components/AppComponents/SegmentedControl';
import { Spaces } from '@/constants/tokens';

// ─── Tab & filter types ───────────────────────────────────────────────────────

type MainTab = 'predictions' | 'standings' | 'matches';
type StatusFilter = 'all' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';

const MAIN_TABS: Segment<MainTab>[] = [
  { label: 'Palpites', value: 'predictions' },
  { label: 'Ranking', value: 'standings' },
  { label: 'Partidas', value: 'matches' },
];

const STATUS_SEGMENTS: Segment<StatusFilter>[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Agendados', value: 'SCHEDULED' },
  { label: 'Ao vivo', value: 'IN_PROGRESS' },
  { label: 'Encerrados', value: 'COMPLETED' },
];

// ─── Styled ───────────────────────────────────────────────────────────────────

const Root = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.background};
`;

const HeaderArea = styled.View`
  padding-top: ${Spaces.md}px;
  padding-horizontal: ${Spaces.md}px;
  padding-bottom: ${Spaces.sm}px;
`;

const HeaderRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
`;

const HeaderTitles = styled.View`
  flex: 1;
`;

const SettingsButton = styled.Pressable`
  padding: ${Spaces.xsm}px;
  margin-left: ${Spaces.sm}px;
`;

const CenteredFill = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding-horizontal: ${Spaces.md}px;
`;

const ListHeaderText = styled.View`
  align-items: flex-end;
  padding-horizontal: ${Spaces.md}px;
  padding-vertical: ${Spaces.xsm}px;
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function minutesSince(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  return Math.floor(diff / 60_000);
}

function formatDeadline(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// ─── Match list panel (shared between "predictions" and "matches" tabs) ───────

type MatchPanelProps = {
  matches: Match[];
  isFetching: boolean;
  refetch: () => void;
  predictionMap: Map<number, Prediction>;
  onMatchPress: (match: Match) => void;
  statusFilter: StatusFilter;
};

function MatchPanel({
  matches,
  isFetching,
  refetch,
  predictionMap,
  onMatchPress,
  statusFilter,
}: MatchPanelProps) {
  const theme = useTheme();

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return matches;
    return matches.filter((m) => m.matchStatus === statusFilter);
  }, [matches, statusFilter]);

  return (
    <FlatList<Match>
      data={filtered}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={{
        paddingHorizontal: Spaces.md,
        paddingBottom: Spaces.lg,
        flexGrow: 1,
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
          prediction={predictionMap.get(match.id) ?? null}
          onPress={() => onMatchPress(match)}
        />
      )}
    />
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function PoolDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const poolId = id ? Number(id) : undefined;
  const router = useRouter();
  const theme = useTheme();
  const { apiUser } = useSession();

  const [activeTab, setActiveTab] = useState<MainTab>('predictions');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // ── Data ────────────────────────────────────────────────────────────────────

  const { pool, loading: poolLoading, error: poolError, refresh: poolRefresh } = usePool(poolId);

  const {
    data: matches,
    isFetching: matchesFetching,
    refetch: matchesRefetch,
  } = useMatches();

  const matchIds = useMemo(() => (matches ?? []).map((m) => m.id), [matches]);

  const { data: predictions } = usePredictions(poolId, matchIds, apiUser?.id);

  const predictionMap = useMemo(() => {
    const map = new Map<number, Prediction>();
    for (const pred of predictions ?? []) {
      map.set(pred.matchId, pred);
    }
    return map;
  }, [predictions]);

  const {
    standings,
    loading: standingsLoading,
    refresh: standingsRefresh,
  } = usePoolStandings(poolId);

  const lastUpdatedMinutes = minutesSince(standings[0]?.lastUpdated);

  // Adapt API shape (fullName) to LeaderboardRow shape (name)
  const leaderboardEntries: LeaderboardEntry[] = useMemo(
    () =>
      standings.map((s) => ({
        poolId: s.poolId,
        userId: s.userId,
        totalPoints: s.totalPoints,
        exactScoresCount: s.exactScoresCount,
        correctWinnersCount: s.correctWinnersCount,
        rank: s.rank,
        lastUpdated: s.lastUpdated,
        user: {
          id: s.user.id,
          name: (s.user as any).fullName ?? (s.user as any).name ?? '',
          profileImageUrl: s.user.profileImageUrl,
        },
      })),
    [standings],
  );

  // ── Loading / Error ──────────────────────────────────────────────────────────

  if (poolLoading) {
    return (
      <Root>
        <CenteredFill>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </CenteredFill>
      </Root>
    );
  }

  if (poolError || !pool) {
    return (
      <Root>
        <CenteredFill>
          <AppText size="sm" color={theme.colors.negative} align="center">
            {poolError ?? 'Grupo não encontrado.'}
          </AppText>
          <AppSpacer verticalSpace="md" />
          <AppButton
            title="Tentar novamente"
            variant="transparent"
            onPress={() => poolRefresh()}
          />
        </CenteredFill>
      </Root>
    );
  }

  // ── Navigation handlers ──────────────────────────────────────────────────────

  function handlePredictionsPress(match: Match) {
    if (!isMatchLocked(match)) {
      router.push(`/pool/${id}/predict?matchId=${match.id}`);
    } else {
      router.push(`/match/${match.id}`);
    }
  }

  function handleMatchesPress(match: Match) {
    router.push(`/match/${match.id}`);
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Root>
      {/* Header */}
      <HeaderArea>
        <HeaderRow>
          <HeaderTitles>
            <AppText bold size="lg" numberOfLines={1}>
              {pool.name}
            </AppText>
            <AppSpacer verticalSpace="xsm" />
            <AppText size="sm" color={theme.colors.text_gray}>
              {pool.participantsCount} participante
              {pool.participantsCount !== 1 ? 's' : ''}
            </AppText>
            <AppText size="xsm" color={theme.colors.text_disabled}>
              Palpites, ranking e calendário do grupo
            </AppText>
            {pool.registrationDeadline != null && (
              <AppText size="xsm" color={theme.colors.text_disabled}>
                Inscrições até {formatDeadline(pool.registrationDeadline)}
              </AppText>
            )}
          </HeaderTitles>

          {pool.isCreator && (
            <SettingsButton
              onPress={() => router.push(`/pool/${id}/settings`)}
              accessibilityLabel="Configurações do grupo"
            >
              <Ionicons
                name="settings-outline"
                size={22}
                color={theme.colors.text_gray}
              />
            </SettingsButton>
          )}
        </HeaderRow>
      </HeaderArea>

      {/* Main tab selector */}
      <SegmentedControl
        segments={MAIN_TABS}
        selected={activeTab}
        onChange={(tab) => {
          setActiveTab(tab);
          setStatusFilter('all');
        }}
      />

      {/* Predictions tab */}
      {activeTab === 'predictions' && (
        <>
          <SegmentedControl
            segments={STATUS_SEGMENTS}
            selected={statusFilter}
            onChange={setStatusFilter}
          />
          <MatchPanel
            matches={matches ?? []}
            isFetching={matchesFetching}
            refetch={matchesRefetch}
            predictionMap={predictionMap}
            onMatchPress={handlePredictionsPress}
            statusFilter={statusFilter}
          />
        </>
      )}

      {/* Standings tab */}
      {activeTab === 'standings' && (
        <FlatList<LeaderboardEntry>
          data={leaderboardEntries}
          keyExtractor={(item) => item.userId}
          refreshControl={
            <RefreshControl
              refreshing={standingsLoading}
              onRefresh={standingsRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ListHeaderComponent={
            lastUpdatedMinutes != null ? (
              <ListHeaderText>
                <AppText size="xsm" color={theme.colors.text_disabled} align="right">
                  Atualizado há {lastUpdatedMinutes} min
                </AppText>
              </ListHeaderText>
            ) : null
          }
          ListEmptyComponent={
            <CenteredFill>
              <AppText size="sm" color={theme.colors.text_gray} align="center">
                Nenhum participante ainda
              </AppText>
            </CenteredFill>
          }
          contentContainerStyle={{ flexGrow: 1 }}
          renderItem={({ item: entry, index }) => (
            <LeaderboardRow
              entry={entry}
              rank={entry.rank ?? index + 1}
              isCurrentUser={entry.userId === apiUser?.id}
            />
          )}
        />
      )}

      {/* Matches tab (read-only) */}
      {activeTab === 'matches' && (
        <>
          <SegmentedControl
            segments={STATUS_SEGMENTS}
            selected={statusFilter}
            onChange={setStatusFilter}
          />
          <MatchPanel
            matches={matches ?? []}
            isFetching={matchesFetching}
            refetch={matchesRefetch}
            predictionMap={predictionMap}
            onMatchPress={handleMatchesPress}
            statusFilter={statusFilter}
          />
        </>
      )}
    </Root>
  );
}
