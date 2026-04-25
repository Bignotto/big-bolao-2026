import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from 'styled-components/native';
import { TypographyFamilies } from '@/constants/tokens';

export type ScoreStepperProps = {
  value: number;
  onChange: (val: number) => void;
  accent?: boolean;
  max?: number;
  disabled?: boolean;
};

export default function ScoreStepper({
  value,
  onChange,
  accent = false,
  max = 20,
  disabled = false,
}: ScoreStepperProps) {
  const theme = useTheme();

  // Keep a ref so the hold-interval closure always reads the latest value
  const valueRef = useRef(value);
  useEffect(() => { valueRef.current = value; }, [value]);

  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (holdTimer.current) clearTimeout(holdTimer.current);
      if (holdInterval.current) clearInterval(holdInterval.current);
    };
  }, []);

  function step(delta: 1 | -1) {
    const next = Math.max(0, Math.min(max, valueRef.current + delta));
    if (next === valueRef.current) return;
    valueRef.current = next; // update eagerly so hold-interval stays in sync
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onChange(next);
  }

  function startHold(delta: 1 | -1) {
    if (disabled) return;
    holdTimer.current = setTimeout(() => {
      holdInterval.current = setInterval(() => step(delta), 100);
    }, 500);
  }

  function stopHold() {
    if (holdTimer.current) { clearTimeout(holdTimer.current); holdTimer.current = null; }
    if (holdInterval.current) { clearInterval(holdInterval.current); holdInterval.current = null; }
  }

  const btnBg = theme.colors.ink800;
  const btnBorder = theme.colors.ink700;
  const glyphColor = theme.colors.ink300;
  const boxBg = accent ? 'rgba(200,255,62,0.08)' : theme.colors.ink900;
  const boxBorder = accent ? 'rgba(200,255,62,0.3)' : theme.colors.ink700;
  const numColor = accent ? theme.colors.pitch : theme.colors.ink100;

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      {/* Increment */}
      <Pressable
        disabled={disabled || value >= max}
        onPress={() => step(1)}
        onPressIn={() => startHold(1)}
        onPressOut={stopHold}
        style={[styles.btn, { backgroundColor: btnBg, borderColor: btnBorder }]}
      >
        <Text style={[styles.glyph, { color: glyphColor }]}>+</Text>
      </Pressable>

      {/* Value box — digit crossfades on every change via key prop */}
      <View style={[styles.box, { backgroundColor: boxBg, borderColor: boxBorder }]}>
        <Animated.Text
          key={value}
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(100)}
          style={[styles.number, { color: numColor }]}
        >
          {value}
        </Animated.Text>
      </View>

      {/* Decrement */}
      <Pressable
        disabled={disabled || value <= 0}
        onPress={() => step(-1)}
        onPressIn={() => startHold(-1)}
        onPressOut={stopHold}
        style={[styles.btn, { backgroundColor: btnBg, borderColor: btnBorder }]}
      >
        <Text style={[styles.glyph, { color: glyphColor }]}>−</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  disabled: {
    opacity: 0.35,
  },
  btn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    fontFamily: TypographyFamilies.sans,
    fontSize: 22,
    lineHeight: 24,
    includeFontPadding: false,
  },
  box: {
    width: 128,
    height: 128,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    fontFamily: TypographyFamilies.display,
    fontSize: 88,
    letterSpacing: -3.52, // -0.04em at 88px
    lineHeight: 88,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
