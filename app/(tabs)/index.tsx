import styled from 'styled-components/native';
import type { DefaultTheme } from 'styled-components/native';

import AppAvatar from '@/components/AppComponents/AppAvatar';
import AppButton from '@/components/AppComponents/AppButton';
import AppText from '@/components/AppComponents/AppText';
import { useSession } from '@/context/SessionContext';

export default function HomeScreen() {
  const { user, signOut } = useSession();

  const displayName = user?.user_metadata?.full_name ?? user?.email ?? 'Usuário';
  const avatarUrl: string | undefined = user?.user_metadata?.avatar_url ?? undefined;
  const email = user?.email ?? '';
  const provider = user?.app_metadata?.provider ?? '';

  return (
    <Screen>
      <Card>
        <AppAvatar imagePath={avatarUrl} size={72} />

        <AppText size="lg" bold align="center" style={{ marginTop: 16 }}>
          {displayName}
        </AppText>

        {!!email && (
          <AppText size="sm" color="#5B7485" align="center" style={{ marginTop: 4 }}>
            {email}
          </AppText>
        )}

        <Badge>
          <AppText size="xsm" color="#065894">
            {provider === 'google' ? 'Google' : provider === 'apple' ? 'Apple' : provider}
          </AppText>
        </Badge>
      </Card>

      <AppButton
        title="Sair"
        variant="negative"
        outline
        onPress={signOut}
        style={{ marginHorizontal: 24 }}
      />
    </Screen>
  );
}

const Screen = styled.View<{ theme: DefaultTheme }>`
  flex: 1;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.background};
  justify-content: center;
  gap: 24px;
  padding-bottom: 32px;
`;

const Card = styled.View<{ theme: DefaultTheme }>`
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.white};
  margin: 0 24px;
  border-radius: 16px;
  padding: 32px 24px;
  align-items: center;
`;

const Badge = styled.View<{ theme: DefaultTheme }>`
  margin-top: 12px;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.primary_light}33;
  border-radius: 20px;
  padding: 4px 12px;
`;
