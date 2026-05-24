import * as AppleAuthentication from 'expo-apple-authentication';
import { makeRedirectUri } from 'expo-auth-session';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Alert, AppState, Linking, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'styled-components/native';

import AppButton from '@/components/AppComponents/AppButton';
import { TypographyFamilies } from '@/constants/tokens';
import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

const redirectTo = makeRedirectUri({ scheme: 'bigbolao2026', path: 'auth/callback' });
const appVersion = Constants.expoConfig?.version ?? '—';

// expo-updates native module is absent in Expo Go — require lazily so dev builds don't crash
let otaLabel: string | null = null;
try {
  const Updates = require('expo-updates');
  if (!Updates.isEmbedded && Updates.createdAt) {
    otaLabel = (Updates.createdAt as Date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }
} catch {
  // Expo Go / simulator — no OTA runtime available
}

async function createNonce(): Promise<{ raw: string; hashed: string }> {
  const raw = Array.from(Crypto.getRandomBytes(16))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const hashed = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, raw);
  return { raw, hashed };
}

export default function LoginScreen() {
  const theme = useTheme();
  const c = theme.colors;
  const router = useRouter();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  async function handleGoogleSignIn() {
    setGoogleLoading(true);

    let linkingSubscription: ReturnType<typeof Linking.addEventListener> | null = null;
    let appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;
    let resolveAuthUrl: ((url: string) => void) | null = null;
    let rejectAuthUrl: ((e: Error) => void) | null = null;

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          queryParams: { prompt: 'select_account' },
        },
      });
      if (error) throw error;
      if (!data.url) throw new Error('No OAuth URL returned');

      // On Android with newer Chrome, the Custom Tab may not auto-close after the
      // OAuth redirect, so openAuthSessionAsync never resolves as 'success'.
      // Android still delivers the redirect intent to the app via Linking — we
      // capture it here instead of depending on openAuthSessionAsync's return value.
      const authUrlPromise = new Promise<string>((resolve, reject) => {
        resolveAuthUrl = resolve;
        rejectAuthUrl = reject;
        linkingSubscription = Linking.addEventListener('url', ({ url }) => {
          if (url.startsWith(redirectTo.split('?')[0])) {
            resolve(url);
          }
        });
      });

      // When the user returns to the app (auth done or cancelled), dismiss the
      // Custom Tab. Give Linking 400 ms to fire first — if it hasn't, treat as cancel.
      appStateSubscription = AppState.addEventListener('change', (nextState) => {
        if (nextState === 'active') {
          setTimeout(async () => {
            await WebBrowser.dismissBrowser();
            rejectAuthUrl?.(new Error('Login cancelado pelo usuário'));
          }, 400);
        }
      });

      // Fire the browser without awaiting — the URL arrives via Linking above.
      WebBrowser.openAuthSessionAsync(data.url, redirectTo).catch(() => {});

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Login expirou — tente novamente')), 120_000),
      );

      const authUrl = await Promise.race([authUrlPromise, timeoutPromise]);

      const url = new URL(authUrl);
      const code = url.searchParams.get('code');

      if (code) {
        const { error: sessionError } =
          await supabase.auth.exchangeCodeForSession(authUrl);
        if (sessionError) throw sessionError;
      } else {
        const hashParams = new URLSearchParams(url.hash.replace('#', ''));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') ?? '';
        if (!accessToken) throw new Error('No tokens in callback URL');
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (sessionError) throw sessionError;
      }
    } catch (e: any) {
      Alert.alert('Google Sign In failed', e.message ?? String(e));
    } finally {
      linkingSubscription?.remove();
      appStateSubscription?.remove();
      setGoogleLoading(false);
    }
  }

  async function handleAppleSignIn() {
    setAppleLoading(true);
    try {
      const nonce = await createNonce();

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: nonce.hashed,
      });

      if (!credential.identityToken) throw new Error('No identity token from Apple');

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
        nonce: nonce.raw,
      });
      if (error) throw error;

      // Apple only provides full name on first sign-in — capture immediately
      const fullName = [credential.fullName?.givenName, credential.fullName?.familyName]
        .filter(Boolean)
        .join(' ');
      if (fullName) {
        await supabase.auth.updateUser({ data: { full_name: fullName } });
      }
    } catch (e: any) {
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Apple Sign In failed', e.message);
      }
    } finally {
      setAppleLoading(false);
    }
  }

  return (
    <SafeAreaView style={[s.root, { backgroundColor: c.ink950 }]} edges={['top']}>
      {/* ── Hero ── */}
      <View style={s.hero}>
        {/* Tournament badge */}
        <View
          style={[
            s.badge,
            {
              borderColor: 'rgba(200,255,62,0.22)',
              backgroundColor: 'rgba(200,255,62,0.06)',
            },
          ]}
        >
          <Text style={s.badgeEmoji}>⚽</Text>
          <Text style={[s.badgeTxt, { color: c.pitch }]}>BOLÃO 2026</Text>
        </View>

        {/* App name */}
        <Text style={[s.appName, { color: c.ink100 }]}>
          Big{'\n'}Bolão<Text style={{ color: c.pitch }}>.</Text>
        </Text>

        {/* Tagline */}
        <Text style={[s.tagline, { color: c.ink400 }]}>
          Palpites, amigos{'\n'}e muito futebol.
        </Text>

        {/* Decorative bottom rule */}
        <View style={[s.rule, { backgroundColor: c.ink800 }]} />
      </View>

      {/* ── Auth card ── */}
      <View style={[s.card, { backgroundColor: c.ink900, borderTopColor: c.ink800 }]}>
        <Text style={[s.cardLabel, { color: c.ink500 }]}>ACESSE SUA CONTA</Text>

        <View style={s.gap16} />

        <AppButton
          title="Continuar com Google"
          variant="secondary"
          isLoading={googleLoading}
          onPress={handleGoogleSignIn}
        />

        {Platform.OS === 'ios' && (
          <View style={s.gap12}>
            {appleLoading ? (
              <AppButton
                title="Continuar com Apple"
                variant="secondary"
                isLoading
                onPress={() => {}}
                style={{ width: '100%', height: 48 }}
              />
            ) : (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
                cornerRadius={10}
                style={{ width: '100%', height: 48 }}
                onPress={handleAppleSignIn}
              />
            )}
          </View>
        )}

        {/* Email OTP fallback */}
        <View style={s.dividerRow}>
          <View style={[s.dividerLine, { backgroundColor: c.ink800 }]} />
          <Text style={[s.dividerTxt, { color: c.ink600 }]}>ou</Text>
          <View style={[s.dividerLine, { backgroundColor: c.ink800 }]} />
        </View>

        <AppButton
          title="Entrar com e-mail"
          variant="ghost"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onPress={() => router.push('/(auth)/email-otp' as any)}
        />

        <Text style={[s.legal, { color: c.ink600 }]}>
          Ao entrar você concorda com os Termos de Uso e Política de Privacidade.
        </Text>

        <Text style={[s.version, { color: c.ink300 }]}>
          v{appVersion}{otaLabel ? ` · ${otaLabel}` : ''}
        </Text>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1 },

  // ── Hero ──
  hero: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    gap: 0,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 28,
  },
  badgeEmoji: { fontSize: 13 },
  badgeTxt: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 11,
    letterSpacing: 1.2,
    includeFontPadding: false,
  },
  appName: {
    fontFamily: TypographyFamilies.display,
    fontSize: 72,
    lineHeight: 70,
    letterSpacing: -3,
    includeFontPadding: false,
    marginBottom: 20,
  },
  tagline: {
    fontFamily: TypographyFamilies.sans,
    fontSize: 18,
    lineHeight: 26,
    includeFontPadding: false,
    marginBottom: 40,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    position: 'absolute',
    bottom: 0,
    left: 28,
    right: 28,
  },

  // ── Auth card ──
  card: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cardLabel: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 10,
    letterSpacing: 1.4,
    includeFontPadding: false,
    marginBottom: 4,
  },
  legal: {
    fontFamily: TypographyFamilies.sans,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 20,
    includeFontPadding: false,
  },

  version: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 10,
    letterSpacing: 0.8,
    textAlign: 'center',
    marginTop: 8,
    includeFontPadding: false,
    opacity: 0.75,
  },

  // Spacing
  gap12: { marginTop: 12 },
  gap16: { height: 16 },

  // Email divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerTxt: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 10,
    letterSpacing: 1.2,
    includeFontPadding: false,
    marginHorizontal: 12,
  },
});
