import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'styled-components/native';

import AppButton from '@/components/AppComponents/AppButton';
import { usePool } from '@/hooks/usePool';
import { useUpdateScoringRules } from '@/hooks/useUpdateScoringRules';
import { TypographyFamilies } from '@/constants/tokens';

export default function PoolSettingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const c = theme.colors;
  const poolId = id ? Number(id) : undefined;

  const { pool, loading: poolLoading } = usePool(poolId);
  const { updateRules, loading: saving, error, clearError } = useUpdateScoringRules(poolId);

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
      if (raw.trim() === '' || isNaN(n)) errors[key] = 'Valor obrigatório.';
      else if (n < 0 || !Number.isInteger(n)) errors[key] = 'Deve ser um número inteiro ≥ 0.';
      else values[key] = n;
    }

    const multiplierFields: [string, string][] = [
      ['knockoutMultiplier', knockoutMultiplier],
      ['finalMultiplier', finalMultiplier],
    ];
    for (const [key, raw] of multiplierFields) {
      const n = Number(raw);
      if (raw.trim() === '' || isNaN(n)) errors[key] = 'Valor obrigatório.';
      else if (n < 1) errors[key] = 'Deve ser ≥ 1.0.';
      else values[key] = n;
    }

    setFieldErrors(errors);
    return Object.values(errors).some((e) => e !== '') ? null : values;
  }

  function handleSave() {
    clearError();
    const values = validate();
    if (!values) return;
    Alert.alert(
      'Alterar regras de pontuação',
      'Alterar as regras recalculará todos os pontos do grupo imediatamente. Deseja continuar?',
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

  // ── Loading ──────────────────────────────────────────────────────────────────

  if (poolLoading) {
    return (
      <SafeAreaView style={[s.root, { backgroundColor: c.ink950 }]}>
        <ActivityIndicator size="large" color={c.pitch} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  // ── Access guard ─────────────────────────────────────────────────────────────

  if (pool && !pool.isCreator) {
    return (
      <SafeAreaView style={[s.root, { backgroundColor: c.ink950 }]}>
        <View style={s.centered}>
          <Ionicons name="lock-closed-outline" size={40} color={c.ink600} />
          <Text style={[s.guardText, { color: c.ink400 }]}>
            Apenas o administrador pode editar as regras de pontuação.
          </Text>
          <View style={{ marginTop: 20 }}>
            <AppButton title="Voltar" variant="secondary" size="sm" onPress={() => router.back()} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={[s.root, { backgroundColor: c.ink950 }]}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <View style={s.header}>
            <Pressable onPress={() => router.back()} style={s.backBtn} hitSlop={12}>
              <Ionicons name="arrow-back" size={20} color={c.ink300} />
            </Pressable>
            <Text style={[s.heroTitle, { color: c.ink100 }]}>
              Regras de{'\n'}Pontuação<Text style={{ color: c.pitch }}>.</Text>
            </Text>
            <Text style={[s.subtitle, { color: c.ink400 }]}>{pool?.name}</Text>
          </View>

          {/* ── Warning banner ── */}
          <View style={[s.warningBox, { backgroundColor: c.ink850, borderColor: c.signalAmber }]}>
            <Ionicons name="information-circle-outline" size={16} color={c.signalAmber} />
            <Text style={[s.warningText, { color: c.signalAmber }]}>
              Alterar as regras recalcula todos os pontos do grupo imediatamente.
            </Text>
          </View>

          <View style={s.gap20} />

          {/* ── Pontos base ── */}
          <Text style={[s.sectionLabel, { color: c.ink400 }]}>PONTOS BASE</Text>
          <View style={s.gap8} />
          <View style={[s.card, { backgroundColor: c.ink850 }]}>
            <PointField
              label="Placar exato"
              hint="Acertou o placar completo (ex: previu 2-1, resultado foi 2-1)."
              value={exactScorePoints}
              onChangeText={setExactScorePoints}
              error={fieldErrors['exactScorePoints']}
              placeholder="5"
            />
            <View style={[s.divider, { backgroundColor: c.ink700 }]} />
            <PointField
              label="Vencedor + saldo de gols"
              hint="Acertou o vencedor e a diferença de gols, mas não o placar exato."
              value={correctWinnerGoalDiffPoints}
              onChangeText={setCorrectWinnerGoalDiffPoints}
              error={fieldErrors['correctWinnerGoalDiffPoints']}
              placeholder="3"
            />
            <View style={[s.divider, { backgroundColor: c.ink700 }]} />
            <PointField
              label="Vencedor correto"
              hint="Acertou apenas o vencedor, com diferença de gols errada."
              value={correctWinnerPoints}
              onChangeText={setCorrectWinnerPoints}
              error={fieldErrors['correctWinnerPoints']}
              placeholder="2"
            />
            <View style={[s.divider, { backgroundColor: c.ink700 }]} />
            <PointField
              label="Empate correto"
              hint="Previu empate e o jogo de fato empatou."
              value={correctDrawPoints}
              onChangeText={setCorrectDrawPoints}
              error={fieldErrors['correctDrawPoints']}
              placeholder="2"
            />
          </View>

          <View style={s.gap20} />

          {/* ── Multiplicadores ── */}
          <Text style={[s.sectionLabel, { color: c.ink400 }]}>MULTIPLICADORES DE FASE</Text>
          <View style={s.gap8} />
          <View style={[s.card, { backgroundColor: c.ink850 }]}>
            <PointField
              label="Eliminatórias"
              hint="Multiplica os pontos nas fases eliminatórias, exceto a final. Ex: 1.5×"
              value={knockoutMultiplier}
              onChangeText={setKnockoutMultiplier}
              error={fieldErrors['knockoutMultiplier']}
              placeholder="1.5"
              prefix="×"
              decimal
            />
            <View style={[s.divider, { backgroundColor: c.ink700 }]} />
            <PointField
              label="Final"
              hint="Multiplica os pontos na partida final do torneio. Ex: 2×"
              value={finalMultiplier}
              onChangeText={setFinalMultiplier}
              error={fieldErrors['finalMultiplier']}
              placeholder="2.0"
              prefix="×"
              decimal
            />
          </View>

          {/* ── API error ── */}
          {!!error && (
            <>
              <View style={s.gap12} />
              <View style={[s.errorBox, { backgroundColor: c.ink850, borderColor: c.signalLose }]}>
                <Ionicons name="alert-circle-outline" size={16} color={c.signalLose} />
                <Text style={[s.errorText, { color: c.signalLose }]}>{error}</Text>
              </View>
            </>
          )}

          <View style={s.gap28} />

          <AppButton
            title="Salvar regras"
            variant="primary"
            size="lg"
            isLoading={saving}
            onPress={handleSave}
          />
          <View style={s.gap12} />
          <AppButton
            title="Cancelar"
            variant="ghost"
            size="md"
            onPress={() => router.back()}
            disabled={saving}
          />
          <View style={s.gap20} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Field component ──────────────────────────────────────────────────────────

function PointField({
  label,
  hint,
  value,
  onChangeText,
  error,
  placeholder,
  prefix,
  decimal,
}: {
  label: string;
  hint: string;
  value: string;
  onChangeText: (t: string) => void;
  error?: string;
  placeholder: string;
  prefix?: string;
  decimal?: boolean;
}) {
  const c = useTheme().colors;
  return (
    <View style={s.fieldWrap}>
      <View style={s.fieldRow}>
        <View style={s.fieldLeft}>
          <Text style={[s.fieldLabel, { color: c.ink300 }]}>{label}</Text>
          <Text style={[s.fieldHint, { color: c.ink500 }]}>{hint}</Text>
          {!!error && <Text style={[s.fieldError, { color: c.signalLose }]}>{error}</Text>}
        </View>
        <View style={[s.inputWrap, { borderColor: error ? c.signalLose : c.ink700, backgroundColor: c.ink800 }]}>
          {!!prefix && <Text style={[s.inputPrefix, { color: c.ink400 }]}>{prefix}</Text>}
          <TextInput
            style={[s.input, { color: c.ink100 }]}
            value={value}
            onChangeText={onChangeText}
            keyboardType={decimal ? 'decimal-pad' : 'number-pad'}
            placeholder={placeholder}
            placeholderTextColor={c.ink500}
            returnKeyType="done"
          />
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 48 },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  guardText: { fontFamily: TypographyFamilies.sans, fontSize: 14, textAlign: 'center', lineHeight: 20 },

  header: { marginBottom: 20 },
  backBtn: { marginBottom: 12, alignSelf: 'flex-start' },
  heroTitle: { fontFamily: TypographyFamilies.display, fontSize: 38, lineHeight: 42 },
  subtitle: { fontFamily: TypographyFamilies.sans, fontSize: 13, marginTop: 4 },

  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  warningText: { fontFamily: TypographyFamilies.sans, fontSize: 13, flex: 1, lineHeight: 18 },

  sectionLabel: { fontFamily: TypographyFamilies.sansSemi, fontSize: 11, letterSpacing: 0.8 },
  gap8: { height: 8 },
  gap12: { height: 12 },
  gap20: { height: 20 },
  gap28: { height: 28 },

  card: { borderRadius: 16, overflow: 'hidden' },
  divider: { height: 1, marginHorizontal: 14 },

  fieldWrap: { paddingHorizontal: 14, paddingVertical: 14 },
  fieldRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  fieldLeft: { flex: 1, gap: 3 },
  fieldLabel: { fontFamily: TypographyFamilies.sansSemi, fontSize: 14 },
  fieldHint: { fontFamily: TypographyFamilies.sans, fontSize: 12, lineHeight: 16 },
  fieldError: { fontFamily: TypographyFamilies.sans, fontSize: 12 },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    minWidth: 72,
  },
  inputPrefix: { fontFamily: TypographyFamilies.sansMedium, fontSize: 15 },
  input: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 18,
    paddingVertical: 10,
    textAlign: 'center',
    minWidth: 48,
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  errorText: { fontFamily: TypographyFamilies.sans, fontSize: 13, flex: 1 },
});
