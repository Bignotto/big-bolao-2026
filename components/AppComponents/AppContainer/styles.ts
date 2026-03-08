import { View, ViewProps } from 'react-native';
import styled from 'styled-components/native';

export interface AppContainerProps extends ViewProps {
  children: React.ReactNode;
  direction?: 'row' | 'column';
  justify?: 'space-between' | 'space-around' | 'space-evenly' | 'center' | 'flex-start' | 'flex-end';
  align?: 'center' | 'flex-start' | 'flex-end';
  padding?: number;
}

export const Container = styled(View)<AppContainerProps>`
  flex-direction: ${({ direction = 'column' }) => direction};
  justify-content: ${({ justify = 'space-evenly' }) => justify};
  align-items: ${({ align = 'center' }) => align};
  padding: ${({ padding = 0 }) => padding}px;
  gap: 8px;
`;
