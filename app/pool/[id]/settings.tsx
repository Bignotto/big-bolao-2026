import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import type { DefaultTheme } from 'styled-components/native';

import AppButton from '@/components/AppComponents/AppButton';
import AppNumberInput from '@/components/AppComponents/AppNumberInput';
import AppSpacer from '@/components/AppComponents/AppSpacer';
import AppText from '@/components/AppComponents/AppText';
import { useSession } from '@/context/SessionContext';
import { usePool } from '@/hooks/usePool';
import { useUpdateScoringRules } from '@/hooks/useUpdateScoringRules';

export default function PoolSettingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { session, apiUser } = useSession();
  const poolId = id ? Number(id) : undefined;

  const { pool, loading: poolLoading } = usePool(poolId, apiUser?.id, session?.access_token);
  const { updateRules, loading: saving, error, clearError } = useUpdateScoringRules(
    poolId,
    session?.access_token,
  );

  const [exactScorePoints, setExactScorePoints] = useState('');
  const [correctWinnerGoalDiffPoints, setCorrectWinnerGoalDiffPoints] = useState('');
  const [correctWinnerPoints, setCorrectWinnerPoints] = useState('');
  const [correctDrawPoints, setCorrectDrawPoints] = useState('');
  const [knockoutMultiplier, setKnockoutMultiplier] = useState('');
  const [finalMultiplier, setFinalMultiplier] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (pool?.scoringRules) {
      const r = pool.scoringRules;
      setExactScorePoints(String(r.exactScorePoints));
      setCorrectWinnerGoalDiffPoints(String(r.correctWinnerGoalDiffPoints));
      setCorrectWinnerPoints(String(r.correctWinnerPoints));
      setCorrectDrawPoints(String(r.correctDrawPoints));
      setKnockoutMultiplier(String(r.knockoutMultiplier));
      setFinalMultiplier(String(r.finalMultiplier));
    }
  }, [pool]);

  function validatePointField(value: string, key: string): number | null {
    const n = Number(value);
    if (value.trim() === '' || isNaN(n)) {
      setFieldErrors((prev) => ({ ...prev, [key]: 'Valor obrigatório.' }));
      return null;
    }
    if (n < 0 || !Number.isInteger(n)) {
      setFieldErrors((prev) => ({ ...prev, [key]: 'Deve ser um número inteiro ≥ 0.' }));
      return null;
    }
    setFieldErrors((prev) => ({ ...prev, [key]: '' }));
    return n;
  }

  function validateMultiplierField(value: string, key: string): number | null {
    const n = Number(value);
    if (value.trim() === '' || isNaN(n)) {
      setFieldErrors((prev) => ({ ...prev, [key]: 'Valor obrigatório.' }));
      return null;
    }
    if (n < 1) {
      setFieldErrors((prev) => ({ ...prev, [key]: 'Deve ser ≥ 1.0.' }));
      return null;
    }
    setFieldErrors((prev) => ({ ...prev, [key]: '' }));
    return n;
  }

  function validate(): Record<string, number> | null {
    const errors: Record<string, string> = {};
    const values: Record<string, number> = {};

    const pointFields: [string, string][] = [
      ['exactScorePoints', exactScorePoints],
      ['correctWinnerGoalDiffPoints', correctWinnerGoalDiffPoints],
      ['correctWinnerPoints', correctWinnerPoints],
      ['correctDrawPoints', correctDrawPoints],
    ];

    for (const [key, raw] of pointFields) {
      const n = Number(raw);
      if (raw.trim() === '' || isNaN(n)) {
        errors[key] = 'Valor obrigatório.';
      } else if (n < 0 || !Number.isInteger(n)) {
        errors[key] = 'Deve ser um número inteiro ≥ 0.';
      } else {
        values[key] = n;
      }
    }

    const multiplierFields: [string, string][] = [
      ['knockoutMultiplier', knockoutMultiplier],
      ['finalMultiplier', finalMultiplier],
    ];

    for (const [key, raw] of multiplierFields) {
      const n = Number(raw);
      if (raw.trim() === '' || isNaN(n)) {
        errors[key] = 'Valor obrigatório.';
      } else if (n < 1) {
        errors[key] = 'Deve ser ≥ 1.0.';
      } else {
        values[key] = n;
      }
    }

    setFieldErrors(errors);
    if (Object.values(errors).some((e) => e !== '')) return null;
    return values;
  }

  function handleSave() {
    clearError();
    const values = validate();
    if (!values) return;

    Alert.alert(
      'Alterar regras de pontuação',
      'Alterar as regras de pontuação recalculará todos os pontos imediatamente. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: async () => {
            const success = await updateRules(values);
            if (success) router.back();
          },
        },
      ],
    );
  }

  if (poolLoading) {
    return (
      <Screen>
        <CenteredView>
          <AppText size="sm" color="#5B7485">
            Carregando...
          </AppText>
        </CenteredView>
      </Screen>
    );
  }

  if (pool && !pool.isCreator) {
    return (
      <Screen>
        <CenteredView>
          <Ionicons name="lock-closed-outline" size={40} color="#B2BCBF" />
          <AppSpacer verticalSpace="md" />
          <AppText size="sm" color="#5B7485" align="center">
            Apenas o administrador do grupo pode editar as regras de pontuação.
          </AppText>
          <AppSpacer verticalSpace="md" />
          <AppButton title="Voltar" variant="solid" size="sm" onPress={() => router.back()} />
        </CenteredView>
      </Screen>
    );
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
            Regras de Pontuação
          </AppText>
          <AppText size="sm" color="#5B7485">
            {pool?.name}
          </AppText>

          <AppSpacer verticalSpace="lg" />

          <WarningBox>
            <Ionicons name="information-circle-outline" size={18} color="#B07800" />
            <AppText size="xsm" color="#B07800" style={{ marginLeft: 8, flex: 1 }}>
              Alterar as regras recalcula todos os pontos do grupo imediatamente.
            </AppText>
          </WarningBox>

          <AppSpacer verticalSpace="lg" />

          {/* Points section */}
          <SectionTitle>Pontos base</SectionTitle>

          <AppNumberInput
            label="Placar exato"
            placeholder="5"
            value={exactScorePoints}
            onChangeText={(t) => {
              setExactScorePoints(t);
              validatePointField(t, 'exactScorePoints');
            }}
            keyboardType="numeric"
            error={fieldErrors['exactScorePoints']}
          />
          <InfoText>
            Acertou o placar completo (ex: previu 2-1, resultado foi 2-1).
          </InfoText>

          <AppSpacer verticalSpace="sm" />

          <AppNumberInput
            label="Vencedor + saldo de gols"
            placeholder="3"
            value={correctWinnerGoalDiffPoints}
            onChangeText={(t) => {
              setCorrectWinnerGoalDiffPoints(t);
              validatePointField(t, 'correctWinnerGoalDiffPoints');
            }}
            keyboardType="numeric"
            error={fieldErrors['correctWinnerGoalDiffPoints']}
          />
          <InfoText>
            Acertou o vencedor e a diferença de gols, mas não o placar exato (ex: previu 2-0, foi 3-1).
          </InfoText>

          <AppSpacer verticalSpace="sm" />

          <AppNumberInput
            label="Vencedor correto"
            placeholder="2"
            value={correctWinnerPoints}
            onChangeText={(t) => {
              setCorrectWinnerPoints(t);
              validatePointField(t, 'correctWinnerPoints');
            }}
            keyboardType="numeric"
            error={fieldErrors['correctWinnerPoints']}
          />
          <InfoText>
            Acertou apenas o vencedor, mas com diferença de gols errada.
          </InfoText>

          <AppSpacer verticalSpace="sm" />

          <AppNumberInput
            label="Empate correto"
            placeholder="2"
            value={correctDrawPoints}
            onChangeText={(t) => {
              setCorrectDrawPoints(t);
              validatePointField(t, 'correctDrawPoints');
            }}
            keyboardType="numeric"
            error={fieldErrors['correctDrawPoints']}
          />
          <InfoText>
            Previu empate e o jogo de fato empatou.
          </InfoText>

          <AppSpacer verticalSpace="lg" />

          {/* Multipliers section */}
          <SectionTitle>Multiplicadores de fase</SectionTitle>

          <AppNumberInput
            label="Multiplicador eliminatórias"
            placeholder="1.5"
            value={knockoutMultiplier}
            onChangeText={(t) => {
              setKnockoutMultiplier(t);
              validateMultiplierField(t, 'knockoutMultiplier');
            }}
            keyboardType="numeric"
            error={fieldErrors['knockoutMultiplier']}
          />
          <InfoText>
            Multiplica os pontos nas fases eliminatórias (exceto a final). Ex: 1.5× faz 3 pts virarem 4.5.
          </InfoText>

          <AppSpacer verticalSpace="sm" />

          <AppNumberInput
            label="Multiplicador da final"
            placeholder="2.0"
            value={finalMultiplier}
            onChangeText={(t) => {
              setFinalMultiplier(t);
              validateMultiplierField(t, 'finalMultiplier');
            }}
            keyboardType="numeric"
            error={fieldErrors['finalMultiplier']}
          />
          <InfoText>
            Multiplica os pontos na partida final do torneio. Ex: 2× faz 3 pts virarem 6.
          </InfoText>

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
            title="Salvar regras"
            variant="solid"
            color="#065894"
            size="md"
            isLoading={saving}
            onPress={handleSave}
          />

          <AppSpacer verticalSpace="sm" />

          <AppButton
            title="Cancelar"
            variant="transparent"
            size="md"
            onPress={() => router.back()}
            disabled={saving}
          />
        </ScrollView>
      </Screen>
    </KeyboardAvoidingView>
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

const SectionTitle = styled(AppText)`
  font-size: 13px;
  color: #5b7485;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 8px;
`;

const InfoText = styled(AppText)`
  font-size: 12px;
  color: #5b7485;
  margin-top: 4px;
  margin-bottom: 4px;
  padding-horizontal: 4px;
`;

const WarningBox = styled.View`
  flex-direction: row;
  align-items: flex-start;
  background-color: rgba(176, 120, 0, 0.1);
  border-radius: 8px;
  padding: 10px 12px;
`;

const ErrorBox = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: rgba(232, 63, 91, 0.08);
  border-radius: 8px;
  padding: 10px 12px;
`;
