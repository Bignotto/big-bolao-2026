import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'styled-components/native';

import AppButton from '@/components/AppComponents/AppButton';
import { useCreatePool } from '@/hooks/useCreatePool';
import { TypographyFamilies } from '@/constants/tokens';

const TOURNAMENT_ID = 1;

export default function CreatePoolScreen() {
  const router = useRouter();
  const theme = useTheme();
  const c = theme.colors;
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
      setInviteCodeError('O código deve ter pelo menos 4 caracteres.');
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
              Novo Grupo<Text style={{ color: c.pitch }}>.</Text>
            </Text>
            <Text style={[s.subtitle, { color: c.ink400 }]}>Copa do Mundo 2026</Text>
          </View>

          {/* ── Basic info card ── */}
          <Text style={[s.sectionLabel, { color: c.ink400 }]}>INFORMAÇÕES</Text>
          <View style={s.gap8} />
          <View style={[s.card, { backgroundColor: c.ink850 }]}>
            <Field label="Nome do grupo" error={nameError}>
              <TextInput
                style={[s.input, { color: c.ink100, borderColor: nameError ? c.signalLose : c.ink700 }]}
                placeholder="Ex: Bolão da Firma"
                placeholderTextColor={c.ink500}
                value={name}
                onChangeText={setName}
                maxLength={60}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </Field>

            <View style={[s.divider, { backgroundColor: c.ink700 }]} />

            <Field label="Descrição">
              <TextInput
                style={[s.input, s.inputMultiline, { color: c.ink100, borderColor: c.ink700 }]}
                placeholder="Opcional — descreva seu grupo"
                placeholderTextColor={c.ink500}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                maxLength={200}
                returnKeyType="next"
                textAlignVertical="top"
              />
            </Field>
          </View>

          <View style={s.gap20} />

          {/* ── Settings card ── */}
          <Text style={[s.sectionLabel, { color: c.ink400 }]}>CONFIGURAÇÕES</Text>
          <View style={s.gap8} />
          <View style={[s.card, { backgroundColor: c.ink850 }]}>
            <Field label="Máximo de participantes">
              <TextInput
                style={[s.input, { color: c.ink100, borderColor: c.ink700 }]}
                placeholder="Sem limite"
                placeholderTextColor={c.ink500}
                value={maxParticipants}
                onChangeText={setMaxParticipants}
                keyboardType="numeric"
                maxLength={4}
                returnKeyType="next"
              />
            </Field>

            <View style={[s.divider, { backgroundColor: c.ink700 }]} />

            {/* Private toggle row */}
            <View style={s.toggleRow}>
              <View style={s.toggleInfo}>
                <Text style={[s.fieldLabel, { color: c.ink300 }]}>Grupo privado</Text>
                <Text style={[s.toggleHint, { color: c.ink500 }]}>
                  Acesso apenas por código de convite
                </Text>
              </View>
              <Switch
                value={isPrivate}
                onValueChange={setIsPrivate}
                trackColor={{ false: c.ink700, true: c.pitchSoft }}
                thumbColor={isPrivate ? c.pitch : c.ink400}
              />
            </View>

            <View style={[s.divider, { backgroundColor: c.ink700 }]} />

            <Field label="Código de convite" error={inviteCodeError}>
              <TextInput
                style={[s.input, { color: c.ink100, borderColor: inviteCodeError ? c.signalLose : c.ink700 }]}
                placeholder="Opcional — ex: BOLAO2026"
                placeholderTextColor={c.ink500}
                value={inviteCode}
                onChangeText={(t) => setInviteCode(t.toUpperCase())}
                autoCapitalize="characters"
                maxLength={20}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </Field>
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

          {/* ── Actions ── */}
          <AppButton
            title="Criar grupo"
            variant="primary"
            size="lg"
            isLoading={loading}
            onPress={handleSubmit}
          />
          <View style={s.gap12} />
          <AppButton
            title="Cancelar"
            variant="ghost"
            size="md"
            onPress={() => router.back()}
            disabled={loading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Field wrapper ─────────────────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  const c = useTheme().colors;
  return (
    <View style={s.fieldWrap}>
      <Text style={[s.fieldLabel, { color: c.ink400 }]}>{label}</Text>
      <View style={s.gap6} />
      {children}
      {!!error && (
        <Text style={[s.fieldError, { color: c.signalLose }]}>{error}</Text>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 48 },

  header: { marginBottom: 24 },
  backBtn: { marginBottom: 12, alignSelf: 'flex-start' },
  heroTitle: { fontFamily: TypographyFamilies.display, fontSize: 38, lineHeight: 42 },
  subtitle: { fontFamily: TypographyFamilies.sans, fontSize: 13, marginTop: 4 },

  sectionLabel: { fontFamily: TypographyFamilies.sansSemi, fontSize: 11, letterSpacing: 0.8 },

  card: { borderRadius: 16, overflow: 'hidden' },
  divider: { height: 1, marginHorizontal: 16 },

  // Field
  fieldWrap: { padding: 14 },
  fieldLabel: { fontFamily: TypographyFamilies.sansMedium, fontSize: 11, letterSpacing: 0.5 },
  fieldError: { fontFamily: TypographyFamilies.sans, fontSize: 12, marginTop: 4 },
  gap6: { height: 6 },

  input: {
    fontFamily: TypographyFamilies.sans,
    fontSize: 15,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputMultiline: { minHeight: 72, textAlignVertical: 'top' },

  // Toggle
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  toggleInfo: { flex: 1, marginRight: 12 },
  toggleHint: { fontFamily: TypographyFamilies.sans, fontSize: 12, marginTop: 2 },

  // Error box
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  errorText: { fontFamily: TypographyFamilies.sans, fontSize: 13, flex: 1 },

  // Spacing
  gap8: { height: 8 },
  gap12: { height: 12 },
  gap20: { height: 20 },
  gap28: { height: 28 },
});
