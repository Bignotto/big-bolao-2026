import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'styled-components/native';

import { useMatch } from '@/hooks/useMatch';
import { usePool, type ScoringRule } from '@/hooks/usePool';
import { usePoolMembers } from '@/hooks/usePoolMembers';
import { usePoolMatchPredictions } from '@/hooks/usePoolMatchPredictions';
import type { Match } from '@/domain/entities/Match';
import { MatchStage, STAGE_LABELS } from '@/domain/enums/MatchStage';
import { MatchStatus } from '@/domain/enums/MatchStatus';
import type { PoolMatchPredictionEntry } from '@/domain/entities/PoolMatchPrediction';
import AppAvatar from '@/components/AppComponents/AppAvatar';
import AppButton from '@/components/AppComponents/AppButton';
import { TypographyFamilies } from '@/constants/tokens';

// ── Helpers ───────────────────────────────────────────────────────────────────

const DAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const MONTHS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

function formatEyebrow(match: Match): string {
  const stagePart = match.group
    ? `GRUPO ${match.group}`
    : (STAGE_LABELS[match.stage as MatchStage] ?? match.stage).toUpperCase();
  if (match.matchStatus === MatchStatus.IN_PROGRESS) return `${stagePart}  ·  AO VIVO`;
  const dt = new Date(match.matchDatetime);
  const day = DAYS[dt.getDay()];
  const date = `${String(dt.getDate()).padStart(2, '0')} ${MONTHS[dt.getMonth()]}`;
  return `${stagePart}  ·  ${day} ${date}`;
}

function statusLabel(status: Match['matchStatus']): string {
  if (status === MatchStatus.IN_PROGRESS) return 'AO VIVO';
  if (status === MatchStatus.COMPLETED) return 'ENCERRADO';
  if (status === MatchStatus.POSTPONED) return 'ADIADO';
  return 'AGENDADO';
}

function scoreOutcome(home: number, away: number): 'HOME' | 'AWAY' | 'DRAW' {
  if (home > away) return 'HOME';
  if (away > home) return 'AWAY';
  return 'DRAW';
}

function phaseMultiplier(match: Match, rules: ScoringRule): number {
  if (match.stage === MatchStage.FINAL) return rules.finalMultiplier;
  if (match.stage !== MatchStage.GROUP) return rules.knockoutMultiplier;
  return 1;
}

function calculatePoints(
  entry: PoolMatchPredictionEntry,
  match: Match,
  rules: ScoringRule | null | undefined,
): number | null {
  const p = entry.prediction;
  if (!p) return 0;
  if (p.pointsEarned != null) return p.pointsEarned;
  if (match.homeTeamScore == null || match.awayTeamScore == null || !rules) return null;

  const aH = match.homeTeamScore;
  const aA = match.awayTeamScore;
  const pH = p.predictedHomeScore;
  const pA = p.predictedAwayScore;

  if (pH === aH && pA === aA) return rules.exactScorePoints * phaseMultiplier(match, rules);
  if (scoreOutcome(pH, pA) === scoreOutcome(aH, aA)) {
    const base =
      scoreOutcome(aH, aA) === 'DRAW'
        ? rules.correctDrawPoints
        : pH - pA === aH - aA
          ? rules.correctWinnerGoalDiffPoints
          : rules.correctWinnerPoints;
    return base * phaseMultiplier(match, rules);
  }
  return 0;
}

// ── Match header ──────────────────────────────────────────────────────────────

function MatchHeader({ match }: { match: Match }) {
  const theme = useTheme();
  const isLive = match.matchStatus === MatchStatus.IN_PROGRESS;
  const isDone = match.matchStatus === MatchStatus.COMPLETED;
  const hasScore = match.homeTeamScore != null && match.awayTeamScore != null;
  const showScore = (isLive || isDone) && hasScore;

  let homeScoreColor = theme.colors.ink100;
  let awayScoreColor = theme.colors.ink100;
  if (showScore) {
    if (match.homeTeamScore! > match.awayTeamScore!) awayScoreColor = theme.colors.ink600;
    else if (match.awayTeamScore! > match.homeTeamScore!) homeScoreColor = theme.colors.ink600;
  }

  return (
    <View style={[s.matchPanel, { backgroundColor: theme.colors.ink900 }]}>
      {/* Eyebrow */}
      <View style={s.eyebrowRow}>
        {isLive && (
          <View style={[s.liveDot, { backgroundColor: theme.colors.signalLive }]} />
        )}
        <Text style={[s.eyebrow, { color: isLive ? theme.colors.pitch : theme.colors.ink500 }]}>
          {formatEyebrow(match)}
        </Text>
      </View>

      {/* Home team */}
      <View style={s.teamRow}>
        {match.homeTeam.flagUrl ? (
          <Image source={{ uri: match.homeTeam.flagUrl }} style={s.flag} />
        ) : (
          <View style={[s.flag, s.flagFallback, { backgroundColor: theme.colors.ink800 }]} />
        )}
        <Text style={[s.teamName, { color: theme.colors.ink100 }]} numberOfLines={1}>
          {match.homeTeam.name}
        </Text>
        {showScore && (
          <Text style={[s.teamScore, { color: homeScoreColor }]}>
            {match.homeTeamScore}
          </Text>
        )}
      </View>

      {/* Divider */}
      <View style={[s.teamDivider, { backgroundColor: theme.colors.ink800 }]} />

      {/* Away team */}
      <View style={s.teamRow}>
        {match.awayTeam.flagUrl ? (
          <Image source={{ uri: match.awayTeam.flagUrl }} style={s.flag} />
        ) : (
          <View style={[s.flag, s.flagFallback, { backgroundColor: theme.colors.ink800 }]} />
        )}
        <Text style={[s.teamName, { color: theme.colors.ink100 }]} numberOfLines={1}>
          {match.awayTeam.name}
        </Text>
        {showScore && (
          <Text style={[s.teamScore, { color: awayScoreColor }]}>
            {match.awayTeamScore}
          </Text>
        )}
      </View>

      {/* Venue + status row */}
      <View style={[s.footerRow, { borderTopColor: theme.colors.ink800 }]}>
        {match.stadium && (
          <View style={s.stadiumRow}>
            <Ionicons name="location-outline" size={12} color={theme.colors.ink500} />
            <Text style={[s.stadiumText, { color: theme.colors.ink500 }]}>
              {match.stadium}
            </Text>
          </View>
        )}
        <View
          style={[
            s.statusPill,
            {
              backgroundColor: isLive
                ? `rgba(255,90,95,0.12)`
                : `rgba(255,255,255,0.06)`,
            },
          ]}
        >
          {isLive && (
            <View style={[s.liveDotSmall, { backgroundColor: theme.colors.signalLive }]} />
          )}
          <Text
            style={[
              s.statusText,
              { color: isLive ? theme.colors.signalLive : theme.colors.ink500 },
            ]}
          >
            {statusLabel(match.matchStatus)}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ── Prediction row ────────────────────────────────────────────────────────────

function PredictionRow({
  entry,
  match,
  points,
}: {
  entry: PoolMatchPredictionEntry;
  match: Match;
  points: number | null;
}) {
  const theme = useTheme();
  const pred = entry.prediction;
  const hasPred = pred != null;
  const name = entry.user.fullName || 'Participante';
  const earned = points != null && points > 0;
  const isDoneOrLive =
    match.matchStatus === MatchStatus.COMPLETED ||
    match.matchStatus === MatchStatus.IN_PROGRESS;

  return (
    <View style={[s.predRow, { backgroundColor: theme.colors.ink850 }]}>
      {/* Avatar + name */}
      <AppAvatar imagePath={entry.user.profileImageUrl ?? undefined} name={name} size={40} />
      <View style={s.predInfo}>
        <Text style={[s.predName, { color: theme.colors.ink100 }]} numberOfLines={1}>
          {name}
        </Text>
        <Text style={[s.predRank, { color: theme.colors.ink500 }]}>
          {entry.rank != null ? `${entry.rank}º lugar` : 'Sem ranking'}
        </Text>
      </View>

      {/* Score + badge */}
      <View style={s.predRight}>
        <Text
          style={[
            s.predScore,
            { color: hasPred ? theme.colors.pitch : theme.colors.ink600 },
          ]}
        >
          {hasPred
            ? `${pred.predictedHomeScore}–${pred.predictedAwayScore}`
            : '—'}
        </Text>
        {isDoneOrLive ? (
          <View
            style={[
              s.pointsBadge,
              {
                backgroundColor: earned
                  ? `rgba(74,222,128,0.12)`
                  : theme.colors.ink800,
              },
            ]}
          >
            <Text
              style={[
                s.pointsText,
                { color: earned ? theme.colors.signalWin : theme.colors.ink500 },
              ]}
            >
              {points == null ? 'apurando' : `+${points} pts`}
            </Text>
          </View>
        ) : (
          <Text style={[s.predPending, { color: theme.colors.ink600 }]}>
            {hasPred ? 'aguardando' : 'sem palpite'}
          </Text>
        )}
      </View>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function PoolMatchPredictionsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id, matchId: matchIdParam } = useLocalSearchParams<{
    id: string;
    matchId: string;
  }>();

  const poolId = id ? Number(id) : undefined;
  const matchId = matchIdParam ? Number(matchIdParam) : undefined;

  const { data: match, isLoading: matchLoading, isError, refetch } = useMatch(matchId);
  const { pool } = usePool(poolId);
  const { members } = usePoolMembers(poolId);
  const {
    predictions,
    loading: predictionsLoading,
    isFetching: predictionsFetching,
    error: predictionsError,
    refresh,
  } = usePoolMatchPredictions(poolId, matchId);

  const membersById = React.useMemo(() => {
    const map = new Map<string, (typeof members)[number]>();
    for (const m of members) map.set(m.id, m);
    return map;
  }, [members]);

  const displayPredictions = React.useMemo(
    () =>
      predictions.map((entry) => {
        const member = membersById.get(entry.userId) ?? membersById.get(entry.user.id);
        if (!member) return entry;
        return {
          ...entry,
          user: {
            ...entry.user,
            fullName:
              entry.user.fullName !== 'Participante'
                ? entry.user.fullName
                : member.fullName ?? member.name ?? entry.user.fullName,
            profileImageUrl: entry.user.profileImageUrl ?? member.profileImageUrl,
          },
        };
      }),
    [membersById, predictions],
  );

  const isInitialLoading = (matchLoading && !match) || predictionsLoading;

  // ── Loading ──────────────────────────────────────────────────────────────────

  if (isInitialLoading) {
    return (
      <SafeAreaView
        style={[s.root, { backgroundColor: theme.colors.ink950 }]}
        edges={['top']}
      >
        <View style={s.centered}>
          <ActivityIndicator size="large" color={theme.colors.pitch} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !match) {
    return (
      <SafeAreaView
        style={[s.root, { backgroundColor: theme.colors.ink950 }]}
        edges={['top']}
      >
        <View style={s.centered}>
          <Text style={[s.emptyText, { color: theme.colors.ink500 }]}>
            Não foi possível carregar o jogo.
          </Text>
          <View style={{ height: 16 }} />
          <AppButton title="Tentar novamente" variant="ghost" onPress={() => refetch()} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView
      style={[s.root, { backgroundColor: theme.colors.ink950 }]}
      edges={['top']}
    >
      {/* Nav row */}
      <View style={s.navRow}>
        <Pressable
          onPress={() => router.back()}
          style={[s.circleBtn, { backgroundColor: theme.colors.ink800 }]}
        >
          <Ionicons name="chevron-back" size={20} color={theme.colors.ink300} />
        </Pressable>
        <Text style={[s.navTitle, { color: theme.colors.ink500 }]}>
          PALPITES DO GRUPO
        </Text>
        <View style={s.circleBtn} />
      </View>

      <FlatList<PoolMatchPredictionEntry>
        data={displayPredictions}
        keyExtractor={(item) => item.userId}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          s.listContent,
          displayPredictions.length === 0 && s.listContentEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={predictionsFetching}
            onRefresh={refresh}
            tintColor={theme.colors.pitch}
          />
        }
        ListHeaderComponent={
          <>
            <MatchHeader match={match} />

            {predictionsError != null && (
              <Text style={[s.errorText, { color: theme.colors.signalLose }]}>
                {predictionsError}
              </Text>
            )}

            <View style={s.sectionRow}>
              <Text style={[s.sectionLabel, { color: theme.colors.ink500 }]}>
                PARTICIPANTES
              </Text>
              {displayPredictions.length > 0 && (
                <>
                  <View style={[s.sectionLine, { backgroundColor: theme.colors.ink800 }]} />
                  <Text style={[s.sectionLabel, { color: theme.colors.ink600 }]}>
                    {displayPredictions.length}
                  </Text>
                </>
              )}
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={s.centered}>
            <Text style={[s.emptyText, { color: theme.colors.ink500 }]}>
              Nenhum participante encontrado.
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <PredictionRow
            entry={item}
            match={match}
            points={calculatePoints(item, match, pool?.scoringRules)}
          />
        )}
      />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },

  // Nav
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 11,
    letterSpacing: 0.8,
    includeFontPadding: false,
  },

  // Match panel
  matchPanel: {
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 7,
  },
  eyebrow: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 11,
    letterSpacing: 1,
    includeFontPadding: false,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  flag: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 14,
  },
  flagFallback: {},
  teamName: {
    flex: 1,
    fontFamily: TypographyFamilies.sansSemi,
    fontSize: 18,
    includeFontPadding: false,
  },
  teamScore: {
    fontFamily: TypographyFamilies.display,
    fontSize: 28,
    letterSpacing: -0.5,
    includeFontPadding: false,
    minWidth: 28,
    textAlign: 'right',
  },
  teamDivider: {
    height: 1,
    marginHorizontal: 58,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  stadiumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 5,
    marginRight: 8,
  },
  stadiumText: {
    fontFamily: TypographyFamilies.sans,
    fontSize: 12,
    includeFontPadding: false,
    flexShrink: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
  },
  liveDotSmall: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 10,
    letterSpacing: 0.5,
    includeFontPadding: false,
  },

  // List
  listContent: {
    paddingBottom: 40,
  },
  listContentEmpty: {
    flexGrow: 1,
  },

  // Section header
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionLabel: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 10,
    letterSpacing: 0.8,
    includeFontPadding: false,
  },
  sectionLine: { flex: 1, height: 1 },

  // Prediction row
  predRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 14,
  },
  predInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  predName: {
    fontFamily: TypographyFamilies.sansSemi,
    fontSize: 15,
    includeFontPadding: false,
  },
  predRank: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 10,
    letterSpacing: 0.3,
    includeFontPadding: false,
    marginTop: 2,
  },
  predRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  predScore: {
    fontFamily: TypographyFamilies.display,
    fontSize: 22,
    letterSpacing: -0.5,
    includeFontPadding: false,
  },
  pointsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  pointsText: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 10,
    includeFontPadding: false,
  },
  predPending: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 10,
    includeFontPadding: false,
  },

  // Error / empty
  errorText: {
    fontFamily: TypographyFamilies.sans,
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    includeFontPadding: false,
  },
  emptyText: {
    fontFamily: TypographyFamilies.sans,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    includeFontPadding: false,
  },
});
