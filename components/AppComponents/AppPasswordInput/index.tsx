import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { TextInputProps, View } from 'react-native';
import { useTheme } from 'styled-components/native';
import AppText from '../AppText';
import { ButtonContainer, Container, InputComponent, Wrapper } from './styles';

interface AppPasswordInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export default function AppPasswordInput({ label, error, ...rest }: AppPasswordInputProps) {
  const theme = useTheme();
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <Container>
      {label && (
        <View style={{ marginBottom: 4 }}>
          <AppText>{label}:</AppText>
        </View>
      )}
      <Wrapper error={error}>
        <InputComponent
          secureTextEntry={!passwordVisible}
          keyboardType="ascii-capable"
          autoCapitalize="none"
          {...rest}
        />
        <ButtonContainer onPress={() => setPasswordVisible(!passwordVisible)}>
          <Ionicons
            name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
            size={24}
            color={theme.colors.text_gray}
          />
        </ButtonContainer>
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
