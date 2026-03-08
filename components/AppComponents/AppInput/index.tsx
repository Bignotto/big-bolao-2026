import { TextInputProps, View } from 'react-native';
import { useTheme } from 'styled-components/native';
import AppText from '../AppText';
import { Container, InputComponent, Wrapper } from './styles';

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  color?: string;
}

export default function AppInput({ label, error, color, ...rest }: AppInputProps) {
  const theme = useTheme();

  return (
    <Container>
      {label && (
        <View style={{ marginBottom: 4 }}>
          <AppText>{label}:</AppText>
        </View>
      )}
      <Wrapper error={error} color={color}>
        <InputComponent {...rest} />
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
