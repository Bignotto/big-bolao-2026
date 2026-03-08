import { ReactNode, useState } from 'react';
import { ActivityIndicator, PressableProps, View } from 'react-native';
import { useTheme } from 'styled-components/native';
import AppText from '../AppText';
import { ButtonContainer } from './styles';

type AppButtonProps = PressableProps & {
  title?: string;
  variant?: 'positive' | 'solid' | 'negative' | 'transparent';
  isLoading?: boolean;
  size?: 'lg' | 'md' | 'sm';
  outline?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  color?: string;
};

export default function AppButton({
  title,
  variant = 'solid',
  isLoading = false,
  size = 'md',
  disabled = false,
  outline = false,
  leftIcon,
  rightIcon,
  color,
  onPressIn,
  onPressOut,
  ...rest
}: AppButtonProps) {
  const theme = useTheme();
  const [pressed, setPressed] = useState(false);

  let buttonColor = theme.colors.primary;
  switch (variant) {
    case 'positive':
      buttonColor = theme.colors.positive;
      break;
    case 'negative':
      buttonColor = theme.colors.negative;
      break;
    case 'transparent':
      buttonColor = theme.colors.white;
      break;
    case 'solid':
      buttonColor = theme.colors.text;
      break;
    default:
      buttonColor = theme.colors.primary;
  }

  if (color) buttonColor = color;

  const textColor = outline
    ? buttonColor
    : variant === 'transparent'
    ? theme.colors.text
    : theme.colors.white;

  return (
    <ButtonContainer
      disabled={disabled || isLoading}
      enabled={!disabled}
      color={buttonColor}
      outline={outline}
      size={size}
      style={{ opacity: pressed && !disabled && !isLoading ? 0.75 : 1 }}
      onPressIn={(e) => {
        if (isLoading) return;
        setPressed(true);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        if (isLoading) return;
        setPressed(false);
        onPressOut?.(e);
      }}
      {...rest}
    >
      {leftIcon && (
        <View style={{ marginLeft: 8, paddingHorizontal: 20 }}>{leftIcon}</View>
      )}
      {title ? (
        <AppText
          bold
          color={textColor}
          size={size}
          style={{
            marginLeft: leftIcon ? 0 : 8,
            marginRight: rightIcon ? 0 : 8,
            marginTop: leftIcon || rightIcon ? 2 : 0,
          }}
        >
          {isLoading ? <ActivityIndicator color={textColor} /> : title}
        </AppText>
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            marginLeft: leftIcon ? 0 : 8,
            marginRight: rightIcon ? 0 : 8,
          }}
        >
          {isLoading ? <ActivityIndicator color={textColor} /> : null}
        </View>
      )}
      {rightIcon && (
        <View style={{ marginRight: 8, paddingHorizontal: 20 }}>{rightIcon}</View>
      )}
    </ButtonContainer>
  );
}
