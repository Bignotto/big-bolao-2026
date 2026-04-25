import { ReactNode, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  GestureResponderEvent,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from 'styled-components/native';
import type { DefaultTheme } from 'styled-components/native';
import { TypographyFamilies } from '@/constants/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost';
export type ButtonSize = 'lg' | 'md' | 'sm';

type LegacyVariant = 'solid' | 'outline' | 'text' | 'positive' | 'negative' | 'transparent';

export type AppButtonProps = PressableProps & {
  title?: string;
  variant?: ButtonVariant | LegacyVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  /** Icon rendered 8px before the label */
  icon?: ReactNode;
  /** @deprecated use icon */
  leftIcon?: ReactNode;
  /** @deprecated */
  rightIcon?: ReactNode;
  /** @deprecated use variant */
  outline?: boolean;
  /** @deprecated use variant */
  color?: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const HEIGHT: Record<ButtonSize, number> = { lg: 52, md: 44, sm: 36 };
const RADIUS: Record<ButtonSize, number> = { lg: 14, md: 12, sm: 10 };
const FONT_SIZE: Record<ButtonSize, number> = { lg: 16, md: 14, sm: 14 };

const LEGACY_MAP: Record<LegacyVariant, ButtonVariant> = {
  solid: 'primary',
  outline: 'secondary',
  text: 'ghost',
  positive: 'primary',
  negative: 'destructive',
  transparent: 'ghost',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

type VariantStyle = { bg: string; text: string; border: string; indicatorColor: string };

function resolveVariant(raw: ButtonVariant | LegacyVariant): ButtonVariant {
  if (raw in LEGACY_MAP) {
    const mapped = LEGACY_MAP[raw as LegacyVariant];
    if (__DEV__) {
      console.warn(`[AppButton] variant="${raw}" is deprecated. Use variant="${mapped}" instead.`);
    }
    return mapped;
  }
  return raw as ButtonVariant;
}

function getVariantStyle(variant: ButtonVariant, c: DefaultTheme['colors']): VariantStyle {
  switch (variant) {
    case 'primary':
      return { bg: c.pitch, text: c.pitchInk, border: c.pitch, indicatorColor: c.pitchInk };
    case 'secondary':
      return { bg: c.ink800, text: c.ink100, border: c.ink700, indicatorColor: c.ink300 };
    case 'destructive':
      return { bg: c.signalLose, text: '#fff', border: c.signalLose, indicatorColor: '#fff' };
    case 'ghost':
      return { bg: 'transparent', text: c.ink300, border: 'transparent', indicatorColor: c.ink300 };
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AppButton({
  title,
  variant: variantProp = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon,
  leftIcon,
  rightIcon,
  onPressIn: onPressInProp,
  onPressOut: onPressOutProp,
  ...rest
}: AppButtonProps) {
  const theme = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const variant = resolveVariant(variantProp);
  const vs = getVariantStyle(variant, theme.colors);

  const touchDisabled = disabled || isLoading;
  const radius = RADIUS[size];
  const fontSize = FONT_SIZE[size];
  const effectiveIcon = icon ?? leftIcon;

  const springIn = (e: GestureResponderEvent) => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, tension: 400, friction: 30 }).start();
    onPressInProp?.(e);
  };

  const springOut = (e: GestureResponderEvent) => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 400, friction: 30 }).start();
    onPressOutProp?.(e);
  };

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { borderRadius: radius, opacity: disabled ? 0.35 : 1, transform: [{ scale }] },
      ]}
    >
      <Pressable
        disabled={touchDisabled}
        onPressIn={springIn}
        onPressOut={springOut}
        android_ripple={{ color: 'rgba(255,255,255,0.12)', borderless: false }}
        style={[
          styles.base,
          {
            height: HEIGHT[size],
            borderRadius: radius,
            backgroundColor: vs.bg,
            borderColor: vs.border,
          },
        ]}
        {...rest}
      >
        {effectiveIcon && !isLoading && <View style={styles.iconWrap}>{effectiveIcon}</View>}

        <Text
          numberOfLines={1}
          style={[
            styles.label,
            { fontSize, letterSpacing: fontSize * -0.01, color: vs.text, opacity: isLoading ? 0 : 1 },
          ]}
        >
          {title}
        </Text>

        {rightIcon && !isLoading && <View style={styles.rightIconWrap}>{rightIcon}</View>}

        {isLoading && (
          <ActivityIndicator
            size="small"
            color={vs.indicatorColor}
            style={StyleSheet.absoluteFill}
          />
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
  },
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  label: {
    fontFamily: TypographyFamilies.sansSemi,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  iconWrap: {
    marginRight: 8,
  },
  rightIconWrap: {
    marginLeft: 8,
  },
});
