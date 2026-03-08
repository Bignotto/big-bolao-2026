import { rgba } from 'polished';
import { Pressable, PressableProps } from 'react-native';
import styled from 'styled-components/native';

interface ButtonContainerProps extends PressableProps {
  color: string;
  size?: 'lg' | 'md' | 'sm';
  outline: boolean;
  enabled?: boolean;
}

export const ButtonContainer = styled(Pressable)<ButtonContainerProps>`
  align-items: center;
  justify-content: center;
  flex-direction: row;
  height: ${({ size = 'md' }) => (size === 'lg' ? 64 : size === 'md' ? 54 : 46)}px;
  border-radius: 14px;
  border-width: 1px;
  border-color: ${({ theme, outline, color, enabled = true }) =>
    outline
      ? rgba(color, 0.2)
      : !enabled
      ? theme.colors.text_disabled
      : color === theme.colors.white
      ? theme.colors.text_disabled
      : color};
  padding: 2px;
  background-color: ${({ theme, outline, color, enabled = true }) =>
    outline ? rgba(color, 0.2) : enabled ? color : theme.colors.text_disabled};
`;
