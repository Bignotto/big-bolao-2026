import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import styled, { useTheme } from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { RFValue } from 'react-native-responsive-fontsize';

import { useMatch } from '@/hooks/useMatch';
import { useMyMatchPredictions } from '@/hooks/useMyMatchPredictions';
import { isMatchLocked } from '@/domain/entities/Match';
import type { Team } from '@/domain/entities/Match';
import MatchPredictionStatusCard from '@/components/AppComponents/MatchPredictionStatusCard';
import AppText from '@/components/AppComponents/AppText';
import AppSpacer from '@/components/AppComponents/AppSpacer';
import AppButton from '@/components/AppComponents/AppButton';
import { Spaces, BorderRadius, TextSizes, IconSizes } from '@/constants/tokens';

// ─── Styled ───────────────────────────────────────────────────────────────────

const Root = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
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

const HeroCard = styled.View`
  background-color: ${({ theme }) => theme.colors.primary_dark};
  margin-horizontal: ${Spaces.md}px;
  border-radius: ${BorderRadius.lg}px;
  padding: ${Spaces.lg}px ${Spaces.md}px;
  align-items: center;
`;

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

const TeamsRow = styled.View`
  flex-direction: row;
  align-items: center;
  width: 100%;
  justify-content: space-between;
`;

const TeamCol = styled.View`
  width: 35%;
  align-items: center;
  gap: ${Spaces.xsm}px;
`;

const ScoreCol = styled.View`
  flex: 1;
  align-items: center;
`;

const ScoreSeparator = styled.View`
  width: 1px;
  height: 32px;
  background-color: rgba(255,255,255,0.2);
  margin-horizontal: ${Spaces.sm}px;
`;

const StadiumRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${Spaces.xsm}px;
  margin-top: ${Spaces.sm}px;
`;

const PendingBanner = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${Spaces.xsm}px;
  background-color: ${({ theme }) => theme.colors.attention};
  border-radius: ${BorderRadius.sm}px;
  padding: ${Spaces.sm}px ${Spaces.md}px;
  margin-horizontal: ${Spaces.md}px;
  margin-top: ${Spaces.md}px;
`;

const SectionHeader = styled.View`
  padding-horizontal: ${Spaces.md}px;
  padding-top: ${Spaces.lg}px;
  padding-bottom: ${Spaces.sm}px;
`;

const CenteredFill = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding-horizontal: ${Spaces.md}px;
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STAGE_LABELS: Record<string, string> = {
  GROUP: 'Fase de Grupos',
  ROUND_OF_16: 'Oitavas de Final',
  QUARTER_FINAL: 'Quartas de Final',
  SEMI_FINAL: 'Semifinal',
  THIRD_PLACE: '3º Lugar',
  FINAL: 'Final',
  LOSERS_MATCH: 'Repescagem',
};

function TeamDisplay({ team }: { team: Team | undefined | null }) {
  if (!team) return null;
  return (
    <TeamCol>
      {team.flagUrl ? (
        <Image
          source={{ uri: team.flagUrl }}
          style={{ width: 60, height: 40, borderRadius: 3 }}
        />
      ) : null}
      <Txt
        size={TextSizes.md}
        color="#FFFFFF"
        font="Inter_700Bold"
        align="center"
        numberOfLines={2}
      >
        {team.countryCode ?? team.name}
      </Txt>
    </TeamCol>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MatchDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const matchId = Number(id);

  const { data: match, isFetching, isError, refetch } = useMatch(matchId);
  const {
    data: predictions,
    isFetching: isFetchingPredictions,
  } = useMyMatchPredictions(matchId);

  // ── Loading ────────────────────────────────────────────────────────────────

  if (!match && isFetching) {
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
            Erro ao carregar partida.
          </AppText>
          <AppSpacer verticalSpace="md" />
          <AppButton title="Tentar novamente" variant="transparent" onPress={() => refetch()} />
        </CenteredFill>
      </Root>
    );
  }

  // ── Derived values ────────────────────────────────────────────────────────

  const locked = isMatchLocked(match);
  const pending = (predictions ?? []).filter((p) => p.prediction === null);
  const hasPendingBets = pending.length > 0 && !locked;

  const dt = new Date(match.matchDatetime);
  const dateStr = dt.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
  const timeStr = dt.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const stageLabel = STAGE_LABELS[match.stage] ?? match.stage;
  const groupSuffix = match.group ? ` — Grupo ${match.group}` : '';

  // ── Main ──────────────────────────────────────────────────────────────────

  return (
    <Root>
      {/* Nav bar */}
      <NavBar>
        <BackButton onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={IconSizes.md} color={theme.colors.primary} />
        </BackButton>
        <AppText bold size="md">
          {stageLabel}{groupSuffix}
        </AppText>
      </NavBar>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Spaces.xlg * 2 }}
      >
        {/* Hero card */}
        <HeroCard>
          <Txt size={TextSizes.xsm} color="rgba(255,255,255,0.6)" align="center">
            {dateStr} · {timeStr}
          </Txt>
          <AppSpacer verticalSpace="md" />

          <TeamsRow>
            <TeamDisplay team={match.homeTeam} />

            <ScoreCol>
              {match.matchStatus === 'SCHEDULED' || match.matchStatus === 'POSTPONED' ? (
                <Txt size={TextSizes.lg} color="rgba(255,255,255,0.5)" font="Inter_700Bold" align="center">
                  vs
                </Txt>
              ) : (
                <>
                  <Txt size={TextSizes.xlg} color="#FFFFFF" font="Inter_900Black" align="center">
                    {match.homeTeamScore ?? 0}
                  </Txt>
                  <ScoreSeparator />
                  <Txt size={TextSizes.xlg} color="#FFFFFF" font="Inter_900Black" align="center">
                    {match.awayTeamScore ?? 0}
                  </Txt>
                </>
              )}
              {match.matchStatus === 'IN_PROGRESS' && (
                <>
                  <AppSpacer verticalSpace="xsm" />
                  <Txt size={TextSizes.xsm} color={theme.colors.secondary} font="Inter_700Bold" align="center">
                    AO VIVO
                  </Txt>
                </>
              )}
            </ScoreCol>

            <TeamDisplay team={match.awayTeam} />
          </TeamsRow>

          {match.stadium && (
            <StadiumRow>
              <Ionicons name="location-outline" size={IconSizes.sm} color="rgba(255,255,255,0.5)" />
              <Txt size={TextSizes.xsm} color="rgba(255,255,255,0.5)" align="center">
                {match.stadium}
              </Txt>
            </StadiumRow>
          )}
        </HeroCard>

        {/* Pending bets banner */}
        {hasPendingBets && (
          <PendingBanner>
            <Ionicons name="alert-circle" size={IconSizes.sm} color={theme.colors.text_dark} />
            <AppText size="xsm" color={theme.colors.text_dark}>
              Você ainda não apostou em {pending.length}{' '}
              {pending.length === 1 ? 'bolão' : 'bolões'}
            </AppText>
          </PendingBanner>
        )}

        {/* Predictions section */}
        <SectionHeader>
          <AppText bold size="md">
            Seus palpites
          </AppText>
        </SectionHeader>

        {isFetchingPredictions && (predictions ?? []).length === 0 ? (
          <CenteredFill style={{ minHeight: 80 }}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </CenteredFill>
        ) : (predictions ?? []).length === 0 ? (
          <CenteredFill style={{ minHeight: 80 }}>
            <AppText size="sm" color={theme.colors.text_gray} align="center">
              Você não participa de nenhum bolão para este torneio.
            </AppText>
          </CenteredFill>
        ) : (
          <FlatList
            data={predictions}
            keyExtractor={(item) => String(item.poolId)}
            scrollEnabled={false}
            contentContainerStyle={{
              paddingHorizontal: Spaces.md,
              gap: Spaces.sm,
            }}
            renderItem={({ item }) => (
              <MatchPredictionStatusCard
                item={item}
                matchLocked={locked}
                onPredict={(poolId) =>
                  router.push(`/pool/${poolId}/predict?matchId=${match.id}`)
                }
              />
            )}
          />
        )}
      </ScrollView>
    </Root>
  );
}
