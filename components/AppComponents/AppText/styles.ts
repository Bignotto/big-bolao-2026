import { ReactNode } from 'react';
import { Text, TextProps } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';
import { TextSizes } from '@/constants/tokens';

export interface AppTextStyleProps extends TextProps {
  children: ReactNode;
  bold?: boolean;
  size?: 'xlg' | 'lg' | 'md' | 'sm' | 'xsm';
  color?: string;
  align?: 'center' | 'left' | 'right' | 'justify';
}

export const TextContainer = styled(Text)<AppTextStyleProps>`
  font-family: ${({ theme, bold }) => (bold ? theme.fonts.bold : theme.fonts.regular)};
  font-size: ${({ size = 'md' }) => RFValue(TextSizes[size])}px;
  color: ${({ theme, color }) => (color ? color : theme.colors.text)};
  text-align: ${({ align = 'left' }) => align};
`;
