import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  SectionList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import styled, { useTheme, type DefaultTheme } from 'styled-components/native';

import { usePool } from '@/hooks/usePool';
import { usePoolStandings } from '@/hooks/usePoolStandings';
import { usePoolMembers } from '@/hooks/usePoolMembers';
import { useMatches } from '@/hooks/useMatches';
import { usePredictions } from '@/hooks/usePredictions';
import { useSession } from '@/context/SessionContext';
import type { Match } from '@/domain/entities/Match';
import type { Prediction } from '@/domain/entities/Prediction';
import { MatchStage, STAGE_LABELS } from '@/domain/enums/MatchStage';
import {
  filterByDate,
  filterByGroup,
  filterByStage,
  groupByRound,
} from '@/domain/helpers/matchFilters';

import AppText from '@/components/AppComponents/AppText';
import AppSpacer from '@/components/AppComponents/AppSpacer';
import AppButton from '@/components/AppComponents/AppButton';
import MatchCard from '@/components/AppComponents/MatchCard';
import PoolPredictionMatchCard from '@/components/AppComponents/PoolPredictionMatchCard';
import LeaderboardRow from '@/components/AppComponents/LeaderboardRow';
import type { LeaderboardEntry } from '@/components/AppComponents/LeaderboardRow';
import SegmentedControl, {
  Segment,
} from '@/components/AppComponents/SegmentedControl';
import MatchFilterControls, {
  getAvailableDates,
  getDefaultMatchDate,
  isGroupChip,
  type MatchFilterChipValue,
  type MatchFilterMode,
} from '@/components/matches/MatchFilterControls';
import { IconSizes, Spaces } from '@/constants/tokens';

// ─── Tab & filter types ───────────────────────────────────────────────────────

type MainTab = 'predictions' | 'standings' | 'matches';
type StatusFilter = 'all' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';

const MAIN_TABS: Segment<MainTab>[] = [
  { label: 'Ranking', value: 'standings' },
  { label: 'Palpites', value: 'predictions' },
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

const RankingSummary = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-horizontal: ${Spaces.md}px;
  margin-top: ${Spaces.sm}px;
  margin-bottom: ${Spaces.xsm}px;
  padding-horizontal: ${Spaces.md}px;
  padding-vertical: ${Spaces.md}px;
  border-radius: 10px;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.positive};
`;

const SummaryItem = styled.View`
  flex: 1;
  align-items: center;
`;

const SummaryValueRow = styled.View`
  min-height: 28px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const StandingsFooter = styled.View`
  padding-horizontal: ${Spaces.md}px;
  padding-top: ${Spaces.md}px;
  padding-bottom: ${Spaces.lg}px;
`;

const StandingsTableHeader = styled.View`
  flex-direction: row;
  align-items: center;
  min-height: 34px;
  padding-horizontal: ${Spaces.md}px;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.shape_light};
  border-bottom-width: 0.5px;
  border-bottom-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
`;

const RankHeaderCell = styled.View`
  width: 36px;
`;

const NameHeaderCell = styled.View`
  flex: 1;
  margin-left: ${IconSizes.lg + Spaces.sm}px;
  margin-right: ${Spaces.sm}px;
`;

const PointsHeaderCell = styled.View`
  width: 48px;
  align-items: flex-end;
  margin-left: ${Spaces.sm}px;
`;

const StatsHeaderCell = styled.View`
  justify-content: flex-end;
  width: 48px;
  margin-left: ${Spaces.md}px;
`;

const StatHeaderItem = styled.View`
  align-items: flex-end;
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

const MATCH_LIST_CONTENT = {
  paddingHorizontal: Spaces.md,
  paddingBottom: Spaces.lg,
  flexGrow: 1,
} as const;

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

function formatDDMM(datetime: string): string {
  return new Date(datetime).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
}

function getDateModeSubtext(match: Match): string {
  if (match.stage === MatchStage.GROUP) return `Grupo ${match.group ?? ''}`;
  return STAGE_LABELS[match.stage as MatchStage] ?? match.stage;
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
      contentContainerStyle={MATCH_LIST_CONTENT}
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

type PredictionMatchPanelProps = {
  matches: Match[];
  isFetching: boolean;
  refetch: () => void;
  predictionMap: Map<number, Prediction>;
  onMatchPress: (match: Match) => void;
  mode: MatchFilterMode;
  selectedChip: MatchFilterChipValue;
  selectedDate: string | null;
  onModeChange: (mode: MatchFilterMode) => void;
  onChipChange: (chip: MatchFilterChipValue) => void;
  onDateChange: (date: string) => void;
};

function PredictionMatchPanel({
  matches,
  isFetching,
  refetch,
  predictionMap,
  onMatchPress,
  mode,
  selectedChip,
  selectedDate,
  onModeChange,
  onChipChange,
  onDateChange,
}: PredictionMatchPanelProps) {
  const theme = useTheme();
  const availableDates = useMemo(() => getAvailableDates(matches), [matches]);
  const defaultDate = useMemo(() => getDefaultMatchDate(matches), [matches]);
  const effectiveDate = selectedDate ?? defaultDate;

  const sections = useMemo(() => {
    if (isGroupChip(selectedChip)) {
      return groupByRound(filterByGroup(matches, selectedChip)).map(
        ({ round, matches: roundMatches }) => ({
          title: `Grupo ${selectedChip} · Rodada ${round}`,
          data: roundMatches,
        }),
      );
    }

    const stage = selectedChip as MatchStage;
    return [{ title: STAGE_LABELS[stage], data: filterByStage(matches, stage) }];
  }, [matches, selectedChip]);

  const dateMatches = useMemo(
    () => filterByDate(matches, effectiveDate),
    [effectiveDate, matches],
  );

  const refreshControl = (
    <RefreshControl
      refreshing={isFetching}
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

  return (
    <>
      <MatchFilterControls
        mode={mode}
        selectedChip={selectedChip}
        selectedDate={effectiveDate}
        availableDates={availableDates}
        onModeChange={onModeChange}
        onChipChange={onChipChange}
        onDateChange={onDateChange}
      />

      {mode === 'group-stage' ? (
        <SectionList
          sections={sections}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={MATCH_LIST_CONTENT}
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
            <PoolPredictionMatchCard
              match={item}
              prediction={predictionMap.get(item.id) ?? null}
              centerSubtext={formatDDMM(item.matchDatetime)}
              onPress={() => onMatchPress(item)}
            />
          )}
        />
      ) : (
        <FlatList<Match>
          data={dateMatches}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={MATCH_LIST_CONTENT}
          refreshControl={refreshControl}
          ListEmptyComponent={emptyComponent}
          ItemSeparatorComponent={() => <AppSpacer verticalSpace="xsm" />}
          renderItem={({ item }) => (
            <PoolPredictionMatchCard
              match={item}
              prediction={predictionMap.get(item.id) ?? null}
              centerSubtext={getDateModeSubtext(item)}
              onPress={() => onMatchPress(item)}
            />
          )}
        />
      )}
    </>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function PoolDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const poolId = id ? Number(id) : undefined;
  const router = useRouter();
  const theme = useTheme();
  const { apiUser } = useSession();

  const [activeTab, setActiveTab] = useState<MainTab>('standings');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [predictionFilterMode, setPredictionFilterMode] =
    useState<MatchFilterMode>('group-stage');
  const [predictionSelectedChip, setPredictionSelectedChip] =
    useState<MatchFilterChipValue>('A');
  const [predictionSelectedDate, setPredictionSelectedDate] = useState<string | null>(null);

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

  const {
    members,
    loading: membersLoading,
    error: membersError,
    refresh: membersRefresh,
  } = usePoolMembers(poolId);

  const lastUpdatedMinutes = minutesSince(standings[0]?.lastUpdated);

  const memberById = useMemo(() => {
    const map = new Map<string, (typeof members)[number]>();
    for (const member of members) {
      map.set(member.id, member);
    }
    return map;
  }, [members]);

  // Adapt API shape (fullName) to LeaderboardRow shape (name)
  const leaderboardEntries: LeaderboardEntry[] = useMemo(
    () =>
      standings.map((s, index) => {
        const standing = s as typeof s & {
          exactScoreCount?: number;
          user?: Record<string, unknown>;
        };
        const user = standing.user;
        const userId =
          standing.userId ??
          (typeof user?.id === 'string' ? user.id : null) ??
          String(index);
        const member = memberById.get(userId);

        return {
          poolId: standing.poolId ?? poolId ?? 0,
          userId,
          totalPoints: standing.totalPoints ?? 0,
          exactScoresCount: standing.exactScoreCount ?? standing.exactScoresCount ?? 0,
          correctWinnersCount: standing.correctWinnersCount ?? 0,
          rank: standing.rank ?? index + 1,
          lastUpdated: standing.lastUpdated ?? null,
          user: {
            id: typeof user?.id === 'string' ? user.id : userId,
            name:
              (typeof user?.fullName === 'string' ? user.fullName : null) ??
              (typeof user?.name === 'string' ? user.name : null) ??
              member?.fullName ??
              member?.name ??
              'Participante',
            profileImageUrl:
              (typeof user?.profileImageUrl === 'string' ? user.profileImageUrl : null) ??
              (typeof user?.avatarUrl === 'string' ? user.avatarUrl : null) ??
              (typeof user?.photoUrl === 'string' ? user.photoUrl : null) ??
              (typeof user?.picture === 'string' ? user.picture : null) ??
              member?.profileImageUrl ??
              null,
          },
        };
      }),
    [memberById, poolId, standings],
  );

  const memberEntries: LeaderboardEntry[] = useMemo(
    () =>
      members.map((member) => ({
        poolId: poolId ?? 0,
        userId: member.id,
        totalPoints: 0,
        exactScoresCount: 0,
        correctWinnersCount: 0,
        rank: null,
        lastUpdated: null,
        user: {
          id: member.id,
          name: member.fullName ?? member.name ?? 'Participante',
          profileImageUrl: member.profileImageUrl,
        },
      })),
    [members, poolId],
  );

  const showMemberFallback = !standingsLoading && leaderboardEntries.length === 0;
  const rankingEntries = showMemberFallback ? memberEntries : leaderboardEntries;
  const currentUserEntry = rankingEntries.find((entry) => entry.userId === apiUser?.id);
  const currentUserRank = currentUserEntry?.rank ?? null;
  const rankingSummary = [
    { label: 'Ranking', value: currentUserRank != null ? `# ${currentUserRank}` : '-' },
    { label: 'Pontos', value: String(currentUserEntry?.totalPoints ?? 0) },
    { label: 'Exatos', value: String(currentUserEntry?.exactScoresCount ?? 0) },
  ];

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
    if (match.matchStatus === 'SCHEDULED') {
      router.push(`/pool/${id}/predict?matchId=${match.id}`);
    } else {
      router.push(`/pool/${id}/match/${match.id}`);
    }
  }

  function handleMatchesPress(match: Match) {
    router.push(`/match/${match.id}`);
  }

  async function handleStandingsRefresh() {
    await standingsRefresh();
    if (showMemberFallback) {
      await membersRefresh();
    }
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
        <PredictionMatchPanel
          matches={matches ?? []}
          isFetching={matchesFetching}
          refetch={matchesRefetch}
          predictionMap={predictionMap}
          onMatchPress={handlePredictionsPress}
          mode={predictionFilterMode}
          selectedChip={predictionSelectedChip}
          selectedDate={predictionSelectedDate}
          onModeChange={setPredictionFilterMode}
          onChipChange={setPredictionSelectedChip}
          onDateChange={setPredictionSelectedDate}
        />
      )}

      {/* Standings tab */}
      {activeTab === 'standings' && (
        <FlatList<LeaderboardEntry>
          data={rankingEntries}
          keyExtractor={(item) => item.userId}
          refreshControl={
            <RefreshControl
              refreshing={standingsLoading || (showMemberFallback && membersLoading)}
              onRefresh={handleStandingsRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ListHeaderComponent={
            <>
              <RankingSummary>
                {rankingSummary.map((item) => (
                  <SummaryItem key={item.label}>
                    <SummaryValueRow>
                      <AppText bold size="lg" color={theme.colors.white} align="center">
                        {item.value}
                      </AppText>
                    </SummaryValueRow>
                    <AppText bold size="xsm" color={theme.colors.white} align="center">
                      {item.label}
                    </AppText>
                  </SummaryItem>
                ))}
              </RankingSummary>
              {lastUpdatedMinutes != null ? (
                <ListHeaderText>
                  <AppText size="xsm" color={theme.colors.text_disabled} align="right">
                    Atualizado há {lastUpdatedMinutes} min
                  </AppText>
                </ListHeaderText>
              ) : showMemberFallback ? (
                <ListHeaderText>
                  <AppText size="xsm" color={theme.colors.text_disabled} align="right">
                    Participantes aguardando o primeiro ranking
                  </AppText>
                </ListHeaderText>
              ) : null}
              {rankingEntries.length > 0 && (
                <StandingsTableHeader>
                  <RankHeaderCell />
                  <NameHeaderCell>
                    <AppText bold size="xsm" color={theme.colors.text_gray}>
                      Participante
                    </AppText>
                  </NameHeaderCell>
                  <PointsHeaderCell>
                    <AppText bold size="xsm" color={theme.colors.text_gray} align="right">
                      Pts
                    </AppText>
                  </PointsHeaderCell>
                  <StatsHeaderCell>
                    <StatHeaderItem>
                      <AppText bold size="xsm" color={theme.colors.text_gray} align="right">
                        Exatos
                      </AppText>
                    </StatHeaderItem>
                  </StatsHeaderCell>
                </StandingsTableHeader>
              )}
            </>
          }
          ListEmptyComponent={
            <CenteredFill>
              <AppText size="sm" color={theme.colors.text_gray} align="center">
                {membersLoading
                  ? 'Carregando participantes...'
                  : membersError ?? 'Nenhum participante ainda'}
              </AppText>
            </CenteredFill>
          }
          ListFooterComponent={
            <StandingsFooter>
              <AppButton
                title="Meus Palpites"
                variant="positive"
                onPress={() => setActiveTab('predictions')}
              />
            </StandingsFooter>
          }
          contentContainerStyle={{ flexGrow: 1 }}
          renderItem={({ item: entry, index }) => (
            <LeaderboardRow
              entry={entry}
              rank={entry.rank ?? (showMemberFallback ? null : index + 1)}
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
