import React from 'react';
import { Pressable, ScrollView } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { RFValue } from 'react-native-responsive-fontsize';
import { TextSizes, Spaces, BorderRadius } from '@/constants/tokens';

export type Segment<T extends string> = {
  label: string;
  value: T;
};

interface SegmentedControlProps<T extends string> {
  segments: Segment<T>[];
  selected: T;
  onChange: (value: T) => void;
}

const Outer = styled.View`
  padding-horizontal: ${Spaces.md}px;
  padding-vertical: ${Spaces.sm}px;
`;

const SegmentPill = styled.View<{ active: boolean }>`
  background-color: ${({ theme, active }) =>
    active ? theme.colors.primary : theme.colors.shape_light};
  border-radius: ${BorderRadius.sm}px;
  padding-vertical: ${Spaces.sm}px;
  padding-horizontal: ${Spaces.md}px;
  margin-right: ${Spaces.xsm}px;
`;

const SegmentLabel = styled.Text<{ active: boolean }>`
  font-family: ${({ theme, active }) =>
    active ? theme.fonts.bold : theme.fonts.regular};
  font-size: ${RFValue(TextSizes.sm)}px;
  color: ${({ theme, active }) =>
    active ? theme.colors.white : theme.colors.text_gray};
`;

export default function SegmentedControl<T extends string>({
  segments,
  selected,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <Outer>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexDirection: 'row' }}
      >
        {segments.map((seg) => {
          const active = seg.value === selected;
          return (
            <Pressable
              key={seg.value}
              onPress={() => onChange(seg.value)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <SegmentPill active={active}>
                <SegmentLabel active={active}>{seg.label}</SegmentLabel>
              </SegmentPill>
            </Pressable>
          );
        })}
      </ScrollView>
    </Outer>
  );
}
