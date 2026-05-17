import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';

import { TypographyFamilies } from '@/constants/tokens';

// ─── Content ──────────────────────────────────────────────────────────────────

const STEPS = [
  {
    icon: '🏆',
    title: 'Crie ou entre em um bolão',
    body: 'Crie um bolão para a sua galera ou entre em um existente usando o código de convite. Cada bolão tem suas próprias regras de pontuação.',
  },
  {
    icon: '⚽',
    title: 'Faça seus palpites',
    body: 'Antes de cada partida, registre seu placar previsto. Você pode palpitar no resultado, gols de cada time, prorrogação e pênaltis — quanto mais detalhado, mais pontos.',
  },
  {
    icon: '⏰',
    title: 'Respeite o prazo',
    body: 'Os palpites fecham no início do jogo. Depois do apito, não é mais possível alterar sua previsão — então não deixe para a última hora!',
  },
  {
    icon: '📊',
    title: 'Acompanhe a pontuação',
    body: 'Após o fim da partida, os pontos são calculados automaticamente e o placar do bolão é atualizado. Veja o ranking e torça pelos seus acertos.',
  },
  {
    icon: '🎯',
    title: 'Como a pontuação funciona',
    body: 'Acertar o vencedor já garante pontos. Acertar o placar exato dá muito mais. Prorrogação e pênaltis corretos dão bônus extras. Confira as regras de cada bolão na tela de detalhes.',
  },
];

const APP_VERSION = '1.0.0';

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HelpScreen() {
  const theme = useTheme();
  const router = useRouter();
  const c = theme.colors;

  return (
    <SafeAreaView style={[s.root, { backgroundColor: c.ink950 }]}>
      {/* ── Nav bar ── */}
      <View style={[s.navbar, { borderBottomColor: c.ink800 }]}>
        <Pressable onPress={() => router.back()} style={s.backBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={22} color={c.ink300} />
        </Pressable>
        <Text style={[s.navTitle, { color: c.ink400 }]}>AJUDA</Text>
        <View style={s.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
        <Text style={[s.breadcrumb, { color: c.ink400 }]}>COMO USAR</Text>
        <Text style={[s.heroTitle, { color: c.ink100 }]}>
          Guia<Text style={{ color: c.pitch }}>.</Text>
        </Text>
        <Text style={[s.subtitle, { color: c.ink400 }]}>
          Tudo que você precisa saber para jogar
        </Text>

        <View style={s.gap24} />

        {/* ── Steps ── */}
        {STEPS.map((step, i) => (
          <View key={i} style={[s.stepCard, { backgroundColor: c.ink850 }]}>
            <View style={s.stepHeader}>
              <Text style={s.stepIcon}>{step.icon}</Text>
              <Text style={[s.stepTitle, { color: c.ink100 }]}>{step.title}</Text>
            </View>
            <Text style={[s.stepBody, { color: c.ink400 }]}>{step.body}</Text>
          </View>
        ))}

        <View style={s.gap32} />

        {/* ── Divider ── */}
        <View style={[s.divider, { backgroundColor: c.ink800 }]} />

        <View style={s.gap32} />

        {/* ── About ── */}
        <Text style={[s.sectionLabel, { color: c.ink400 }]}>SOBRE O APP</Text>
        <View style={s.gap16} />

        <View style={[s.aboutCard, { backgroundColor: c.ink850, borderColor: c.ink700 }]}>
          <View style={[s.aboutAccent, { backgroundColor: c.pitch }]} />
          <View style={s.aboutContent}>
            <Text style={[s.aboutAppName, { color: c.ink100 }]}>
              Big Bolão 2026
            </Text>
            <Text style={[s.aboutTagline, { color: c.ink400 }]}>
              O bolão da sua galera para 2026
            </Text>
            <View style={s.gap12} />
            <Text style={[s.aboutBody, { color: c.ink300 }]}>
              Feito com carinho para tornar cada partida mais empolgante —
              não importa onde você e seus amigos estejam assistindo.
            </Text>
          </View>
        </View>

        <View style={s.gap16} />

        <View style={[s.developerCard, { backgroundColor: c.ink850 }]}>
          <View style={s.devRow}>
            <View style={[s.devAvatar, { backgroundColor: c.ink700, borderColor: c.pitch }]}>
              <Text style={s.devAvatarText}>TB</Text>
            </View>
            <View style={s.devInfo}>
              <Text style={[s.devName, { color: c.ink100 }]}>Thiago Bignotto</Text>
              <Text style={[s.devRole, { color: c.ink400 }]}>Desenvolvedor</Text>
            </View>
          </View>
          <View style={s.gap12} />
          <Text style={[s.devBio, { color: c.ink400 }]}>
            Desenvolvedor apaixonado por tecnologia e futebol. Criou o Big Bolão
            para reunir amigos e família em torno de um bolão bem feito —
            sem apostas, sem drama, só diversão.
          </Text>
          <View style={s.gap16} />
          <View style={[s.devContact, { borderTopColor: c.ink700 }]}>
            <Ionicons name="mail-outline" size={13} color={c.ink500} />
            <Text style={[s.devContactText, { color: c.ink500 }]}>
              bignotto@gmail.com
            </Text>
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={s.gap32} />
        <Text style={[s.footer, { color: c.ink600 }]}>
          BIG BOLÃO · V{APP_VERSION}{'   '}MUNDIAL 2026
        </Text>
        <View style={s.gap24} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1 },

  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { width: 36 },
  navTitle: {
    fontFamily: TypographyFamilies.sansSemi,
    fontSize: 11,
    letterSpacing: 1,
  },

  scroll: { paddingHorizontal: 16, paddingTop: 20 },

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

  sectionLabel: {
    fontFamily: TypographyFamilies.sansSemi,
    fontSize: 11,
    letterSpacing: 0.8,
  },

  // Steps
  stepCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  stepIcon: { fontSize: 22 },
  stepTitle: {
    fontFamily: TypographyFamilies.sansSemi,
    fontSize: 15,
    flex: 1,
  },
  stepBody: {
    fontFamily: TypographyFamilies.sans,
    fontSize: 14,
    lineHeight: 21,
  },

  divider: { height: StyleSheet.hairlineWidth },

  // About card
  aboutCard: {
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  aboutAccent: { width: 4 },
  aboutContent: { flex: 1, padding: 16 },
  aboutAppName: {
    fontFamily: TypographyFamilies.display,
    fontSize: 22,
    lineHeight: 26,
  },
  aboutTagline: {
    fontFamily: TypographyFamilies.sansMedium,
    fontSize: 12,
    letterSpacing: 0.3,
    marginTop: 3,
  },
  aboutBody: {
    fontFamily: TypographyFamilies.sans,
    fontSize: 14,
    lineHeight: 21,
  },

  // Developer card
  developerCard: {
    borderRadius: 18,
    padding: 16,
  },
  devRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  devAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  devAvatarText: {
    fontFamily: TypographyFamilies.sansSemi,
    fontSize: 16,
    color: '#fff',
  },
  devInfo: { flex: 1 },
  devName: { fontFamily: TypographyFamilies.sansSemi, fontSize: 15 },
  devRole: { fontFamily: TypographyFamilies.sans, fontSize: 13, marginTop: 2 },
  devBio: {
    fontFamily: TypographyFamilies.sans,
    fontSize: 14,
    lineHeight: 21,
  },
  devContact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  devContactText: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 12,
  },

  // Spacing
  gap12: { height: 12 },
  gap16: { height: 16 },
  gap24: { height: 24 },
  gap32: { height: 32 },

  footer: {
    fontFamily: TypographyFamilies.sansMedium,
    fontSize: 11,
    textAlign: 'center',
    letterSpacing: 0.6,
  },
});
