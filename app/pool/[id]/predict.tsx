import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import styled, { useTheme, type DefaultTheme } from 'styled-components/native';

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
import { TeamFlag } from '@/components/matches/TeamFlag';
import { BorderRadius, Spaces } from '@/constants/tokens';

const STAGE_LABELS: Record<MatchStage, string> = {
  GROUP: 'Fase de Grupos',
  ROUND_OF_32: 'Dezesseis avos',
  ROUND_OF_16: 'Oitavas de Final',
  QUARTER_FINAL: 'Quartas de Final',
  SEMI_FINAL: 'Semifinal',
  THIRD_PLACE: '3º Lugar',
  LOSERS_MATCH: '3º Lugar',
  FINAL: 'Final',
};

function formatMatchDatetime(iso: string): string {
  const date = new Date(iso);
  const timeZone = 'America/Sao_Paulo';
  const datePart = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    timeZone,
  }).format(date);
  const timePart = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone,
  }).format(date);
  const cleaned = datePart.replace(/\.$/, '').replace(/^\w/, (c) => c.toUpperCase());
  return `${cleaned} - ${timePart}`;
}

function normalizeScoreInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, 2);
}

function nextScoreValue(value: string, delta: 1 | -1): string {
  const current = value.trim() === '' ? 0 : Number(value);
  return String(Math.max(0, Math.min(99, current + delta)));
}

const Root = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.background};
`;

const CenteredFill = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding-horizontal: ${Spaces.md}px;
`;

const PoolBanner = styled.View`
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.primary};
  border-radius: ${BorderRadius.sm}px;
  padding: ${Spaces.sm}px ${Spaces.md}px;
  margin: ${Spaces.lg}px ${Spaces.md}px 0;
`;

const MatchInfoCard = styled.View`
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.white};
  border-radius: ${BorderRadius.sm}px;
  padding: ${Spaces.lg}px ${Spaces.md}px;
  margin: ${Spaces.md}px ${Spaces.md}px;
  border-width: 1px;
  border-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.shape};
`;

const MatchMeta = styled.View`
  align-items: center;
`;

const TeamsRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: ${Spaces.lg}px;
`;

const TeamBlock = styled.View`
  flex: 1;
  align-items: center;
`;

const VersusBlock = styled.View`
  width: 56px;
  align-items: center;
`;

const DetailsRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${Spaces.xsm}px;
  margin-top: ${Spaces.md}px;
`;

const DetailPill = styled.View`
  border-radius: ${BorderRadius.sm}px;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.shape_light};
  padding: ${Spaces.xsm}px ${Spaces.sm}px;
`;

const Section = styled.View`
  padding-horizontal: ${Spaces.md}px;
`;

const RulesCard = styled.View`
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.white};
  border-radius: ${BorderRadius.sm}px;
  padding: ${Spaces.md}px;
  border-width: 1px;
  border-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.shape};
`;

const RuleRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-vertical: ${Spaces.xsm}px;
`;

const SubmitArea = styled.View`
  padding-horizontal: ${Spaces.md}px;
  padding-bottom: ${Spaces.lg}px;
`;

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

  const { data: match, isLoading: matchLoading } = useMatch(matchId);
  const { pool, loading: poolLoading } = usePool(poolId);
  const { data: predictions, isLoading: predsLoading } = usePredictions(
    poolId,
    matchId != null ? [matchId] : [],
    apiUser?.id,
  );

  const existingPrediction = predictions?.[0] ?? null;
  const [homeValue, setHomeValue] = useState('0');
  const [awayValue, setAwayValue] = useState('0');

  React.useEffect(() => {
    if (existingPrediction) {
      setHomeValue(String(existingPrediction.predictedHomeScore));
      setAwayValue(String(existingPrediction.predictedAwayScore));
    } else {
      setHomeValue('0');
      setAwayValue('0');
    }
  }, [
    matchId,
    existingPrediction?.id,
    existingPrediction?.predictedHomeScore,
    existingPrediction?.predictedAwayScore,
  ]);

  const mutation = useUpsertPrediction(poolId!);

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

  const locked = isMatchLocked(match);
  const rules = pool.scoringRules;
  const stageLabel = STAGE_LABELS[match.stage] ?? match.stage.replace(/_/g, ' ');
  const groupLabel = match.stage === 'GROUP' && match.group ? `Grupo ${match.group}` : null;
  const stadiumLabel = match.stadium ?? 'Estádio a definir';

  const canSubmit =
    !locked &&
    homeValue.trim().length > 0 &&
    awayValue.trim().length > 0 &&
    /^\d{1,2}$/.test(homeValue.trim()) &&
    /^\d{1,2}$/.test(awayValue.trim()) &&
    !mutation.isPending;

  function handleHomeChange(value: string) {
    setHomeValue(normalizeScoreInput(value));
  }

  function handleAwayChange(value: string) {
    setAwayValue(normalizeScoreInput(value));
  }

  function handleSubmit() {
    if (locked) {
      Alert.alert('Palpites encerrados', 'Este jogo já começou.');
      return;
    }

    if (!canSubmit) {
      Alert.alert('Palpite inválido', 'Informe placares entre 0 e 99 para os dois times.');
      return;
    }

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

  return (
    <Root>
      <ScrollView
        contentContainerStyle={{ paddingBottom: Spaces.lg }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <PoolBanner>
          <AppText size="xsm" color={theme.colors.primary_light} align="center">
            Você está apostando no bolão
          </AppText>
          <AppSpacer verticalSpace="xsm" />
          <AppText size="md" bold color={theme.colors.white} align="center">
            {pool.name}
          </AppText>
        </PoolBanner>

        <MatchInfoCard>
          <MatchMeta>
            <AppText size="xsm" bold color={theme.colors.primary} align="center">
              {stageLabel.toUpperCase()}
            </AppText>
            <AppSpacer verticalSpace="xsm" />
            <AppText size="sm" color={theme.colors.text_gray} align="center">
              {formatMatchDatetime(match.matchDatetime)}
            </AppText>
          </MatchMeta>

          <TeamsRow>
            <TeamBlock>
              <TeamFlag
                flagUrl={match.homeTeam.flagUrl}
                teamName={match.homeTeam.name}
                size="lg"
              />
              <AppSpacer verticalSpace="sm" />
              <AppText size="md" bold align="center">
                {match.homeTeam.countryCode ?? match.homeTeam.name}
              </AppText>
              <AppText size="xsm" color={theme.colors.text_gray} align="center">
                {match.homeTeam.name}
              </AppText>
            </TeamBlock>

            <VersusBlock>
              <AppText size="lg" bold color={theme.colors.text_disabled} align="center">
                x
              </AppText>
            </VersusBlock>

            <TeamBlock>
              <TeamFlag
                flagUrl={match.awayTeam.flagUrl}
                teamName={match.awayTeam.name}
                size="lg"
              />
              <AppSpacer verticalSpace="sm" />
              <AppText size="md" bold align="center">
                {match.awayTeam.countryCode ?? match.awayTeam.name}
              </AppText>
              <AppText size="xsm" color={theme.colors.text_gray} align="center">
                {match.awayTeam.name}
              </AppText>
            </TeamBlock>
          </TeamsRow>

          <DetailsRow>
            {groupLabel && (
              <DetailPill>
                <AppText size="xsm" color={theme.colors.text_gray}>
                  {groupLabel}
                </AppText>
              </DetailPill>
            )}
            <DetailPill>
              <AppText size="xsm" color={theme.colors.text_gray}>
                {stadiumLabel}
              </AppText>
            </DetailPill>
          </DetailsRow>
        </MatchInfoCard>

        <ScoreInput
          homeTeamName={match.homeTeam.name}
          awayTeamName={match.awayTeam.name}
          homeValue={homeValue}
          awayValue={awayValue}
          onHomeChange={handleHomeChange}
          onAwayChange={handleAwayChange}
          onHomeIncrement={() => setHomeValue((value) => nextScoreValue(value, 1))}
          onHomeDecrement={() => setHomeValue((value) => nextScoreValue(value, -1))}
          onAwayIncrement={() => setAwayValue((value) => nextScoreValue(value, 1))}
          onAwayDecrement={() => setAwayValue((value) => nextScoreValue(value, -1))}
          locked={locked}
        />

        <AppSpacer verticalSpace="lg" />

        {locked && (
          <Section>
            <AppText size="sm" color={theme.colors.text_gray} align="center">
              Este jogo já começou. Palpites encerrados.
            </AppText>
          </Section>
        )}

        {rules && (
          <>
            <AppSpacer verticalSpace="md" />
            <Section>
              <AppText
                size="sm"
                bold
                color={theme.colors.text_gray}
                style={{ marginBottom: Spaces.xsm }}
              >
                Como os pontos funcionam
              </AppText>
              <RulesCard>
                <RuleRow>
                  <AppText size="xsm" color={theme.colors.text_gray}>
                    Placar exato
                  </AppText>
                  <AppText size="xsm" bold>
                    {rules.exactScorePoints} pts
                  </AppText>
                </RuleRow>
                <RuleRow>
                  <AppText size="xsm" color={theme.colors.text_gray}>
                    Vencedor + saldo
                  </AppText>
                  <AppText size="xsm" bold>
                    {rules.correctWinnerGoalDiffPoints} pts
                  </AppText>
                </RuleRow>
                <RuleRow>
                  <AppText size="xsm" color={theme.colors.text_gray}>
                    Vencedor
                  </AppText>
                  <AppText size="xsm" bold>
                    {rules.correctWinnerPoints} pts
                  </AppText>
                </RuleRow>
                <RuleRow>
                  <AppText size="xsm" color={theme.colors.text_gray}>
                    Empate
                  </AppText>
                  <AppText size="xsm" bold>
                    {rules.correctDrawPoints} pts
                  </AppText>
                </RuleRow>
                <RuleRow>
                  <AppText size="xsm" color={theme.colors.text_gray}>
                    Multiplicador eliminatórias
                  </AppText>
                  <AppText size="xsm" bold>
                    x{rules.knockoutMultiplier}
                  </AppText>
                </RuleRow>
                <RuleRow>
                  <AppText size="xsm" color={theme.colors.text_gray}>
                    Multiplicador final
                  </AppText>
                  <AppText size="xsm" bold>
                    x{rules.finalMultiplier}
                  </AppText>
                </RuleRow>
              </RulesCard>
            </Section>
          </>
        )}

        <AppSpacer verticalSpace="lg" />

        <SubmitArea>
          {locked ? (
            <AppButton
              title="Ver partida"
              variant="transparent"
              onPress={() => router.back()}
            />
          ) : (
            <AppButton
              title={existingPrediction ? 'Atualizar palpite' : 'Salvar palpite'}
              variant="solid"
              isLoading={mutation.isPending}
              disabled={!canSubmit}
              onPress={handleSubmit}
            />
          )}
        </SubmitArea>
      </ScrollView>
    </Root>
  );
}
