import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { RFValue } from 'react-native-responsive-fontsize';
import { rgba } from 'polished';
import { TextSizes, Spaces, BorderRadius, IconSizes } from '@/constants/tokens';
import type { MatchPredictionStatus } from '@/domain/entities/MatchPredictionStatus';
import AppButton from '@/components/AppComponents/AppButton';

// ─── Styled ───────────────────────────────────────────────────────────────────

const Card = styled.View`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${BorderRadius.md}px;
  padding: ${Spaces.md}px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

const Row = styled.View<{ justify?: string }>`
  flex-direction: row;
  align-items: center;
  justify-content: ${({ justify }) => justify ?? 'space-between'};
`;

const Txt = styled.Text<{
  size?: number;
  color?: string;
  font?: string;
}>`
  font-family: ${({ theme, font }) => font ?? theme.fonts.regular};
  font-size: ${({ size }) => RFValue(size ?? TextSizes.sm)}px;
  color: ${({ theme, color }) => color ?? theme.colors.text};
`;

const PoolName = styled(Txt)`
  font-family: ${({ theme }) => theme.fonts.bold};
  flex: 1;
  margin-right: ${Spaces.sm}px;
`;

const ScoreText = styled(Txt)`
  font-family: ${({ theme }) => theme.fonts.semi};
`;

const PendingRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${Spaces.xsm}px;
  margin-top: ${Spaces.xsm}px;
`;

const PointsBadge = styled.View<{ positive: boolean }>`
  flex-direction: row;
  align-items: center;
  gap: ${Spaces.xsm}px;
  background-color: ${({ theme, positive }) =>
    positive ? theme.colors.positive_light : theme.colors.negative_light};
  border-radius: ${BorderRadius.xsm}px;
  padding-horizontal: ${Spaces.sm}px;
  padding-vertical: 2px;
`;

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  item: MatchPredictionStatus;
  matchLocked: boolean;
  onPredict: (poolId: number) => void;
}

export default function MatchPredictionStatusCard({
  item,
  matchLocked,
  onPredict,
}: Props) {
  const theme = useTheme();
  const { poolName, poolId, prediction } = item;

  // ── No prediction yet ─────────────────────────────────────────────────────

  if (prediction === null) {
    return (
      <Card>
        <Row>
          <PoolName numberOfLines={1}>{poolName}</PoolName>
          {!matchLocked && (
            <AppButton
              title="Apostar agora"
              variant="primary"
              size="sm"
              onPress={() => onPredict(poolId)}
            />
          )}
        </Row>
        <PendingRow>
          <Ionicons
            name="alert-circle-outline"
            size={IconSizes.sm}
            color={theme.colors.attention}
          />
          <Txt size={TextSizes.xsm} color={theme.colors.text_gray}>
            {matchLocked
              ? 'Jogo encerrado sem palpite'
              : 'Você ainda não apostou neste bolão'}
          </Txt>
        </PendingRow>
      </Card>
    );
  }

  // ── Has prediction ────────────────────────────────────────────────────────

  const score = `${prediction.predictedHomeScore} × ${prediction.predictedAwayScore}`;
  const pts = prediction.pointsEarned;
  const hasPoints = pts != null;
  const positive = hasPoints && pts > 0;

  return (
    <Card>
      <Row>
        <PoolName numberOfLines={1}>{poolName}</PoolName>
        {hasPoints ? (
          <PointsBadge positive={positive}>
            <Ionicons
              name={positive ? 'checkmark-circle' : 'close-circle'}
              size={IconSizes.sm}
              color={positive ? theme.colors.positive : theme.colors.negative}
            />
            <Txt
              size={TextSizes.sm}
              color={positive ? theme.colors.positive : theme.colors.negative}
              font={theme.fonts.bold}
            >
              +{pts} pts
            </Txt>
          </PointsBadge>
        ) : (
          <Txt size={TextSizes.xsm} color={theme.colors.text_disabled}>
            Aguardando resultado
          </Txt>
        )}
      </Row>
      <Row justify="flex-start" style={{ marginTop: Spaces.xsm, gap: Spaces.xsm }}>
        <Ionicons
          name="football-outline"
          size={IconSizes.sm}
          color={theme.colors.primary}
        />
        <ScoreText size={TextSizes.sm} color={theme.colors.primary}>
          {score}
        </ScoreText>
      </Row>
    </Card>
  );
}
