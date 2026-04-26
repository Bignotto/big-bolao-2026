import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Image,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'styled-components/native';

import { useMatchPoolPredictions, type PoolPredictionItem } from '@/hooks/useMatchPoolPredictions';
import { isMatchLocked } from '@/domain/entities/Match';
import { TypographyFamilies } from '@/constants/tokens';

// ── Helpers ───────────────────────────────────────────────────────────────────
const DAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const MONTHS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

type MatchLike = {
  matchDatetime: string;
  stage: string;
  group: string | null;
  matchStatus: string;
  stadium: string | null;
};

function formatEyebrow(m: MatchLike): string {
  const dt = new Date(m.matchDatetime);
  const day = DAYS[dt.getDay()];
  const date = `${String(dt.getDate()).padStart(2, '0')} ${MONTHS[dt.getMonth()]}`;
  const stagePart = m.group ? `GRUPO ${m.group}` : m.stage.replace(/_/g, ' ');
  if (m.matchStatus === 'LIVE') return `${stagePart}  ·  AO VIVO`;
  if (m.matchStatus === 'COMPLETED') return `${stagePart}  ·  ${day} ${date}`;
  return `${stagePart}  ·  ${day} ${date}`;
}

// ── SkeletonCard ──────────────────────────────────────────────────────────────
function SkeletonCard() {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.65, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[s.poolCard, { backgroundColor: theme.colors.ink850, opacity }]}
    >
      <View style={s.poolCardHeader}>
        <View style={[s.skeletonLine, { width: '55%', height: 14, backgroundColor: theme.colors.ink800 }]} />
        <View style={[s.skeletonLine, { width: 40, height: 12, backgroundColor: theme.colors.ink800 }]} />
      </View>
      <View style={[s.skeletonLine, { width: '35%', height: 32, marginTop: 10, backgroundColor: theme.colors.ink800 }]} />
    </Animated.View>
  );
}

// ── PoolCard ──────────────────────────────────────────────────────────────────
type PoolCardProps = {
  item: PoolPredictionItem;
  matchLocked: boolean;
  matchCompleted: boolean;
  onPress: (item: PoolPredictionItem) => void;
};

function PoolCard({ item, matchLocked, matchCompleted, onPress }: PoolCardProps) {
  const theme = useTheme();
  const hasPred = item.prediction !== null;

  const rankLabel =
    item.userRank != null
      ? `#${item.userRank}${item.participantsCount != null ? `/${item.participantsCount}` : ''}`
      : item.participantsCount != null
      ? `${item.participantsCount} part.`
      : '';

  return (
    <Pressable
      onPress={() => onPress(item)}
      style={({ pressed }) => [
        s.poolCard,
        { backgroundColor: theme.colors.ink850 },
        pressed && { opacity: 0.8 },
      ]}
    >
      {/* Header */}
      <View style={s.poolCardHeader}>
        <Text style={[s.poolCardName, { color: theme.colors.ink100 }]}>{item.poolName}</Text>
        {rankLabel ? (
          <Text style={[s.poolCardRank, { color: theme.colors.ink400 }]}>{rankLabel}</Text>
        ) : null}
      </View>

      {hasPred ? (
        // State A / C — has prediction
        <View style={[s.predTile, { backgroundColor: theme.colors.ink800 }]}>
          <View style={{ flex: 1 }}>
            <Text style={[s.predLabel, { color: theme.colors.ink500 }]}>Seu palpite</Text>
            <Text style={[s.predScore, { color: theme.colors.pitch }]}>
              {item.prediction!.predictedHomeScore}–{item.prediction!.predictedAwayScore}
            </Text>
            {matchCompleted && item.prediction!.pointsEarned != null && (
              <Text style={[s.predPoints, { color: theme.colors.pitch }]}>
                +{item.prediction!.pointsEarned} pts
              </Text>
            )}
          </View>
          <Ionicons
            name="lock-closed-outline"
            size={16}
            color={matchLocked ? theme.colors.ink600 : theme.colors.pitch}
          />
        </View>
      ) : matchLocked ? (
        // State D — no prediction, locked
        <View style={s.noPredLocked}>
          <Ionicons name="lock-closed-outline" size={14} color={theme.colors.ink600} />
          <Text style={[s.noPredLockedText, { color: theme.colors.ink500 }]}>
            Palpite não enviado
          </Text>
        </View>
      ) : (
        // State B — no prediction, scheduleable
        <View style={[s.makePredCta, { borderColor: theme.colors.pitch }]}>
          <Ionicons name="add-circle-outline" size={16} color={theme.colors.pitch} />
          <Text style={[s.makePredText, { color: theme.colors.pitch }]}>Fazer palpite</Text>
        </View>
      )}
    </Pressable>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function MatchHubScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const matchId = Number(id);

  const { match, poolPredictions, isLoading } = useMatchPoolPredictions(matchId);

  const locked = match ? isMatchLocked(match) : false;
  const completed = match?.matchStatus === 'COMPLETED';
  const isLive = match?.matchStatus === 'LIVE';

  function handleShare() {
    if (!match) return;
    Share.share({ message: `${match.homeTeam.name} vs ${match.awayTeam.name}` });
  }

  function handlePoolPress(item: PoolPredictionItem) {
    if (!locked) {
      router.push(`/pool/${item.poolId}/predict?matchId=${matchId}`);
    } else {
      router.push(`/pool/${item.poolId}`);
    }
  }

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
        <Pressable
          onPress={handleShare}
          style={[s.circleBtn, { backgroundColor: theme.colors.ink800 }]}
        >
          <Ionicons name="share-outline" size={20} color={theme.colors.ink300} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* Eyebrow */}
        {match && (
          <View style={s.eyebrowRow}>
            {isLive && (
              <View style={[s.liveDot, { backgroundColor: theme.colors.signalLive }]} />
            )}
            <Text
              style={[
                s.eyebrow,
                { color: isLive ? theme.colors.pitch : theme.colors.ink500 },
              ]}
            >
              {formatEyebrow(match)}
            </Text>
          </View>
        )}

        {/* Match panel */}
        <View style={[s.matchPanel, { backgroundColor: theme.colors.ink900 }]}>
          {/* Home team */}
          <View style={s.teamRow}>
            {match?.homeTeam.flagUrl ? (
              <Image source={{ uri: match.homeTeam.flagUrl }} style={s.flag} />
            ) : (
              <View style={[s.flag, s.flagFallback, { backgroundColor: theme.colors.ink800 }]} />
            )}
            <Text style={[s.teamName, { color: theme.colors.ink100 }]} numberOfLines={1}>
              {match?.homeTeam.name ?? '—'}
            </Text>
            {(completed || isLive) && match && (
              <Text style={[s.teamScore, { color: theme.colors.ink100 }]}>
                {match.homeTeamScore ?? '–'}
              </Text>
            )}
          </View>

          {/* Divider */}
          <View style={[s.divider, { backgroundColor: theme.colors.ink800 }]} />

          {/* Away team */}
          <View style={s.teamRow}>
            {match?.awayTeam.flagUrl ? (
              <Image source={{ uri: match.awayTeam.flagUrl }} style={s.flag} />
            ) : (
              <View style={[s.flag, s.flagFallback, { backgroundColor: theme.colors.ink800 }]} />
            )}
            <Text style={[s.teamName, { color: theme.colors.ink100 }]} numberOfLines={1}>
              {match?.awayTeam.name ?? '—'}
            </Text>
            {(completed || isLive) && match && (
              <Text style={[s.teamScore, { color: theme.colors.ink100 }]}>
                {match.awayTeamScore ?? '–'}
              </Text>
            )}
          </View>

          {/* Venue */}
          {match?.stadium && (
            <View style={[s.stadiumRow, { borderTopColor: theme.colors.ink800 }]}>
              <Ionicons name="location-outline" size={12} color={theme.colors.ink500} />
              <Text style={[s.stadiumText, { color: theme.colors.ink500 }]}>
                {match.stadium}
              </Text>
            </View>
          )}
        </View>

        {/* Section label */}
        <Text style={[s.sectionEyebrow, { color: theme.colors.ink500 }]}>
          SEUS PALPITES
          {!isLoading && poolPredictions.length > 0
            ? `  ·  ${poolPredictions.length} ${poolPredictions.length === 1 ? 'BOLÃO' : 'BOLÕES'}`
            : ''}
        </Text>

        {/* Pool cards */}
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : poolPredictions.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={[s.emptyText, { color: theme.colors.ink500 }]}>
              Você não está em nenhum bolão{'\n'}que inclua este jogo.
            </Text>
          </View>
        ) : (
          poolPredictions.map((item) => (
            <PoolCard
              key={item.poolId}
              item={item}
              matchLocked={locked}
              matchCompleted={completed}
              onPress={handlePoolPress}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 },

  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },

  // Eyebrow
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 7,
  },
  eyebrow: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 11,
    letterSpacing: 1,
    includeFontPadding: false,
  },

  // Match panel
  matchPanel: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
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
    includeFontPadding: false,
    letterSpacing: -0.5,
    minWidth: 28,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    marginHorizontal: 58,
  },
  stadiumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    gap: 5,
  },
  stadiumText: {
    fontFamily: TypographyFamilies.sans,
    fontSize: 12,
    includeFontPadding: false,
  },

  // Section label
  sectionEyebrow: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 11,
    letterSpacing: 1,
    includeFontPadding: false,
    marginBottom: 14,
  },

  // Pool card
  poolCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  poolCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  poolCardName: {
    fontFamily: TypographyFamilies.sansSemi,
    fontSize: 16,
    includeFontPadding: false,
    flex: 1,
    marginRight: 8,
  },
  poolCardRank: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 11,
    includeFontPadding: false,
  },

  // State A/C — has prediction
  predTile: {
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  predLabel: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 10,
    includeFontPadding: false,
    marginBottom: 2,
  },
  predScore: {
    fontFamily: TypographyFamilies.display,
    fontSize: 36,
    includeFontPadding: false,
    letterSpacing: -1,
  },
  predPoints: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 11,
    includeFontPadding: false,
    marginTop: 4,
  },

  // State D — locked, no prediction
  noPredLocked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  noPredLockedText: {
    fontFamily: TypographyFamilies.sans,
    fontSize: 13,
    includeFontPadding: false,
  },

  // State B — scheduleable, no prediction
  makePredCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  makePredText: {
    fontFamily: TypographyFamilies.sansSemi,
    fontSize: 15,
    includeFontPadding: false,
  },

  // Skeleton
  skeletonLine: { borderRadius: 6 },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: {
    fontFamily: TypographyFamilies.sans,
    fontSize: 14,
    includeFontPadding: false,
    textAlign: 'center',
    lineHeight: 22,
  },
});
