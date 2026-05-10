import { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
}

// ─── Component ────────────────────────────────────────────────────────────────

const RankingShareCard = forwardRef<View, Props>(({ poolName, entries, date }, ref) => {
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
            <Text style={[s.points, isFirst && s.pointsFirst]}>
              {entry.totalPoints}
            </Text>
          </View>
        );
      })}

      {/* Separator */}
      <View style={[s.divider, { marginTop: 4 }]} />

      {/* Watermark */}
      <Text style={s.watermark}>bigbolao · {date}</Text>
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
  watermark: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 10,
    color: C.ink700,
    textAlign: 'right',
    marginTop: 12,
    includeFontPadding: false,
  },
});
