import { ActivityIndicator, FlatList, Pressable } from 'react-native';
import styled from 'styled-components/native';
import type { DefaultTheme } from 'styled-components/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useTheme } from 'styled-components/native';

import AppText from '@/components/AppComponents/AppText';
import AppButton from '@/components/AppComponents/AppButton';
import AppSpacer from '@/components/AppComponents/AppSpacer';
import { useSession } from '@/context/SessionContext';
import { usePools, type Pool } from '@/hooks/usePools';

export default function DashboardScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { signOut, apiUser } = useSession();
  const { pools, loading, error, refresh } = usePools();

  function handleCreatePool() {
    router.push('/(tabs)/create-pool');
  }

  function handleFindPool() {
    router.push('/(tabs)/find-pool');
  }

  return (
    <Screen>
      <Header>
        <HeaderTitle>
          <AppText size="lg" bold>
            Meus Grupos
          </AppText>
          <AppText size="xsm" color={theme.colors.text_gray} numberOfLines={1}>
            {apiUser?.fullName ?? 'Copa do Mundo 2026'}
          </AppText>
        </HeaderTitle>
        <AppButton
          title="Novo Grupo"
          variant="solid"
          size="sm"
          color={theme.colors.primary}
          leftIcon={<Ionicons name="add" size={18} color={theme.colors.white} />}
          onPress={handleCreatePool}
        />
        <Ionicons
          name="log-out-outline"
          size={24}
          color={theme.colors.text_gray}
          onPress={signOut}
          style={{ marginLeft: 8 }}
        />
      </Header>

      {loading && (
        <CenteredView>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </CenteredView>
      )}

      {!loading && !!error && (
        <CenteredView>
          <Ionicons name="cloud-offline-outline" size={48} color={theme.colors.text_disabled} />
          <AppSpacer verticalSpace="md" />
          <AppText size="sm" color={theme.colors.negative} align="center">
            {error}
          </AppText>
          <AppSpacer verticalSpace="md" />
          <AppButton title="Tentar novamente" variant="solid" size="sm" onPress={() => refresh()} />
        </CenteredView>
      )}

      {!loading && !error && (
        <FlatList<Pool>
          data={pools}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 12 }}
          renderItem={({ item }) => (
            <PoolCard pool={item} onPress={() => router.push(`/pool/${item.id}`)} />
          )}
          ListEmptyComponent={<EmptyPools onCreatePool={handleCreatePool} onFindPool={handleFindPool} />}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FindPoolBar>
        <AppButton
          title="Buscar um grupo para entrar"
          variant="solid"
          color={theme.colors.text_gray}
          size="md"
          leftIcon={<Ionicons name="search-outline" size={18} color={theme.colors.white} />}
          onPress={handleFindPool}
        />
      </FindPoolBar>
    </Screen>
  );
}

function PoolCard({ pool, onPress }: { pool: Pool; onPress: () => void }) {
  const theme = useTheme();

  return (
    <CardPressable onPress={onPress}>
      <CardHeader>
        <AppText size="md" bold numberOfLines={1} style={{ flex: 1 }}>
          {pool.name}
        </AppText>
        <BadgeRow>
          {pool.isCreator && (
            <AdminBadge>
              <AppText size="xsm" color={theme.colors.primary}>
                Admin
              </AppText>
            </AdminBadge>
          )}
          {pool.isPrivate && (
            <Ionicons name="lock-closed-outline" size={14} color={theme.colors.text_gray} style={{ marginLeft: 6 }} />
          )}
        </BadgeRow>
      </CardHeader>

      {!!pool.description && (
        <AppText size="sm" color={theme.colors.text_gray} numberOfLines={2} style={{ marginTop: 6 }}>
          {pool.description}
        </AppText>
      )}

      <AppSpacer verticalSpace="sm" />

      <AppText size="xsm" color={theme.colors.text_gray} style={{ marginTop: 4 }}>
        Palpites, ranking e calendário
      </AppText>

      <CardFooter>
        <FooterItem>
          <Ionicons name="people-outline" size={14} color={theme.colors.text_gray} />
          <AppText size="xsm" color={theme.colors.text_gray} style={{ marginLeft: 4 }}>
            {pool.participantsCount}{' '}
            {pool.participantsCount === 1 ? 'participante' : 'participantes'}
          </AppText>
        </FooterItem>

        {pool.maxParticipants != null && (
          <FooterItem style={{ marginLeft: 12 }}>
            <Ionicons name="person-add-outline" size={14} color={theme.colors.text_gray} />
            <AppText size="xsm" color={theme.colors.text_gray} style={{ marginLeft: 4 }}>
              máx. {pool.maxParticipants}
            </AppText>
          </FooterItem>
        )}

        <Ionicons
          name="chevron-forward"
          size={16}
          color={theme.colors.text_disabled}
          style={{ marginLeft: 'auto' }}
        />
      </CardFooter>
    </CardPressable>
  );
}

function EmptyPools({ onCreatePool, onFindPool }: { onCreatePool: () => void; onFindPool: () => void }) {
  const theme = useTheme();

  return (
    <EmptyState>
      <Ionicons name="people-outline" size={56} color={theme.colors.text_disabled} />
      <AppSpacer verticalSpace="md" />
      <AppText size="md" bold align="center" color={theme.colors.text}>
        Nenhum grupo ainda
      </AppText>
      <AppText size="sm" align="center" color={theme.colors.text_gray} style={{ marginTop: 6 }}>
        Crie um grupo ou use um código de convite para participar.
      </AppText>
      <AppSpacer verticalSpace="lg" />
      <AppButton
        title="Criar meu primeiro grupo"
        variant="solid"
        color={theme.colors.primary}
        size="md"
        onPress={onCreatePool}
      />
      <AppSpacer verticalSpace="sm" />
      <AppButton
        title="Entrar em um grupo"
        variant="transparent"
        size="md"
        onPress={onFindPool}
      />
    </EmptyState>
  );
}

// --- Styled Components ---

const Screen = styled.View<{ theme: DefaultTheme }>`
  flex: 1;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.background};
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 12px;
`;

const HeaderTitle = styled.View`
  flex: 1;
  margin-right: 12px;
`;

const FindPoolBar = styled.View<{ theme: DefaultTheme }>`
  padding: 12px 16px 16px;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.background};
  border-top-width: 1px;
  border-top-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.shape_light};
`;

const CardPressable = styled(Pressable)<{ theme: DefaultTheme }>`
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.white};
  border-radius: 12px;
  padding: 16px;
`;

const CardHeader = styled.View`
  flex-direction: row;
  align-items: center;
`;

const BadgeRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-left: 8px;
`;

const AdminBadge = styled.View<{ theme: DefaultTheme }>`
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.primary_light}33;
  border-radius: 20px;
  padding: 2px 8px;
`;

const CardFooter = styled.View`
  flex-direction: row;
  align-items: center;
`;

const FooterItem = styled.View`
  flex-direction: row;
  align-items: center;
`;

const CenteredView = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 32px;
`;

const EmptyState = styled.View`
  align-items: center;
  justify-content: center;
  padding: 48px 32px;
`;
