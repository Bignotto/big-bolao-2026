import { useEffect, useRef } from 'react';
import {
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from 'styled-components/native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useSession } from '@/context/SessionContext';
import { usePools, type Pool } from '@/hooks/usePools';
import { useLiveMatches, type LiveMatchEntry } from '@/hooks/useLiveMatches';
import LiveMatchCard from '@/components/LiveMatchCard';
import AppAvatar from '@/components/AppComponents/AppAvatar';
import { TypographyFamilies } from '@/constants/tokens';
import {
  TOURNAMENT_START_DATE,
  TOURNAMENT_OPENING_MATCHUP,
  TOURNAMENT_OPENING_DATE_LABEL,
} from '@/constants/tournament';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysUntil(date: Date): number {
  const diff = date.getTime() - Date.now();
  return Math.max(0, Math.floor(diff / 86_400_000));
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
        s.skelCard,
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
  const c = theme.colors;
  const days = daysUntil(TOURNAMENT_START_DATE);
  if (days <= 0) return null;

  return (
    <Pressable
      onPress={onPress}
      style={[s.countdownCard, { backgroundColor: 'rgba(200,255,62,0.04)', borderColor: 'rgba(200,255,62,0.15)' }]}
    >
      {/* Top row */}
      <View style={s.countdownTopRow}>
        <Text style={[s.countdownBadge, { color: c.pitch }]}>BOLÃO 2026</Text>
        <Text style={s.countdownEmoji}>⚽</Text>
      </View>

      {/* Hero: big number + info */}
      <View style={s.countdownMain}>
        <View style={s.countdownNumWrap}>
          <Text style={[s.countdownDays, { color: c.pitch }]}>{days}</Text>
          <Text style={[s.countdownUnit, { color: c.pitch }]}>
            {days === 1 ? 'DIA' : 'DIAS'}
          </Text>
        </View>
        <View style={s.countdownRight}>
          <Text style={[s.countdownLabel, { color: c.ink100 }]}>
            para a abertura
          </Text>
          <Text style={[s.countdownSub, { color: c.ink400 }]}>
            {TOURNAMENT_OPENING_DATE_LABEL}
          </Text>
          <Text style={[s.countdownSub, { color: c.ink500 }]}>
            {TOURNAMENT_OPENING_MATCHUP}
          </Text>
        </View>
      </View>

      {/* Footer CTA */}
      <View style={[s.countdownFooter, { borderTopColor: 'rgba(200,255,62,0.1)' }]}>
        <Text style={[s.countdownCta, { color: c.ink400 }]}>Ver partidas</Text>
        <Ionicons name="chevron-forward" size={13} color={c.ink500} />
      </View>
    </Pressable>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ label, count }: { label: string; count: string }) {
  const theme = useTheme();
  const c = theme.colors;
  return (
    <View style={s.sectionHeaderRow}>
      <Text style={[s.sectionHeaderLabel, { color: c.ink500 }]}>{label}</Text>
      <View style={[s.sectionHeaderLine, { backgroundColor: c.ink800 }]} />
      <Text style={[s.sectionHeaderCount, { color: c.ink600 }]}>{count}</Text>
    </View>
  );
}

// ─── Pool card ────────────────────────────────────────────────────────────────

function PoolCard({ pool, onPress }: { pool: Pool; onPress: () => void }) {
  const theme = useTheme();
  const c = theme.colors;

  const isAdmin = pool.isAdmin ?? pool.isCreator;
  const isFirst = pool.userRank === 1;
  const hasStats = pool.userRank != null;
  const showDeadline = pool.pendingDeadlineSoon && (pool.pendingDeadlineCount ?? 0) > 0;
  const showDelta = !showDeadline && pool.rankDelta != null && pool.rankDelta !== 0;
  const visibility = pool.isPrivate ? 'Privado' : 'Público';

  return (
    <Pressable
      onPress={onPress}
      style={[
        s.card,
        {
          backgroundColor: c.ink850,
          borderColor: isFirst ? 'rgba(200,255,62,0.25)' : c.ink800,
        },
      ]}
    >
      {/* Left accent strip for #1 */}
      {isFirst && <View style={[s.accentStrip, { backgroundColor: c.pitch }]} />}

      <View style={s.cardInner}>
        {/* Eyebrow */}
        <View style={s.eyebrowRow}>
          {isAdmin ? (
            <>
              <View style={[s.adminBadge, { backgroundColor: 'rgba(200,255,62,0.1)' }]}>
                <Text style={[s.adminBadgeTxt, { color: c.pitch }]}>ADMIN</Text>
              </View>
              <Text style={[s.eyebrowTxt, { color: c.ink500 }]}>
                {' · '}{pool.participantsCount} participante{pool.participantsCount !== 1 ? 's' : ''}
              </Text>
            </>
          ) : (
            <>
              {pool.isPrivate && (
                <Ionicons name="lock-closed" size={10} color={c.ink500} style={{ marginRight: 3 }} />
              )}
              <Text style={[s.eyebrowTxt, { color: c.ink500 }]}>
                {visibility} · {pool.participantsCount} participante{pool.participantsCount !== 1 ? 's' : ''}
              </Text>
            </>
          )}
        </View>

        {/* Name */}
        <Text style={[s.poolName, { color: c.ink100 }]} numberOfLines={1}>
          {pool.name}
        </Text>

        {/* Description */}
        {!!pool.description && (
          <Text style={[s.poolDesc, { color: c.ink400 }]} numberOfLines={1}>
            {pool.description}
          </Text>
        )}

        {/* Stats */}
        {hasStats && (
          <>
            <View style={[s.divider, { backgroundColor: c.ink800 }]} />
            <View style={s.statsRow}>
              <View style={s.statBlock}>
                <Text style={[s.statLabel, { color: c.ink500 }]}>RANK</Text>
                <View style={s.rankInline}>
                  <Text style={[s.rankNum, { color: isFirst ? c.pitch : c.ink100 }]}>
                    #{pool.userRank}
                  </Text>
                  <Text style={[s.rankTotal, { color: c.ink500 }]}>
                    /{pool.participantsCount}
                  </Text>
                </View>
              </View>

              <View style={{ flex: 1 }} />

              {showDeadline && (
                <View
                  style={[
                    s.urgencyChip,
                    { backgroundColor: 'rgba(255,176,32,0.1)', borderColor: 'rgba(255,176,32,0.3)' },
                  ]}
                >
                  <View style={[s.urgencyDot, { backgroundColor: c.signalAmber }]} />
                  <Text style={[s.urgencyTxt, { color: c.signalAmber }]}>
                    <Text style={s.urgencyCount}>{pool.pendingDeadlineCount}</Text>
                    {' '}palpites vencem hoje
                  </Text>
                </View>
              )}

              {showDelta && (
                <View style={s.deltaRow}>
                  {pool.userPoints != null && (
                    <Text style={[s.deltaTxt, { color: c.ink400 }]}>
                      {pool.userPoints} pts
                    </Text>
                  )}
                  <Text
                    style={[
                      s.deltaTxt,
                      {
                        color: pool.rankDelta! > 0 ? c.signalWin : c.signalLose,
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
      </View>
    </Pressable>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onJoin }: { onJoin: () => void }) {
  const theme = useTheme();
  const c = theme.colors;
  return (
    <View style={s.emptyWrap}>
      <Text style={s.emptyEmoji}>⚽</Text>
      <Text style={[s.emptyTitle, { color: c.ink100 }]}>Nenhum bolão ainda</Text>
      <Text style={[s.emptyBody, { color: c.ink500 }]}>
        Crie um bolão para a galera ou entre em um grupo com um código de convite.
      </Text>
      <Pressable
        onPress={onJoin}
        style={[s.emptyBtn, { backgroundColor: c.ink800, borderColor: c.ink700 }]}
      >
        <Ionicons name="add-circle-outline" size={18} color={c.ink300} />
        <Text style={[s.emptyBtnTxt, { color: c.ink300 }]}>Criar ou entrar em um grupo</Text>
      </Pressable>
    </View>
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
  const totalPending = pools.reduce((n, p) => n + (p.pendingPredictionsCount ?? 0), 0);

  function handleJoin() {
    router.push('/(tabs)/find-pool');
  }

  const listHeader = (
    <>
      {/* Greeting + hero */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={[s.greeting, { color: theme.colors.ink500 }]}>
            OLÁ, {firstName.toUpperCase()}
          </Text>
          <Text style={[s.heroTitle, { color: theme.colors.ink100 }]}>
            Seus bolões<Text style={{ color: theme.colors.pitch }}>.</Text>
          </Text>
          <Text style={[s.subtitle, { color: theme.colors.ink400 }]}>
            {pools.length > 0
              ? `${pools.length} grupo${pools.length !== 1 ? 's' : ''}`
              : 'bem-vindo ao app'}
            {totalPending > 0
              ? ` · ${totalPending} palpite${totalPending !== 1 ? 's' : ''} pendente${totalPending !== 1 ? 's' : ''}`
              : ''}
          </Text>
        </View>

        {/* Avatar — taps to profile, shows amber dot when palpites pending */}
        <Pressable
          onPress={() => router.push('/(tabs)/profile')}
          style={s.avatarWrap}
        >
          <AppAvatar
            imagePath={apiUser?.profileImageUrl ?? undefined}
            name={firstName}
            size={40}
          />
          {totalPending > 0 && (
            <View style={[s.pendingDot, { backgroundColor: theme.colors.signalAmber }]} />
          )}
        </Pressable>
      </View>

      {/* Live match cards */}
      {liveMatchesWithMyPredictions.length > 0 && (
        <View style={{ gap: 10, marginBottom: 12 }}>
          {liveMatchesWithMyPredictions.map((entry) => (
            <LiveMatchCard
              key={entry.match.id}
              entry={entry}
              onPress={handleLiveCardPress}
            />
          ))}
        </View>
      )}

      {/* Countdown — hidden once matches are live */}
      {liveMatchesWithMyPredictions.length === 0 && (
        <CountdownCard onPress={() => router.push('/(tabs)/matches')} />
      )}

      {/* Section header — only when there are (or will be) pools */}
      {(pools.length > 0 || loading) && (
        <View style={s.sectionGap}>
          <SectionHeader
            label="MEUS BOLÕES"
            count={loading ? '···' : String(pools.length)}
          />
        </View>
      )}
    </>
  );

  const emptyContent = loading ? (
    <View style={{ gap: 10 }}>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </View>
  ) : (
    <EmptyState onJoin={handleJoin} />
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
            {pools.length > 0 && <JoinButton onPress={handleJoin} />}
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
  listContent: { paddingHorizontal: 16 },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 16,
    paddingBottom: 20,
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
    fontSize: 42,
    letterSpacing: -1.28,
    lineHeight: 48,
    includeFontPadding: false,
    marginTop: 4,
  },
  subtitle: {
    fontFamily: TypographyFamilies.sans,
    fontSize: 14,
    marginTop: 4,
    includeFontPadding: false,
  },
  avatarWrap: {
    marginLeft: 16,
    marginTop: 18,
  },
  pendingDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#0D0D0D',
  },

  // ── Countdown ──
  countdownCard: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    overflow: 'hidden',
  },
  countdownTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  countdownBadge: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 10,
    letterSpacing: 1.2,
    includeFontPadding: false,
  },
  countdownEmoji: { fontSize: 18 },
  countdownMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  countdownNumWrap: {
    alignItems: 'center',
    gap: 0,
  },
  countdownDays: {
    fontFamily: TypographyFamilies.display,
    fontSize: 72,
    letterSpacing: -4,
    includeFontPadding: false,
    lineHeight: 68,
  },
  countdownUnit: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    includeFontPadding: false,
  },
  countdownRight: {
    flex: 1,
    gap: 3,
  },
  countdownLabel: {
    fontFamily: TypographyFamilies.sansSemi,
    fontSize: 16,
    includeFontPadding: false,
  },
  countdownSub: {
    fontFamily: TypographyFamilies.sans,
    fontSize: 13,
    includeFontPadding: false,
  },
  countdownFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  countdownCta: {
    fontFamily: TypographyFamilies.sansMedium,
    fontSize: 12,
    includeFontPadding: false,
  },

  // ── Section header ──
  sectionGap: { marginTop: 28, marginBottom: 14 },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionHeaderLabel: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 10,
    letterSpacing: 1.2,
    includeFontPadding: false,
  },
  sectionHeaderLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  sectionHeaderCount: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 10,
    letterSpacing: 0.5,
    includeFontPadding: false,
  },

  // ── Pool card ──
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  accentStrip: {
    width: 4,
    alignSelf: 'stretch',
  },
  cardInner: {
    flex: 1,
    padding: 18,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  adminBadge: {
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
  skelCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    overflow: 'hidden',
  },
  skelLine: { borderRadius: 6 },

  // ── Empty state ──
  emptyWrap: {
    paddingTop: 48,
    paddingBottom: 32,
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    fontFamily: TypographyFamilies.sansSemi,
    fontSize: 18,
    includeFontPadding: false,
  },
  emptyBody: {
    fontFamily: TypographyFamilies.sans,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    includeFontPadding: false,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  emptyBtnTxt: {
    fontFamily: TypographyFamilies.sansMedium,
    fontSize: 14,
    includeFontPadding: false,
  },
});
