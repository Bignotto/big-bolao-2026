import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
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
import { TypographyFamilies } from '@/constants/tokens';
import { supabase } from '@/lib/supabase';

const RESEND_COOLDOWN = 60;

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export default function EmailOtpScreen() {
  const theme = useTheme();
  const c = theme.colors;
  const router = useRouter();

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [codeError, setCodeError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  function startCooldown() {
    setCooldown(RESEND_COOLDOWN);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function sendOtp(targetEmail: string) {
    const { error } = await supabase.auth.signInWithOtp({
      email: targetEmail,
      options: { shouldCreateUser: true },
    });
    if (error) throw error;
  }

  async function handleSend() {
    const trimmed = email.trim();
    if (!isValidEmail(trimmed)) {
      setEmailError('Digite um e-mail válido.');
      return;
    }
    setEmailError('');
    setSendLoading(true);
    try {
      await sendOtp(trimmed);
      setStep('otp');
      startCooldown();
    } catch (e: any) {
      setEmailError(e.message ?? JSON.stringify(e));
    } finally {
      setSendLoading(false);
    }
  }

  async function handleVerify() {
    if (code.length !== 6) {
      setCodeError('Digite os 6 dígitos do código.');
      return;
    }
    setCodeError('');
    setVerifyLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code,
        type: 'email',
      });
      if (error) throw error;
      // SessionContext.onAuthStateChange handles navigation
    } catch (e: any) {
      setCodeError(e.message ?? 'Código inválido ou expirado.');
    } finally {
      setVerifyLoading(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0 || sendLoading) return;
    setCode('');
    setCodeError('');
    setSendLoading(true);
    try {
      await sendOtp(email.trim());
      startCooldown();
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Não foi possível reenviar o código.');
    } finally {
      setSendLoading(false);
    }
  }

  function handleBack() {
    if (step === 'otp') {
      setStep('email');
      setCode('');
      setCodeError('');
    } else {
      router.back();
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
            <Pressable onPress={handleBack} style={s.backBtn} hitSlop={12}>
              <Ionicons name="arrow-back" size={20} color={c.ink300} />
            </Pressable>

            {step === 'email' ? (
              <>
                <Text style={[s.heroTitle, { color: c.ink100 }]}>
                  Entrar com e-mail<Text style={{ color: c.pitch }}>.</Text>
                </Text>
                <Text style={[s.subtitle, { color: c.ink400 }]}>
                  Enviaremos um código de 6 dígitos para o seu e-mail.
                </Text>
              </>
            ) : (
              <>
                <Text style={[s.heroTitle, { color: c.ink100 }]}>
                  Código enviado<Text style={{ color: c.pitch }}>.</Text>
                </Text>
                <Text style={[s.subtitle, { color: c.ink400 }]}>
                  Verifique o e-mail{' '}
                  <Text style={{ color: c.ink100 }}>{email.trim()}</Text>
                </Text>
              </>
            )}
          </View>

          {/* ── Input card ── */}
          {step === 'email' ? (
            <>
              <Text style={[s.sectionLabel, { color: c.ink400 }]}>E-MAIL</Text>
              <View style={s.gap8} />
              <View style={[s.card, { backgroundColor: c.ink850 }]}>
                <View style={s.fieldWrap}>
                  <Text style={[s.fieldLabel, { color: c.ink400 }]}>Endereço de e-mail</Text>
                  <View style={s.gap6} />
                  <TextInput
                    style={[
                      s.input,
                      {
                        color: c.ink100,
                        borderColor: emailError ? c.signalLose : c.ink700,
                      },
                    ]}
                    placeholder="seu@email.com"
                    placeholderTextColor={c.ink500}
                    value={email}
                    onChangeText={(v) => {
                      setEmail(v);
                      if (emailError) setEmailError('');
                    }}
                    autoFocus
                    autoCapitalize="none"
                    keyboardType="email-address"
                    returnKeyType="send"
                    onSubmitEditing={handleSend}
                  />
                  {!!emailError && (
                    <Text style={[s.fieldError, { color: c.signalLose }]}>{emailError}</Text>
                  )}
                </View>
              </View>
            </>
          ) : (
            <>
              <Text style={[s.sectionLabel, { color: c.ink400 }]}>CÓDIGO</Text>
              <View style={s.gap8} />
              <View style={[s.card, { backgroundColor: c.ink850 }]}>
                <View style={s.fieldWrap}>
                  <Text style={[s.fieldLabel, { color: c.ink400 }]}>Código de 6 dígitos</Text>
                  <View style={s.gap6} />
                  <TextInput
                    style={[
                      s.input,
                      s.inputCode,
                      {
                        color: c.ink100,
                        borderColor: codeError ? c.signalLose : c.ink700,
                      },
                    ]}
                    placeholder="000000"
                    placeholderTextColor={c.ink500}
                    value={code}
                    onChangeText={(v) => {
                      setCode(v.replace(/[^0-9]/g, '').slice(0, 6));
                      if (codeError) setCodeError('');
                    }}
                    autoFocus
                    keyboardType="number-pad"
                    maxLength={6}
                    returnKeyType="done"
                    onSubmitEditing={handleVerify}
                  />
                  {!!codeError && (
                    <Text style={[s.fieldError, { color: c.signalLose }]}>{codeError}</Text>
                  )}
                </View>
              </View>
            </>
          )}

          <View style={s.gap20} />

          {/* ── Actions ── */}
          {step === 'email' ? (
            <AppButton
              title="Enviar código"
              variant="primary"
              size="lg"
              isLoading={sendLoading}
              onPress={handleSend}
            />
          ) : (
            <>
              <AppButton
                title="Confirmar"
                variant="primary"
                size="lg"
                isLoading={verifyLoading}
                onPress={handleVerify}
              />
              <View style={s.gap12} />
              <AppButton
                title={cooldown > 0 ? `Reenviar em ${cooldown}s` : 'Reenviar código'}
                variant="ghost"
                size="md"
                isLoading={sendLoading}
                disabled={cooldown > 0}
                onPress={handleResend}
              />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 48 },

  header: { marginBottom: 28 },
  backBtn: { marginBottom: 16, alignSelf: 'flex-start' },
  heroTitle: {
    fontFamily: TypographyFamilies.display,
    fontSize: 38,
    lineHeight: 42,
    includeFontPadding: false,
  },
  subtitle: {
    fontFamily: TypographyFamilies.sans,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    includeFontPadding: false,
  },

  sectionLabel: {
    fontFamily: TypographyFamilies.sansSemi,
    fontSize: 11,
    letterSpacing: 0.8,
  },

  card: { borderRadius: 16, overflow: 'hidden' },

  fieldWrap: { padding: 14 },
  fieldLabel: {
    fontFamily: TypographyFamilies.sansMedium,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  fieldError: {
    fontFamily: TypographyFamilies.sans,
    fontSize: 12,
    marginTop: 4,
  },

  input: {
    fontFamily: TypographyFamilies.sans,
    fontSize: 15,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputCode: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 22,
    letterSpacing: 6,
    textAlign: 'center',
  },

  gap6: { height: 6 },
  gap8: { height: 8 },
  gap12: { height: 12 },
  gap20: { height: 20 },
});
