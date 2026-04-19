import React from 'react';
import type { PressableStateCallbackType } from 'react-native';
import { Image } from 'react-native';
import styled, { type DefaultTheme, useTheme } from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { RFValue } from 'react-native-responsive-fontsize';

import type { Match, Team } from '@/domain/entities/Match';
import type { Prediction } from '@/domain/entities/Prediction';
import { TextSizes, Spaces, BorderRadius, IconSizes } from '@/constants/tokens';

type PoolPredictionMatchCardProps = {
  match: Match;
  prediction?: Prediction | null;
  centerSubtext: string;
  onPress: () => void;
};

const CardPressable = styled.Pressable`
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.white};
  border-radius: ${BorderRadius.md}px;
  padding: ${Spaces.md}px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
`;

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

const StatusBadge = styled.View<{ $status: Match['matchStatus'] }>`
  background-color: ${({
    theme,
    $status,
  }: {
    theme: DefaultTheme;
    $status: Match['matchStatus'];
  }) => {
    if ($status === 'IN_PROGRESS') return theme.colors.secondary;
    if ($status === 'COMPLETED') return theme.colors.shape_dark;
    if ($status === 'POSTPONED') return theme.colors.negative;
    return theme.colors.primary;
  }};
  border-radius: ${BorderRadius.xsm}px;
  padding-horizontal: ${Spaces.xsm}px;
  padding-vertical: 2px;
  align-self: center;
  margin-bottom: ${Spaces.xsm}px;
`;

const FlagImage = styled(Image)`
  width: 32px;
  height: 21px;
  border-radius: 2px;
  margin-bottom: 4px;
`;

function statusLabel(status: Match['matchStatus']): string {
  if (status === 'IN_PROGRESS') return 'AO VIVO';
  if (status === 'COMPLETED') return 'ENCERRADO';
  if (status === 'POSTPONED') return 'ADIADO';
  return 'ABERTO';
}

function formatPoints(points: number): string {
  return `+${Number.isInteger(points) ? points : points.toFixed(1)} pts`;
}

function TeamDisplay({ team }: { team: Team }) {
  return (
    <TeamCol>
      {team.flagUrl && <FlagImage source={{ uri: team.flagUrl }} resizeMode="cover" />}
      <Txt size={TextSizes.sm} align="center" numberOfLines={1} ellipsizeMode="tail">
        {team.countryCode ?? team.name}
      </Txt>
    </TeamCol>
  );
}

function PredictionCenter({
  match,
  prediction,
  centerSubtext,
}: {
  match: Match;
  prediction?: Prediction | null;
  centerSubtext: string;
}) {
  const theme = useTheme();
  const hasPrediction = prediction != null;
  const predictionScore = hasPrediction
    ? `${prediction.predictedHomeScore} : ${prediction.predictedAwayScore}`
    : '—';
  const pointsEarned = prediction?.pointsEarned;
  const hasPoints = pointsEarned != null;

  return (
    <CenterCol>
      {match.matchStatus !== 'SCHEDULED' && (
        <StatusBadge $status={match.matchStatus}>
          <Txt size={TextSizes.xsm} color={theme.colors.white} font={theme.fonts.bold}>
            {statusLabel(match.matchStatus)}
          </Txt>
        </StatusBadge>
      )}
      <Txt
        size={TextSizes.lg}
        color={hasPrediction ? theme.colors.primary : theme.colors.text_disabled}
        font={theme.fonts.display}
        align="center"
        style={{ fontVariant: ['tabular-nums'] }}
      >
        {predictionScore}
      </Txt>
      <Txt size={TextSizes.xsm} color={theme.colors.text_gray} align="center">
        {centerSubtext}
      </Txt>
      {match.matchStatus === 'SCHEDULED' ? (
        <Row justify="center" style={{ gap: 4, marginTop: 4 }}>
          <Ionicons
            name={hasPrediction ? 'create-outline' : 'add-circle-outline'}
            size={IconSizes.xsm}
            color={theme.colors.text_gray}
          />
          <Txt size={TextSizes.xsm} color={theme.colors.text_gray} align="center">
            {hasPrediction ? 'Editar palpite' : 'Fazer palpite'}
          </Txt>
        </Row>
      ) : (
        <>
          {hasPoints && (
            <Txt
              size={TextSizes.xsm}
              color={pointsEarned > 0 ? theme.colors.positive : theme.colors.text_gray}
              font={theme.fonts.bold}
              align="center"
              style={{ marginTop: 4 }}
            >
              {formatPoints(pointsEarned)}
            </Txt>
          )}
          <Txt
            size={TextSizes.xsm}
            color={theme.colors.text_gray}
            align="center"
            style={{ marginTop: hasPoints ? 2 : 4 }}
          >
            Ver palpites do grupo
          </Txt>
        </>
      )}
    </CenterCol>
  );
}

export default function PoolPredictionMatchCard({
  match,
  prediction,
  centerSubtext,
  onPress,
}: PoolPredictionMatchCardProps) {
  return (
    <CardPressable
      onPress={onPress}
      style={({ pressed }: PressableStateCallbackType) => ({
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Row>
        <TeamDisplay team={match.homeTeam} />
        <PredictionCenter
          match={match}
          prediction={prediction}
          centerSubtext={centerSubtext}
        />
        <TeamDisplay team={match.awayTeam} />
      </Row>
    </CardPressable>
  );
}
