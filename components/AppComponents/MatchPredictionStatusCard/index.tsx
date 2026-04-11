import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import type { DefaultTheme } from 'styled-components/native';
import { rgba } from 'polished';
import { Spaces, BorderRadius } from '@/constants/tokens';
import AppText from '@/components/AppComponents/AppText';
import AppSpacer from '@/components/AppComponents/AppSpacer';
import AppContainer from '@/components/AppComponents/AppContainer';
import AppButton from '@/components/AppComponents/AppButton';

// ─── Types ────────────────────────────────────────────────────────────────────

type MatchPredictionStatusCardProps = {
  poolName: string;
  poolId: number;
  matchId: number;
  matchStatus: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'POSTPONED';
  prediction: {
    id: number;
    predictedHomeScore: number;
    predictedAwayScore: number;
    pointsEarned: number | null;
  } | null;
  userRank: number | null;
  homeTeamCode: string;
  awayTeamCode: string;
  onPressBet: (poolId: number, matchId: number) => void;
};

type CardVariant =
  | 'no-prediction-open'
  | 'prediction-open'
  | 'prediction-live'
  | 'no-prediction-locked'
  | 'prediction-completed';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveVariant(
  matchStatus: string,
  prediction: object | null,
): CardVariant {
  if (matchStatus === 'SCHEDULED') {
    return prediction ? 'prediction-open' : 'no-prediction-open';
  }
  if (matchStatus === 'IN_PROGRESS') {
    return prediction ? 'prediction-live' : 'no-prediction-locked';
  }
  if (matchStatus === 'COMPLETED') {
    return prediction ? 'prediction-completed' : 'no-prediction-locked';
  }
  // POSTPONED
  return 'no-prediction-locked';
}

function resolveResultDisplay(pointsEarned: number | null): {
  isPositive: boolean;
  label: string;
} {
  if (pointsEarned === null) return { isPositive: false, label: 'Em apuração' };
  if (pointsEarned === 0) return { isPositive: false, label: 'Não pontuou' };
  return { isPositive: true, label: 'Pontuou' };
}

// ─── Styled ───────────────────────────────────────────────────────────────────

type WithTheme = { theme: DefaultTheme };
type PointsBadgeStyledProps = { earned: boolean; theme: DefaultTheme };

const Card = styled.View`
  background-color: ${(p: WithTheme) => p.theme.colors.white};
  border-radius: ${BorderRadius.md}px;
  padding: ${Spaces.md}px;
  margin-bottom: ${Spaces.sm}px;
`;

const ScoreRow = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const PointsBadge = styled.View<{ earned: boolean }>`
  background-color: ${(p: PointsBadgeStyledProps) =>
    p.earned ? rgba(p.theme.colors.positive, 0.15) : rgba(p.theme.colors.border, 0.3)};
  border-radius: ${BorderRadius.sm}px;
  padding: ${Spaces.xsm}px ${Spaces.sm}px;
`;

// ─── Shared header row ────────────────────────────────────────────────────────

function HeaderRow({
  poolName,
  userRank,
  colors,
}: {
  poolName: string;
  userRank: number | null;
  colors: DefaultTheme['colors'];
}) {
  return (
    <AppContainer direction="row" justify="space-between" align="center">
      <AppText bold size="md">
        {poolName}
      </AppText>
      {userRank !== null && (
        <AppText size="xsm" color={colors.text_gray}>
          {userRank}º lugar
        </AppText>
      )}
    </AppContainer>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MatchPredictionStatusCard({
  poolName,
  poolId,
  matchId,
  matchStatus,
  prediction,
  userRank,
  homeTeamCode,
  awayTeamCode,
  onPressBet,
}: MatchPredictionStatusCardProps) {
  const { colors } = useTheme();
  const variant = resolveVariant(matchStatus, prediction);
  const teamCodesLabel = `${homeTeamCode} | ${awayTeamCode}`;

  // ── no-prediction-open ────────────────────────────────────────────────────
  if (variant === 'no-prediction-open') {
    return (
      <Card>
        <HeaderRow poolName={poolName} userRank={userRank} colors={colors} />
        <AppSpacer verticalSpace="sm" />
        <AppContainer direction="row" justify="space-between" align="center">
          <AppText size="sm" color={colors.text_gray} style={{ flex: 1 }}>
            Você ainda não apostou neste bolão
          </AppText>
          <AppButton
            variant="solid"
            size="sm"
            title="Apostar agora"
            onPress={() => onPressBet(poolId, matchId)}
          />
        </AppContainer>
      </Card>
    );
  }

  // ── prediction-open ───────────────────────────────────────────────────────
  if (variant === 'prediction-open') {
    return (
      <Card>
        <HeaderRow poolName={poolName} userRank={userRank} colors={colors} />
        <AppSpacer verticalSpace="md" />
        <ScoreRow>
          <AppText bold size="xlg">
            {prediction!.predictedHomeScore}
          </AppText>
          <AppText bold size="xlg" color={colors.text_gray}>
            {' : '}
          </AppText>
          <AppText bold size="xlg">
            {prediction!.predictedAwayScore}
          </AppText>
        </ScoreRow>
        <AppSpacer verticalSpace="sm" />
        <AppContainer direction="row" justify="space-between" align="center">
          <AppText size="xsm" color={colors.text_gray}>
            {teamCodesLabel}
          </AppText>
          <AppButton
            variant="transparent"
            outline
            size="sm"
            title="Editar"
            onPress={() => onPressBet(poolId, matchId)}
          />
        </AppContainer>
      </Card>
    );
  }

  // ── prediction-live ───────────────────────────────────────────────────────
  if (variant === 'prediction-live') {
    return (
      <Card>
        <HeaderRow poolName={poolName} userRank={userRank} colors={colors} />
        <AppSpacer verticalSpace="md" />
        <ScoreRow>
          <AppText bold size="xlg">
            {prediction!.predictedHomeScore}
          </AppText>
          <AppText bold size="xlg" color={colors.text_gray}>
            {' : '}
          </AppText>
          <AppText bold size="xlg">
            {prediction!.predictedAwayScore}
          </AppText>
        </ScoreRow>
        <AppSpacer verticalSpace="sm" />
        <AppContainer direction="row" justify="space-between" align="center">
          <AppText size="xsm" color={colors.text_gray}>
            {teamCodesLabel}
          </AppText>
          <AppText size="xsm" color={colors.text_gray}>
            Aguardando...
          </AppText>
        </AppContainer>
      </Card>
    );
  }

  // ── no-prediction-locked ──────────────────────────────────────────────────
  if (variant === 'no-prediction-locked') {
    const statusLabel =
      matchStatus === 'COMPLETED' ? 'Encerrado' : 'Partida em andamento';
    return (
      <Card>
        <HeaderRow poolName={poolName} userRank={userRank} colors={colors} />
        <AppSpacer verticalSpace="sm" />
        <AppText size="sm" color={colors.text_gray}>
          Você não enviou palpite para este jogo neste bolão.
        </AppText>
        <AppSpacer verticalSpace="sm" />
        <AppContainer direction="row" justify="space-between" align="center">
          <AppText size="xsm" color={colors.text_gray}>
            {statusLabel}
          </AppText>
          <PointsBadge earned={false}>
            <AppText bold size="xsm" color={colors.text_gray}>
              +0 pts
            </AppText>
          </PointsBadge>
        </AppContainer>
      </Card>
    );
  }

  // ── prediction-completed ──────────────────────────────────────────────────
  const { isPositive, label } = resolveResultDisplay(prediction!.pointsEarned);
  const scoreColor = isPositive ? colors.positive : colors.text_gray;
  const pts = prediction!.pointsEarned;

  return (
    <Card>
      <HeaderRow poolName={poolName} userRank={userRank} colors={colors} />
      <AppSpacer verticalSpace="md" />
      <ScoreRow>
        <AppText bold size="xlg" color={scoreColor}>
          {prediction!.predictedHomeScore}
        </AppText>
        <AppText bold size="xlg" color={colors.text_gray}>
          {' : '}
        </AppText>
        <AppText bold size="xlg" color={scoreColor}>
          {prediction!.predictedAwayScore}
        </AppText>
      </ScoreRow>
      <AppSpacer verticalSpace="sm" />
      <AppContainer direction="row" justify="space-between" align="center">
        <AppText size="xsm" color={scoreColor}>
          {label}
        </AppText>
        <PointsBadge earned={isPositive}>
          <AppText
            bold
            size="xsm"
            color={isPositive ? colors.positive : colors.text_gray}
          >
            +{pts ?? 0} pts
          </AppText>
        </PointsBadge>
      </AppContainer>
    </Card>
  );
}
