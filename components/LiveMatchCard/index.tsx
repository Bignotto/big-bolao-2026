import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'styled-components/native';

import { TypographyFamilies } from '@/constants/tokens';
import type { LiveMatchEntry } from '@/hooks/useLiveMatches';
import { MatchStatus } from '@/domain/enums/MatchStatus';

// ── Helpers ───────────────────────────────────────────────────────────────────

function stageLabel(stage: string, group: string | null): string {
  const parts: string[] = [];
  if (group) {
    parts.push(`GRUPO ${group}`);
  } else {
    parts.push(stage.replace(/_/g, ' '));
  }
  return parts.join(' · ');
}

function liveStatusLabel(matchStatus: MatchStatus): string {
  if (matchStatus === MatchStatus.COMPLETED) return 'ENCERRADO';
  return 'AO VIVO';
}

// Predicted winner name for footer label
function predictedWinner(
  entry: LiveMatchEntry,
): string {
  const { predictedHomeScore, predictedAwayScore, match } = entry;
  if (predictedHomeScore > predictedAwayScore) return match.homeTeam.name;
  if (predictedAwayScore > predictedHomeScore) return match.awayTeam.name;
  return 'Empate';
}

// ── Pulsing dot ───────────────────────────────────────────────────────────────

function PulsingDot({ color }: { color: string }) {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.4, duration: 750, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 750, useNativeDriver: true }),
      ]),
    ).start();
  }, [opacity]);
  return <Animated.View style={[s.dot, { backgroundColor: color, opacity }]} />;
}

// ── Flag ─────────────────────────────────────────────────────────────────────

function TeamFlag({ uri, name }: { uri: string | null; name: string }) {
  const theme = useTheme();
  if (uri) {
    return <Image source={{ uri }} style={s.flag} resizeMode="cover" />;
  }
  return (
    <View style={[s.flag, s.flagFallback, { backgroundColor: theme.colors.ink700 }]}>
      <Text style={[s.flagInitial, { color: theme.colors.ink300 }]}>
        {name.charAt(0)}
      </Text>
    </View>
  );
}

// ── Card ─────────────────────────────────────────────────────────────────────

type Props = {
  entry: LiveMatchEntry;
  onPress: (entry: LiveMatchEntry) => void;
};

export default function LiveMatchCard({ entry, onPress }: Props) {
  const theme = useTheme();
  const { match } = entry;

  const homeScore = match.homeTeamScore ?? 0;
  const awayScore = match.awayTeamScore ?? 0;
  const homeWinning = homeScore > awayScore;
  const awayWinning = awayScore > homeScore;
  const isDraw = homeScore === awayScore;

  const winner = predictedWinner(entry);
  const isDrewPred = entry.predictedHomeScore === entry.predictedAwayScore;
  const hasPoints = entry.currentPointsSwing > 0;

  return (
    <Pressable
      onPress={() => onPress(entry)}
      style={({ pressed }) => [s.card, pressed && { opacity: 0.88 }]}
    >
      {/* Red tint gradient — simulated with two overlay views */}
      <View style={[StyleSheet.absoluteFill, s.tintLayer]} pointerEvents="none" />

      {/* ── Top strip ── */}
      <View style={s.topStrip}>
        <View style={s.liveRow}>
          <PulsingDot color={theme.colors.signalLive} />
          <Text style={[s.liveLabel, { color: theme.colors.signalLive }]}>
            {liveStatusLabel(match.matchStatus)}
          </Text>
        </View>
        <Text style={[s.groupLabel, { color: theme.colors.ink500 }]}>
          {stageLabel(match.stage, match.group)}
        </Text>
      </View>

      {/* ── Score block ── */}
      <View style={s.scoreBlock}>
        {/* Home team */}
        <View style={s.teamRow}>
          <TeamFlag uri={match.homeTeam.flagUrl} name={match.homeTeam.name} />
          <Text
            style={[s.teamName, { color: theme.colors.ink100 }]}
            numberOfLines={1}
          >
            {match.homeTeam.name}
          </Text>
          <Text
            style={[
              s.score,
              {
                color:
                  homeWinning || isDraw
                    ? theme.colors.ink100
                    : theme.colors.ink400,
              },
            ]}
          >
            {homeScore}
          </Text>
        </View>

        {/* Away team */}
        <View style={s.teamRow}>
          <TeamFlag uri={match.awayTeam.flagUrl} name={match.awayTeam.name} />
          <Text
            style={[s.teamName, { color: theme.colors.ink100 }]}
            numberOfLines={1}
          >
            {match.awayTeam.name}
          </Text>
          <Text
            style={[
              s.score,
              {
                color:
                  awayWinning || isDraw
                    ? theme.colors.ink100
                    : theme.colors.ink400,
              },
            ]}
          >
            {awayScore}
          </Text>
        </View>
      </View>

      {/* ── Footer ── */}
      <View style={[s.footer, { borderTopColor: 'rgba(255,255,255,0.07)' }]}>
        {/* Pitch checkmark circle */}
        <View style={[s.checkCircle, { backgroundColor: theme.colors.pitch }]}>
          <Ionicons name="checkmark" size={16} color={theme.colors.ink950} />
        </View>

        <View style={s.footerText}>
          {/* Prediction line */}
          <Text style={[s.predLine, { color: theme.colors.ink100 }]}>
            {'Seu palpite: '}
            <Text style={s.predScore}>
              {entry.predictedHomeScore}–{entry.predictedAwayScore}
            </Text>
            {!isDrewPred && (
              <Text style={[s.predWinner, { color: theme.colors.pitch }]}>
                {' '}{winner}
              </Text>
            )}
          </Text>

          {/* Subtitle */}
          <Text style={[s.subtitle, { color: theme.colors.ink400 }]}>
            {hasPoints ? (
              <>
                {'Você está ganhando '}
                <Text style={[s.subtitlePitch, { color: theme.colors.pitch }]}>
                  +{entry.currentPointsSwing} pts
                </Text>
                {' · '}{entry.poolName}
              </>
            ) : (
              <>
                {'Sem pontos agora · '}
                {entry.poolName}
              </>
            )}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,90,95,0.25)',
    backgroundColor: '#151A1F', // ink850 base
    padding: 16,
    overflow: 'hidden',
  },
  tintLayer: {
    borderRadius: 18,
    backgroundColor: 'rgba(255,90,95,0.07)',
  },

  // ── Top strip ──
  topStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveLabel: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 11,
    letterSpacing: 0.8,
    includeFontPadding: false,
  },
  groupLabel: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 10,
    letterSpacing: 0.5,
    includeFontPadding: false,
  },

  // ── Score block ──
  scoreBlock: {
    gap: 2,
    marginBottom: 14,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  flag: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 12,
  },
  flagFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagInitial: {
    fontFamily: TypographyFamilies.sansSemi,
    fontSize: 12,
    includeFontPadding: false,
  },
  teamName: {
    flex: 1,
    fontFamily: TypographyFamilies.sansMedium,
    fontSize: 15,
    includeFontPadding: false,
  },
  score: {
    fontFamily: TypographyFamilies.display,
    fontSize: 40,
    letterSpacing: -1.4,
    includeFontPadding: false,
    minWidth: 32,
    textAlign: 'right',
  },

  // ── Footer ──
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    paddingTop: 12,
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  footerText: {
    flex: 1,
  },
  predLine: {
    fontFamily: TypographyFamilies.sansMedium,
    fontSize: 13,
    includeFontPadding: false,
  },
  predScore: {
    fontFamily: TypographyFamilies.sansSemi,
  },
  predWinner: {
    fontFamily: TypographyFamilies.sansSemi,
  },
  subtitle: {
    fontFamily: TypographyFamilies.sans,
    fontSize: 11,
    marginTop: 2,
    includeFontPadding: false,
  },
  subtitlePitch: {
    fontFamily: TypographyFamilies.sansSemi,
  },
});
