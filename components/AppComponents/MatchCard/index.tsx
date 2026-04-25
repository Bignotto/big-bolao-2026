import { useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from 'styled-components/native';
import { TypographyFamilies } from '@/constants/tokens';
import type { Match, Team } from '@/domain/entities/Match';
import type { Prediction } from '@/domain/entities/Prediction';
import { MatchStatus } from '@/domain/enums/MatchStatus';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PoolContext = {
  poolId: string | number;
  userPrediction?: Prediction | null;
};

export type MatchCardProps = {
  match: Match;
  poolContext?: PoolContext;
  showBorder?: boolean;
};

// ─── Live dot ─────────────────────────────────────────────────────────────────

function LiveDot({ color }: { color: string }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.4, { duration: 1500, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }, animStyle]}
    />
  );
}

// ─── Flag ─────────────────────────────────────────────────────────────────────

function Flag({ flagUrl, countryCode }: { flagUrl: string | null; countryCode: string | null }) {
  if (flagUrl) {
    return <Image source={{ uri: flagUrl }} style={styles.flagImg} resizeMode="cover" />;
  }
  return (
    <View style={[styles.flagImg, styles.flagFallback]}>
      <Text style={styles.flagFallbackTxt}>{countryCode?.slice(0, 2) ?? '?'}</Text>
    </View>
  );
}

// ─── Team row ─────────────────────────────────────────────────────────────────

function TeamRow({
  team,
  score,
  scoreColor,
}: {
  team: Team;
  score: number | null;
  scoreColor: string;
}) {
  const theme = useTheme();
  return (
    <View style={styles.teamRow}>
      <Flag flagUrl={team.flagUrl} countryCode={team.countryCode} />
      <Text style={[styles.teamName, { color: theme.colors.ink100 }]} numberOfLines={1}>
        {team.countryCode ?? team.name}
      </Text>
      {score != null && (
        <Text style={[styles.scoreNum, { color: scoreColor }]}>{score}</Text>
      )}
    </View>
  );
}

// ─── Prediction chip ──────────────────────────────────────────────────────────

type ChipProps = {
  label: string;
  bg: string;
  borderColor: string;
  textColor: string;
  dashed?: boolean;
  showPencil?: boolean;
  showDot?: boolean;
  dotColor?: string;
};

function PredictionChip({
  label,
  bg,
  borderColor,
  textColor,
  dashed,
  showPencil,
  showDot,
  dotColor,
}: ChipProps) {
  return (
    <View
      style={[
        styles.chip,
        { backgroundColor: bg, borderColor, borderStyle: dashed ? 'dashed' : 'solid' },
      ]}
    >
      {showDot && dotColor && <LiveDot color={dotColor} />}
      {showPencil && (
        <Text style={[styles.chipText, { color: textColor, fontSize: 10, marginRight: 1 }]}>
          ✎
        </Text>
      )}
      <Text style={[styles.chipText, { color: textColor }]}>{label}</Text>
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MatchCard({ match, poolContext, showBorder = true }: MatchCardProps) {
  const theme = useTheme();
  const router = useRouter();
  const { matchStatus, homeTeamScore, awayTeamScore, matchDatetime } = match;

  const isLive = matchStatus === MatchStatus.IN_PROGRESS;
  const isDone = matchStatus === MatchStatus.COMPLETED;
  const isSched =
    matchStatus === MatchStatus.SCHEDULED || matchStatus === MatchStatus.POSTPONED;
  const hasScore = homeTeamScore != null && awayTeamScore != null;

  // Losing team's score rendered in muted color
  let homeScoreColor = theme.colors.ink100;
  let awayScoreColor = theme.colors.ink100;
  if (hasScore) {
    if (homeTeamScore! > awayTeamScore!) awayScoreColor = theme.colors.ink400;
    else if (awayTeamScore! > homeTeamScore!) homeScoreColor = theme.colors.ink400;
  }

  const timeStr = new Date(matchDatetime).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const handlePress = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // haptics unavailable in Expo Go on Android — silently skip
    }
    if (poolContext) {
      if (isSched) {
        router.push(`/pool/${poolContext.poolId}/predict?matchId=${match.id}`);
      } else {
        router.push(`/pool/${poolContext.poolId}/match/${match.id}`);
      }
    } else {
      router.push(`/match/${match.id}`);
    }
  };

  const renderChip = () => {
    if (!poolContext) return null;
    const pred = poolContext.userPrediction;
    const predLabel = pred
      ? `${pred.predictedHomeScore}-${pred.predictedAwayScore}`
      : '—';

    if (isSched) {
      if (!pred) {
        return (
          <PredictionChip
            label="PALPITAR"
            bg="transparent"
            borderColor={theme.colors.pitch}
            textColor={theme.colors.pitch}
            dashed
          />
        );
      }
      return (
        <PredictionChip
          label={predLabel}
          bg="rgba(200,255,62,0.12)"
          borderColor={theme.colors.pitch}
          textColor={theme.colors.pitch}
          showPencil
        />
      );
    }

    if (isLive) {
      if (!pred) {
        return (
          <PredictionChip
            label="—"
            bg="transparent"
            borderColor={theme.colors.ink700}
            textColor={theme.colors.ink500}
          />
        );
      }
      return (
        <PredictionChip
          label={predLabel}
          bg="rgba(255,176,32,0.12)"
          borderColor="rgba(255,176,32,0.3)"
          textColor={theme.colors.signalAmber}
          showDot
          dotColor={theme.colors.signalAmber}
        />
      );
    }

    if (isDone) {
      if (!pred) {
        return (
          <PredictionChip
            label="—"
            bg="transparent"
            borderColor={theme.colors.ink700}
            textColor={theme.colors.ink500}
          />
        );
      }
      const correct = pred.pointsEarned != null && pred.pointsEarned > 0;
      return (
        <PredictionChip
          label={correct ? `${predLabel} ✓` : predLabel}
          bg={correct ? 'rgba(74,222,128,0.12)' : 'rgba(240,74,80,0.12)'}
          borderColor={correct ? theme.colors.signalWin : theme.colors.signalLose}
          textColor={correct ? theme.colors.signalWin : theme.colors.signalLose}
        />
      );
    }

    return null;
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.row,
        showBorder && { borderBottomWidth: 1, borderBottomColor: theme.colors.ink800 },
      ]}
    >
      {/* Left: time or live indicator */}
      <View style={styles.leftCol}>
        {isLive ? (
          <>
            <LiveDot color={theme.colors.signalLive} />
            <Text style={[styles.liveText, { color: theme.colors.signalLive }]}>LIVE</Text>
          </>
        ) : (
          <Text style={[styles.timeText, { color: theme.colors.ink500 }]}>{timeStr}</Text>
        )}
      </View>

      {/* Middle: teams + scores */}
      <View style={styles.midCol}>
        <TeamRow
          team={match.homeTeam}
          score={hasScore ? homeTeamScore : null}
          scoreColor={homeScoreColor}
        />
        <View style={styles.teamGap} />
        <TeamRow
          team={match.awayTeam}
          score={hasScore ? awayTeamScore : null}
          scoreColor={awayScoreColor}
        />
      </View>

      {/* Right: prediction chip — pool mode only */}
      {poolContext && <View style={styles.rightCol}>{renderChip()}</View>}
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 72,
  },
  leftCol: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  midCol: {
    flex: 1,
    paddingHorizontal: 8,
  },
  rightCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 8,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  teamGap: {
    height: 6,
  },
  flagImg: {
    width: 28,
    height: 20,
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  flagFallback: {
    backgroundColor: '#262E36',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagFallbackTxt: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 9,
    color: '#8A949E',
  },
  teamName: {
    flex: 1,
    fontFamily: TypographyFamilies.sansMedium,
    fontSize: 14,
  },
  scoreNum: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 15,
  },
  timeText: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 11,
    textAlign: 'center',
  },
  liveText: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
  },
  chipText: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 11,
    includeFontPadding: false,
  },
});
