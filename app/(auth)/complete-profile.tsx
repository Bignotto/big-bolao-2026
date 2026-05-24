import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'styled-components/native';

import AppButton from '@/components/AppComponents/AppButton';
import AppInput from '@/components/AppComponents/AppInput';
import { TypographyFamilies } from '@/constants/tokens';
import { supabase } from '@/lib/supabase';

export default function CompleteProfileScreen() {
  const theme = useTheme();
  const c = theme.colors;
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('O nome não pode ficar em branco.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { full_name: trimmed },
      });
      if (updateError) throw updateError;
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Não foi possível salvar o nome.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[s.root, { backgroundColor: c.ink950 }]} edges={['top', 'bottom']}>
      <View style={s.content}>
        <Text style={[s.heading, { color: c.ink100 }]}>Como quer{'\n'}ser chamado?</Text>
        <Text style={[s.sub, { color: c.ink400 }]}>
          Seu nome aparece para os outros participantes do bolão.
        </Text>

        <View style={s.fieldWrap}>
          <AppInput
            label="Nome"
            value={name}
            onChangeText={(v) => {
              setName(v);
              if (error) setError('');
            }}
            error={error}
            placeholder="Seu nome"
            autoFocus
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />
        </View>

        <AppButton
          title="Continuar"
          variant="primary"
          isLoading={loading}
          disabled={!name.trim()}
          onPress={handleSubmit}
        />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
  },
  heading: {
    fontFamily: TypographyFamilies.display,
    fontSize: 44,
    lineHeight: 46,
    letterSpacing: -2,
    includeFontPadding: false,
    marginBottom: 12,
  },
  sub: {
    fontFamily: TypographyFamilies.sans,
    fontSize: 16,
    lineHeight: 24,
    includeFontPadding: false,
    marginBottom: 36,
  },
  fieldWrap: {
    marginBottom: 4,
  },
});
