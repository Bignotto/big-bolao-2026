import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from 'styled-components/native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useSession } from '@/context/SessionContext';
import { usePools, type Pool } from '@/hooks/usePools';
import { useLiveMatches, type LiveMatchEntry } from '@/hooks/useLiveMatches';
import LiveMatchCard from '@/components/LiveMatchCard';
import { TypographyFamilies } from '@/constants/tokens';
import {
  TOURNAMENT_START_DATE,
  TOURNAMENT_OPENING_MATCHUP,
  TOURNAMENT_OPENING_DATE_LABEL,
} from '@/constants/tournament';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_PALETTE = ['#D8A040', '#4D7D5B', '#B5643A', '#5D4DA0', '#2E7C8C', '#B8414A'];

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = Math.imul(31, h) + id.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h) % AVATAR_PALETTE.length;
}

function daysUntil(date: Date): number {
  const diff = date.getTime() - Date.now();
  return Math.max(0, Math.floor(diff / 86_400_000));
}

// ─── Header avatar ────────────────────────────────────────────────────────────

function HeaderAvatar({
  userId,
  imageUrl,
  initial,
}: {
  userId: string;
  imageUrl: string | null;
  initial: string;
}) {
  const [failed, setFailed] = useState(false);
  const color = AVATAR_PALETTE[hashId(userId)];

  if (imageUrl && !failed) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={s.avatarImg}
        resizeMode="cover"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <View style={s.avatarClip}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: color }]} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.2)' }]} />
      <Text style={s.avatarInitial}>{initial}</Text>
    </View>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.65, duration: 900, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        s.card,
        { backgroundColor: theme.colors.ink850, borderColor: theme.colors.ink800, opacity },
      ]}
    >
      <View style={[s.skelLine, { width: '42%', height: 10, backgroundColor: theme.colors.ink700 }]} />
      <View style={[s.skelLine, { width: '72%', height: 20, marginTop: 10, backgroundColor: theme.colors.ink700 }]} />
      <View style={[s.skelLine, { width: '52%', height: 12, marginTop: 6, backgroundColor: theme.colors.ink700 }]} />
    </Animated.View>
  );
}

// ─── Countdown card ───────────────────────────────────────────────────────────

function CountdownCard({ onPress }: { onPress: () => void }) {
  const theme = useTheme();
  const days = daysUntil(TOURNAMENT_START_DATE);
  if (days <= 0) return null;

  return (
    <Pressable
      onPress={onPress}
      style={[s.countdownCard, { borderColor: 'rgba(200,255,62,0.2)' }]}
    >
      <Text style={[s.countdownDays, { color: theme.colors.pitch }]}>{days}</Text>
      <View style={s.countdownMid}>
        <Text style={[s.countdownLabel, { color: theme.colors.ink100 }]}>
          dias para a abertura
        </Text>
        <Text style={[s.countdownSub, { color: theme.colors.ink400 }]}>
          {TOURNAMENT_OPENING_DATE_LABEL} · {TOURNAMENT_OPENING_MATCHUP}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.ink400} />
    </Pressable>
  );
}

// ─── Pool card ────────────────────────────────────────────────────────────────

function PoolCard({ pool, onPress }: { pool: Pool; onPress: () => void }) {
  const theme = useTheme();

  const isAdmin = pool.isAdmin ?? pool.isCreator;
  const isFirst = pool.userRank === 1;
  const hasStats = pool.userRank != null;
  const showDeadline = pool.pendingDeadlineSoon && (pool.pendingDeadlineCount ?? 0) > 0;
  const showDelta = !showDeadline && pool.rankDelta != null && pool.rankDelta !== 0;
  const visibility = pool.isPrivate ? 'Privado' : 'Público';

  return (
    <Pressable
      onPress={onPress}
      style={[s.card, { backgroundColor: theme.colors.ink850, borderColor: theme.colors.ink800 }]}
    >
      {/* Leader accent strip */}
      {isFirst && <View style={s.accentStrip} />}

      {/* Eyebrow */}
      <View style={s.eyebrowRow}>
        {isAdmin ? (
          <>
            <View style={s.adminBadge}>
              <Text style={[s.adminBadgeTxt, { color: theme.colors.pitch }]}>ADMIN</Text>
            </View>
            <Text style={[s.eyebrowTxt, { color: theme.colors.ink500 }]}>
              {' · '}{pool.participantsCount} participante{pool.participantsCount !== 1 ? 's' : ''}
            </Text>
          </>
        ) : (
          <>
            {pool.isPrivate && (
              <Ionicons name="lock-closed" size={10} color={theme.colors.ink500} style={{ marginRight: 3 }} />
            )}
            <Text style={[s.eyebrowTxt, { color: theme.colors.ink500 }]}>
              {visibility} · {pool.participantsCount} participante{pool.participantsCount !== 1 ? 's' : ''}
            </Text>
          </>
        )}
      </View>

      {/* Name */}
      <Text style={[s.poolName, { color: theme.colors.ink100 }]} numberOfLines={1}>
        {pool.name}
      </Text>

      {/* Description */}
      {!!pool.description && (
        <Text style={[s.poolDesc, { color: theme.colors.ink400 }]} numberOfLines={1}>
          {pool.description}
        </Text>
      )}

      {/* Stats */}
      {hasStats && (
        <>
          <View style={[s.divider, { backgroundColor: theme.colors.ink800 }]} />
          <View style={s.statsRow}>
            {/* Rank */}
            <View style={s.statBlock}>
              <Text style={[s.statLabel, { color: theme.colors.ink500 }]}>RANK</Text>
              <View style={s.rankInline}>
                <Text style={[s.rankNum, { color: isFirst ? theme.colors.pitch : theme.colors.ink100 }]}>
                  #{pool.userRank}
                </Text>
                <Text style={[s.rankTotal, { color: theme.colors.ink500 }]}>
                  /{pool.participantsCount}
                </Text>
              </View>
            </View>

            <View style={{ flex: 1 }} />

            {/* Urgency chip */}
            {showDeadline && (
              <View
                style={[
                  s.urgencyChip,
                  { backgroundColor: 'rgba(255,176,32,0.1)', borderColor: 'rgba(255,176,32,0.3)' },
                ]}
              >
                <View style={[s.urgencyDot, { backgroundColor: theme.colors.signalAmber }]} />
                <Text style={[s.urgencyTxt, { color: theme.colors.signalAmber }]}>
                  <Text style={s.urgencyCount}>{pool.pendingDeadlineCount}</Text>
                  {' '}palpites vencem hoje
                </Text>
              </View>
            )}

            {/* Points + rank delta */}
            {showDelta && (
              <View style={s.deltaRow}>
                {pool.userPoints != null && (
                  <Text style={[s.deltaTxt, { color: theme.colors.ink400 }]}>
                    {pool.userPoints} pts
                  </Text>
                )}
                <Text
                  style={[
                    s.deltaTxt,
                    {
                      color: pool.rankDelta! > 0 ? theme.colors.signalWin : theme.colors.signalLose,
                      marginLeft: 6,
                    },
                  ]}
                >
                  {pool.rankDelta! > 0 ? '↑' : '↓'}{Math.abs(pool.rankDelta!)}
                </Text>
              </View>
            )}
          </View>
        </>
      )}
    </Pressable>
  );
}

// ─── Join button ──────────────────────────────────────────────────────────────

function JoinButton({ onPress }: { onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[s.joinBtn, { borderColor: theme.colors.ink700 }]}
    >
      <Ionicons name="add" size={16} color={theme.colors.ink400} />
      <Text style={[s.joinTxt, { color: theme.colors.ink400 }]}>
        Criar ou entrar em um grupo
      </Text>
    </Pressable>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { apiUser } = useSession();
  const { pools, loading, refresh } = usePools();
  const { liveMatchesWithMyPredictions } = useLiveMatches();

  function handleLiveCardPress(entry: LiveMatchEntry) {
    router.push(`/match/${entry.match.id}`);
  }

  const firstName = (apiUser?.fullName ?? '').split(' ')[0] || 'Você';
  const initial = firstName.charAt(0).toUpperCase();
  const totalPending = pools.reduce((n, p) => n + (p.pendingPredictionsCount ?? 0), 0);

  function handleJoin() {
    router.push('/(tabs)/find-pool');
  }

  const listHeader = (
    <>
      {/* Greeting + title */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={[s.greeting, { color: theme.colors.ink500 }]}>
            OLÁ, {firstName.toUpperCase()}
          </Text>
          <Text style={[s.heroTitle, { color: theme.colors.ink100 }]}>
            Seus bolões<Text style={{ color: theme.colors.pitch }}>.</Text>
          </Text>
          <Text style={[s.subtitle, { color: theme.colors.ink400 }]}>
            {pools.length} grupo{pools.length !== 1 ? 's' : ''}
            {totalPending > 0
              ? ` · ${totalPending} palpite${totalPending !== 1 ? 's' : ''} pendente${totalPending !== 1 ? 's' : ''}`
              : ''}
          </Text>
        </View>
        <HeaderAvatar
          userId={apiUser?.id ?? 'anon'}
          imageUrl={apiUser?.profileImageUrl ?? null}
          initial={initial}
        />
      </View>

      {/* Live match cards — shown above countdown when a predicted match is active */}
      {liveMatchesWithMyPredictions.length > 0 && (
        <View style={{ gap: 10, marginBottom: 12 }}>
          {liveMatchesWithMyPredictions.map((entry) => (
            <LiveMatchCard
              key={entry.match.matchId}
              entry={entry}
              onPress={handleLiveCardPress}
            />
          ))}
        </View>
      )}

      {/* Countdown */}
      <CountdownCard onPress={() => router.push('/(tabs)/matches')} />

      <View style={{ height: 20 }} />
    </>
  );

  const emptyContent = loading ? (
    <View style={{ gap: 10 }}>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </View>
  ) : (
    <View style={s.emptyWrap}>
      <Text style={[s.emptyTxt, { color: theme.colors.ink500 }]}>
        Você ainda não está em nenhum grupo.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.colors.background }]}>
      <FlatList<Pool>
        data={loading ? [] : pools}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={emptyContent}
        ListFooterComponent={
          <View style={{ marginTop: pools.length > 0 || loading ? 10 : 0 }}>
            <JoinButton onPress={handleJoin} />
            <View style={{ height: 90 }} />
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        contentContainerStyle={s.listContent}
        renderItem={({ item }) => (
          <PoolCard pool={item} onPress={() => router.push(`/pool/${item.id}`)} />
        )}
        onRefresh={refresh}
        refreshing={loading}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1 },
  listContent: { paddingHorizontal: 20 },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerLeft: { flex: 1 },
  greeting: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 10,
    letterSpacing: 1.4,
    includeFontPadding: false,
  },
  heroTitle: {
    fontFamily: TypographyFamilies.display,
    fontSize: 40,
    letterSpacing: -1.28,
    lineHeight: 46,
    includeFontPadding: false,
    marginTop: 4,
  },
  subtitle: {
    fontFamily: TypographyFamilies.sans,
    fontSize: 14,
    marginTop: 4,
    includeFontPadding: false,
  },

  // ── Avatar ──
  avatarImg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginLeft: 16,
    marginTop: 58,
  },
  avatarClip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
    marginTop: 58,
  },
  avatarInitial: {
    fontFamily: TypographyFamilies.display,
    fontSize: 16,
    color: '#fff',
    includeFontPadding: false,
  },

  // ── Countdown ──
  countdownCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: 'rgba(200,255,62,0.05)',
  },
  countdownDays: {
    fontFamily: TypographyFamilies.display,
    fontSize: 40,
    letterSpacing: -1.6,
    includeFontPadding: false,
    minWidth: 52,
  },
  countdownMid: { flex: 1 },
  countdownLabel: {
    fontFamily: TypographyFamilies.sansMedium,
    fontSize: 14,
    includeFontPadding: false,
  },
  countdownSub: {
    fontFamily: TypographyFamilies.sans,
    fontSize: 12,
    marginTop: 2,
    includeFontPadding: false,
  },

  // ── Pool card ──
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    overflow: 'hidden',
  },
  accentStrip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#C8FF3E',
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  adminBadge: {
    backgroundColor: 'rgba(200,255,62,0.1)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  adminBadgeTxt: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 9,
    includeFontPadding: false,
    letterSpacing: 0.5,
  },
  eyebrowTxt: {
    fontFamily: TypographyFamilies.sans,
    fontSize: 11,
    includeFontPadding: false,
  },
  poolName: {
    fontFamily: TypographyFamilies.sansSemi,
    fontSize: 18,
    letterSpacing: -0.18,
    includeFontPadding: false,
  },
  poolDesc: {
    fontFamily: TypographyFamilies.sans,
    fontSize: 12,
    marginTop: 3,
    includeFontPadding: false,
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statBlock: { alignItems: 'flex-start' },
  statLabel: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 9,
    letterSpacing: 0.5,
    includeFontPadding: false,
    marginBottom: 2,
  },
  rankInline: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  rankNum: {
    fontFamily: TypographyFamilies.display,
    fontSize: 32,
    letterSpacing: -1,
    includeFontPadding: false,
  },
  rankTotal: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 13,
    includeFontPadding: false,
    marginLeft: 1,
  },
  urgencyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 100,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  urgencyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  urgencyTxt: {
    fontFamily: TypographyFamilies.sans,
    fontSize: 12,
    includeFontPadding: false,
  },
  urgencyCount: {
    fontFamily: TypographyFamilies.sansSemi,
  },
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deltaTxt: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 12,
    includeFontPadding: false,
  },

  // ── Join button ──
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 16,
  },
  joinTxt: {
    fontFamily: TypographyFamilies.sansMedium,
    fontSize: 14,
    includeFontPadding: false,
  },

  // ── Skeleton ──
  skelLine: { borderRadius: 6 },

  // ── Empty ──
  emptyWrap: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyTxt: {
    fontFamily: TypographyFamilies.sans,
    fontSize: 14,
    textAlign: 'center',
    includeFontPadding: false,
  },
});
