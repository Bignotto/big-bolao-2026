import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';
import { useTheme } from 'styled-components/native';
import { TypographyFamilies } from '@/constants/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────

export type LeaderboardEntry = {
  poolId: number;
  userId: string;
  totalPoints: number;
  exactScoresCount: number;
  correctWinnersCount: number;
  rank: number | null;
  lastUpdated: string | null;
  user: {
    id: string;
    name: string;
    profileImageUrl: string | null;
  };
};

export interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
  rank: number | null;
  rankDelta?: number | null;
  showBorder?: boolean;
}

// ─── Avatar helpers ───────────────────────────────────────────────────────────

const AVATAR_PALETTE = ['#D8A040', '#4D7D5B', '#B5643A', '#5D4DA0', '#2E7C8C', '#B8414A'];

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = Math.imul(31, h) + id.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h) % AVATAR_PALETTE.length;
}

function Avatar({ user }: { user: LeaderboardEntry['user'] }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = !!user.profileImageUrl && !imgFailed;
  const color = AVATAR_PALETTE[hashId(user.id)];
  const initial = user.name.charAt(0).toUpperCase();

  return (
    // overflow:hidden on its own (no backgroundColor here) avoids the Android
    // bug where borderRadius + overflow:hidden + backgroundColor = blank circle.
    // Background color lives on an absoluteFill child instead.
    <View style={styles.avatarClip}>
      {showImage ? (
        <Image
          source={{ uri: user.profileImageUrl! }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: color }]} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.25)' }]} />
          <Text style={styles.avatarInitial}>{initial}</Text>
        </>
      )}
    </View>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────

const ROW_LAYOUT = LinearTransition.duration(300).easing(Easing.out(Easing.cubic));

export default function LeaderboardRow({
  entry,
  isCurrentUser,
  rank,
  rankDelta,
  showBorder = true,
}: LeaderboardRowProps) {
  const theme = useTheme();

  const rankColor = rank != null && rank <= 3 ? theme.colors.pitch : theme.colors.ink500;
  const nameColor = isCurrentUser ? theme.colors.pitch : theme.colors.ink100;
  const showDelta = rankDelta != null && rankDelta !== 0;
  const deltaColor = rankDelta != null && rankDelta > 0 ? theme.colors.signalWin : theme.colors.signalLose;
  const deltaLabel =
    rankDelta != null
      ? `${rankDelta > 0 ? '↑' : '↓'}${Math.abs(rankDelta)} desde rodada`
      : '';

  return (
    <Animated.View
      layout={ROW_LAYOUT}
      style={[
        styles.row,
        {
          backgroundColor: isCurrentUser ? 'rgba(200,255,62,0.06)' : 'transparent',
          borderLeftColor: isCurrentUser ? theme.colors.pitch : 'transparent',
          borderBottomColor: showBorder ? theme.colors.ink800 : 'transparent',
        },
      ]}
    >
      {/* 1 · Rank */}
      <Text style={[styles.rank, { color: rankColor }]}>
        {rank ?? '—'}
      </Text>

      {/* 2 · Avatar */}
      <Avatar user={entry.user} />

      {/* 3 · Name + delta */}
      <View style={styles.nameCol}>
        <Text
          style={[
            styles.name,
            {
              color: nameColor,
              fontFamily: isCurrentUser
                ? TypographyFamilies.sansSemi
                : TypographyFamilies.sansMedium,
            },
          ]}
          numberOfLines={1}
        >
          {entry.user.name}
        </Text>
        {showDelta && (
          <Text style={[styles.delta, { color: deltaColor }]}>{deltaLabel}</Text>
        )}
      </View>

      {/* 4 · Exact scores */}
      <Text style={[styles.exactCount, { color: theme.colors.ink400 }]}>
        {entry.exactScoresCount}
      </Text>

      {/* 5 · Points (animated flip on change) */}
      <View style={styles.pointsCol}>
        <Animated.Text
          key={entry.totalPoints}
          entering={FadeIn.duration(250)}
          exiting={FadeOut.duration(150)}
          style={[styles.points, { color: theme.colors.ink100 }]}
        >
          {entry.totalPoints}
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

export function LeaderboardHeader() {
  const theme = useTheme();
  const labelStyle = [styles.headerLabel, { color: theme.colors.ink500 }];

  return (
    <View style={styles.header}>
      {/* spacer for rank + avatar columns */}
      <View style={styles.headerSpacer} />
      <Text style={[labelStyle, styles.headerParticipant]}>Participante</Text>
      <Text style={[labelStyle, styles.headerExact]}>Exatos</Text>
      <Text style={[labelStyle, styles.headerPts]}>Pts</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  row: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
    borderLeftWidth: 3,
    borderBottomWidth: 1,
  },
  rank: {
    width: 22,
    fontFamily: TypographyFamilies.mono,
    fontSize: 13,
    textAlign: 'right',
    includeFontPadding: false,
  },
  avatarClip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  avatarInitial: {
    fontFamily: TypographyFamilies.display,
    fontSize: 13,
    color: '#fff',
    includeFontPadding: false,
  },
  nameCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  name: {
    fontSize: 14,
    includeFontPadding: false,
  },
  delta: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 10,
    marginTop: 2,
    includeFontPadding: false,
  },
  exactCount: {
    width: 20,
    fontFamily: TypographyFamilies.mono,
    fontSize: 12,
    textAlign: 'right',
    includeFontPadding: false,
  },
  pointsCol: {
    width: 40,
    alignItems: 'flex-end',
  },
  points: {
    fontFamily: TypographyFamilies.display,
    fontSize: 22,
    letterSpacing: -0.44,
    includeFontPadding: false,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 12,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  headerSpacer: {
    width: 22 + 12 + 32, // rank + gap + avatar
  },
  headerLabel: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 10,
    includeFontPadding: false,
  },
  headerParticipant: {
    flex: 1,
    minWidth: 0,
  },
  headerExact: {
    width: 20,
    textAlign: 'right',
  },
  headerPts: {
    width: 40,
    textAlign: 'right',
  },
});
