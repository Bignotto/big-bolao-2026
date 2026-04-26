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
  nameColor,
  bold,
}: {
  team: Team;
  score: number | null;
  scoreColor: string;
  nameColor: string;
  bold?: boolean;
}) {
  return (
    <View style={styles.teamRow}>
      <Flag flagUrl={team.flagUrl} countryCode={team.countryCode} />
      <Text
        style={[
          styles.teamName,
          { color: nameColor },
          bold && { fontFamily: TypographyFamilies.sansSemi },
        ]}
        numberOfLines={1}
      >
        {team.countryCode ?? team.name}
      </Text>
      <Text style={[styles.scoreNum, { color: scoreColor }]}>
        {score != null ? score : '·'}
      </Text>
    </View>
  );
}

// ─── Prediction chip ──────────────────────────────────────────────────────────

type ChipProps = {
  label: string;
  score?: string;
  pts?: string;
  bg: string;
  borderColor: string;
  textColor: string;
  scoreColor?: string;
  dashed?: boolean;
  showDot?: boolean;
  dotColor?: string;
};

function PredictionChip({
  label,
  score,
  pts,
  bg,
  borderColor,
  textColor,
  scoreColor,
  dashed,
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
      <View style={styles.chipLabelRow}>
        {showDot && dotColor && (
          <View style={styles.chipDotWrap}>
            <LiveDot color={dotColor} />
          </View>
        )}
        <Text style={[styles.chipLabel, { color: textColor }]}>{label}</Text>
      </View>
      {score != null && (
        <Text style={[styles.chipScore, { color: scoreColor ?? textColor }]}>{score}</Text>
      )}
      {pts != null && (
        <Text style={[styles.chipPts, { color: textColor }]}>{pts}</Text>
      )}
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

  // Score and name colors: winner = ink100 bold, loser = ink600 muted
  let homeScoreColor = theme.colors.ink600;
  let awayScoreColor = theme.colors.ink600;
  let homeNameColor = theme.colors.ink400;
  let awayNameColor = theme.colors.ink400;
  let homeWinner = false;
  let awayWinner = false;

  if (hasScore) {
    if (homeTeamScore! > awayTeamScore!) {
      homeScoreColor = theme.colors.ink100;
      homeNameColor = theme.colors.ink100;
      homeWinner = true;
    } else if (awayTeamScore! > homeTeamScore!) {
      awayScoreColor = theme.colors.ink100;
      awayNameColor = theme.colors.ink100;
      awayWinner = true;
    } else {
      // draw
      homeScoreColor = theme.colors.ink100;
      awayScoreColor = theme.colors.ink100;
      homeNameColor = theme.colors.ink300;
      awayNameColor = theme.colors.ink300;
    }
  } else if (!isSched) {
    homeNameColor = theme.colors.ink400;
    awayNameColor = theme.colors.ink400;
  } else {
    homeNameColor = theme.colors.ink100;
    awayNameColor = theme.colors.ink100;
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
    const predScore = pred
      ? `${pred.predictedHomeScore}–${pred.predictedAwayScore}`
      : undefined;

    // No prediction yet, match not started
    if (isSched && !pred) {
      return (
        <PredictionChip
          label="PALPITAR"
          score="+"
          bg="transparent"
          borderColor={theme.colors.pitch}
          textColor={theme.colors.pitch}
          dashed
        />
      );
    }

    // Prediction submitted, match not started
    if (isSched && pred) {
      return (
        <PredictionChip
          label="PALPITADO"
          score={predScore}
          bg={theme.colors.ink850}
          borderColor={theme.colors.ink700}
          textColor={theme.colors.ink500}
          scoreColor={theme.colors.ink100}
        />
      );
    }

    // Match live, prediction exists
    if (isLive && pred) {
      return (
        <PredictionChip
          label="AO VIVO"
          score={predScore}
          bg="rgba(255,176,32,0.10)"
          borderColor="rgba(255,176,32,0.30)"
          textColor={theme.colors.signalAmber}
          showDot
          dotColor={theme.colors.signalLive}
        />
      );
    }

    // Match live, no prediction
    if (isLive && !pred) {
      return (
        <PredictionChip
          label="SEM PALPITE"
          bg="transparent"
          borderColor={theme.colors.ink700}
          textColor={theme.colors.ink500}
        />
      );
    }

    // Match finished
    if (isDone && pred) {
      const isExact =
        hasScore &&
        pred.predictedHomeScore === homeTeamScore &&
        pred.predictedAwayScore === awayTeamScore;
      const isWinner = !isExact && pred.pointsEarned != null && pred.pointsEarned > 0;
      const pts = pred.pointsEarned ?? 0;
      const ptsLabel = pts > 0 ? `+${pts} pts` : '0 pts';

      if (isExact) {
        return (
          <PredictionChip
            label="EXATO"
            score={predScore}
            pts={ptsLabel}
            bg="rgba(74,222,128,0.12)"
            borderColor={theme.colors.signalWin}
            textColor={theme.colors.signalWin}
            scoreColor={theme.colors.ink100}
          />
        );
      }
      if (isWinner) {
        return (
          <PredictionChip
            label="VENCEDOR"
            score={predScore}
            pts={ptsLabel}
            bg="rgba(255,176,32,0.10)"
            borderColor={theme.colors.signalAmber}
            textColor={theme.colors.signalAmber}
            scoreColor={theme.colors.ink100}
          />
        );
      }
      return (
        <PredictionChip
          label="ERROU"
          score={predScore}
          pts={ptsLabel}
          bg="rgba(240,74,80,0.10)"
          borderColor={theme.colors.signalLose}
          textColor={theme.colors.signalLose}
          scoreColor={theme.colors.ink100}
        />
      );
    }

    // Finished, no prediction
    if (isDone && !pred) {
      return (
        <PredictionChip
          label="SEM PALPITE"
          bg="transparent"
          borderColor={theme.colors.ink700}
          textColor={theme.colors.ink500}
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
          nameColor={homeNameColor}
          bold={homeWinner}
        />
        <View style={styles.teamGap} />
        <TeamRow
          team={match.awayTeam}
          score={hasScore ? awayTeamScore : null}
          scoreColor={awayScoreColor}
          nameColor={awayNameColor}
          bold={awayWinner}
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
    width: 76,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 2,
  },
  chipLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chipDotWrap: {
    marginRight: 1,
  },
  chipLabel: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 8,
    letterSpacing: 0.3,
    includeFontPadding: false,
  },
  chipScore: {
    fontFamily: TypographyFamilies.display,
    fontSize: 16,
    includeFontPadding: false,
    letterSpacing: -0.5,
  },
  chipPts: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 8,
    includeFontPadding: false,
  },
});
