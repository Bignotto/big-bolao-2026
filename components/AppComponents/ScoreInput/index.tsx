import React from 'react';
import { TextInput } from 'react-native';
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
}: ScoreInputProps) {
  const theme = useTheme();

  const inputStyle = {
    width: 64,
    height: 64,
    fontFamily: locked ? theme.fonts.regular : theme.fonts.bold,
    fontSize: RFValue(TextSizes.xlg),
    color: locked ? theme.colors.text_disabled : theme.colors.text,
    textAlign: 'center' as const,
  };

  return (
    <Wrapper>
      <Row>
        <TeamCol>
          <TeamName numberOfLines={1} ellipsizeMode="tail">
            {homeTeamName}
          </TeamName>
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
        </TeamCol>

        <Separator>×</Separator>

        <TeamCol>
          <TeamName numberOfLines={1} ellipsizeMode="tail">
            {awayTeamName}
          </TeamName>
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
