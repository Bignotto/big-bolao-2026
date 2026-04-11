import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView } from 'react-native';
import styled, { useTheme, type DefaultTheme } from 'styled-components/native';

import { useMe } from '@/hooks/useMe';
import { useUpdateProfile, useLogout } from '@/hooks/useUpdateProfile';
import { useSession } from '@/context/SessionContext';

import AppText from '@/components/AppComponents/AppText';
import AppButton from '@/components/AppComponents/AppButton';
import AppInput from '@/components/AppComponents/AppInput';
import AppSpacer from '@/components/AppComponents/AppSpacer';
import AppAvatar from '@/components/AppComponents/AppAvatar';
import { Spaces, LogoSizes } from '@/constants/tokens';

// ─── Styled ───────────────────────────────────────────────────────────────────

const Root = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.background};
`;

const CenteredFill = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const AvatarSection = styled.View`
  align-items: center;
  padding-top: ${Spaces.lg}px;
  padding-horizontal: ${Spaces.md}px;
`;

const FormSection = styled.View`
  padding-horizontal: ${Spaces.md}px;
`;

const DangerSection = styled.View`
  margin-top: ${Spaces.xlg}px;
  padding-horizontal: ${Spaces.md}px;
`;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const theme = useTheme();
  const { apiUser } = useSession();

  const { data: user, isLoading } = useMe();
  const mutation = useUpdateProfile(apiUser?.id ?? '');
  const logout = useLogout();

  const [name, setName] = useState('');

  // Initialise name from loaded user
  useEffect(() => {
    if (user?.fullName && name === '') {
      setName(user.fullName);
    }
  }, [user?.fullName]);

  // ── Loading ──────────────────────────────────────────────────────────────────

  if (isLoading || !user) {
    return (
      <Root>
        <CenteredFill>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </CenteredFill>
      </Root>
    );
  }

  // ── Handlers ─────────────────────────────────────────────────────────────────

  function handleSave() {
    mutation.mutate(
      { fullName: name.trim() },
      {
        onSuccess: () => Alert.alert('Salvo!', 'Perfil atualizado.'),
        onError: (e) => Alert.alert('Erro', (e as Error).message),
      },
    );
  }

  function handleLogout() {
    Alert.alert('Sair', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  }

  const hasChanges = name.trim() !== user.fullName && name.trim().length > 0;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Root>
      <ScrollView
        contentContainerStyle={{ paddingBottom: Spaces.xlg }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar section */}
        <AvatarSection>
          <AppAvatar
            imagePath={user.profileImageUrl ?? undefined}
            size={LogoSizes.md}
          />
          <AppSpacer verticalSpace="sm" />
          <AppText size="md" bold align="center">
            {user.fullName}
          </AppText>
          <AppText size="sm" color={theme.colors.text_gray} align="center">
            {user.email}
          </AppText>
          <AppSpacer verticalSpace="xsm" />
          <AppText size="xsm" color={theme.colors.text_disabled} align="center">
            Avatar vindo da sua conta de login
          </AppText>
        </AvatarSection>

        <AppSpacer verticalSpace="lg" />

        {/* Edit section */}
        <FormSection>
          <AppInput
            label="Nome"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            returnKeyType="done"
          />
          <AppSpacer verticalSpace="sm" />
          <AppButton
            title="Salvar"
            variant="solid"
            isLoading={mutation.isPending}
            disabled={!hasChanges || mutation.isPending}
            onPress={handleSave}
          />
        </FormSection>

        {/* Danger section */}
        <DangerSection>
          <AppText size="sm" bold color={theme.colors.text_gray}>
            Conta
          </AppText>
          <AppSpacer verticalSpace="sm" />
          <AppButton
            title="Sair"
            variant="negative"
            outline
            onPress={handleLogout}
          />
        </DangerSection>
      </ScrollView>
    </Root>
  );
}
