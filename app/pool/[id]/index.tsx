import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  SectionList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import styled, { useTheme, type DefaultTheme } from 'styled-components/native';

import { usePool } from '@/hooks/usePool';
import type { PoolDetail } from '@/hooks/usePool';
import { usePoolStandings } from '@/hooks/usePoolStandings';
import { usePoolMembers } from '@/hooks/usePoolMembers';
import type { PoolMember } from '@/hooks/usePoolMembers';
import { useMatches } from '@/hooks/useMatches';
import { usePredictions } from '@/hooks/usePredictions';
import { useRemovePoolMember } from '@/hooks/useRemovePoolMember';
import { useLeavePool } from '@/hooks/useLeavePool';
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
import PoolPredictionMatchCard from '@/components/AppComponents/PoolPredictionMatchCard';
import AppAvatar from '@/components/AppComponents/AppAvatar';
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

type MainTab = 'predictions' | 'standings' | 'info';

const MAIN_TABS: Segment<MainTab>[] = [
  { label: 'Ranking', value: 'standings' },
  { label: 'Palpites', value: 'predictions' },
  { label: 'Grupo', value: 'info' },
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
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.primary};
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

const InfoScroll = styled(ScrollView)`
  flex: 1;
`;

const InfoSection = styled.View`
  margin-top: ${Spaces.md}px;
`;

const InfoSectionHeader = styled.View`
  flex-direction: row;
  align-items: center;
  padding-horizontal: ${Spaces.md}px;
  padding-vertical: ${Spaces.sm}px;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.shape_light};
  border-bottom-width: 0.5px;
  border-bottom-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
`;

const ScoringRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-horizontal: ${Spaces.md}px;
  padding-vertical: ${Spaces.sm}px;
  border-bottom-width: 0.5px;
  border-bottom-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.white};
`;

const MemberRow = styled.View`
  flex-direction: row;
  align-items: center;
  height: 60px;
  padding-horizontal: ${Spaces.md}px;
  border-bottom-width: 0.5px;
  border-bottom-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.white};
`;

const MemberNameCell = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  margin-horizontal: ${Spaces.sm}px;
`;

const RemoveButton = styled.Pressable`
  padding: ${Spaces.xsm}px;
`;

const InfoFooter = styled.View`
  padding-horizontal: ${Spaces.md}px;
  padding-top: ${Spaces.md}px;
  padding-bottom: ${Spaces.lg}px;
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

// ─── Pool Info panel ─────────────────────────────────────────────────────────

type PoolInfoPanelProps = {
  pool: PoolDetail;
  members: PoolMember[];
  currentUserId: string | undefined;
  onMemberRemoved: () => void;
  onLeavePool: () => void;
};

function PoolInfoPanel({
  pool,
  members,
  currentUserId,
  onMemberRemoved,
  onLeavePool,
}: PoolInfoPanelProps) {
  const theme = useTheme();
  const removeMutation = useRemovePoolMember(pool.id);
  const leaveMutation = useLeavePool(pool.id);

  const rules = pool.scoringRules;
  const scoringRows = [
    { label: 'Placar exato', value: `${rules.exactScorePoints} pts` },
    { label: 'Vencedor + saldo de gols', value: `${rules.correctWinnerGoalDiffPoints} pts` },
    { label: 'Vencedor correto', value: `${rules.correctWinnerPoints} pts` },
    { label: 'Empate correto', value: `${rules.correctDrawPoints} pts` },
    { label: 'Multiplicador eliminatórias', value: `${rules.knockoutMultiplier}×` },
    { label: 'Multiplicador final', value: `${rules.finalMultiplier}×` },
  ];

  function handleRemove(member: PoolMember) {
    const name = member.fullName ?? member.name ?? 'Participante';
    Alert.alert(
      'Remover participante',
      `Deseja remover ${name} do grupo?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () =>
            removeMutation.mutate(member.id, { onSuccess: onMemberRemoved }),
        },
      ],
    );
  }

  function handleLeave() {
    Alert.alert(
      'Sair do grupo',
      'Tem certeza que deseja sair deste grupo? Seu histórico de palpites será mantido.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveMutation.mutateAsync();
              onLeavePool();
            } catch (e) {
              Alert.alert('Erro', (e as Error).message ?? 'Não foi possível sair do grupo.');
            }
          },
        },
      ],
    );
  }

  return (
    <InfoScroll contentContainerStyle={{ paddingBottom: Spaces.lg }}>
      {/* Scoring rules */}
      <InfoSection>
        <InfoSectionHeader>
          <AppText bold size="xsm" color={theme.colors.text_gray}>
            REGRAS DE PONTUAÇÃO
          </AppText>
        </InfoSectionHeader>
        {scoringRows.map((row) => (
          <ScoringRow key={row.label}>
            <AppText size="sm" color={theme.colors.text}>
              {row.label}
            </AppText>
            <AppText bold size="sm" color={theme.colors.primary}>
              {row.value}
            </AppText>
          </ScoringRow>
        ))}
      </InfoSection>

      {/* Participants */}
      <InfoSection>
        <InfoSectionHeader>
          <AppText bold size="xsm" color={theme.colors.text_gray}>
            PARTICIPANTES ({members.length})
          </AppText>
        </InfoSectionHeader>
        {members.map((member) => {
          const isMe = member.id === currentUserId;
          const isRemoving =
            removeMutation.isPending && removeMutation.variables === member.id;
          return (
            <MemberRow key={member.id}>
              <AppAvatar
                imagePath={member.profileImageUrl ?? undefined}
                name={member.fullName ?? member.name ?? 'P'}
                size={IconSizes.lg}
              />
              <MemberNameCell>
                <AppText
                  bold={isMe}
                  size="sm"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{ flex: 1 }}
                >
                  {member.fullName ?? member.name ?? 'Participante'}
                </AppText>
                {isMe && (
                  <AppText size="xsm" color={theme.colors.text_gray}>
                    {' '}(você)
                  </AppText>
                )}
              </MemberNameCell>
              {pool.isCreator && !isMe && (
                <RemoveButton
                  onPress={() => handleRemove(member)}
                  disabled={isRemoving}
                  accessibilityLabel={`Remover ${member.fullName ?? member.name}`}
                >
                  {isRemoving ? (
                    <ActivityIndicator size="small" color={theme.colors.negative} />
                  ) : (
                    <Ionicons
                      name="trash-outline"
                      size={IconSizes.sm}
                      color={theme.colors.negative}
                    />
                  )}
                </RemoveButton>
              )}
            </MemberRow>
          );
        })}
      </InfoSection>

      {/* Leave pool footer — only for non-admins */}
      {!pool.isCreator && (
        <InfoFooter>
          <AppButton
            title="Sair do Grupo"
            variant="negative"
            isLoading={leaveMutation.isPending}
            onPress={handleLeave}
          />
        </InfoFooter>
      )}
    </InfoScroll>
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
                size={IconSizes.md}
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
        onChange={setActiveTab}
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
                      <AppText
                        bold
                        size="lg"
                        color={theme.colors.white}
                        align="center"
                        style={{ fontFamily: theme.fonts.display, fontVariant: ['tabular-nums'] }}
                      >
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

      {/* Info tab */}
      {activeTab === 'info' && (
        <PoolInfoPanel
          pool={pool}
          members={members}
          currentUserId={apiUser?.id}
          onMemberRemoved={membersRefresh}
          onLeavePool={() => router.replace('/(tabs)')}
        />
      )}
    </Root>
  );
}
