import { TextInputProps, View } from 'react-native';
import { useTheme } from 'styled-components/native';
import AppText from '../AppText';
import { Container, InputComponent, TextWrapper, Wrapper } from './styles';

interface AppNumberInputProps extends TextInputProps {
  label?: string;
  error?: string;
  currency?: string;
  unit?: string;
}

export default function AppNumberInput({
  label,
  error,
  currency,
  unit,
  ...rest
}: AppNumberInputProps) {
  const theme = useTheme();

  return (
    <Container>
      {label && (
        <View style={{ marginBottom: 4 }}>
          <AppText>{label}:</AppText>
        </View>
      )}
      <Wrapper error={error}>
        {currency && (
          <AppText size="md" color={theme.colors.text_gray} style={{ marginLeft: 8 }}>
            {currency}
          </AppText>
        )}
        <TextWrapper>
          <InputComponent keyboardType="numeric" {...rest} />
        </TextWrapper>
        {unit && (
          <AppText size="md" color={theme.colors.text_gray} style={{ marginRight: 8 }}>
            {unit}
          </AppText>
        )}
      </Wrapper>
      {error ? (
        <AppText size="xsm" color={theme.colors.negative}>
          {error}
        </AppText>
      ) : (
        <AppText size="xsm"> </AppText>
      )}
    </Container>
  );
}
