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

import { useMatchPoolPredictions, type PoolPredictionItem } from '@/hooks/useMatchPoolPredictions';
import { isMatchLocked } from '@/domain/entities/Match';

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg: '#0A0D10',
  ink900: '#111518',
  ink850: '#161B20',
  ink800: '#1C2229',
  ink500: '#4A5568',
  ink300: '#8896A8',
  pitch: '#C8FF3E',
  white: '#F0F4F8',
  orange: '#FF872C',
};

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
  const time = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
  const stagePart = m.group ? `GRUPO ${m.group}` : m.stage.replace(/_/g, ' ');
  if (m.matchStatus === 'LIVE') return `${stagePart}  ·  AO VIVO`;
  if (m.matchStatus === 'COMPLETED') return `${stagePart}  ·  ${day} ${date}`;
  return `${stagePart}  ·  ${day} ${date}  ·  ${time}`;
}

// ── SkeletonCard ──────────────────────────────────────────────────────────────
function SkeletonCard() {
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
    <Animated.View style={[styles.poolCard, { opacity }]}>
      <View style={styles.poolCardHeader}>
        <View style={[styles.skeletonLine, { width: '55%', height: 14 }]} />
        <View style={[styles.skeletonLine, { width: 40, height: 12 }]} />
      </View>
      <View style={[styles.skeletonLine, { width: '35%', height: 32, marginTop: 10 }]} />
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
      style={({ pressed }) => [styles.poolCard, pressed && { opacity: 0.8 }]}
    >
      {/* Header */}
      <View style={styles.poolCardHeader}>
        <Text style={styles.poolCardName}>{item.poolName}</Text>
        {rankLabel ? <Text style={styles.poolCardRank}>{rankLabel}</Text> : null}
      </View>

      {hasPred ? (
        // State A / C — has prediction
        <View style={styles.predTile}>
          <View style={{ flex: 1 }}>
            <Text style={styles.predLabel}>Seu palpite</Text>
            <Text style={styles.predScore}>
              {item.prediction!.predictedHomeScore}–{item.prediction!.predictedAwayScore}
            </Text>
            {!matchLocked && <Text style={styles.predHint}>Toque para editar</Text>}
            {matchCompleted && item.prediction!.pointsEarned != null && (
              <Text style={styles.predPoints}>+{item.prediction!.pointsEarned} pts</Text>
            )}
          </View>
          {!matchLocked && (
            <Ionicons name="pencil-outline" size={18} color={C.pitch} />
          )}
          {matchLocked && (
            <Ionicons name="lock-closed-outline" size={16} color={C.ink500} />
          )}
        </View>
      ) : matchLocked ? (
        // State D — no prediction, locked
        <View style={styles.noPredLocked}>
          <Ionicons name="lock-closed-outline" size={14} color={C.ink500} />
          <Text style={styles.noPredLockedText}>Palpite não enviado</Text>
        </View>
      ) : (
        // State B — no prediction, scheduleable
        <View style={styles.makePredCta}>
          <Ionicons name="alert-circle-outline" size={16} color={C.orange} />
          <Text style={styles.makePredText}>Fazer palpite</Text>
        </View>
      )}
    </Pressable>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function MatchHubScreen() {
  const router = useRouter();
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
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Nav row */}
      <View style={styles.navRow}>
        <Pressable onPress={() => router.back()} style={styles.circleBtn}>
          <Ionicons name="chevron-back" size={20} color={C.white} />
        </Pressable>
        <Pressable onPress={handleShare} style={styles.circleBtn}>
          <Ionicons name="share-outline" size={20} color={C.white} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Eyebrow */}
        {match && (
          <View style={styles.eyebrowRow}>
            {isLive && <View style={styles.liveDot} />}
            <Text style={[styles.eyebrow, isLive && { color: C.pitch }]}>
              {formatEyebrow(match)}
            </Text>
          </View>
        )}

        {/* Match panel */}
        <View style={styles.matchPanel}>
          <View style={styles.teamRow}>
            {match?.homeTeam.flagUrl ? (
              <Image source={{ uri: match.homeTeam.flagUrl }} style={styles.flag} />
            ) : (
              <View style={[styles.flag, styles.flagFallback]} />
            )}
            <Text style={styles.teamName}>{match?.homeTeam.name ?? '—'}</Text>
            {(completed || isLive) && match && (
              <Text style={styles.teamScore}>{match.homeTeamScore ?? '–'}</Text>
            )}
          </View>

          <View style={styles.vsDividerRow}>
            <View style={styles.vsDividerLine} />
            {!completed && !isLive && <Text style={styles.vsText}>VS</Text>}
            <View style={styles.vsDividerLine} />
          </View>

          <View style={styles.teamRow}>
            {match?.awayTeam.flagUrl ? (
              <Image source={{ uri: match.awayTeam.flagUrl }} style={styles.flag} />
            ) : (
              <View style={[styles.flag, styles.flagFallback]} />
            )}
            <Text style={styles.teamName}>{match?.awayTeam.name ?? '—'}</Text>
            {(completed || isLive) && match && (
              <Text style={styles.teamScore}>{match.awayTeamScore ?? '–'}</Text>
            )}
          </View>

          {match?.stadium && (
            <View style={styles.stadiumRow}>
              <Ionicons name="location-outline" size={12} color={C.ink300} />
              <Text style={styles.stadiumText}>{match.stadium}</Text>
            </View>
          )}
        </View>

        {/* Pool predictions section */}
        <Text style={styles.sectionEyebrow}>
          SEUS PALPITES
          {!isLoading && poolPredictions.length > 0
            ? `  ·  ${poolPredictions.length} ${poolPredictions.length === 1 ? 'BOLÃO' : 'BOLÕES'}`
            : ''}
        </Text>

        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : poolPredictions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
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
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
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
    backgroundColor: C.ink800,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  // ── Eyebrow ────────────────────────────────────────────────────────────────
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
    backgroundColor: C.pitch,
    marginRight: 7,
  },
  eyebrow: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1,
    color: C.ink300,
  },
  // ── Match panel ────────────────────────────────────────────────────────────
  matchPanel: {
    backgroundColor: C.ink900,
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  flag: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 14,
  },
  flagFallback: {
    backgroundColor: C.ink800,
  },
  teamName: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: C.white,
    letterSpacing: 0.1,
  },
  teamScore: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: C.white,
    minWidth: 28,
    textAlign: 'right',
  },
  vsDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 58,
    marginVertical: 4,
  },
  vsDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.ink800,
  },
  vsText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: C.ink500,
    letterSpacing: 2,
    marginHorizontal: 10,
  },
  stadiumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: C.ink800,
  },
  stadiumText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: C.ink300,
    marginLeft: 5,
  },
  // ── Section eyebrow ────────────────────────────────────────────────────────
  sectionEyebrow: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1,
    color: C.ink300,
    marginBottom: 14,
  },
  // ── Pool card ──────────────────────────────────────────────────────────────
  poolCard: {
    backgroundColor: C.ink850,
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
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: C.white,
    flex: 1,
    marginRight: 8,
  },
  poolCardRank: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: C.ink300,
  },
  // State A/C — has prediction
  predTile: {
    backgroundColor: C.ink800,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  predLabel: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: C.ink300,
    marginBottom: 2,
  },
  predScore: {
    fontSize: 30,
    fontFamily: 'Inter_700Bold',
    color: C.pitch,
    letterSpacing: 1,
  },
  predHint: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: C.ink300,
    marginTop: 2,
  },
  predPoints: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: C.pitch,
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
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: C.ink500,
  },
  // State B — scheduleable, no prediction
  makePredCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: C.orange,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  makePredText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: C.orange,
  },
  // ── Skeleton ───────────────────────────────────────────────────────────────
  skeletonLine: {
    backgroundColor: C.ink800,
    borderRadius: 6,
  },
  // ── Empty ──────────────────────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: C.ink300,
    textAlign: 'center',
    lineHeight: 22,
  },
});
