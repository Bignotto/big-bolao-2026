import React from 'react';
import { ActivityIndicator, FlatList, RefreshControl, SafeAreaView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import styled, { type DefaultTheme, useTheme } from 'styled-components/native';
import { rgba } from 'polished';

import { useMatch } from '@/hooks/useMatch';
import { usePool, type ScoringRule } from '@/hooks/usePool';
import { usePoolMembers } from '@/hooks/usePoolMembers';
import { usePoolMatchPredictions } from '@/hooks/usePoolMatchPredictions';
import type { Match } from '@/domain/entities/Match';
import { MatchStage, STAGE_LABELS } from '@/domain/enums/MatchStage';
import { MatchStatus } from '@/domain/enums/MatchStatus';
import type { PoolMatchPredictionEntry } from '@/domain/entities/PoolMatchPrediction';
import AppAvatar from '@/components/AppComponents/AppAvatar';
import AppText from '@/components/AppComponents/AppText';
import AppSpacer from '@/components/AppComponents/AppSpacer';
import AppButton from '@/components/AppComponents/AppButton';
import { TeamFlag } from '@/components/matches/TeamFlag';
import { Spaces, BorderRadius } from '@/constants/tokens';

type WithTheme = { theme: DefaultTheme };
type StatusTagProps = { $status: Match['matchStatus']; theme: DefaultTheme };
type PointsBadgeProps = { $earned: boolean; theme: DefaultTheme };

const Root = styled(SafeAreaView)`
  flex: 1;
  background-color: ${(p: WithTheme) => p.theme.colors.background};
`;

const CenteredFill = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding-horizontal: ${Spaces.md}px;
`;

const HeaderContainer = styled.View`
  background-color: ${(p: WithTheme) => p.theme.colors.primary_dark};
  padding-vertical: ${Spaces.lg}px;
  padding-horizontal: ${Spaces.md}px;
  align-items: center;
`;

const TeamRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const TeamCol = styled.View`
  flex: 1;
  align-items: center;
`;

const StatusTag = styled.View<{ $status: Match['matchStatus'] }>`
  flex-direction: row;
  align-items: center;
  gap: ${Spaces.xsm}px;
  border-radius: 99px;
  padding: ${Spaces.xsm}px ${Spaces.sm}px;
  background-color: ${(p: StatusTagProps) => {
    if (p.$status === 'IN_PROGRESS') return rgba(p.theme.colors.positive, 0.2);
    if (p.$status === 'POSTPONED') return rgba(p.theme.colors.negative, 0.2);
    return rgba(p.theme.colors.white, 0.12);
  }};
`;

const RedDot = styled.View`
  width: 7px;
  height: 7px;
  border-radius: 4px;
  background-color: ${(p: WithTheme) => p.theme.colors.negative};
`;

const SectionTitle = styled.View`
  padding-horizontal: ${Spaces.md}px;
  padding-top: ${Spaces.md}px;
  padding-bottom: ${Spaces.sm}px;
`;

const PredictionRow = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${(p: WithTheme) => p.theme.colors.white};
  border-radius: ${BorderRadius.md}px;
  padding: ${Spaces.md}px;
`;

const ParticipantInfo = styled.View`
  flex: 1;
  margin-left: ${Spaces.sm}px;
  margin-right: ${Spaces.sm}px;
`;

const PredictionScore = styled.View`
  align-items: flex-end;
`;

const PointsBadge = styled.View<{ $earned: boolean }>`
  background-color: ${(p: PointsBadgeProps) =>
    p.$earned ? rgba(p.theme.colors.positive, 0.15) : rgba(p.theme.colors.border, 0.3)};
  border-radius: ${BorderRadius.sm}px;
  padding: ${Spaces.xsm}px ${Spaces.sm}px;
  margin-top: ${Spaces.xsm}px;
`;

const LIST_CONTENT = {
  paddingHorizontal: Spaces.md,
  paddingBottom: Spaces.xlg,
  flexGrow: 1,
} as const;

function formatMatchDatetime(isoString: string): string {
  const date = new Date(isoString);
  const weekday = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    timeZone: 'America/Sao_Paulo',
  }).format(date);
  const dayMonth = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(date);
  const time = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
    hour12: false,
  }).format(date);
  return `${weekday.replace(/\.$/, '')}, ${dayMonth} · ${time}`;
}

function metadataLine(match: Match): string {
  const parts = [STAGE_LABELS[match.stage as MatchStage] ?? match.stage];
  if (match.stage === MatchStage.GROUP && match.group) {
    parts.push(`Grupo ${match.group}`);
  }
  return parts.join(' · ');
}

function statusLabel(status: Match['matchStatus']): string {
  if (status === MatchStatus.IN_PROGRESS) return 'Ao vivo';
  if (status === MatchStatus.COMPLETED) return 'Encerrado';
  if (status === MatchStatus.POSTPONED) return 'Adiado';
  return 'Agendado';
}

function resultLabel(match: Match): string {
  if (
    (match.matchStatus === MatchStatus.IN_PROGRESS ||
      match.matchStatus === MatchStatus.COMPLETED) &&
    match.homeTeamScore != null &&
    match.awayTeamScore != null
  ) {
    return `${match.homeTeamScore} : ${match.awayTeamScore}`;
  }

  return 'VS';
}

function scoreOutcome(homeScore: number, awayScore: number): 'HOME' | 'AWAY' | 'DRAW' {
  if (homeScore > awayScore) return 'HOME';
  if (awayScore > homeScore) return 'AWAY';
  return 'DRAW';
}

function phaseMultiplier(match: Match, rules: ScoringRule): number {
  if (match.stage === MatchStage.FINAL) return rules.finalMultiplier;
  if (match.stage !== MatchStage.GROUP) return rules.knockoutMultiplier;
  return 1;
}

function formatPoints(points: number | null): string {
  if (points == null) return 'Em apuração';
  return `+${Number.isInteger(points) ? points : points.toFixed(1)} pts`;
}

function calculatePredictionPoints(
  entry: PoolMatchPredictionEntry,
  match: Match,
  rules: ScoringRule | null | undefined,
): number | null {
  const prediction = entry.prediction;
  if (!prediction) return 0;
  if (prediction.pointsEarned != null) return prediction.pointsEarned;
  if (match.homeTeamScore == null || match.awayTeamScore == null || !rules) return null;

  const actualHome = match.homeTeamScore;
  const actualAway = match.awayTeamScore;
  const predictedHome = prediction.predictedHomeScore;
  const predictedAway = prediction.predictedAwayScore;

  let basePoints = 0;
  if (predictedHome === actualHome && predictedAway === actualAway) {
    basePoints = rules.exactScorePoints;
  } else {
    const actualOutcome = scoreOutcome(actualHome, actualAway);
    const predictedOutcome = scoreOutcome(predictedHome, predictedAway);

    if (actualOutcome === predictedOutcome) {
      if (actualOutcome === 'DRAW') {
        basePoints = rules.correctDrawPoints;
      } else if (predictedHome - predictedAway === actualHome - actualAway) {
        basePoints = rules.correctWinnerGoalDiffPoints;
      } else {
        basePoints = rules.correctWinnerPoints;
      }
    }
  }

  return basePoints * phaseMultiplier(match, rules);
}

function MatchPredictionHeader({ match }: { match: Match }) {
  const { colors } = useTheme();

  return (
    <HeaderContainer>
      <AppText size="xsm" color={colors.text_gray} align="center">
        {metadataLine(match).toUpperCase()}
      </AppText>

      <AppSpacer verticalSpace="sm" />

      <TeamRow>
        <TeamCol>
          <TeamFlag flagUrl={match.homeTeam.flagUrl} teamName={match.homeTeam.name} size="lg" />
          <AppSpacer verticalSpace="xsm" />
          <AppText bold size="md" align="center" color={colors.white}>
            {match.homeTeam.countryCode ?? match.homeTeam.name}
          </AppText>
        </TeamCol>

        <TeamCol>
          <AppText
            bold
            size={
              match.matchStatus === MatchStatus.IN_PROGRESS ||
              match.matchStatus === MatchStatus.COMPLETED
                ? 'xlg'
                : 'lg'
            }
            color={
              match.matchStatus === MatchStatus.IN_PROGRESS ||
              match.matchStatus === MatchStatus.COMPLETED
                ? colors.white
                : colors.text_gray
            }
          >
            {resultLabel(match)}
          </AppText>
          <AppText size="xsm" color={colors.text_gray} align="center">
            {formatMatchDatetime(match.matchDatetime)}
          </AppText>
        </TeamCol>

        <TeamCol>
          <TeamFlag flagUrl={match.awayTeam.flagUrl} teamName={match.awayTeam.name} size="lg" />
          <AppSpacer verticalSpace="xsm" />
          <AppText bold size="md" align="center" color={colors.white}>
            {match.awayTeam.countryCode ?? match.awayTeam.name}
          </AppText>
        </TeamCol>
      </TeamRow>

      <AppSpacer verticalSpace="sm" />

      <StatusTag $status={match.matchStatus}>
        {match.matchStatus === MatchStatus.IN_PROGRESS && <RedDot />}
        <AppText
          size="sm"
          bold={match.matchStatus === MatchStatus.IN_PROGRESS}
          color={
            match.matchStatus === MatchStatus.IN_PROGRESS
              ? colors.positive
              : match.matchStatus === MatchStatus.POSTPONED
                ? colors.negative
                : colors.text_gray
          }
        >
          {statusLabel(match.matchStatus)}
        </AppText>
      </StatusTag>
    </HeaderContainer>
  );
}

function PredictionListRow({
  entry,
  match,
  points,
}: {
  entry: PoolMatchPredictionEntry;
  match: Match;
  points: number | null;
}) {
  const { colors } = useTheme();
  const prediction = entry.prediction;
  const hasPrediction = prediction != null;
  const name = entry.user.fullName || 'Participante';
  const earned = points != null && points > 0;

  return (
    <PredictionRow>
      <AppAvatar imagePath={entry.user.profileImageUrl ?? undefined} name={name} size={40} />
      <ParticipantInfo>
        <AppText bold size="sm" numberOfLines={1}>
          {name}
        </AppText>
        {entry.rank != null ? (
          <AppText size="xsm" color={colors.text_gray}>
            {entry.rank}º lugar
          </AppText>
        ) : (
          <AppText size="xsm" color={colors.text_gray}>
            Sem ranking
          </AppText>
        )}
      </ParticipantInfo>

      <PredictionScore>
        <AppText
          bold={hasPrediction}
          size={hasPrediction ? 'lg' : 'md'}
          color={hasPrediction ? colors.text : colors.text_disabled}
          align="right"
        >
          {hasPrediction
            ? `${prediction.predictedHomeScore} : ${prediction.predictedAwayScore}`
            : '—'}
        </AppText>

        {match.matchStatus === MatchStatus.COMPLETED ||
        match.matchStatus === MatchStatus.IN_PROGRESS ? (
          <PointsBadge $earned={earned}>
            <AppText bold size="xsm" color={earned ? colors.positive : colors.text_gray}>
              {formatPoints(points)}
            </AppText>
          </PointsBadge>
        ) : (
          <AppText size="xsm" color={colors.text_gray} align="right">
            {hasPrediction ? 'Aguardando...' : 'Sem palpite'}
          </AppText>
        )}
      </PredictionScore>
    </PredictionRow>
  );
}

export default function PoolMatchPredictionsScreen() {
  const theme = useTheme();
  const { id, matchId: matchIdParam } = useLocalSearchParams<{
    id: string;
    matchId: string;
  }>();

  const poolId = id ? Number(id) : undefined;
  const matchId = matchIdParam ? Number(matchIdParam) : undefined;
  const { data: match, isLoading: matchLoading, isError, refetch } = useMatch(matchId);
  const { pool } = usePool(poolId);
  const { members } = usePoolMembers(poolId);
  const {
    predictions,
    loading: predictionsLoading,
    isFetching: predictionsFetching,
    error: predictionsError,
    refresh,
  } = usePoolMatchPredictions(poolId, matchId);

  const membersById = React.useMemo(() => {
    const map = new Map<string, (typeof members)[number]>();
    for (const member of members) {
      map.set(member.id, member);
    }
    return map;
  }, [members]);

  const displayPredictions = React.useMemo(
    () =>
      predictions.map((entry) => {
        const member = membersById.get(entry.userId) ?? membersById.get(entry.user.id);
        if (!member) return entry;

        return {
          ...entry,
          user: {
            ...entry.user,
            fullName:
              entry.user.fullName !== 'Participante'
                ? entry.user.fullName
                : member.fullName ?? member.name ?? entry.user.fullName,
            profileImageUrl: entry.user.profileImageUrl ?? member.profileImageUrl,
          },
        };
      }),
    [membersById, predictions],
  );

  const isInitialLoading = (matchLoading && !match) || predictionsLoading;

  if (isInitialLoading) {
    return (
      <Root>
        <CenteredFill>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </CenteredFill>
      </Root>
    );
  }

  if (isError || !match) {
    return (
      <Root>
        <CenteredFill>
          <AppText size="sm" color={theme.colors.text_gray} align="center">
            Não foi possível carregar o jogo.
          </AppText>
          <AppSpacer verticalSpace="md" />
          <AppButton title="Tentar novamente" variant="transparent" onPress={() => refetch()} />
        </CenteredFill>
      </Root>
    );
  }

  return (
    <Root>
      <MatchPredictionHeader match={match} />

      <SectionTitle>
        <AppText size="xsm" color={theme.colors.text_gray}>
          PARTICIPANTES
        </AppText>
        {predictionsError != null && (
          <>
            <AppSpacer verticalSpace="xsm" />
            <AppText size="sm" color={theme.colors.negative}>
              {predictionsError}
            </AppText>
          </>
        )}
      </SectionTitle>

      <FlatList<PoolMatchPredictionEntry>
        data={displayPredictions}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={LIST_CONTENT}
        refreshControl={
          <RefreshControl
            refreshing={predictionsFetching}
            onRefresh={refresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ItemSeparatorComponent={() => <AppSpacer verticalSpace="xsm" />}
        ListEmptyComponent={
          <CenteredFill>
            <AppText size="sm" color={theme.colors.text_gray} align="center">
              Nenhum participante encontrado.
            </AppText>
          </CenteredFill>
        }
        renderItem={({ item }) => (
          <PredictionListRow
            entry={item}
            match={match}
            points={calculatePredictionPoints(item, match, pool?.scoringRules)}
          />
        )}
      />
    </Root>
  );
}
