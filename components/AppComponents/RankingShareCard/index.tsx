import { forwardRef } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import type { LeaderboardEntry } from '@/components/AppComponents/LeaderboardRow';
import AppAvatar from '@/components/AppComponents/AppAvatar';
import { TypographyFamilies } from '@/constants/tokens';

// ─── Constants ────────────────────────────────────────────────────────────────

const CARD_WIDTH = 390;
const MAX_ENTRIES = 10;

// Hardcoded dark-mode palette — share card always renders dark regardless of system theme
const C = {
  bg: '#0F1317',
  ink100: '#EAEEF2',
  ink500: '#5B6670',
  ink700: '#262E36',
  ink800: '#1C2228',
  orange: '#FF872C',
  orangeSoft: 'rgba(255,135,44,0.10)',
  pitch: '#C8FF3E',
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  poolName: string;
  entries: LeaderboardEntry[];
  date: string;
  completedMatches?: number;
  totalMatches?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

const RankingShareCard = forwardRef<View, Props>(({ poolName, entries, date, completedMatches, totalMatches }, ref) => {
  const top = entries.slice(0, MAX_ENTRIES);

  return (
    <View ref={ref} style={s.card} collapsable={false}>
      {/* Eyebrow */}
      <Text style={s.eyebrow}>MUNDIAL 2026 · BIG BOLÃO</Text>

      {/* Pool name */}
      <Text style={s.poolName} numberOfLines={2}>{poolName}</Text>

      {/* Separator */}
      <View style={s.divider} />

      {/* Ranking rows */}
      {top.map((entry, index) => {
        const rank = entry.rank ?? index + 1;
        const isFirst = rank === 1;
        return (
          <View key={entry.userId} style={[s.row, isFirst && s.rowFirst]}>
            <Text style={[s.rank, isFirst && s.rankFirst]}>{rank}</Text>
            <AppAvatar
              imagePath={entry.user.profileImageUrl ?? undefined}
              name={entry.user.name}
              size={28}
            />
            <Text style={[s.name, isFirst && s.nameFirst]} numberOfLines={1}>
              {entry.user.name}
            </Text>
            <View style={s.pointsWrap}>
              <Text style={[s.points, isFirst && s.pointsFirst]}>
                {entry.exactScoresCount}
              </Text>
              <Text style={[s.ptsLabel, isFirst && s.ptsLabelFirst]}>exatos</Text>
            </View>
            <View style={[s.pointsWrap, { marginLeft: 12 }]}>
              <Text style={[s.points, isFirst && s.pointsFirst]}>
                {entry.totalPoints}
              </Text>
              <Text style={[s.ptsLabel, isFirst && s.ptsLabelFirst]}>pts</Text>
            </View>
          </View>
        );
      })}

      {/* Separator */}
      <View style={[s.divider, { marginTop: 4 }]} />

      {/* Stats */}
      {totalMatches != null && totalMatches > 0 && (
        <Text style={s.stats}>
          {completedMatches} de {totalMatches} partidas disputadas
          {' · '}
          {((completedMatches! / totalMatches) * 100).toLocaleString('pt-BR', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })}%
        </Text>
      )}

      {/* Watermark */}
      <View style={s.watermarkRow}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={s.watermarkIcon}
          resizeMode="contain"
        />
        <Text style={s.watermarkName}>
          Big Bolão<Text style={{ color: C.pitch }}>.</Text>
        </Text>
        <Text style={s.watermarkDate}>{date}</Text>
      </View>
    </View>
  );
});

RankingShareCard.displayName = 'RankingShareCard';
export default RankingShareCard;

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: C.bg,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  eyebrow: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 10,
    letterSpacing: 1.2,
    color: C.ink500,
    marginBottom: 8,
    includeFontPadding: false,
  },
  poolName: {
    fontFamily: TypographyFamilies.display,
    fontSize: 30,
    letterSpacing: -0.8,
    lineHeight: 34,
    color: C.ink100,
    marginBottom: 20,
    includeFontPadding: false,
  },
  divider: {
    height: 1,
    backgroundColor: C.ink800,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 2,
  },
  rowFirst: {
    backgroundColor: C.orangeSoft,
  },
  rank: {
    width: 20,
    fontFamily: TypographyFamilies.mono,
    fontSize: 12,
    color: C.ink500,
    textAlign: 'right',
    includeFontPadding: false,
  },
  rankFirst: {
    color: C.orange,
  },
  name: {
    flex: 1,
    fontFamily: TypographyFamilies.sansMedium,
    fontSize: 14,
    color: C.ink100,
    includeFontPadding: false,
  },
  nameFirst: {
    fontFamily: TypographyFamilies.sansSemi,
    color: C.orange,
  },
  pointsWrap: {
    alignItems: 'flex-end',
  },
  points: {
    fontFamily: TypographyFamilies.display,
    fontSize: 22,
    letterSpacing: -0.44,
    color: C.ink100,
    includeFontPadding: false,
  },
  pointsFirst: {
    color: C.orange,
  },
  ptsLabel: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 9,
    letterSpacing: 0.5,
    color: C.ink500,
    includeFontPadding: false,
    marginTop: -3,
  },
  ptsLabelFirst: {
    color: C.orange,
  },
  stats: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 10,
    color: C.ink500,
    textAlign: 'right',
    marginTop: 10,
    includeFontPadding: false,
  },
  watermarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  watermarkIcon: {
    width: 18,
    height: 18,
    borderRadius: 4,
  },
  watermarkName: {
    fontFamily: TypographyFamilies.display,
    fontSize: 16,
    letterSpacing: -0.4,
    color: C.ink100,
    includeFontPadding: false,
    flex: 1,
  },
  watermarkDate: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 10,
    color: C.ink500,
    includeFontPadding: false,
  },
});
