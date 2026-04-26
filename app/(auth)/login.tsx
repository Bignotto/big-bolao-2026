import * as AppleAuthentication from 'expo-apple-authentication';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import styled, { useTheme, type DefaultTheme } from 'styled-components/native';

import AppButton from '@/components/AppComponents/AppButton';
import AppText from '@/components/AppComponents/AppText';
import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

const redirectTo = makeRedirectUri({ scheme: 'bigbolao2026', path: 'auth/callback' });

export default function LoginScreen() {
  const theme = useTheme();
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error) throw error;
      if (!data.url) throw new Error('No OAuth URL returned');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (result.type === 'success' && result.url) {
        const url = new URL(result.url);
        const code = url.searchParams.get('code');

        if (code) {
          // PKCE flow: exchange the code for a session
          const { error: sessionError } = await supabase.auth.exchangeCodeForSession(result.url);
          if (sessionError) throw sessionError;
        } else {
          // Implicit flow: tokens are in the hash fragment
          const hashParams = new URLSearchParams(url.hash.replace('#', ''));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token') ?? '';
          if (!accessToken) throw new Error('No tokens in callback URL');
          const { error: sessionError } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          if (sessionError) throw sessionError;
        }
      }
    } catch (e: any) {
      Alert.alert('Google Sign In failed', e.message);
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleAppleSignIn() {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) throw new Error('No identity token from Apple');

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });
      if (error) throw error;
    } catch (e: any) {
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Apple Sign In failed', e.message);
      }
    }
  }

  return (
    <Screen>
      <Hero>
        <AppText size="xlg" bold color={theme.colors.white} align="center">
          Big Bolão
        </AppText>
        <AppText size="md" color="rgba(255,255,255,0.75)" align="center">
          Copa do Mundo 2026
        </AppText>
      </Hero>

      <Card>
        <AppText size="lg" bold align="center">
          Entrar
        </AppText>
        <AppText size="sm" color={theme.colors.text_gray} align="center" style={{ marginTop: 4, marginBottom: 32 }}>
          Escolha como quer acessar o bolão
        </AppText>

        <AppButton
          title="Continuar com Google"
          variant="secondary"
          isLoading={googleLoading}
          onPress={handleGoogleSignIn}
          style={{ marginBottom: 12 }}
        />

        {Platform.OS === 'ios' && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={8}
            style={{ width: '100%', height: 48 }}
            onPress={handleAppleSignIn}
          />
        )}
      </Card>
    </Screen>
  );
}

const Screen = styled.View`
  flex: 1;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.primary_dark};
`;

const Hero = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  gap: 8px;
`;

const Card = styled.View`
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.background};
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  padding: 32px 24px 48px;
`;
