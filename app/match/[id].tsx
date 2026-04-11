import React from 'react';
import { ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import styled, { useTheme } from 'styled-components/native';
import type { DefaultTheme } from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';

import { useMatch } from '@/hooks/useMatch';
import { useMyMatchPredictions } from '@/hooks/useMyMatchPredictions';
import { MatchHeader } from '@/components/matches/MatchHeader';
import MatchPredictionStatusCard from '@/components/AppComponents/MatchPredictionStatusCard';
import AppText from '@/components/AppComponents/AppText';
import AppSpacer from '@/components/AppComponents/AppSpacer';
import AppButton from '@/components/AppComponents/AppButton';
import { Spaces, IconSizes } from '@/constants/tokens';

// ─── Styled ───────────────────────────────────────────────────────────────────

type WithTheme = { theme: DefaultTheme };

const Root = styled(SafeAreaView)`
  flex: 1;
  background-color: ${(p: WithTheme) => p.theme.colors.background};
`;

const NavBar = styled.View`
  flex-direction: row;
  align-items: center;
  padding-horizontal: ${Spaces.md}px;
  padding-vertical: ${Spaces.sm}px;
`;

const BackButton = styled.Pressable`
  margin-right: ${Spaces.sm}px;
`;

const CenteredFill = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding-horizontal: ${Spaces.md}px;
`;

const PredictionsSection = styled.View`
  padding-horizontal: ${Spaces.md}px;
  padding-vertical: ${Spaces.md}px;
`;

const MissingBanner = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.primary_light}33;
  border-radius: 8px;
  padding: ${Spaces.sm}px ${Spaces.md}px;
`;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MatchDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const matchId = Number(id);

  const { data: match, isLoading: matchLoading, isError, refetch } = useMatch(matchId);
  const { data: predictions, isLoading: predictionsLoading } = useMyMatchPredictions(matchId);
  const missingPredictionsCount =
    predictions?.filter((entry) => entry.prediction === null).length ?? 0;

  function handleNavigateToPredictionForm(poolId: number, mId: number) {
    router.push(`/pool/${poolId}/predict?matchId=${mId}`);
  }

  // ── Loading ────────────────────────────────────────────────────────────────

  if (matchLoading && !match) {
    return (
      <Root>
        <CenteredFill>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </CenteredFill>
      </Root>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────

  if (isError || !match) {
    return (
      <Root>
        <NavBar>
          <BackButton onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={IconSizes.md} color={theme.colors.primary} />
          </BackButton>
        </NavBar>
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

  // ── Main ──────────────────────────────────────────────────────────────────

  return (
    <Root>
      <NavBar>
        <BackButton onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={IconSizes.md} color={theme.colors.primary} />
        </BackButton>
      </NavBar>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Spaces.xlg * 2 }}
      >
        <MatchHeader match={match} />

        <PredictionsSection>
          <AppText size="xsm" color={theme.colors.text_gray}>
            MEUS PALPITES POR BOLÃO
          </AppText>

          {!predictionsLoading && missingPredictionsCount > 0 && (
            <>
              <AppSpacer verticalSpace="xsm" />
              <MissingBanner>
                <Ionicons name="alert-circle-outline" size={18} color={theme.colors.primary} />
                <AppText size="sm" color={theme.colors.primary} style={{ marginLeft: 8, flex: 1 }}>
                  Falta apostar em {missingPredictionsCount}{' '}
                  {missingPredictionsCount === 1 ? 'bolão' : 'bolões'}.
                </AppText>
              </MissingBanner>
            </>
          )}

          <AppSpacer verticalSpace="sm" />

          {predictionsLoading && (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          )}

          {!predictionsLoading && (predictions ?? []).length === 0 && (
            <AppText size="sm" color={theme.colors.text_gray} align="center">
              Você não participa de nenhum bolão para este torneio.
            </AppText>
          )}

          {predictions?.map((entry) => (
            <MatchPredictionStatusCard
              key={entry.poolId}
              poolName={entry.poolName}
              poolId={entry.poolId}
              matchId={matchId}
              matchStatus={match.matchStatus}
              prediction={entry.prediction}
              userRank={entry.userRank}
              homeTeamCode={match.homeTeam.countryCode ?? match.homeTeam.name}
              awayTeamCode={match.awayTeam.countryCode ?? match.awayTeam.name}
              onPressBet={handleNavigateToPredictionForm}
            />
          ))}
        </PredictionsSection>
      </ScrollView>
    </Root>
  );
}
