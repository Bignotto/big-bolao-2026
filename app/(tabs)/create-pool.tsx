import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Switch } from 'react-native';
import styled from 'styled-components/native';
import type { DefaultTheme } from 'styled-components/native';

import AppButton from '@/components/AppComponents/AppButton';
import AppInput from '@/components/AppComponents/AppInput';
import AppNumberInput from '@/components/AppComponents/AppNumberInput';
import AppSpacer from '@/components/AppComponents/AppSpacer';
import AppText from '@/components/AppComponents/AppText';
import { useCreatePool } from '@/hooks/useCreatePool';

// Tournament ID is fixed to the 2026 World Cup
const TOURNAMENT_ID = 1;

export default function CreatePoolScreen() {
  const router = useRouter();
  const { createPool, loading, error } = useCreatePool();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');

  const [nameError, setNameError] = useState('');
  const [inviteCodeError, setInviteCodeError] = useState('');

  function validate(): boolean {
    let valid = true;

    if (!name.trim()) {
      setNameError('O nome do grupo é obrigatório.');
      valid = false;
    } else {
      setNameError('');
    }

    if (inviteCode.trim() && inviteCode.trim().length < 4) {
      setInviteCodeError('O código de convite deve ter pelo menos 4 caracteres.');
      valid = false;
    } else {
      setInviteCodeError('');
    }

    return valid;
  }

  async function handleSubmit() {
    if (!validate()) return;

    const maxPart = maxParticipants.trim() ? parseInt(maxParticipants, 10) : undefined;

    const success = await createPool({
      name: name.trim(),
      description: description.trim() || undefined,
      tournamentId: TOURNAMENT_ID,
      isPrivate,
      inviteCode: inviteCode.trim() || undefined,
      maxParticipants: maxPart,
    });

    if (success) {
      Alert.alert('Grupo criado!', 'Seu grupo foi criado com sucesso.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen>
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AppText size="lg" bold>
            Novo Grupo
          </AppText>
          <AppText size="sm" color="#5B7485">
            Copa do Mundo 2026
          </AppText>

          <AppSpacer verticalSpace="lg" />

          <AppInput
            label="Nome do grupo"
            placeholder="Ex: Bolão da Firma"
            value={name}
            onChangeText={setName}
            error={nameError}
            maxLength={60}
            autoCapitalize="words"
            returnKeyType="next"
          />

          <AppInput
            label="Descrição"
            placeholder="Opcional — descreva seu grupo"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={{ textAlignVertical: 'top', minHeight: 72 }}
            maxLength={200}
            returnKeyType="next"
          />

          <AppNumberInput
            label="Máximo de participantes"
            placeholder="Sem limite"
            value={maxParticipants}
            onChangeText={setMaxParticipants}
            keyboardType="numeric"
            maxLength={4}
            returnKeyType="next"
          />

          <SectionLabel>
            <AppText size="sm" bold color="#364A59">
              Grupo privado
            </AppText>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              trackColor={{ false: '#CED5D7', true: '#89CBFB' }}
              thumbColor={isPrivate ? '#065894' : '#FFFFFF'}
            />
          </SectionLabel>
          <AppText size="xsm" color="#5B7485" style={{ marginBottom: 4 }}>
            Grupos privados só podem ser acessados por código de convite.
          </AppText>

          <AppSpacer verticalSpace="sm" />

          <AppInput
            label="Código de convite"
            placeholder="Opcional — ex: BOLAO2026"
            value={inviteCode}
            onChangeText={(t) => setInviteCode(t.toUpperCase())}
            error={inviteCodeError}
            autoCapitalize="characters"
            maxLength={20}
            returnKeyType="done"
          />

          {!!error && (
            <>
              <AppSpacer verticalSpace="sm" />
              <ErrorBox>
                <Ionicons name="alert-circle-outline" size={16} color="#E83F5B" />
                <AppText size="sm" color="#E83F5B" style={{ marginLeft: 6, flex: 1 }}>
                  {error}
                </AppText>
              </ErrorBox>
            </>
          )}

          <AppSpacer verticalSpace="lg" />

          <AppButton
            title="Criar grupo"
            variant="solid"
            color="#065894"
            size="md"
            isLoading={loading}
            onPress={handleSubmit}
          />

          <AppSpacer verticalSpace="sm" />

          <AppButton
            title="Cancelar"
            variant="transparent"
            size="md"
            onPress={() => router.back()}
            disabled={loading}
          />
        </ScrollView>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const Screen = styled.View<{ theme: DefaultTheme }>`
  flex: 1;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.background};
`;

const SectionLabel = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const ErrorBox = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: rgba(232, 63, 91, 0.08);
  border-radius: 8px;
  padding: 10px 12px;
`;
