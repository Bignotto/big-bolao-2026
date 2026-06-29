import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from 'styled-components/native';

import { usePoolUserPredictions } from '@/hooks/usePoolUserPredictions';
import type { UserPredictionBreakdown } from '@/domain/entities/UserPredictionBreakdown';
import { TypographyFamilies } from '@/constants/tokens';

const ORANGE = '#FF872C';

export default function UserBreakdownScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { id, userId, userName, totalPoints, exactScoresCount, exactScorePoints } =
    useLocalSearchParams<{
      id: string;
      userId: string;
      userName: string;
      totalPoints: string;
      exactScoresCount: string;
      exactScorePoints: string;
    }>();

  const poolId = Number(id);
  const { predictions, loading, error } = usePoolUserPredictions(poolId, userId);

  const total = predictions.length;
  const scoringCount = useMemo(
    () => predictions.filter((p) => p.pointsEarned > 0).length,
    [predictions]
  );

  const pointsEfficiencyPct = useMemo(() => {
    const maxPts = total * Number(exactScorePoints);
    if (maxPts <= 0) return null;
    return Math.round((Number(totalPoints) / maxPts) * 100);
  }, [total, totalPoints, exactScorePoints]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

  const renderItem = ({ item }: { item: UserPredictionBreakdown }) => {
    const rowBg = item.exactScore
      ? 'rgba(200,255,62,0.06)'
      : item.correctWinner
      ? 'rgba(255,135,44,0.06)'
      : 'transparent';
    const rowBorder = item.exactScore
      ? theme.colors.pitch
      : item.correctWinner
      ? ORANGE
      : 'transparent';

    return (
      <View
        style={[
          s.row,
          {
            backgroundColor: rowBg,
            borderLeftColor: rowBorder,
            borderBottomColor: theme.colors.ink800,
          },
        ]}
      >
        <View style={s.teamsCol}>
          <Text style={[s.teams, { color: theme.colors.ink100 }]} numberOfLines={1}>
            {item.match.homeTeam.name} × {item.match.awayTeam.name}
          </Text>
          <Text style={[s.date, { color: theme.colors.ink500 }]}>
            {formatDate(item.match.matchDate)}
          </Text>
        </View>
        <View style={s.scoresCol}>
          <Text style={[s.scoreLabel, { color: theme.colors.ink500 }]}>Palpite</Text>
          <Text style={[s.score, { color: item.exactScore ? theme.colors.pitch : theme.colors.ink100 }]}>
            {item.predictedHomeScore}–{item.predictedAwayScore}
          </Text>
        </View>
        <View style={s.scoresCol}>
          <Text style={[s.scoreLabel, { color: theme.colors.ink500 }]}>Real</Text>
          <Text style={[s.score, { color: theme.colors.ink100 }]}>
            {item.match.homeScore}–{item.match.awayScore}
          </Text>
        </View>
        <View
          style={[
            s.pointsChip,
            {
              backgroundColor: item.exactScore
                ? 'rgba(200,255,62,0.15)'
                : item.pointsEarned > 0
                ? 'rgba(255,135,44,0.14)'
                : theme.colors.ink800,
            },
          ]}
        >
          <Text
            style={[
              s.pointsValue,
              {
                color: item.exactScore
                  ? theme.colors.pitch
                  : item.pointsEarned > 0
                  ? ORANGE
                  : theme.colors.ink400,
              },
            ]}
          >
            {item.pointsEarned}
          </Text>
          <Text
            style={[
              s.pointsUnit,
              {
                color: item.exactScore
                  ? theme.colors.pitch
                  : item.pointsEarned > 0
                  ? ORANGE
                  : theme.colors.ink500,
              },
            ]}
          >
            pts
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[s.safe, { backgroundColor: theme.colors.background }]}
      edges={['top', 'bottom']}
    >
      {/* Header */}
      <View style={[s.header, { borderBottomColor: theme.colors.ink800 }]}>
        <Pressable onPress={() => router.back()} style={s.closeBtn} hitSlop={12}>
          <Ionicons name="close" size={24} color={theme.colors.ink100} />
        </Pressable>
        <View style={s.headerCenter}>
          <Text style={[s.headerName, { color: theme.colors.ink100 }]} numberOfLines={1}>
            {userName}
          </Text>
        </View>
        <View style={s.closeBtn} />
      </View>

      {/* Summary grid (2×2) */}
      <View style={[s.summaryGrid, { borderBottomColor: theme.colors.ink800 }]}>
        {/* Row 1 */}
        <View style={s.summaryRow}>
          {/* Total points */}
          <View style={[s.summaryCell, { borderRightColor: theme.colors.ink800, borderBottomColor: theme.colors.ink800 }]}>
            <Text style={[s.summaryValue, { color: ORANGE, fontFamily: TypographyFamilies.display }]}>
              {totalPoints}
            </Text>
            <Text style={[s.summaryLabel, { color: theme.colors.ink500 }]}>pontos</Text>
          </View>
          {/* Aproveitamento: matches with any points / total */}
          <View style={[s.summaryCell, { borderBottomColor: theme.colors.ink800 }]}>
            <View style={s.ratioRow}>
              <Text style={[s.ratioNum, { color: theme.colors.ink100, fontFamily: TypographyFamilies.display }]}>
                {total > 0 ? scoringCount : '–'}
              </Text>
              {total > 0 && (
                <Text style={[s.ratioDen, { color: theme.colors.ink500, fontFamily: TypographyFamilies.mono }]}>
                  /{total}
                </Text>
              )}
            </View>
            <Text style={[s.summaryLabel, { color: theme.colors.ink500 }]}>aproveitamento</Text>
          </View>
        </View>

        {/* Row 2 */}
        <View style={s.summaryRow}>
          {/* Points efficiency % */}
          <View style={[s.summaryCell, { borderRightColor: theme.colors.ink800 }]}>
            <View style={s.ratioRow}>
              <Text style={[s.ratioNum, { color: ORANGE, fontFamily: TypographyFamilies.display }]}>
                {pointsEfficiencyPct != null ? pointsEfficiencyPct : '–'}
              </Text>
              {pointsEfficiencyPct != null && (
                <Text style={[s.ratioDen, { color: theme.colors.ink500, fontFamily: TypographyFamilies.mono }]}>
                  %
                </Text>
              )}
            </View>
            <Text style={[s.summaryLabel, { color: theme.colors.ink500 }]}>eficiência</Text>
          </View>
          {/* Exact match ratio */}
          <View style={s.summaryCell}>
            <View style={s.ratioRow}>
              <Text style={[s.ratioNum, { color: theme.colors.pitch, fontFamily: TypographyFamilies.display }]}>
                {total > 0 ? Number(exactScoresCount) : '–'}
              </Text>
              {total > 0 && (
                <Text style={[s.ratioDen, { color: theme.colors.ink500, fontFamily: TypographyFamilies.mono }]}>
                  /{total}
                </Text>
              )}
            </View>
            <Text style={[s.summaryLabel, { color: theme.colors.ink500 }]}>exatos</Text>
          </View>
        </View>
      </View>

      {/* Prediction list */}
      {loading ? (
        <ActivityIndicator style={s.loader} color={theme.colors.ink400} />
      ) : error ? (
        <View style={s.centered}>
          <Text style={[s.emptyTxt, { color: theme.colors.ink500 }]}>
            Erro ao carregar palpites
          </Text>
        </View>
      ) : (
        <FlatList<UserPredictionBreakdown>
          data={predictions}
          keyExtractor={(item) => String(item.predictionId)}
          renderItem={renderItem}
          contentContainerStyle={{ flexGrow: 1 }}
          ListEmptyComponent={
            <View style={s.centered}>
              <Text style={[s.emptyTxt, { color: theme.colors.ink500 }]}>
                Nenhuma partida concluída ainda
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  closeBtn: { width: 40, alignItems: 'center' },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerName: {
    fontFamily: TypographyFamilies.sansSemi,
    fontSize: 15,
    includeFontPadding: false,
  },
  summaryGrid: { borderBottomWidth: 1 },
  summaryRow: { flexDirection: 'row' },
  summaryCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 4,
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  summaryValue: { fontSize: 28, includeFontPadding: false },
  summaryLabel: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 10,
    includeFontPadding: false,
  },
  ratioRow: { flexDirection: 'row', alignItems: 'baseline', gap: 1 },
  ratioNum: { fontSize: 24, includeFontPadding: false },
  ratioDen: { fontSize: 14, includeFontPadding: false },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    borderLeftWidth: 3,
    borderBottomWidth: 1,
  },
  teamsCol: { flex: 1, minWidth: 0 },
  teams: {
    fontFamily: TypographyFamilies.sansMedium,
    fontSize: 13,
    includeFontPadding: false,
  },
  date: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 11,
    marginTop: 2,
    includeFontPadding: false,
  },
  scoresCol: { alignItems: 'center', width: 44 },
  scoreLabel: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 9,
    includeFontPadding: false,
  },
  score: {
    fontFamily: TypographyFamilies.display,
    fontSize: 15,
    includeFontPadding: false,
  },
  pointsChip: {
    width: 44,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  pointsValue: {
    fontFamily: TypographyFamilies.display,
    fontSize: 16,
    includeFontPadding: false,
  },
  pointsUnit: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 9,
    includeFontPadding: false,
  },
  loader: { marginTop: 48 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTxt: {
    fontFamily: TypographyFamilies.sansMedium,
    fontSize: 14,
    includeFontPadding: false,
  },
});
