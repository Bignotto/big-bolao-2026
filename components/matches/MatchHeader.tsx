import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import type { DefaultTheme } from 'styled-components/native';
import { rgba } from 'polished';
import AppText from '@/components/AppComponents/AppText';
import AppSpacer from '@/components/AppComponents/AppSpacer';
import AppContainer from '@/components/AppComponents/AppContainer';
import { TeamFlag } from './TeamFlag';
import type { Match } from '@/domain/entities/Match';
import { MatchStage } from '@/domain/enums/MatchStage';
import { MatchStatus } from '@/domain/enums/MatchStatus';
import { Spaces } from '@/constants/tokens';

type MatchHeaderProps = {
  match: Match;
};

const STAGE_LABELS: Record<string, string> = {
  [MatchStage.GROUP]: 'FASE DE GRUPOS',
  [MatchStage.ROUND_OF_16]: 'OITAVAS DE FINAL',
  [MatchStage.QUARTER_FINAL]: 'QUARTAS DE FINAL',
  [MatchStage.SEMI_FINAL]: 'SEMIFINAL',
  [MatchStage.THIRD_PLACE]: 'TERCEIRO LUGAR',
  [MatchStage.FINAL]: 'FINAL',
};

function buildMetadataLine(match: Match): string {
  const parts: string[] = [];
  parts.push(STAGE_LABELS[match.stage] ?? match.stage.replace(/_/g, ' '));
  if (match.stage === MatchStage.GROUP && match.group) {
    parts.push(`GRUPO ${match.group.toUpperCase()}`);
  }
  if (match.stadium) {
    parts.push(match.stadium.toUpperCase());
  }
  return parts.join(' · ');
}

function formatMatchDatetime(isoString: string): string {
  const date = new Date(isoString);
  const tz = 'America/Sao_Paulo';
  const locale = 'pt-BR';
  const weekday = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    timeZone: tz,
  }).format(date);
  const dayMonth = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    timeZone: tz,
  }).format(date);
  const time = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: tz,
    hour12: false,
  }).format(date);
  return `${weekday}, ${dayMonth} · ${time}`;
}

// ─── Styled atoms ─────────────────────────────────────────────────────────────

type WithTheme = { theme: DefaultTheme };

const HeaderContainer = styled.View`
  background-color: ${(p: WithTheme) => p.theme.colors.primary_dark};
  padding-vertical: ${Spaces.lg}px;
  padding-horizontal: ${Spaces.md}px;
  align-items: center;
`;

const TeamCol = styled.View`
  flex: 1;
  align-items: center;
`;

const ScoreRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

type StatusTagStyledProps = { $status: string; theme: DefaultTheme };

const StatusTag = styled.View<{ $status: string }>`
  flex-direction: row;
  align-items: center;
  gap: ${Spaces.xsm}px;
  border-radius: 99px;
  padding: ${Spaces.xsm}px ${Spaces.sm}px;
  background-color: ${(p: StatusTagStyledProps) => {
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

// ─── Component ────────────────────────────────────────────────────────────────

export function MatchHeader({ match }: MatchHeaderProps) {
  const { colors } = useTheme();
  const metadata = buildMetadataLine(match);

  return (
    <HeaderContainer>
      {/* Row 1: metadata line */}
      <AppText size="xsm" color={colors.text_gray} align="center">
        {metadata}
      </AppText>

      <AppSpacer verticalSpace="sm" />

      {/* Row 2: teams + score */}
      <AppContainer
        direction="row"
        justify="space-between"
        align="center"
        style={{ width: '100%' }}
      >
        {/* Home team */}
        <TeamCol>
          <TeamFlag flagUrl={match.homeTeam.flagUrl} teamName={match.homeTeam.name} size="lg" />
          <AppSpacer verticalSpace="xsm" />
          <AppText bold size="md" align="center" color={colors.white}>
            {match.homeTeam.countryCode ?? match.homeTeam.name}
          </AppText>
        </TeamCol>

        {/* Center: VS or score */}
        <TeamCol>
          {(match.matchStatus === MatchStatus.SCHEDULED ||
            match.matchStatus === MatchStatus.POSTPONED) && (
            <AppText bold size="lg" color={colors.text_gray}>
              VS
            </AppText>
          )}
          {(match.matchStatus === MatchStatus.IN_PROGRESS ||
            match.matchStatus === MatchStatus.COMPLETED) && (
            <ScoreRow>
              <AppText bold size="xlg" color={colors.white}>
                {match.homeTeamScore ?? '-'}
              </AppText>
              <AppText bold size="xlg" color={colors.white}>
                {' : '}
              </AppText>
              <AppText bold size="xlg" color={colors.white}>
                {match.awayTeamScore ?? '-'}
              </AppText>
            </ScoreRow>
          )}
        </TeamCol>

        {/* Away team */}
        <TeamCol>
          <TeamFlag flagUrl={match.awayTeam.flagUrl} teamName={match.awayTeam.name} size="lg" />
          <AppSpacer verticalSpace="xsm" />
          <AppText bold size="md" align="center" color={colors.white}>
            {match.awayTeam.countryCode ?? match.awayTeam.name}
          </AppText>
        </TeamCol>
      </AppContainer>

      {/* Row 3: status tag */}
      <AppSpacer verticalSpace="sm" />

      {match.matchStatus === MatchStatus.SCHEDULED && (
        <StatusTag $status="SCHEDULED">
          <AppText size="sm" color={colors.text_gray}>
            {formatMatchDatetime(match.matchDatetime)}
          </AppText>
        </StatusTag>
      )}
      {match.matchStatus === MatchStatus.IN_PROGRESS && (
        <StatusTag $status="IN_PROGRESS">
          <RedDot />
          <AppText size="sm" bold color={colors.positive}>
            Ao vivo
          </AppText>
        </StatusTag>
      )}
      {match.matchStatus === MatchStatus.COMPLETED && (
        <StatusTag $status="COMPLETED">
          <AppText size="sm" color={colors.text_gray}>
            Encerrado
          </AppText>
        </StatusTag>
      )}
      {match.matchStatus === MatchStatus.POSTPONED && (
        <StatusTag $status="POSTPONED">
          <AppText size="sm" color={colors.negative}>
            Adiado
          </AppText>
        </StatusTag>
      )}
    </HeaderContainer>
  );
}
