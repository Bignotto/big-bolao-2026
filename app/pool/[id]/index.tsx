import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from 'styled-components/native';

import { usePool } from '@/hooks/usePool';
import type { PoolDetail } from '@/hooks/usePool';
import { usePoolStandings } from '@/hooks/usePoolStandings';
import { usePoolMembers } from '@/hooks/usePoolMembers';
import type { PoolMember } from '@/hooks/usePoolMembers';
import { useMatches } from '@/hooks/useMatches';
import { usePredictions } from '@/hooks/usePredictions';
import { useLeavePool } from '@/hooks/useLeavePool';
import { useRemovePoolMember } from '@/hooks/useRemovePoolMember';
import { useSession } from '@/context/SessionContext';
import type { Match } from '@/domain/entities/Match';
import { MatchStage } from '@/domain/enums/MatchStage';
import { MatchStatus } from '@/domain/enums/MatchStatus';
import type { Prediction } from '@/domain/entities/Prediction';
import {
  filterByDate,
  filterByGroup,
  filterByStage,
  groupByRound,
} from '@/domain/helpers/matchFilters';

import AppButton from '@/components/AppComponents/AppButton';
import AppAvatar from '@/components/AppComponents/AppAvatar';
import MatchCard from '@/components/AppComponents/MatchCard';
import LeaderboardRow from '@/components/AppComponents/LeaderboardRow';
import { LeaderboardHeader } from '@/components/AppComponents/LeaderboardRow';
import type { LeaderboardEntry } from '@/components/AppComponents/LeaderboardRow';
import MatchFilterControls, {
  getAvailableDates,
  getDefaultMatchDate,
  isGroupChip,
  type MatchFilterChipValue,
  type MatchFilterMode,
} from '@/components/matches/MatchFilterControls';
import { TypographyFamilies } from '@/constants/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────

type MainTab = 'standings' | 'predictions' | 'info';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function minutesSince(iso: string | null | undefined): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
}

// ─── Underline tab bar ────────────────────────────────────────────────────────

const TABS: { label: string; value: MainTab }[] = [
  { label: 'Ranking', value: 'standings' },
  { label: 'Palpites', value: 'predictions' },
  { label: 'Grupo', value: 'info' },
];

function TabBar({
  active,
  onChange,
}: {
  active: MainTab;
  onChange: (t: MainTab) => void;
}) {
  const theme = useTheme();
  return (
    <View
      style={[
        s.tabBar,
        { borderBottomColor: theme.colors.ink800, backgroundColor: theme.colors.background },
      ]}
    >
      {TABS.map((tab) => {
        const isActive = tab.value === active;
        return (
          <Pressable
            key={tab.value}
            onPress={() => onChange(tab.value)}
            style={s.tabItem}
          >
            <Text
              style={[
                s.tabLabel,
                { color: isActive ? theme.colors.ink100 : theme.colors.ink500 },
                isActive && s.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
            {isActive && (
              <View style={[s.tabUnderline, { backgroundColor: theme.colors.pitch }]} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Round section header ─────────────────────────────────────────────────────

function RoundSectionHeader({
  title,
  done,
  total,
  pts,
  allScheduled,
}: {
  title: string;
  done: number;
  total: number;
  pts: number;
  allScheduled: boolean;
}) {
  const theme = useTheme();
  return (
    <View style={[s.sectionHeader, { backgroundColor: theme.colors.background }]}>
      <Text style={[s.sectionTitle, { color: theme.colors.ink400 }]}>
        {title.toUpperCase()}
      </Text>
      <View style={[s.sectionLine, { backgroundColor: theme.colors.ink800 }]} />
      <View style={s.sectionRight}>
        {allScheduled ? (
          <>
            <View style={[s.amberDot, { backgroundColor: theme.colors.signalAmber }]} />
            <Text style={[s.sectionStat, { color: theme.colors.signalAmber }]}>ABERTO</Text>
          </>
        ) : (
          <Text
            style={[
              s.sectionStat,
              { color: pts > 0 ? theme.colors.pitch : theme.colors.ink500 },
            ]}
          >
            {done}/{total} · +{pts} pts
          </Text>
        )}
      </View>
    </View>
  );
}

// ─── Predictions panel ────────────────────────────────────────────────────────

function PredictionMatchPanel({
  matches,
  isFetching,
  refetch,
  predictionMap,
  poolId,
  mode,
  selectedChip,
  selectedDate,
  onModeChange,
  onChipChange,
  onDateChange,
}: {
  matches: Match[];
  isFetching: boolean;
  refetch: () => void;
  predictionMap: Map<number, Prediction>;
  poolId: number;
  mode: MatchFilterMode;
  selectedChip: MatchFilterChipValue;
  selectedDate: string | null;
  onModeChange: (m: MatchFilterMode) => void;
  onChipChange: (c: MatchFilterChipValue) => void;
  onDateChange: (d: string) => void;
}) {
  const theme = useTheme();
  const availableDates = useMemo(() => getAvailableDates(matches), [matches]);
  const defaultDate = useMemo(() => getDefaultMatchDate(matches), [matches]);
  const effectiveDate = selectedDate ?? defaultDate;

  const sections = useMemo(() => {
    if (isGroupChip(selectedChip)) {
      return groupByRound(filterByGroup(matches, selectedChip)).map(({ round, matches: ms }) => {
        const done = ms.filter((m) => {
          const pred = predictionMap.get(m.id);
          return pred != null && m.matchStatus === MatchStatus.COMPLETED;
        }).length;
        const pts = ms.reduce((sum, m) => {
          const pred = predictionMap.get(m.id);
          return sum + (pred?.pointsEarned ?? 0);
        }, 0);
        const allScheduled = ms.every(
          (m) =>
            m.matchStatus === MatchStatus.SCHEDULED ||
            m.matchStatus === MatchStatus.POSTPONED,
        );
        return {
          title: `Grupo ${selectedChip} · Rodada ${round}`,
          data: ms,
          done,
          total: ms.length,
          pts,
          allScheduled,
        };
      });
    }
    const stage = selectedChip as MatchStage;
    const ms = filterByStage(matches, stage);
    return [{
      title: stage,
      data: ms,
      done: 0,
      total: ms.length,
      pts: 0,
      allScheduled: ms.every(
        (m) =>
          m.matchStatus === MatchStatus.SCHEDULED ||
          m.matchStatus === MatchStatus.POSTPONED,
      ),
    }];
  }, [matches, selectedChip, predictionMap]);

  const dateMatches = useMemo(
    () => filterByDate(matches, effectiveDate),
    [effectiveDate, matches],
  );

  const refreshControl = (
    <RefreshControl
      refreshing={isFetching}
      onRefresh={refetch}
      tintColor={theme.colors.pitch}
    />
  );

  const empty = (
    <View style={s.centered}>
      <Text style={[s.emptyTxt, { color: theme.colors.ink500 }]}>
        Nenhuma partida encontrada
      </Text>
    </View>
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
          contentContainerStyle={s.listContent}
          stickySectionHeadersEnabled
          refreshControl={refreshControl}
          ListEmptyComponent={empty}
          renderSectionHeader={({ section }) => (
            <RoundSectionHeader
              title={section.title}
              done={section.done}
              total={section.total}
              pts={section.pts}
              allScheduled={section.allScheduled}
            />
          )}
          renderItem={({ item }) => (
            <MatchCard
              match={item}
              poolContext={{ poolId, userPrediction: predictionMap.get(item.id) }}
            />
          )}
        />
      ) : (
        <FlatList<Match>
          data={dateMatches}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={s.listContent}
          refreshControl={refreshControl}
          ListEmptyComponent={empty}
          renderItem={({ item }) => (
            <MatchCard
              match={item}
              poolContext={{ poolId, userPrediction: predictionMap.get(item.id) }}
            />
          )}
        />
      )}
    </>
  );
}

// ─── Group info tab ───────────────────────────────────────────────────────────

function GroupInfoTab({
  pool,
  members,
  membersLoading,
  membersError,
  membersRefresh,
  isAdmin,
  removingUserId,
  onRemove,
  leavePending,
  onLeave,
}: {
  pool: PoolDetail;
  members: PoolMember[];
  membersLoading: boolean;
  membersError: string | null;
  membersRefresh: () => void;
  isAdmin: boolean;
  removingUserId: string | null;
  onRemove: (member: PoolMember) => void;
  leavePending: boolean;
  onLeave: () => void;
}) {
  const c = useTheme().colors;
  const rules = pool.scoringRules;

  const scoringRows = [
    { label: 'Placar exato', value: `${rules.exactScorePoints} pts` },
    { label: 'Vencedor + saldo de gols', value: `${rules.correctWinnerGoalDiffPoints} pts` },
    { label: 'Vencedor correto', value: `${rules.correctWinnerPoints} pts` },
    { label: 'Empate correto', value: `${rules.correctDrawPoints} pts` },
    { label: 'Multiplicador mata-mata', value: `×${rules.knockoutMultiplier}` },
    { label: 'Multiplicador final', value: `×${rules.finalMultiplier}` },
  ];

  return (
    <ScrollView
      contentContainerStyle={sg.scroll}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={membersLoading}
          onRefresh={membersRefresh}
          tintColor={c.pitch}
        />
      }
    >
      {/* ── Invite code ── */}
      <Text style={[sg.sectionLabel, { color: c.ink400 }]}>CÓDIGO DO GRUPO</Text>
      <View style={sg.gap8} />
      <View style={[sg.card, { backgroundColor: c.ink850 }]}>
        {pool.inviteCode ? (
          <>
            <Text style={[sg.hint, { color: c.ink500 }]}>
              Compartilhe este código para convidar participantes
            </Text>
            <View style={[sg.codePill, { backgroundColor: c.ink800 }]}>
              <Text style={[sg.codeText, { color: c.pitch }]}>{pool.inviteCode}</Text>
            </View>
          </>
        ) : (
          <Text style={[sg.hint, { color: c.ink500 }]}>
            Este grupo não possui código de convite.
          </Text>
        )}
      </View>

      <View style={sg.gap20} />

      {/* ── Scoring rules ── */}
      <Text style={[sg.sectionLabel, { color: c.ink400 }]}>PONTUAÇÃO</Text>
      <View style={sg.gap8} />
      <View style={[sg.card, { backgroundColor: c.ink850 }]}>
        {scoringRows.map((row, i) => (
          <View key={row.label}>
            {i > 0 && <View style={[sg.divider, { backgroundColor: c.ink700 }]} />}
            <View style={sg.ruleRow}>
              <Text style={[sg.ruleLabel, { color: c.ink300 }]}>{row.label}</Text>
              <Text style={[sg.ruleValue, { color: c.pitch }]}>{row.value}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={sg.gap20} />

      {/* ── Members ── */}
      <Text style={[sg.sectionLabel, { color: c.ink400 }]}>
        PARTICIPANTES · {pool.participantsCount}
      </Text>
      <View style={sg.gap8} />
      <View style={[sg.card, { backgroundColor: c.ink850 }]}>
        {membersError ? (
          <Text style={[sg.hint, { color: c.signalLose }]}>{membersError}</Text>
        ) : members.length === 0 ? (
          <Text style={[sg.hint, { color: c.ink500 }]}>Nenhum participante ainda.</Text>
        ) : (
          members.map((member, i) => {
            const name = member.fullName ?? member.name ?? 'Participante';
            const isCreatorMember = member.id === pool.creatorId;
            const isRemoving = removingUserId === member.id;

            return (
              <View key={member.id || i}>
                {i > 0 && <View style={[sg.divider, { backgroundColor: c.ink700 }]} />}
                <View style={sg.memberRow}>
                  <AppAvatar
                    imagePath={member.profileImageUrl ?? undefined}
                    name={name}
                    size={36}
                  />
                  <View style={sg.memberInfo}>
                    <Text style={[sg.memberName, { color: c.ink100 }]} numberOfLines={1}>
                      {name}
                    </Text>
                    {isCreatorMember && (
                      <Text style={[sg.memberBadge, { color: c.pitchSoft }]}>Admin</Text>
                    )}
                  </View>
                  {isAdmin && !isCreatorMember && (
                    isRemoving ? (
                      <ActivityIndicator size="small" color={c.signalLose} />
                    ) : (
                      <Pressable onPress={() => onRemove(member)} hitSlop={12}>
                        <Ionicons name="person-remove-outline" size={18} color={c.signalLose} />
                      </Pressable>
                    )
                  )}
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* ── Leave button (non-admin only) ── */}
      {!isAdmin && (
        <>
          <View style={sg.gap28} />
          <AppButton
            title="Sair do grupo"
            variant="destructive"
            size="lg"
            isLoading={leavePending}
            onPress={onLeave}
          />
        </>
      )}

      <View style={sg.gap28} />
    </ScrollView>
  );
}

const sg = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingTop: 16 },
  sectionLabel: { fontFamily: TypographyFamilies.sansSemi, fontSize: 11, letterSpacing: 0.8 },
  gap8: { height: 8 },
  gap20: { height: 20 },
  gap28: { height: 28 },
  card: { borderRadius: 16, overflow: 'hidden' },
  divider: { height: 1, marginHorizontal: 14 },
  hint: { fontFamily: TypographyFamilies.sans, fontSize: 13, padding: 14, lineHeight: 18 },
  codePill: {
    margin: 14,
    marginTop: 4,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  codeText: { fontFamily: TypographyFamilies.mono, fontSize: 22, letterSpacing: 4 },
  ruleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  ruleLabel: { fontFamily: TypographyFamilies.sans, fontSize: 14 },
  ruleValue: { fontFamily: TypographyFamilies.sansSemi, fontSize: 14 },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 12,
  },
  memberInfo: { flex: 1, gap: 2 },
  memberName: { fontFamily: TypographyFamilies.sansSemi, fontSize: 14 },
  memberBadge: { fontFamily: TypographyFamilies.sansMedium, fontSize: 11 },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function PoolDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const poolId = id ? Number(id) : undefined;
  const router = useRouter();
  const theme = useTheme();
  const { apiUser } = useSession();

  const [activeTab, setActiveTab] = useState<MainTab>('standings');
  const [predFilterMode, setPredFilterMode] = useState<MatchFilterMode>('group-stage');
  const [predChip, setPredChip] = useState<MatchFilterChipValue>('A');
  const [predDate, setPredDate] = useState<string | null>(null);

  // ── Data ────────────────────────────────────────────────────────────────────

  const { pool, loading: poolLoading, error: poolError, refresh: poolRefresh } = usePool(poolId);

  const { matches, isFetching: matchesFetching, refetch: matchesRefetch } = useMatches();

  const matchIds = useMemo(() => matches.map((m) => m.id), [matches]);
  const { data: predictions } = usePredictions(poolId, matchIds, apiUser?.id);

  const predictionMap = useMemo(() => {
    const map = new Map<number, Prediction>();
    for (const pred of predictions ?? []) map.set(pred.matchId, pred);
    return map;
  }, [predictions]);

  const { standings, loading: standingsLoading, refresh: standingsRefresh } = usePoolStandings(poolId);
  const { members, loading: membersLoading, error: membersError, refresh: membersRefresh } = usePoolMembers(poolId);
  const leaveMutation = useLeavePool(poolId ?? 0);
  const removeMutation = useRemovePoolMember(poolId);

  const memberById = useMemo(() => {
    const map = new Map<string, (typeof members)[number]>();
    for (const m of members) {
      if (m.id) map.set(m.id, m);
      const raw = m as Record<string, unknown>;
      if (typeof raw.userId === 'string' && raw.userId) map.set(raw.userId, m);
    }
    return map;
  }, [members]);

  const leaderboardEntries: LeaderboardEntry[] = useMemo(
    () =>
      standings.map((s, index) => {
        const standing = s as typeof s & { exactScoreCount?: number; user?: Record<string, unknown> };
        const user = standing.user;
        const userId =
          standing.userId ??
          (typeof user?.id === 'string' ? user.id : null) ??
          String(index);
        const member =
          memberById.get(userId) ??
          (typeof user?.id === 'string' ? memberById.get(user.id) : undefined);
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
              member?.fullName ?? member?.name ?? 'Participante',
            profileImageUrl:
              (typeof user?.profileImageUrl === 'string' ? user.profileImageUrl : null) ??
              (typeof user?.avatarUrl === 'string' ? user.avatarUrl : null) ??
              (typeof user?.photoUrl === 'string' ? user.photoUrl : null) ??
              member?.profileImageUrl ?? null,
          },
        };
      }),
    [memberById, poolId, standings],
  );

  const memberEntries: LeaderboardEntry[] = useMemo(
    () =>
      members.map((m) => ({
        poolId: poolId ?? 0,
        userId: m.id,
        totalPoints: 0,
        exactScoresCount: 0,
        correctWinnersCount: 0,
        rank: null,
        lastUpdated: null,
        user: {
          id: m.id,
          name: m.fullName ?? m.name ?? 'Participante',
          profileImageUrl: m.profileImageUrl,
        },
      })),
    [members, poolId],
  );

  const showMemberFallback = !standingsLoading && leaderboardEntries.length === 0;
  const rankingEntries = showMemberFallback ? memberEntries : leaderboardEntries;
  const currentUserEntry = rankingEntries.find((e) => e.userId === apiUser?.id);
  const currentUserRank = currentUserEntry?.rank ?? null;
  const lastUpdatedMinutes = minutesSince(standings[0]?.lastUpdated);


  // ── Loading / Error ──────────────────────────────────────────────────────────

  if (poolLoading) {
    return (
      <SafeAreaView style={[s.root, { backgroundColor: theme.colors.background }]}>
        <View style={s.centered}>
          <ActivityIndicator size="large" color={theme.colors.pitch} />
        </View>
      </SafeAreaView>
    );
  }

  if (poolError || !pool) {
    return (
      <SafeAreaView style={[s.root, { backgroundColor: theme.colors.background }]}>
        <View style={s.centered}>
          <Text style={[s.emptyTxt, { color: theme.colors.signalLose }]}>
            {poolError ?? 'Grupo não encontrado.'}
          </Text>
          <View style={{ height: 16 }} />
          <AppButton title="Tentar novamente" variant="ghost" onPress={() => poolRefresh()} />
        </View>
      </SafeAreaView>
    );
  }

  async function handleStandingsRefresh() {
    await standingsRefresh();
    if (showMemberFallback) await membersRefresh();
  }

  function handleLeave() {
    Alert.alert(
      'Sair do grupo',
      'Tem certeza? Seu histórico de palpites será mantido.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveMutation.mutateAsync();
              router.replace('/(tabs)');
            } catch (e) {
              Alert.alert('Erro', (e as Error).message);
            }
          },
        },
      ],
    );
  }

  function handleRemoveMember(member: PoolMember) {
    const name = member.fullName ?? member.name ?? 'este participante';
    Alert.alert('Remover participante', `Remover ${name} do grupo?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeMutation.mutateAsync(member.id);
          } catch (e) {
            Alert.alert('Erro', (e as Error).message);
          }
        },
      },
    ]);
  }

  // ── Stats for hero ───────────────────────────────────────────────────────────

  const statsGrid = [
    {
      label: 'SUA POS',
      value: currentUserRank != null ? `#${currentUserRank}` : '—',
      isPitch: true,
    },
    {
      label: 'PONTOS',
      value: String(currentUserEntry?.totalPoints ?? 0),
      isPitch: false,
    },
    {
      label: 'EXATOS',
      value: String(currentUserEntry?.exactScoresCount ?? 0),
      isPitch: false,
    },
  ];

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.colors.background }]}>
      {/* Hero header */}
      <View style={s.hero}>
        {/* Subtle top accent */}
        <View style={s.heroAccent} />

        {/* Nav row */}
        <View style={s.navRow}>
          <Pressable
            onPress={() => router.back()}
            style={[s.navBtn, { backgroundColor: theme.colors.ink800 }]}
          >
            <Ionicons name="chevron-back" size={18} color={theme.colors.ink300} />
          </Pressable>
          <Text style={[s.navEyebrow, { color: theme.colors.ink500 }]}>
            DETALHES DO GRUPO
          </Text>
          {pool.isCreator ? (
            <Pressable
              onPress={() => router.push(`/pool/${id}/settings`)}
              style={[s.navBtn, { backgroundColor: theme.colors.ink800 }]}
            >
              <Ionicons name="menu-outline" size={18} color={theme.colors.ink300} />
            </Pressable>
          ) : (
            <View style={s.navBtn} />
          )}
        </View>

        {/* Eyebrow */}
        <Text style={[s.heroEyebrow, { color: theme.colors.ink500 }]}>
          {pool.participantsCount} PARTICIPANTES · {pool.isCreator ? 'ADMIN' : 'MEMBRO'}
        </Text>

        {/* Pool name */}
        <Text style={[s.heroTitle, { color: theme.colors.ink100 }]} numberOfLines={2}>
          {pool.name}
        </Text>

        {/* Stats grid */}
        <View style={s.statsGrid}>
          {statsGrid.map((item) => (
            <View
              key={item.label}
              style={[
                s.statTile,
                item.isPitch
                  ? { backgroundColor: theme.colors.pitch }
                  : { backgroundColor: theme.colors.ink850, borderWidth: 1, borderColor: theme.colors.ink800 },
              ]}
            >
              <Text
                style={[
                  s.statLabel,
                  { color: item.isPitch ? theme.colors.pitchInk : theme.colors.ink500 },
                ]}
              >
                {item.label}
              </Text>
              <Text
                style={[
                  s.statValue,
                  { color: item.isPitch ? theme.colors.pitchInk : theme.colors.ink100 },
                ]}
              >
                {item.value}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Tab bar */}
      <TabBar active={activeTab} onChange={setActiveTab} />

      {/* ── Standings ── */}
      {activeTab === 'standings' && (
        <FlatList<LeaderboardEntry>
          data={rankingEntries}
          keyExtractor={(item) => item.userId}
          refreshControl={
            <RefreshControl
              refreshing={standingsLoading || (showMemberFallback && membersLoading)}
              onRefresh={handleStandingsRefresh}
              tintColor={theme.colors.pitch}
            />
          }
          ListHeaderComponent={
            <>
              {lastUpdatedMinutes != null && (
                <Text style={[s.updatedTxt, { color: theme.colors.ink500 }]}>
                  Atualizado há {lastUpdatedMinutes} min
                </Text>
              )}
              {showMemberFallback && (
                <Text style={[s.updatedTxt, { color: theme.colors.ink500 }]}>
                  Aguardando primeiro ranking
                </Text>
              )}
              <LeaderboardHeader />
            </>
          }
          ListEmptyComponent={
            <View style={s.centered}>
              <Text style={[s.emptyTxt, { color: theme.colors.ink500 }]}>
                {membersLoading ? 'Carregando...' : membersError ?? 'Nenhum participante ainda'}
              </Text>
            </View>
          }
          ListFooterComponent={
            <View style={s.standingsFooter}>
              <AppButton
                title="Ver palpites"
                variant="secondary"
                onPress={() => setActiveTab('predictions')}
              />
            </View>
          }
          contentContainerStyle={{ flexGrow: 1 }}
          renderItem={({ item, index }) => (
            <LeaderboardRow
              entry={item}
              rank={item.rank ?? (showMemberFallback ? null : index + 1)}
              isCurrentUser={item.userId === apiUser?.id}
            />
          )}
        />
      )}

      {/* ── Predictions ── */}
      {activeTab === 'predictions' && (
        <PredictionMatchPanel
          matches={matches ?? []}
          isFetching={matchesFetching}
          refetch={matchesRefetch}
          predictionMap={predictionMap}
          poolId={poolId ?? 0}
          mode={predFilterMode}
          selectedChip={predChip}
          selectedDate={predDate}
          onModeChange={setPredFilterMode}
          onChipChange={setPredChip}
          onDateChange={setPredDate}
        />
      )}

      {/* ── Grupo ── */}
      {activeTab === 'info' && (
        <GroupInfoTab
          pool={pool}
          members={members}
          membersLoading={membersLoading}
          membersError={membersError}
          membersRefresh={membersRefresh}
          isAdmin={pool.isCreator}
          removingUserId={removeMutation.isPending ? (removeMutation.variables as string ?? null) : null}
          onRemove={handleRemoveMember}
          leavePending={leaveMutation.isPending}
          onLeave={handleLeave}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTxt: {
    fontFamily: TypographyFamilies.sans,
    fontSize: 14,
    textAlign: 'center',
    includeFontPadding: false,
  },

  // Hero
  hero: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    overflow: 'hidden',
  },
  heroAccent: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 120,
    backgroundColor: 'rgba(200,255,62,0.04)',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  navBtn: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  navEyebrow: {
    flex: 1,
    fontFamily: TypographyFamilies.mono,
    fontSize: 11,
    letterSpacing: 0.8,
    textAlign: 'center',
    includeFontPadding: false,
  },
  heroEyebrow: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 10,
    letterSpacing: 1,
    includeFontPadding: false,
    marginBottom: 6,
  },
  heroTitle: {
    fontFamily: TypographyFamilies.display,
    fontSize: 34,
    letterSpacing: -0.95,
    lineHeight: 38,
    includeFontPadding: false,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statTile: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
  },
  statLabel: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 9,
    letterSpacing: 0.5,
    includeFontPadding: false,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: TypographyFamilies.display,
    fontSize: 36,
    letterSpacing: -1.26,
    includeFontPadding: false,
    lineHeight: 38,
  },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 20,
  },
  tabItem: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginRight: 20,
    alignItems: 'center',
  },
  tabLabel: {
    fontFamily: TypographyFamilies.sans,
    fontSize: 14,
    includeFontPadding: false,
  },
  tabLabelActive: {
    fontFamily: TypographyFamilies.sansSemi,
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 1,
  },

  // Lists
  listContent: { flexGrow: 1, paddingBottom: 32 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 10,
    letterSpacing: 0.8,
    includeFontPadding: false,
  },
  sectionLine: { flex: 1, height: 1 },
  sectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  amberDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  sectionStat: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 10,
    letterSpacing: 0.4,
    includeFontPadding: false,
  },
  standingsFooter: { padding: 20 },
  updatedTxt: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 10,
    textAlign: 'right',
    paddingHorizontal: 16,
    paddingVertical: 8,
    includeFontPadding: false,
  },
});
