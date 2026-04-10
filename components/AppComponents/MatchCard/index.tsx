import React from 'react';
import { Image, Pressable } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { RFValue } from 'react-native-responsive-fontsize';
import { rgba } from 'polished';
import { TextSizes, Spaces, BorderRadius, IconSizes } from '@/constants/tokens';
import type { Match, Team } from '@/domain/entities/Match';
import { isMatchLocked } from '@/domain/entities/Match';
import type { Prediction } from '@/domain/entities/Prediction';

// ─── Card shell ───────────────────────────────────────────────────────────────

const CardPressable = styled.Pressable`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${BorderRadius.md}px;
  padding: ${Spaces.md}px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

// ─── Generic text atoms ───────────────────────────────────────────────────────

const Txt = styled.Text<{
  size?: number;
  color?: string;
  font?: string;
  align?: 'left' | 'center' | 'right';
}>`
  font-family: ${({ theme, font }) => font ?? theme.fonts.regular};
  font-size: ${({ size }) => RFValue(size ?? TextSizes.sm)}px;
  color: ${({ theme, color }) => color ?? theme.colors.text};
  text-align: ${({ align }) => align ?? 'left'};
`;

// ─── Row helpers ──────────────────────────────────────────────────────────────

const Row = styled.View<{ justify?: string }>`
  flex-direction: row;
  align-items: center;
  justify-content: ${({ justify }) => justify ?? 'space-between'};
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
  background-color: ${({ bg }) => bg};
  border-radius: ${BorderRadius.xsm}px;
  padding-horizontal: ${Spaces.xsm}px;
  padding-vertical: 2px;
  align-self: flex-end;
  margin-bottom: ${Spaces.xsm}px;
`;

// ─── Team display ─────────────────────────────────────────────────────────────

function TeamDisplay({ team }: { team: Team | undefined | null }) {
  if (!team) {
    return (
      <TeamCol>
        <Txt size={TextSizes.sm} color="#B2BCBF" align="center">
          —
        </Txt>
      </TeamCol>
    );
  }

  const hasFlag = team.flagUrl != null;
  const hasCode = team.countryCode != null && team.countryCode.length > 0;

  return (
    <TeamCol>
      {hasFlag && (
        <Image
          source={{ uri: team.flagUrl! }}
          style={{ width: 24, height: 24, borderRadius: 12, marginBottom: 4 }}
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
  const dt = new Date(match.matchDatetime);
  const timeStr = dt.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const dateStr = dt.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
  const locked = isMatchLocked(match);

  const hasPrediction = prediction != null;
  const predictionLabel = hasPrediction
    ? `${prediction.predictedHomeScore} × ${prediction.predictedAwayScore}`
    : '—';

  return (
    <CenterCol>
      <Row justify="center" style={{ gap: 4 }}>
        <Txt size={TextSizes.sm} color={undefined} align="center">
          {timeStr}
        </Txt>
        {locked && (
          <Ionicons
            name="lock-closed-outline"
            size={IconSizes.xsm}
            // color applied inline — useTheme not available here
            color="#B2BCBF"
          />
        )}
      </Row>
      <Txt size={TextSizes.xsm} color="#5B7485" align="center">
        {dateStr}
      </Txt>
      <Txt
        size={TextSizes.sm}
        color={hasPrediction ? '#065894' : '#B2BCBF'}
        font={hasPrediction ? 'Inter_500Medium' : undefined}
        align="center"
        style={{ marginTop: 4 }}
      >
        {predictionLabel}
      </Txt>
    </CenterCol>
  );
}

function InProgressCenter({ match, prediction }: { match: Match; prediction?: Prediction | null }) {
  const score = `${match.homeTeamScore ?? 0} – ${match.awayTeamScore ?? 0}`;
  const predLabel =
    prediction != null
      ? `Seu palpite: ${prediction.predictedHomeScore} × ${prediction.predictedAwayScore}`
      : 'Sem palpite';

  return (
    <CenterCol>
      <Txt size={TextSizes.lg} font="Inter_700Bold" align="center">
        {score}
      </Txt>
      <Txt size={TextSizes.sm} color="#5B7485" align="center" style={{ marginTop: 2 }}>
        {predLabel}
      </Txt>
    </CenterCol>
  );
}

function CompletedCenter({ match, prediction }: { match: Match; prediction?: Prediction | null }) {
  const score = `${match.homeTeamScore ?? 0} – ${match.awayTeamScore ?? 0}`;
  const pts = prediction?.pointsEarned;
  const hasPts = pts != null;
  const hasPositive = hasPts && pts > 0;

  return (
    <CenterCol>
      <Txt size={TextSizes.lg} font="Inter_700Bold" align="center">
        {score}
      </Txt>
      {prediction != null && (
        <Row justify="center" style={{ gap: 4, marginTop: 4 }}>
          {hasPts ? (
            <>
              <Ionicons
                name={hasPositive ? 'checkmark-circle' : 'close-circle'}
                size={IconSizes.sm}
                color={hasPositive ? '#12A454' : '#E83F5B'}
              />
              <Txt
                size={TextSizes.sm}
                color={hasPositive ? '#12A454' : '#E83F5B'}
                font="Inter_700Bold"
              >
                +{pts} pts
              </Txt>
            </>
          ) : (
            <Txt size={TextSizes.sm} color="#B2BCBF">
              — pts
            </Txt>
          )}
        </Row>
      )}
    </CenterCol>
  );
}

function PostponedCenter() {
  return (
    <CenterCol>
      <Txt size={TextSizes.sm} color="#B2BCBF" font="Inter_500Medium" align="center">
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
  const { matchStatus } = match;

  return (
    <CardPressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      {matchStatus === 'IN_PROGRESS' && (
        <Badge bg="#FF872C">
          <Txt size={TextSizes.xsm} color="#FFFFFF" font="Inter_700Bold">
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
