import React from 'react';
import { Pressable, TextInput } from 'react-native';
import styled, { useTheme, type DefaultTheme } from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { RFValue } from 'react-native-responsive-fontsize';
import { TextSizes, Spaces, BorderRadius, IconSizes } from '@/constants/tokens';

interface ScoreInputProps {
  homeTeamName: string;
  awayTeamName: string;
  homeValue: string;
  awayValue: string;
  onHomeChange: (val: string) => void;
  onAwayChange: (val: string) => void;
  locked: boolean;
  onHomeIncrement?: () => void;
  onHomeDecrement?: () => void;
  onAwayIncrement?: () => void;
  onAwayDecrement?: () => void;
}

const Wrapper = styled.View`
  align-items: center;
`;

const Row = styled.View`
  flex-direction: row;
  align-items: center;
`;

const TeamCol = styled.View`
  align-items: center;
`;

const ScoreControls = styled.View`
  align-items: center;
  gap: ${Spaces.xsm}px;
`;

const TeamName = styled.Text`
  font-family: ${({ theme }: { theme: DefaultTheme }) => theme.fonts.regular};
  font-size: ${RFValue(TextSizes.sm)}px;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text_gray};
  max-width: 120px;
  margin-bottom: ${Spaces.sm}px;
`;

const InputBox = styled.View<{ locked: boolean }>`
  width: 64px;
  height: 64px;
  border-radius: ${BorderRadius.md}px;
  border-width: 1.5px;
  border-color: ${({ theme, locked }: { locked: boolean; theme: DefaultTheme }) =>
    locked ? theme.colors.border : theme.colors.primary};
  background-color: ${({ theme, locked }: { locked: boolean; theme: DefaultTheme }) =>
    locked ? theme.colors.shape_light : theme.colors.white};
  align-items: center;
  justify-content: center;
`;

const StepButton = styled(Pressable)<{ $disabled: boolean }>`
  width: 36px;
  height: 32px;
  border-radius: ${BorderRadius.sm}px;
  border-width: 1px;
  border-color: ${({ theme, $disabled }: { $disabled: boolean; theme: DefaultTheme }) =>
    $disabled ? theme.colors.border : theme.colors.primary};
  background-color: ${({ theme, $disabled }: { $disabled: boolean; theme: DefaultTheme }) =>
    $disabled ? theme.colors.shape_light : theme.colors.white};
  align-items: center;
  justify-content: center;
  opacity: ${({ $disabled }: { $disabled: boolean }) => ($disabled ? 0.5 : 1)};
`;

const Separator = styled.Text`
  font-family: ${({ theme }: { theme: DefaultTheme }) => theme.fonts.light};
  font-size: ${RFValue(TextSizes.lg)}px;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text_gray};
  margin-horizontal: ${Spaces.md}px;
`;

const LockBanner = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-top: ${Spaces.sm}px;
  gap: ${Spaces.xsm}px;
`;

const LockLabel = styled.Text`
  font-family: ${({ theme }: { theme: DefaultTheme }) => theme.fonts.regular};
  font-size: ${RFValue(TextSizes.xsm)}px;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text_disabled};
`;

export default function ScoreInput({
  homeTeamName,
  awayTeamName,
  homeValue,
  awayValue,
  onHomeChange,
  onAwayChange,
  locked,
  onHomeIncrement,
  onHomeDecrement,
  onAwayIncrement,
  onAwayDecrement,
}: ScoreInputProps) {
  const theme = useTheme();

  const inputStyle = {
    width: 64,
    height: 64,
    fontFamily: theme.fonts.display,
    fontSize: RFValue(TextSizes.xlg),
    color: locked ? theme.colors.text_disabled : theme.colors.text,
    textAlign: 'center' as const,
    fontVariant: ['tabular-nums'] as const,
  };

  return (
    <Wrapper>
      <Row>
        <TeamCol>
          <TeamName numberOfLines={1} ellipsizeMode="tail">
            {homeTeamName}
          </TeamName>
          <ScoreControls>
            <StepButton
              $disabled={locked}
              disabled={locked}
              accessibilityRole="button"
              accessibilityLabel={`Aumentar placar de ${homeTeamName}`}
              onPress={onHomeIncrement}
            >
              <Ionicons
                name="add"
                size={IconSizes.sm}
                color={locked ? theme.colors.text_disabled : theme.colors.primary}
              />
            </StepButton>
            <InputBox locked={locked}>
              <TextInput
                value={homeValue}
                onChangeText={onHomeChange}
                keyboardType="number-pad"
                maxLength={2}
                textAlign="center"
                editable={!locked}
                style={inputStyle}
              />
            </InputBox>
            <StepButton
              $disabled={locked}
              disabled={locked}
              accessibilityRole="button"
              accessibilityLabel={`Diminuir placar de ${homeTeamName}`}
              onPress={onHomeDecrement}
            >
              <Ionicons
                name="remove"
                size={IconSizes.sm}
                color={locked ? theme.colors.text_disabled : theme.colors.primary}
              />
            </StepButton>
          </ScoreControls>
        </TeamCol>

        <Separator>×</Separator>

        <TeamCol>
          <TeamName numberOfLines={1} ellipsizeMode="tail">
            {awayTeamName}
          </TeamName>
          <ScoreControls>
            <StepButton
              $disabled={locked}
              disabled={locked}
              accessibilityRole="button"
              accessibilityLabel={`Aumentar placar de ${awayTeamName}`}
              onPress={onAwayIncrement}
            >
              <Ionicons
                name="add"
                size={IconSizes.sm}
                color={locked ? theme.colors.text_disabled : theme.colors.primary}
              />
            </StepButton>
            <InputBox locked={locked}>
              <TextInput
                value={awayValue}
                onChangeText={onAwayChange}
                keyboardType="number-pad"
                maxLength={2}
                textAlign="center"
                editable={!locked}
                style={inputStyle}
              />
            </InputBox>
            <StepButton
              $disabled={locked}
              disabled={locked}
              accessibilityRole="button"
              accessibilityLabel={`Diminuir placar de ${awayTeamName}`}
              onPress={onAwayDecrement}
            >
              <Ionicons
                name="remove"
                size={IconSizes.sm}
                color={locked ? theme.colors.text_disabled : theme.colors.primary}
              />
            </StepButton>
          </ScoreControls>
        </TeamCol>
      </Row>

      {locked && (
        <LockBanner>
          <Ionicons
            name="lock-closed"
            size={IconSizes.xsm}
            color={theme.colors.text_disabled}
          />
          <LockLabel>Palpite encerrado</LockLabel>
        </LockBanner>
      )}
    </Wrapper>
  );
}
