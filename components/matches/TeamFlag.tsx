import React, { useState } from 'react';
import { Image } from 'react-native';
import styled from 'styled-components/native';
import type { DefaultTheme } from 'styled-components/native';
import { BorderRadius } from '@/constants/tokens';

type TeamFlagProps = {
  flagUrl: string | null;
  teamName: string;
  size?: 'sm' | 'md' | 'lg';
};

const SIZE_MAP = {
  sm: { width: 32, height: 24 },
  md: { width: 56, height: 42 },
  lg: { width: 72, height: 54 },
};

type PlaceholderProps = { $w: number; $h: number; theme: DefaultTheme };

const Placeholder = styled.View<{ $w: number; $h: number }>`
  width: ${(p: PlaceholderProps) => p.$w}px;
  height: ${(p: PlaceholderProps) => p.$h}px;
  border-radius: ${BorderRadius.sm}px;
  background-color: ${(p: PlaceholderProps) => p.theme.colors.border};
`;

export function TeamFlag({ flagUrl, teamName, size = 'md' }: TeamFlagProps) {
  const [hasError, setHasError] = useState(false);
  const { width, height } = SIZE_MAP[size];

  if (!flagUrl || hasError) {
    return <Placeholder $w={width} $h={height} />;
  }

  return (
    <Image
      source={{ uri: flagUrl }}
      style={{ width, height, borderRadius: BorderRadius.sm }}
      resizeMode="cover"
      accessibilityLabel={teamName}
      onError={() => setHasError(true)}
    />
  );
}
