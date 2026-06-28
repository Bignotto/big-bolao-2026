import React from 'react';
import styled, { useTheme, type DefaultTheme } from 'styled-components/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BorderRadius, Spaces, TypographyFamilies } from '@/constants/tokens';
import type { FormResult } from '@/domain/helpers/teamForm';

export interface TeamFormGuideProps {
  results: FormResult[];
  teamName?: string;
  isLoading?: boolean;
}

// ─── Styled shells ────────────────────────────────────────────────────────────

const Wrapper = styled.View`
  align-items: center;
  margin-top: ${Spaces.sm}px;
`;

const Caption = styled.Text`
  font-family: ${TypographyFamilies.mono};
  font-size: 10px;
  letter-spacing: 0.8px;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text_gray};
  margin-bottom: ${Spaces.xsm}px;
`;

const ChipRow = styled.View`
  flex-direction: row;
  gap: ${Spaces.xsm}px;
`;

const Chip = styled.View<{ $bg: string }>`
  width: 20px;
  height: 20px;
  border-radius: ${BorderRadius.sm}px;
  background-color: ${({ $bg }: { $bg: string }) => $bg};
  align-items: center;
  justify-content: center;
`;

const DrawSquare = styled.View<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background-color: ${({ $color }: { $color: string }) => $color};
`;

const NoGamesText = styled.Text`
  font-family: ${TypographyFamilies.sans};
  font-size: 10px;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text_disabled};
`;

// ─── Constants ────────────────────────────────────────────────────────────────

// Allowed hard-coded values per spec: rgba track tints only
const TRACK_BG: Record<FormResult, string> = {
  W: 'rgba(74, 222, 128, 0.14)',
  D: 'rgba(255, 135, 44, 0.12)',
  L: 'rgba(240, 74, 80, 0.12)',
};

const PT_RESULT: Record<FormResult, string> = {
  W: 'vitória',
  D: 'empate',
  L: 'derrota',
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function TeamFormGuide({ results, teamName, isLoading = false }: TeamFormGuideProps) {
  const theme = useTheme();

  const glyphColor: Record<FormResult, string> = {
    W: theme.colors.signalWin,
    D: theme.colors.signalAmber,
    L: theme.colors.signalLose,
  };

  if (isLoading) {
    return (
      <Wrapper>
        <Caption>ÚLTIMOS 3</Caption>
        <ChipRow>
          {[0, 1, 2].map((i) => (
            <Chip key={i} $bg={theme.colors.shape_light} />
          ))}
        </ChipRow>
      </Wrapper>
    );
  }

  if (results.length === 0) {
    return (
      <Wrapper>
        <Caption>ÚLTIMOS 3</Caption>
        <NoGamesText>Sem jogos</NoGamesText>
      </Wrapper>
    );
  }

  const a11yLabel = `Últimos jogos${teamName ? ` do ${teamName}` : ''}: ${results.map((r) => PT_RESULT[r]).join(', ')}.`;

  return (
    <Wrapper>
      <Caption>ÚLTIMOS 3</Caption>
      <ChipRow accessible accessibilityRole="image" accessibilityLabel={a11yLabel}>
        {results.map((result, i) => (
          <Chip key={i} $bg={TRACK_BG[result]} accessible={false}>
            {result === 'W' && (
              <Ionicons name="checkmark" size={12} color={glyphColor.W} />
            )}
            {result === 'L' && (
              <Ionicons name="close" size={12} color={glyphColor.L} />
            )}
            {result === 'D' && <DrawSquare $color={glyphColor.D} />}
          </Chip>
        ))}
      </ChipRow>
    </Wrapper>
  );
}
