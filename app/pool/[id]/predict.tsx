import React, { useState } from 'react';
import { Alert, ScrollView, ActivityIndicator, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import styled, { useTheme } from 'styled-components/native';

import { useMatch } from '@/hooks/useMatch';
import { usePool } from '@/hooks/usePool';
import { usePredictions } from '@/hooks/usePredictions';
import { useUpsertPrediction } from '@/hooks/useUpsertPrediction';
import { useSession } from '@/context/SessionContext';
import { isMatchLocked } from '@/domain/entities/Match';
import type { MatchStage } from '@/domain/entities/Match';
import type { PredictionPayload } from '@/domain/entities/Prediction';

import AppText from '@/components/AppComponents/AppText';
import AppButton from '@/components/AppComponents/AppButton';
import AppSpacer from '@/components/AppComponents/AppSpacer';
import ScoreInput from '@/components/AppComponents/ScoreInput';
import { Spaces, BorderRadius } from '@/constants/tokens';

// ─── Stage labels ─────────────────────────────────────────────────────────────

const STAGE_LABELS: Record<MatchStage, string> = {
  GROUP: 'Fase de Grupos',
  ROUND_OF_16: 'Oitavas de Final',
  QUARTER_FINAL: 'Quartas de Final',
  SEMI_FINAL: 'Semifinal',
  THIRD_PLACE: '3º Lugar',
  LOSERS_MATCH: '3º Lugar',
  FINAL: 'Final',
};

// ─── Datetime formatter ───────────────────────────────────────────────────────

function formatMatchDatetime(iso: string): string {
  const date = new Date(iso);
  const datePart = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date);
  const timePart = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
  // Capitalise first letter and strip trailing dot from weekday abbreviation
  const cleaned = datePart.replace(/\.$/, '').replace(/^\w/, (c) => c.toUpperCase());
  return `${cleaned} · ${timePart}`;
}

// ─── Styled ───────────────────────────────────────────────────────────────────

const Root = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const CenteredFill = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const MatchHeader = styled.View`
  align-items: center;
  padding-horizontal: ${Spaces.md}px;
  padding-top: ${Spaces.lg}px;
  padding-bottom: ${Spaces.md}px;
`;

const RulesBox = styled.View`
  background-color: ${({ theme }) => theme.colors.shape_light};
  border-radius: ${BorderRadius.sm}px;
  padding: ${Spaces.sm}px;
  margin-horizontal: ${Spaces.md}px;
`;

const SubmitArea = styled.View`
  padding-horizontal: ${Spaces.md}px;
  padding-bottom: ${Spaces.lg}px;
`;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PredictScreen() {
  const { id, matchId: matchIdParam } = useLocalSearchParams<{
    id: string;
    matchId: string;
  }>();

  const poolId = id ? Number(id) : undefined;
  const matchId = matchIdParam ? Number(matchIdParam) : undefined;

  const router = useRouter();
  const theme = useTheme();
  const { apiUser } = useSession();

  // ── Data ────────────────────────────────────────────────────────────────────

  const { data: match, isLoading: matchLoading } = useMatch(matchId);
  const { pool, loading: poolLoading } = usePool(poolId);
  const { data: predictions, isLoading: predsLoading } = usePredictions(
    poolId,
    matchId != null ? [matchId] : [],
    apiUser?.id,
  );

  const existingPrediction = predictions?.[0] ?? null;

  // ── Form state ───────────────────────────────────────────────────────────────

  const [homeValue, setHomeValue] = useState(
    existingPrediction != null
      ? String(existingPrediction.predictedHomeScore)
      : '',
  );
  const [awayValue, setAwayValue] = useState(
    existingPrediction != null
      ? String(existingPrediction.predictedAwayScore)
      : '',
  );

  // Sync initial values once existing prediction loads
  React.useEffect(() => {
    if (existingPrediction && homeValue === '' && awayValue === '') {
      setHomeValue(String(existingPrediction.predictedHomeScore));
      setAwayValue(String(existingPrediction.predictedAwayScore));
    }
  }, [existingPrediction]);

  const mutation = useUpsertPrediction(poolId!);

  // ── Loading ──────────────────────────────────────────────────────────────────

  if (matchLoading || poolLoading || predsLoading) {
    return (
      <Root>
        <CenteredFill>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </CenteredFill>
      </Root>
    );
  }

  if (!match || !pool) {
    return (
      <Root>
        <CenteredFill>
          <AppText size="sm" color={theme.colors.text_gray} align="center">
            Não foi possível carregar os dados da partida.
          </AppText>
        </CenteredFill>
      </Root>
    );
  }

  // ── Lock guard ───────────────────────────────────────────────────────────────

  const locked = isMatchLocked(match);

  if (locked) {
    return (
      <Root>
        <ScrollView
          contentContainerStyle={{ paddingVertical: Spaces.lg, alignItems: 'center' }}
          showsVerticalScrollIndicator={false}
        >
          <AppText size="lg" bold align="center" style={{ paddingHorizontal: Spaces.md }}>
            {match.homeTeam.name} vs {match.awayTeam.name}
          </AppText>
          <AppSpacer verticalSpace="md" />
          <ScoreInput
            homeTeamName={match.homeTeam.name}
            awayTeamName={match.awayTeam.name}
            homeValue={
              existingPrediction != null
                ? String(existingPrediction.predictedHomeScore)
                : '0'
            }
            awayValue={
              existingPrediction != null
                ? String(existingPrediction.predictedAwayScore)
                : '0'
            }
            onHomeChange={() => {}}
            onAwayChange={() => {}}
            locked
          />
          <AppSpacer verticalSpace="md" />
          <AppText size="sm" color={theme.colors.text_gray} align="center" style={{ paddingHorizontal: Spaces.md }}>
            Este jogo já começou. Palpites encerrados.
          </AppText>
          <AppSpacer verticalSpace="md" />
          <AppButton
            title="Ver partida"
            variant="transparent"
            onPress={() => router.back()}
          />
        </ScrollView>
      </Root>
    );
  }

  // ── Submit ───────────────────────────────────────────────────────────────────

  function handleSubmit() {
    const payload: PredictionPayload = {
      poolId: poolId!,
      matchId: matchId!,
      predictedHomeScore: Number(homeValue),
      predictedAwayScore: Number(awayValue),
      predictedHasExtraTime: false,
      predictedHasPenalties: false,
      predictedPenaltyHomeScore: null,
      predictedPenaltyAwayScore: null,
      predictionId: existingPrediction?.id,
    };
    mutation.mutate(payload, {
      onSuccess: () => router.back(),
      onError: (err) => Alert.alert('Erro', (err as Error).message),
    });
  }

  const canSubmit =
    homeValue.trim().length > 0 &&
    awayValue.trim().length > 0 &&
    !mutation.isPending;

  const rules = pool.scoringRules;
  const isKnockout = match.stage !== 'GROUP';
  const isFinal = match.stage === 'FINAL';

  // ── Form ─────────────────────────────────────────────────────────────────────

  return (
    <Root>
      <ScrollView
        contentContainerStyle={{ paddingBottom: Spaces.lg }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Match header */}
        <MatchHeader>
          <AppText size="lg" bold align="center">
            {match.homeTeam.name} vs {match.awayTeam.name}
          </AppText>
          <AppSpacer verticalSpace="xsm" />
          <AppText size="sm" color={theme.colors.text_gray} align="center">
            {formatMatchDatetime(match.matchDatetime)}
          </AppText>
          <AppSpacer verticalSpace="xsm" />
          <AppText size="xsm" color={theme.colors.text_disabled} align="center">
            {STAGE_LABELS[match.stage]}
          </AppText>
        </MatchHeader>

        {/* Score input */}
        <ScoreInput
          homeTeamName={match.homeTeam.name}
          awayTeamName={match.awayTeam.name}
          homeValue={homeValue}
          awayValue={awayValue}
          onHomeChange={setHomeValue}
          onAwayChange={setAwayValue}
          locked={false}
        />

        <AppSpacer verticalSpace="lg" />

        {/* Scoring rules */}
        {rules && (
          <>
            <AppText
              size="sm"
              bold
              color={theme.colors.text_gray}
              style={{ paddingHorizontal: Spaces.md, marginBottom: Spaces.xsm }}
            >
              Como os pontos funcionam
            </AppText>
            <RulesBox>
              <AppText size="xsm" color={theme.colors.text_gray}>
                Placar exato: {rules.exactScorePoints} pts
              </AppText>
              <AppText size="xsm" color={theme.colors.text_gray}>
                Vencedor + saldo: {rules.correctWinnerGoalDiffPoints} pts
              </AppText>
              <AppText size="xsm" color={theme.colors.text_gray}>
                Vencedor: {rules.correctWinnerPoints} pts
              </AppText>
              <AppText size="xsm" color={theme.colors.text_gray}>
                Empate: {rules.correctDrawPoints} pts
              </AppText>
              {isKnockout && !isFinal && (
                <AppText size="xsm" color={theme.colors.text_gray}>
                  Multiplicador eliminatórias: ×{rules.knockoutMultiplier}
                </AppText>
              )}
              {isFinal && (
                <AppText size="xsm" color={theme.colors.text_gray}>
                  Multiplicador final: ×{rules.finalMultiplier}
                </AppText>
              )}
            </RulesBox>
          </>
        )}

        <AppSpacer verticalSpace="lg" />

        {/* Submit */}
        <SubmitArea>
          <AppButton
            title={existingPrediction ? 'Atualizar palpite' : 'Salvar palpite'}
            variant="solid"
            isLoading={mutation.isPending}
            disabled={!canSubmit}
            onPress={handleSubmit}
          />
        </SubmitArea>
      </ScrollView>
    </Root>
  );
}
