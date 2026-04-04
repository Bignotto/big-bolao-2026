import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, Alert, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import type { DefaultTheme } from 'styled-components/native';

import AppButton from '@/components/AppComponents/AppButton';
import AppSpacer from '@/components/AppComponents/AppSpacer';
import AppText from '@/components/AppComponents/AppText';
import { useSession } from '@/context/SessionContext';
import { usePool, type ScoringRule } from '@/hooks/usePool';

export default function PoolDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { session } = useSession();

  const { pool, loading, error, refresh } = usePool(id ? Number(id) : undefined);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  function handleLeavePool() {
    Alert.alert('Sair do grupo', 'Tem certeza que deseja sair deste grupo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await fetch(
              `${process.env.EXPO_PUBLIC_API_URL}/pools/${id}/users/me`,
              {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${session?.access_token}` },
              },
            );
            if (!res.ok) throw new Error();
            router.back();
          } catch {
            Alert.alert('Erro', 'Não foi possível sair do grupo. Tente novamente.');
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <Screen>
        <CenteredView>
          <ActivityIndicator size="large" color="#065894" />
        </CenteredView>
      </Screen>
    );
  }

  if (error || !pool) {
    return (
      <Screen>
        <CenteredView>
          <Ionicons name="cloud-offline-outline" size={48} color="#B2BCBF" />
          <AppSpacer verticalSpace="md" />
          <AppText size="sm" color="#E83F5B" align="center">
            {error ?? 'Grupo não encontrado.'}
          </AppText>
          <AppSpacer verticalSpace="md" />
          <AppButton title="Tentar novamente" variant="solid" size="sm" onPress={refresh} />
        </CenteredView>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Row>
          <AppText size="lg" bold style={{ flex: 1 }}>
            {pool.name}
          </AppText>
          {pool.isCreator && (
            <AdminBadge>
              <AppText size="xsm" color="#065894">
                Admin
              </AppText>
            </AdminBadge>
          )}
          {pool.isPrivate && (
            <Ionicons
              name="lock-closed-outline"
              size={16}
              color="#5B7485"
              style={{ marginLeft: 8 }}
            />
          )}
        </Row>

        {!!pool.description && (
          <>
            <AppSpacer verticalSpace="sm" />
            <AppText size="sm" color="#5B7485">
              {pool.description}
            </AppText>
          </>
        )}

        <AppSpacer verticalSpace="lg" />

        {/* Stats */}
        <SectionTitle>Informações</SectionTitle>
        <Card>
          <StatRow>
            <Ionicons name="people-outline" size={18} color="#5B7485" />
            <AppText size="sm" color="#364A59" style={{ marginLeft: 10, flex: 1 }}>
              Participantes
            </AppText>
            <AppText size="sm" bold color="#364A59">
              {pool.participantsCount}
              {pool.maxParticipants != null ? ` / ${pool.maxParticipants}` : ''}
            </AppText>
          </StatRow>

          <Divider />

          <StatRow>
            <Ionicons
              name={pool.isPrivate ? 'lock-closed-outline' : 'globe-outline'}
              size={18}
              color="#5B7485"
            />
            <AppText size="sm" color="#364A59" style={{ marginLeft: 10, flex: 1 }}>
              Visibilidade
            </AppText>
            <AppText size="sm" bold color="#364A59">
              {pool.isPrivate ? 'Privado' : 'Público'}
            </AppText>
          </StatRow>

          {pool.inviteCode && (
            <>
              <Divider />
              <StatRow>
                <Ionicons name="key-outline" size={18} color="#5B7485" />
                <AppText size="sm" color="#364A59" style={{ marginLeft: 10, flex: 1 }}>
                  Código de convite
                </AppText>
                <AppText size="sm" bold color="#065894">
                  {pool.inviteCode}
                </AppText>
              </StatRow>
            </>
          )}

          {pool.registrationDeadline && (
            <>
              <Divider />
              <StatRow>
                <Ionicons name="calendar-outline" size={18} color="#5B7485" />
                <AppText size="sm" color="#364A59" style={{ marginLeft: 10, flex: 1 }}>
                  Prazo de inscrição
                </AppText>
                <AppText size="sm" bold color="#364A59">
                  {new Date(pool.registrationDeadline).toLocaleDateString('pt-BR')}
                </AppText>
              </StatRow>
            </>
          )}
        </Card>

        <AppSpacer verticalSpace="lg" />

        {/* Scoring Rules */}
        {pool.scoringRules && (
          <>
            <SectionTitle>Pontuação</SectionTitle>
            <ScoringRulesCard rules={pool.scoringRules} />
            <AppSpacer verticalSpace="lg" />
          </>
        )}

        {/* Actions */}
        {pool.isCreator && (
          <AppButton
            title="Editar regras de pontuação"
            variant="solid"
            size="md"
            leftIcon={<Ionicons name="settings-outline" size={16} color="#FFFFFF" />}
            onPress={() => router.push(`/pool/${id}/settings`)}
          />
        )}

        {!pool.isCreator && (
          <AppButton
            title="Sair do grupo"
            variant="negative"
            size="md"
            outline
            onPress={handleLeavePool}
          />
        )}
      </ScrollView>
    </Screen>
  );
}

function ScoringRulesCard({ rules }: { rules: ScoringRule }) {
  return (
    <Card>
      <ScoreRow label="Placar exato" points={rules.exactScorePoints} />
      <Divider />
      <ScoreRow
        label="Vencedor + saldo de gols"
        points={rules.correctWinnerGoalDiffPoints}
      />
      <Divider />
      <ScoreRow label="Vencedor correto" points={rules.correctWinnerPoints} />
      <Divider />
      <ScoreRow label="Empate correto" points={rules.correctDrawPoints} />
      {rules.knockoutMultiplier !== 1 && (
        <>
          <Divider />
          <MultiplierRow label="Multiplicador eliminatórias" value={rules.knockoutMultiplier} />
        </>
      )}
      {rules.finalMultiplier !== 1 && (
        <>
          <Divider />
          <MultiplierRow label="Multiplicador final" value={rules.finalMultiplier} />
        </>
      )}
    </Card>
  );
}

function ScoreRow({ label, points }: { label: string; points: number }) {
  return (
    <StatRow>
      <AppText size="sm" color="#364A59" style={{ flex: 1 }}>
        {label}
      </AppText>
      <PointsBadge>
        <AppText size="xsm" bold color="#065894">
          {points} pts
        </AppText>
      </PointsBadge>
    </StatRow>
  );
}

function MultiplierRow({ label, value }: { label: string; value: number }) {
  return (
    <StatRow>
      <AppText size="sm" color="#364A59" style={{ flex: 1 }}>
        {label}
      </AppText>
      <PointsBadge>
        <AppText size="xsm" bold color="#065894">
          ×{value}
        </AppText>
      </PointsBadge>
    </StatRow>
  );
}

// --- Styled Components ---

const Screen = styled.View<{ theme: DefaultTheme }>`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const CenteredView = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 32px;
`;

const Row = styled.View`
  flex-direction: row;
  align-items: center;
`;

const AdminBadge = styled.View<{ theme: DefaultTheme }>`
  background-color: ${({ theme }) => theme.colors.primary_light}33;
  border-radius: 20px;
  padding: 3px 10px;
  margin-left: 8px;
`;

const SectionTitle = styled(AppText)`
  font-size: 13px;
  color: #5b7485;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 8px;
`;

const Card = styled.View<{ theme: DefaultTheme }>`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 12px;
  padding: 4px 16px;
`;

const StatRow = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 14px 0;
`;

const Divider = styled.View<{ theme: DefaultTheme }>`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.shape_light};
`;

const PointsBadge = styled.View<{ theme: DefaultTheme }>`
  background-color: ${({ theme }) => theme.colors.primary_light}33;
  border-radius: 20px;
  padding: 3px 10px;
`;
