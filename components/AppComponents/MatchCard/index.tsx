import React from 'react';
import type { PressableStateCallbackType } from 'react-native';
import { Image, Pressable } from 'react-native';
import styled, { useTheme, type DefaultTheme } from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { RFValue } from 'react-native-responsive-fontsize';
import { TextSizes, Spaces, BorderRadius, IconSizes } from '@/constants/tokens';
import type { Match, Team } from '@/domain/entities/Match';
import { isMatchLocked } from '@/domain/entities/Match';
import type { Prediction } from '@/domain/entities/Prediction';

// ─── Card shell ───────────────────────────────────────────────────────────────

const CardPressable = styled.Pressable`
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.white};
  border-radius: ${BorderRadius.md}px;
  padding: ${Spaces.md}px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
`;

// ─── Generic text atoms ───────────────────────────────────────────────────────

const Txt = styled.Text<{
  size?: number;
  color?: string;
  font?: string;
  align?: 'left' | 'center' | 'right';
}>`
  font-family: ${({ theme, font }: { theme: DefaultTheme; font?: string }) =>
    font ?? theme.fonts.regular};
  font-size: ${({ size }: { size?: number }) => RFValue(size ?? TextSizes.sm)}px;
  color: ${({ theme, color }: { theme: DefaultTheme; color?: string }) =>
    color ?? theme.colors.text};
  text-align: ${({ align }: { align?: 'left' | 'center' | 'right' }) => align ?? 'left'};
`;

// ─── Row helpers ──────────────────────────────────────────────────────────────

const Row = styled.View<{ justify?: string }>`
  flex-direction: row;
  align-items: center;
  justify-content: ${({ justify }: { justify?: string }) => justify ?? 'space-between'};
`;

const CenterCol = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const TeamCol = styled.View`
  width: 30%;
  align-items: center;
`;

// ─── Badge ────────────────────────────────────────────────────────────────────

const Badge = styled.View<{ bg: string }>`
  background-color: ${({ bg }: { bg: string }) => bg};
  border-radius: ${BorderRadius.xsm}px;
  padding-horizontal: ${Spaces.xsm}px;
  padding-vertical: 2px;
  align-self: flex-end;
  margin-bottom: ${Spaces.xsm}px;
`;

// ─── Team display ─────────────────────────────────────────────────────────────

function TeamDisplay({ team }: { team: Team | undefined | null }) {
  const theme = useTheme();

  if (!team) {
    return (
      <TeamCol>
        <Txt size={TextSizes.sm} color={theme.colors.text_disabled} align="center">
          —
        </Txt>
      </TeamCol>
    );
  }

  const flagUrl = team.flagUrl;
  const hasFlag = !!flagUrl;
  const hasCode = !!team.countryCode;

  return (
    <TeamCol>
      {hasFlag && (
        <Image
          source={{ uri: flagUrl }}
          style={{ width: 32, height: 21, borderRadius: 2, marginBottom: 4 }}
        />
      )}
      <Txt
        size={TextSizes.sm}
        align="center"
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {hasCode ? team.countryCode : team.name}
      </Txt>
    </TeamCol>
  );
}

// ─── Status-specific score areas ──────────────────────────────────────────────

function ScheduledCenter({
  match,
  prediction,
}: {
  match: Match;
  prediction?: Prediction | null;
}) {
  const theme = useTheme();
  const dt = new Date(match.matchDatetime);
  const timeStr = dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const locked = isMatchLocked(match);

  const hasPrediction = prediction != null;
  const predictionLabel = hasPrediction
    ? `${prediction.predictedHomeScore} × ${prediction.predictedAwayScore}`
    : '—';

  return (
    <CenterCol>
      <Row justify="center" style={{ gap: 4 }}>
        <Txt size={TextSizes.sm} align="center">
          {timeStr}
        </Txt>
        {locked && (
          <Ionicons
            name="lock-closed-outline"
            size={IconSizes.xsm}
            color={theme.colors.text_disabled}
          />
        )}
      </Row>
      <Txt size={TextSizes.xsm} color={theme.colors.text_gray} align="center">
        {dateStr}
      </Txt>
      <Txt
        size={TextSizes.sm}
        color={hasPrediction ? theme.colors.primary : theme.colors.text_disabled}
        font={hasPrediction ? theme.fonts.display : undefined}
        align="center"
        style={hasPrediction ? { marginTop: 4, fontVariant: ['tabular-nums'] } : { marginTop: 4 }}
      >
        {predictionLabel}
      </Txt>
    </CenterCol>
  );
}

function InProgressCenter({ match, prediction }: { match: Match; prediction?: Prediction | null }) {
  const theme = useTheme();
  const score = `${match.homeTeamScore ?? 0} – ${match.awayTeamScore ?? 0}`;
  const predLabel =
    prediction != null
      ? `Seu palpite: ${prediction.predictedHomeScore} × ${prediction.predictedAwayScore}`
      : 'Sem palpite';

  return (
    <CenterCol>
      <Txt
        size={TextSizes.lg}
        font={theme.fonts.display}
        align="center"
        style={{ fontVariant: ['tabular-nums'] }}
      >
        {score}
      </Txt>
      <Txt size={TextSizes.sm} color={theme.colors.text_gray} align="center" style={{ marginTop: 2 }}>
        {predLabel}
      </Txt>
    </CenterCol>
  );
}

function CompletedCenter({ match, prediction }: { match: Match; prediction?: Prediction | null }) {
  const theme = useTheme();
  const score = `${match.homeTeamScore ?? 0} – ${match.awayTeamScore ?? 0}`;
  const pts = prediction?.pointsEarned;
  const hasPts = pts != null;
  const hasPositive = hasPts && pts > 0;

  return (
    <CenterCol>
      <Txt
        size={TextSizes.lg}
        font={theme.fonts.display}
        align="center"
        style={{ fontVariant: ['tabular-nums'] }}
      >
        {score}
      </Txt>
      {prediction != null && (
        <Row justify="center" style={{ gap: 4, marginTop: 4 }}>
          {hasPts ? (
            <>
              <Ionicons
                name={hasPositive ? 'checkmark-circle' : 'close-circle'}
                size={IconSizes.sm}
                color={hasPositive ? theme.colors.positive : theme.colors.negative}
              />
              <Txt
                size={TextSizes.sm}
                color={hasPositive ? theme.colors.positive : theme.colors.negative}
                font={theme.fonts.bold}
              >
                +{pts} pts
              </Txt>
            </>
          ) : (
            <Txt size={TextSizes.sm} color={theme.colors.text_disabled}>
              — pts
            </Txt>
          )}
        </Row>
      )}
    </CenterCol>
  );
}

function PostponedCenter() {
  const theme = useTheme();
  return (
    <CenterCol>
      <Txt size={TextSizes.sm} color={theme.colors.text_disabled} font={theme.fonts.semi} align="center">
        ADIADO
      </Txt>
    </CenterCol>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface MatchCardProps {
  match: Match;
  prediction?: Prediction | null;
  onPress: () => void;
}

export default function MatchCard({ match, prediction, onPress }: MatchCardProps) {
  const theme = useTheme();
  const { matchStatus } = match;

  return (
    <CardPressable
      onPress={onPress}
      style={({ pressed }: PressableStateCallbackType) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      {matchStatus === 'IN_PROGRESS' && (
        <Badge bg={theme.colors.secondary}>
          <Txt size={TextSizes.xsm} color={theme.colors.white} font={theme.fonts.bold}>
            AO VIVO
          </Txt>
        </Badge>
      )}

      <Row>
        <TeamDisplay team={match.homeTeam} />

        {matchStatus === 'SCHEDULED' && (
          <ScheduledCenter match={match} prediction={prediction} />
        )}
        {matchStatus === 'IN_PROGRESS' && (
          <InProgressCenter match={match} prediction={prediction} />
        )}
        {matchStatus === 'COMPLETED' && (
          <CompletedCenter match={match} prediction={prediction} />
        )}
        {matchStatus === 'POSTPONED' && <PostponedCenter />}

        <TeamDisplay team={match.awayTeam} />
      </Row>
    </CardPressable>
  );
}
