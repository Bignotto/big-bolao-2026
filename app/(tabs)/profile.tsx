import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTheme } from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';

import { useMe } from '@/hooks/useMe';
import { useUpdateProfile, useLogout } from '@/hooks/useUpdateProfile';
import { useSession } from '@/context/SessionContext';
import AppAvatar from '@/components/AppComponents/AppAvatar';
import AppButton from '@/components/AppComponents/AppButton';
import { TypographyFamilies } from '@/constants/tokens';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

function formatJoinDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;
}

function detectAvatarSource(url: string | null): string {
  if (!url) return 'CONTA DE LOGIN';
  if (url.includes('google')) return 'GOOGLE';
  if (url.includes('apple')) return 'APPLE';
  return 'CONTA DE LOGIN';
}

// ─── Static achievements (placeholder until API exposes them) ─────────────────

const ACHIEVEMENTS = [
  { id: '1', icon: '⭐', label: 'Primeiro acerto', unlocked: false },
  { id: '2', icon: '🏆', label: '3 placares', unlocked: false },
  { id: '3', icon: '🔥', label: 'Sequência 5', unlocked: false },
];

const APP_VERSION = '2.4.0';
const MAX_NAME = 40;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const theme = useTheme();
  const { apiUser } = useSession();
  const c = theme.colors;

  const { data: user, isLoading } = useMe();
  const mutation = useUpdateProfile(apiUser?.id ?? '');
  const logout = useLogout();

  const [name, setName] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (user?.fullName && name === '') setName(user.fullName);
  }, [user?.fullName]);

  // ── Loading ──────────────────────────────────────────────────────────────────

  if (isLoading || !user) {
    return (
      <View style={[s.root, { backgroundColor: c.ink950 }]}>
        <ActivityIndicator size="large" color={c.pitch} style={{ flex: 1 }} />
      </View>
    );
  }

  // ── Handlers ─────────────────────────────────────────────────────────────────

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === user!.fullName) {
      setEditing(false);
      return;
    }
    mutation.mutate(
      { fullName: trimmed },
      {
        onSuccess: () => setEditing(false),
        onError: (e) => Alert.alert('Erro', (e as Error).message),
      },
    );
  }

  function handleLogout() {
    Alert.alert('Sair da conta', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  const joinDate = formatJoinDate(user.createdAt);
  const avatarSource = detectAvatarSource(user.profileImageUrl);

  return (
    <SafeAreaView style={[s.root, { backgroundColor: c.ink950 }]}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header breadcrumb ── */}
        <Text style={[s.breadcrumb, { color: c.ink400 }]}>
          CONTA · DESDE {joinDate}
        </Text>

        {/* ── Hero title ── */}
        <Text style={[s.heroTitle, { color: c.ink100 }]}>
          Perfil<Text style={{ color: c.pitch }}>.</Text>
        </Text>
        <Text style={[s.subtitle, { color: c.ink400 }]}>
          Suas estatísticas e configurações
        </Text>

        <View style={s.gap20} />

        {/* ── Identity card ── */}
        <View style={[s.card, { backgroundColor: c.ink850 }]}>
          <View style={s.identityRow}>
            <View>
              <AppAvatar
                imagePath={user.profileImageUrl ?? undefined}
                name={user.fullName}
                size={56}
              />
              <View style={[s.editBadge, { backgroundColor: c.ink700 }]}>
                <Ionicons name="pencil" size={10} color={c.ink300} />
              </View>
            </View>
            <View style={s.identityInfo}>
              <Text style={[s.identityName, { color: c.ink100 }]} numberOfLines={1}>
                {user.fullName}
              </Text>
              <Text style={[s.identityEmail, { color: c.ink400 }]} numberOfLines={1}>
                {user.email}
              </Text>
              <View style={s.avatarSourceRow}>
                <Ionicons name="at" size={11} color={c.ink500} />
                <Text style={[s.avatarSourceText, { color: c.ink500 }]}>
                  AVATAR VIA {avatarSource}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={s.gap12} />

        {/* ── Stats card ── */}
        <View style={[s.card, { backgroundColor: c.ink850 }]}>
          <View style={s.statsRow}>
            <View style={s.statCol}>
              <Text style={[s.statNumber, { color: c.pitch }]}>–</Text>
              <Text style={[s.statLabel, { color: c.ink400 }]}>PONTOS</Text>
            </View>
            <View style={[s.statDivider, { backgroundColor: c.ink700 }]} />
            <View style={s.statCol}>
              <Text style={[s.statNumber, { color: c.ink100 }]}>–</Text>
              <Text style={[s.statLabel, { color: c.ink400 }]}>PALPITES</Text>
            </View>
            <View style={[s.statDivider, { backgroundColor: c.ink700 }]} />
            <View style={s.statCol}>
              <Text style={[s.statNumber, { color: c.ink100 }]}>
                {'–'}<Text style={[s.statUnit, { color: c.ink400 }]}>%</Text>
              </Text>
              <Text style={[s.statLabel, { color: c.ink400 }]}>ACERTO</Text>
            </View>
          </View>
        </View>

        <View style={s.gap12} />

        {/* ── Conquistas ── */}
        <View style={[s.card, { backgroundColor: c.ink850 }]}>
          <View style={s.rowBetween}>
            <Text style={[s.sectionLabel, { color: c.ink400 }]}>CONQUISTAS</Text>
            <Text style={[s.sectionCount, { color: c.ink500 }]}>0 / 8</Text>
          </View>
          <View style={s.gap12} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.badgeList}
          >
            {ACHIEVEMENTS.map((a) => (
              <View
                key={a.id}
                style={[
                  s.badge,
                  {
                    backgroundColor: c.ink800,
                    borderColor: a.unlocked ? c.pitch : c.ink700,
                    opacity: a.unlocked ? 1 : 0.4,
                  },
                ]}
              >
                <Text style={s.badgeIcon}>{a.icon}</Text>
                <Text
                  style={[s.badgeLabel, { color: a.unlocked ? c.ink100 : c.ink500 }]}
                  numberOfLines={2}
                >
                  {a.label}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={s.gap12} />

        {/* ── Nome de exibição ── */}
        <View style={[s.card, { backgroundColor: c.ink850 }]}>
          <View style={s.rowBetween}>
            <Text style={[s.sectionLabel, { color: c.ink400 }]}>NOME DE EXIBIÇÃO</Text>
            <Text style={[s.sectionCount, { color: c.ink500 }]}>
              {name.length}/{MAX_NAME}
            </Text>
          </View>
          <View style={s.gap12} />
          <View style={[s.nameRow, { borderColor: c.ink700 }]}>
            {editing ? (
              <TextInput
                style={[s.nameField, { color: c.ink100 }]}
                value={name}
                onChangeText={setName}
                maxLength={MAX_NAME}
                autoFocus
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={handleSave}
                placeholderTextColor={c.ink500}
              />
            ) : (
              <Text style={[s.nameField, { color: c.ink100 }]} numberOfLines={1}>
                {name || user.fullName}
              </Text>
            )}

            {editing ? (
              <Pressable onPress={handleSave} style={s.inlineBtn} hitSlop={8}>
                {mutation.isPending ? (
                  <ActivityIndicator size="small" color={c.pitch} />
                ) : (
                  <Text style={[s.inlineBtnText, { color: c.pitch }]}>SALVAR</Text>
                )}
              </Pressable>
            ) : (
              <Pressable onPress={() => setEditing(true)} style={s.inlineBtn} hitSlop={8}>
                <Text style={[s.inlineBtnText, { color: c.ink400 }]}>EDITAR</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={s.gap28} />

        {/* ── Conta ── */}
        <Text style={[s.sectionLabel, { color: c.ink400 }]}>CONTA</Text>
        <View style={s.gap12} />
        <AppButton
          title="Sair da conta"
          variant="destructive"
          icon={<Ionicons name="log-out-outline" size={18} color="#fff" />}
          onPress={handleLogout}
        />

        {/* ── Footer ── */}
        <View style={s.gap28} />
        <Text style={[s.footer, { color: c.ink500 }]}>
          BIG BOLÃO · V{APP_VERSION}{'   '}COPA 2026
        </Text>
        <View style={s.gap20} />
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 16 },

  breadcrumb: {
    fontFamily: TypographyFamilies.sansMedium,
    fontSize: 11,
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  heroTitle: {
    fontFamily: TypographyFamilies.display,
    fontSize: 42,
    lineHeight: 46,
  },
  subtitle: {
    fontFamily: TypographyFamilies.sans,
    fontSize: 13,
    marginTop: 4,
  },

  card: { borderRadius: 18, padding: 16 },

  // Identity
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityInfo: { flex: 1, gap: 3 },
  identityName: { fontFamily: TypographyFamilies.sansSemi, fontSize: 16 },
  identityEmail: { fontFamily: TypographyFamilies.sans, fontSize: 13 },
  avatarSourceRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 1 },
  avatarSourceText: {
    fontFamily: TypographyFamilies.sansMedium,
    fontSize: 10,
    letterSpacing: 0.5,
  },

  // Stats
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statCol: { flex: 1, alignItems: 'center', gap: 4 },
  statDivider: { width: 1, height: 36, marginHorizontal: 4 },
  statNumber: {
    fontFamily: TypographyFamilies.display,
    fontSize: 36,
    lineHeight: 40,
  },
  statUnit: { fontFamily: TypographyFamilies.display, fontSize: 20 },
  statLabel: {
    fontFamily: TypographyFamilies.sansMedium,
    fontSize: 10,
    letterSpacing: 0.8,
  },

  // Conquistas
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionLabel: { fontFamily: TypographyFamilies.sansSemi, fontSize: 11, letterSpacing: 0.8 },
  sectionCount: { fontFamily: TypographyFamilies.sansMedium, fontSize: 11 },
  badgeList: { gap: 8, paddingBottom: 2 },
  badge: {
    width: 96,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 8,
  },
  badgeIcon: { fontSize: 24 },
  badgeLabel: {
    fontFamily: TypographyFamilies.sansMedium,
    fontSize: 11,
    textAlign: 'center',
  },

  // Name editor
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 8,
  },
  nameField: {
    flex: 1,
    fontFamily: TypographyFamilies.sansSemi,
    fontSize: 15,
    padding: 0,
  },
  inlineBtn: { paddingHorizontal: 4 },
  inlineBtnText: {
    fontFamily: TypographyFamilies.sansSemi,
    fontSize: 11,
    letterSpacing: 0.6,
  },

  // Spacing helpers
  gap12: { height: 12 },
  gap20: { height: 20 },
  gap28: { height: 28 },

  footer: {
    fontFamily: TypographyFamilies.sansMedium,
    fontSize: 11,
    textAlign: 'center',
    letterSpacing: 0.6,
  },
});
