import React, { useState } from 'react';
import { Pressable, Text } from 'react-native';
import styled, { useTheme, type DefaultTheme } from 'styled-components/native';
import { TypographyFamilies } from '@/constants/tokens';
import type { MatchPredictionBreakdown } from '@/domain/entities/MatchPredictionBreakdown';
import { toPercentages } from '@/domain/helpers/predictionOutcome';

export interface MatchOddsBarProps {
  homeName: string;
  awayName: string;
  pool?: MatchPredictionBreakdown;
  global?: MatchPredictionBreakdown;
  myPick?: 'HOME' | 'DRAW' | 'AWAY';
  isLoading?: boolean;
}

type Outcome = 'HOME' | 'DRAW' | 'AWAY';
type Scope = 'pool' | 'global';

const EMPTY: MatchPredictionBreakdown = { homeCount: 0, drawCount: 0, awayCount: 0, total: 0 };
const MIN_PALPITES = 5;

// ─── Styled shells ────────────────────────────────────────────────────────────

const Card = styled.View`
  border-radius: 14px;
  border-width: 1px;
  border-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.ink700};
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.ink900};
  padding: 14px;
`;

const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const Toggle = styled.View`
  flex-direction: row;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.ink800};
  border-radius: 6px;
  padding: 2px;
  gap: 1px;
`;

const CountLabel = styled.Text`
  font-family: ${TypographyFamilies.mono};
  font-size: 10px;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.ink400};
`;

const Bar = styled.View`
  flex-direction: row;
  height: 52px;
  gap: 4px;
`;

const Segment = styled.View<{ $flex: number; $bg: string; $borderColor?: string }>`
  flex: ${({ $flex }: { $flex: number }) => $flex};
  background-color: ${({ $bg }: { $bg: string }) => $bg};
  border-radius: 11px;
  align-items: center;
  justify-content: center;
  border-width: ${({ $borderColor }: { $borderColor?: string }) => ($borderColor ? 1 : 0)}px;
  border-color: ${({ $borderColor }: { $borderColor?: string }) => $borderColor ?? 'transparent'};
`;

const EmptyBar = styled.View`
  height: 52px;
  border-radius: 11px;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.ink800};
  align-items: center;
  justify-content: center;
`;

const CaptionRow = styled.View`
  flex-direction: row;
  margin-top: 8px;
  gap: 4px;
`;

const CaptionCell = styled.View<{ $flex: number }>`
  flex: ${({ $flex }: { $flex: number }) => $flex};
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4px;
  overflow: hidden;
`;

const Dot = styled.View<{ $color: string }>`
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: ${({ $color }: { $color: string }) => $color};
  flex-shrink: 0;
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function numeralSize(pct: number): number {
  if (pct >= 20) return 26;
  if (pct >= 10) return 20;
  return 16;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function MatchOddsBar({
  homeName,
  awayName,
  pool,
  global: globalData,
  myPick,
  isLoading = false,
}: MatchOddsBarProps) {
  const theme = useTheme();
  const [scope, setScope] = useState<Scope>('global');

  const activeBreakdown = scope === 'global' ? (globalData ?? EMPTY) : (pool ?? EMPTY);
  const { homePct, drawPct, awayPct } = toPercentages(activeBreakdown);
  const { total } = activeBreakdown;

  const homeIsWinner = homePct >= awayPct;

  const config: Record<
    Outcome,
    { pct: number; fillColor: string; dimColor: string; dimBorder: string; label: string }
  > = {
    HOME: {
      pct: homePct,
      fillColor: homeIsWinner ? theme.colors.positive : theme.colors.negative,
      dimColor: homeIsWinner ? 'rgba(74, 222, 128, 0.45)' : 'rgba(240, 74, 80, 0.45)',
      dimBorder: homeIsWinner ? 'rgba(74, 222, 128, 0.75)' : 'rgba(240, 74, 80, 0.75)',
      label: `Vit. ${homeName}`,
    },
    DRAW: {
      pct: drawPct,
      fillColor: theme.colors.secondary,
      dimColor: 'rgba(255, 176, 32, 0.45)',
      dimBorder: 'rgba(255, 176, 32, 0.75)',
      label: 'Empate',
    },
    AWAY: {
      pct: awayPct,
      fillColor: homeIsWinner ? theme.colors.negative : theme.colors.positive,
      dimColor: homeIsWinner ? 'rgba(240, 74, 80, 0.45)' : 'rgba(74, 222, 128, 0.45)',
      dimBorder: homeIsWinner ? 'rgba(240, 74, 80, 0.75)' : 'rgba(74, 222, 128, 0.75)',
      label: `Vit. ${awayName}`,
    },
  };

  const outcomes: Outcome[] = ['HOME', 'DRAW', 'AWAY'];

  const dominantOutcome = outcomes.reduce((best, o) =>
    config[o].pct > config[best].pct ? o : best,
  );

  const a11yLabel = `Palpites ${scope === 'global' ? 'gerais' : 'do grupo'}: ${homePct} por cento vitória do ${homeName}, ${drawPct} por cento empate, ${awayPct} por cento vitória do ${awayName}.`;

  function ScopeBtn({ value, label }: { value: Scope; label: string }) {
    const active = scope === value;
    return (
      <Pressable
        onPress={() => setScope(value)}
        style={{
          paddingHorizontal: 8,
          paddingVertical: 3,
          borderRadius: 4,
          backgroundColor: active ? theme.colors.ink700 : 'transparent',
        }}
      >
        <Text
          style={{
            fontFamily: TypographyFamilies.mono,
            fontSize: 10,
            letterSpacing: 0.8,
            color: active ? theme.colors.ink100 : theme.colors.text_gray,
            includeFontPadding: false,
          }}
        >
          {label}
        </Text>
      </Pressable>
    );
  }

  return (
    <Card>
      <HeaderRow>
        <Toggle>
          <ScopeBtn value="global" label="TODOS" />
          <ScopeBtn value="pool" label="GRUPO" />
        </Toggle>
        <CountLabel>{isLoading ? '—' : total} palpites</CountLabel>
      </HeaderRow>

      {isLoading ? (
        <Bar>
          <Segment $flex={33} $bg={theme.colors.ink800} />
          <Segment $flex={33} $bg={theme.colors.ink800} />
          <Segment $flex={34} $bg={theme.colors.ink800} />
        </Bar>
      ) : total === 0 ? (
        <EmptyBar>
          <Text
            style={{
              fontFamily: TypographyFamilies.sans,
              fontSize: 13,
              color: theme.colors.text_disabled,
            }}
          >
            {scope === 'pool' ? 'O grupo ainda não palpitou' : 'Seja o primeiro a palpitar'}
          </Text>
        </EmptyBar>
      ) : (
        <>
          <Bar
            accessible={true}
            accessibilityRole="image"
            accessibilityLabel={a11yLabel}
          >
            {outcomes.map((outcome) => {
              const { pct, fillColor, dimColor, dimBorder } = config[outcome];
              const isDominant = outcome === dominantOutcome;
              const bg = isDominant ? fillColor : dimColor;
              const textColor = isDominant ? theme.colors.ink950 : fillColor;
              const borderColor = isDominant ? undefined : dimBorder;
              const fSize = numeralSize(pct);

              return (
                <Segment key={outcome} $flex={Math.max(pct, 6)} $bg={bg} $borderColor={borderColor}>
                  <Text
                    style={{
                      fontFamily: theme.fonts.display,
                      fontSize: fSize,
                      color: textColor,
                      includeFontPadding: false,
                    }}
                  >
                    {pct}
                    <Text
                      style={{
                        fontFamily: theme.fonts.display,
                        fontSize: Math.max(fSize - 8, 11),
                        color: textColor,
                      }}
                    >
                      %
                    </Text>
                  </Text>
                </Segment>
              );
            })}
          </Bar>

          <CaptionRow>
            {outcomes.map((outcome) => {
              const { pct, fillColor, label } = config[outcome];
              const active = myPick === outcome;

              return (
                <CaptionCell key={outcome} $flex={Math.max(pct, 6)}>
                  <Dot $color={fillColor} />
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{
                      fontFamily: active
                        ? TypographyFamilies.sansSemi
                        : TypographyFamilies.sans,
                      fontSize: 10,
                      color: active ? theme.colors.ink100 : theme.colors.text_gray,
                      includeFontPadding: false,
                      flexShrink: 1,
                    }}
                  >
                    {label}
                  </Text>
                </CaptionCell>
              );
            })}
          </CaptionRow>

          {total < MIN_PALPITES && (
            <Text
              style={{
                fontFamily: TypographyFamilies.sans,
                fontSize: 11,
                color: theme.colors.text_disabled,
                marginTop: 8,
                textAlign: 'center',
              }}
            >
              Poucos palpites ainda
            </Text>
          )}
        </>
      )}
    </Card>
  );
}
