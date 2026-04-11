import { Pressable } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import styled, { type DefaultTheme } from 'styled-components/native';

interface WrapperProps {
  error?: string;
}

export const Container = styled.View`
  width: 100%;
`;

export const Wrapper = styled.View<WrapperProps>`
  border-radius: 14px;
  border-color: ${({ theme, error }: WrapperProps & { theme: DefaultTheme }) =>
    error ? theme.colors.negative : theme.colors.border};
  border-width: 1px;
  flex-direction: row;
  justify-content: space-between;
`;

export const InputComponent = styled.TextInput`
  padding-top: 12px;
  padding-bottom: 12px;
  padding-left: 12px;
  font-family: ${({ theme }: { theme: DefaultTheme }) => theme.fonts.regular};
  font-size: ${RFValue(16)}px;
  flex: 1;
`;

export const ButtonContainer = styled(Pressable)`
  align-items: center;
  justify-content: center;
  flex-direction: row;
  border-radius: 14px;
  margin: 4px;
  padding-left: 8px;
  padding-right: 8px;
`;
