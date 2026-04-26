import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'styled-components/native';

import AppButton from '@/components/AppComponents/AppButton';
import { useJoinPool } from '@/hooks/useJoinPool';
import { useSearchPools } from '@/hooks/useSearchPools';
import type { Pool } from '@/hooks/usePools';
import { TypographyFamilies } from '@/constants/tokens';

type SearchMode = 'byName' | 'byCode';

export default function FindPoolScreen() {
  const router = useRouter();
  const theme = useTheme();
  const c = theme.colors;

  const [mode, setMode] = useState<SearchMode>('byName');
  const [nameQuery, setNameQuery] = useState('');
  const [codeQuery, setCodeQuery] = useState('');
  const [joiningId, setJoiningId] = useState<number | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { pools, loading: searching, error: searchError, search, reset } = useSearchPools();
  const {
    previewPool,
    previewing,
    previewError,
    fetchByCode,
    clearPreview,
    joining,
    joinError,
    joinById,
    joinByCode,
    clearJoinError,
  } = useJoinPool();

  useEffect(() => {
    if (mode !== 'byName') return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (nameQuery.trim().length < 2) { reset(); return; }
    debounceRef.current = setTimeout(() => search(nameQuery.trim()), 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [nameQuery]);

  function handleSwitchMode(next: SearchMode) {
    if (next === mode) return;
    setMode(next);
    if (next === 'byName') clearPreview();
    if (next === 'byCode') reset();
  }

  useEffect(() => {
    if (joinError && mode === 'byName') {
      Alert.alert('Aviso', joinError, [{ text: 'OK', onPress: clearJoinError }]);
    }
  }, [joinError]);

  async function handleJoinById(pool: Pool) {
    setJoiningId(pool.id);
    const success = await joinById(pool.id);
    setJoiningId(null);
    if (success) {
      Alert.alert('Grupo', `Você entrou em "${pool.name}"!`, [
        { text: 'Ver grupo', onPress: () => router.push(`/pool/${pool.id}`) },
        { text: 'Continuar buscando' },
      ]);
    }
  }

  async function handleJoinByCode() {
    if (!previewPool) return;
    const success = await joinByCode(codeQuery.trim());
    if (success) {
      Alert.alert('Grupo', `Você entrou em "${previewPool.name}"!`, [
        { text: 'Ver grupo', onPress: () => router.push(`/pool/${previewPool.id}`) },
      ]);
    }
  }

  function handleFindByCode() {
    const code = codeQuery.trim();
    if (!code) return;
    clearPreview();
    clearJoinError();
    fetchByCode(code);
  }

  const isFull = (pool: Pool) =>
    pool.maxParticipants != null && pool.participantsCount >= pool.maxParticipants;

  // ── Pool card (byName mode) ──────────────────────────────────────────────────

  function renderPoolItem({ item }: { item: Pool }) {
    const isJoining = joiningId === item.id;
    const alreadyIn = item.isParticipant;
    const full = isFull(item);

    return (
      <Pressable
        style={[s.card, { backgroundColor: c.ink850 }]}
        onPress={() => router.push(`/pool/${item.id}`)}
      >
        <View style={s.cardHeaderRow}>
          <Text style={[s.cardTitle, { color: c.ink100 }]} numberOfLines={1}>
            {item.name}
          </Text>
          {item.isPrivate && (
            <Ionicons name="lock-closed-outline" size={14} color={c.ink400} style={{ marginLeft: 6 }} />
          )}
        </View>

        {!!item.description && (
          <Text style={[s.cardDesc, { color: c.ink400 }]} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={s.cardFooter}>
          <View style={s.participantsRow}>
            <Ionicons name="people-outline" size={14} color={c.ink500} />
            <Text style={[s.participantsText, { color: c.ink500 }]}>
              {item.participantsCount}
              {item.maxParticipants != null ? ` / ${item.maxParticipants}` : ''}
            </Text>
          </View>

          {alreadyIn ? (
            <View style={[s.alreadyInBadge, { borderColor: c.ink700 }]}>
              <Text style={[s.alreadyInText, { color: c.ink400 }]}>Já participo</Text>
            </View>
          ) : full ? (
            <View style={[s.alreadyInBadge, { borderColor: c.ink700 }]}>
              <Text style={[s.alreadyInText, { color: c.ink400 }]}>Lotado</Text>
            </View>
          ) : (
            <AppButton
              title="Entrar"
              variant="primary"
              size="sm"
              isLoading={isJoining}
              onPress={() => handleJoinById(item)}
            />
          )}
        </View>
      </Pressable>
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
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerRow}>
            <Text style={[s.heroTitle, { color: c.ink100 }]}>
              Buscar Grupos
            </Text>
            <Pressable
              style={[s.createBtn, { backgroundColor: c.ink850, borderColor: c.ink700 }]}
              onPress={() => router.push('/(tabs)/create-pool')}
            >
              <Ionicons name="add" size={18} color={c.pitch} />
              <Text style={[s.createBtnText, { color: c.pitch }]}>Criar grupo</Text>
            </Pressable>
          </View>
          <Text style={[s.subtitle, { color: c.ink400 }]}>Copa do Mundo 2026</Text>
        </View>

        {/* Segmented control */}
        <View style={[s.segmentTrack, { backgroundColor: c.ink850 }]}>
          {(['byName', 'byCode'] as SearchMode[]).map((m) => {
            const active = mode === m;
            return (
              <Pressable
                key={m}
                style={[s.segmentTab, active && { backgroundColor: c.pitch }]}
                onPress={() => handleSwitchMode(m)}
              >
                <Text style={[s.segmentText, { color: active ? c.pitchInk : c.ink400 }]}>
                  {m === 'byName' ? 'Por nome' : 'Por código'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ── By Name ── */}
        {mode === 'byName' && (
          <>
            <View style={[s.searchRow, { backgroundColor: c.ink850 }]}>
              <Ionicons name="search-outline" size={18} color={c.ink500} />
              <TextInput
                style={[s.searchInput, { color: c.ink100 }]}
                placeholder="Nome do grupo..."
                placeholderTextColor={c.ink500}
                value={nameQuery}
                onChangeText={setNameQuery}
                autoFocus
                autoCapitalize="none"
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
            </View>

            {nameQuery.trim().length === 0 && (
              <View style={s.hintView}>
                <Ionicons name="search-outline" size={44} color={c.ink700} />
                <Text style={[s.hintText, { color: c.ink500 }]}>
                  Digite o nome do grupo que você quer entrar.
                </Text>
              </View>
            )}

            {nameQuery.trim().length > 0 && nameQuery.trim().length < 2 && (
              <View style={s.hintView}>
                <Text style={[s.hintText, { color: c.ink500 }]}>
                  Digite pelo menos 2 caracteres para buscar.
                </Text>
              </View>
            )}

            {searching && (
              <View style={s.centeredView}>
                <ActivityIndicator size="large" color={c.pitch} />
              </View>
            )}

            {!searching && !!searchError && (
              <View style={s.centeredView}>
                <Ionicons name="alert-circle-outline" size={40} color={c.signalLose} />
                <Text style={[s.hintText, { color: c.signalLose, marginTop: 12 }]}>
                  {searchError}
                </Text>
                <View style={{ marginTop: 16 }}>
                  <AppButton
                    title="Tentar novamente"
                    variant="secondary"
                    size="sm"
                    onPress={() => search(nameQuery.trim())}
                  />
                </View>
              </View>
            )}

            {!searching && !searchError && nameQuery.trim().length >= 2 && (
              <FlatList<Pool>
                data={pools}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={s.listContent}
                renderItem={renderPoolItem}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                  <View style={s.hintView}>
                    <Ionicons name="search-outline" size={44} color={c.ink700} />
                    <Text style={[s.hintText, { color: c.ink500 }]}>
                      Nenhum grupo encontrado para "{nameQuery}".
                    </Text>
                  </View>
                }
              />
            )}
          </>
        )}

        {/* ── By Code ── */}
        {mode === 'byCode' && (
          <View style={s.codeSection}>
            <View style={s.codeInputRow}>
              <TextInput
                style={[s.codeInput, { backgroundColor: c.ink850, color: c.ink100, borderColor: c.ink700 }]}
                placeholder="Ex: BOLAO2026"
                placeholderTextColor={c.ink500}
                value={codeQuery}
                onChangeText={(t) => setCodeQuery(t.toUpperCase())}
                autoCapitalize="characters"
                autoFocus
                returnKeyType="search"
                onSubmitEditing={handleFindByCode}
              />
              <AppButton
                title="Buscar"
                variant="primary"
                size="md"
                isLoading={previewing}
                onPress={handleFindByCode}
                style={{ width: 88 }}
              />
            </View>

            {previewing && (
              <View style={s.centeredView}>
                <ActivityIndicator size="large" color={c.pitch} />
              </View>
            )}

            {!previewing && !!previewError && (
              <View style={[s.errorBox, { backgroundColor: c.ink850, borderColor: c.signalLose }]}>
                <Ionicons name="alert-circle-outline" size={16} color={c.signalLose} />
                <Text style={[s.errorText, { color: c.signalLose }]}>{previewError}</Text>
              </View>
            )}

            {!previewing && !previewError && !!previewPool && (
              <View style={[s.card, { backgroundColor: c.ink850 }]}>
                <View style={s.cardHeaderRow}>
                  <Text style={[s.cardTitle, { color: c.ink100 }]} numberOfLines={1}>
                    {previewPool.name}
                  </Text>
                  {previewPool.isPrivate && (
                    <Ionicons name="lock-closed-outline" size={16} color={c.ink400} style={{ marginLeft: 8 }} />
                  )}
                </View>

                {!!previewPool.description && (
                  <Text style={[s.cardDesc, { color: c.ink400 }]}>
                    {previewPool.description}
                  </Text>
                )}

                <View style={[s.participantsRow, { marginTop: 8 }]}>
                  <Ionicons name="people-outline" size={14} color={c.ink500} />
                  <Text style={[s.participantsText, { color: c.ink500 }]}>
                    {previewPool.participantsCount}
                    {previewPool.maxParticipants != null
                      ? ` / ${previewPool.maxParticipants} participantes`
                      : ' participantes'}
                  </Text>
                </View>

                <View style={{ marginTop: 20 }}>
                  {previewPool.isParticipant ? (
                    <View style={[s.infoBanner, { backgroundColor: c.ink800, borderColor: c.ink700 }]}>
                      <Ionicons name="checkmark-circle-outline" size={18} color={c.signalWin} />
                      <Text style={[s.infoText, { color: c.signalWin }]}>
                        Você já participa deste grupo.
                      </Text>
                    </View>
                  ) : isFull(previewPool) ? (
                    <View style={[s.infoBanner, { backgroundColor: c.ink800, borderColor: c.ink700 }]}>
                      <Ionicons name="close-circle-outline" size={18} color={c.ink400} />
                      <Text style={[s.infoText, { color: c.ink400 }]}>
                        Este grupo está lotado.
                      </Text>
                    </View>
                  ) : (
                    <>
                      <AppButton
                        title="Entrar no Grupo"
                        variant="primary"
                        size="lg"
                        isLoading={joining}
                        onPress={handleJoinByCode}
                      />
                      {!!joinError && (
                        <View style={[s.errorBox, { backgroundColor: c.ink800, borderColor: c.signalLose, marginTop: 12 }]}>
                          <Ionicons name="alert-circle-outline" size={16} color={c.signalLose} />
                          <Text style={[s.errorText, { color: c.signalLose }]}>{joinError}</Text>
                        </View>
                      )}
                    </>
                  )}
                </View>
              </View>
            )}

            {!previewing && !previewError && !previewPool && (
              <View style={s.hintView}>
                <Ionicons name="key-outline" size={44} color={c.ink700} />
                <Text style={[s.hintText, { color: c.ink500 }]}>
                  Digite o código de convite e toque em Buscar.
                </Text>
              </View>
            )}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },

  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroTitle: { fontFamily: TypographyFamilies.display, fontSize: 38, lineHeight: 42 },
  subtitle: { fontFamily: TypographyFamilies.sans, fontSize: 13, marginTop: 4 },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  createBtnText: { fontFamily: TypographyFamilies.sansSemi, fontSize: 13 },

  // Segmented control
  segmentTrack: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  segmentTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 9,
  },
  segmentText: {
    fontFamily: TypographyFamilies.sansSemi,
    fontSize: 14,
  },

  // Name search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: TypographyFamilies.sans,
    fontSize: 15,
    padding: 0,
  },

  // Hint / empty states
  hintView: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    gap: 12,
  },
  hintText: {
    fontFamily: TypographyFamilies.sans,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  centeredView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },

  // List
  listContent: { padding: 16, paddingBottom: 32, gap: 10 },

  // Pool card
  card: { borderRadius: 16, padding: 16 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: {
    flex: 1,
    fontFamily: TypographyFamilies.display,
    fontSize: 22,
    lineHeight: 26,
  },
  cardDesc: {
    fontFamily: TypographyFamilies.sans,
    fontSize: 13,
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  participantsRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  participantsText: { fontFamily: TypographyFamilies.sansMedium, fontSize: 12 },
  alreadyInBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  alreadyInText: { fontFamily: TypographyFamilies.sansMedium, fontSize: 12 },

  // Code mode
  codeSection: { flex: 1, paddingHorizontal: 16, gap: 12 },
  codeInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  codeInput: {
    flex: 1,
    fontFamily: TypographyFamilies.sansSemi,
    fontSize: 15,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  // Error / info banners
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  errorText: { fontFamily: TypographyFamilies.sans, fontSize: 13, flex: 1 },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  infoText: { fontFamily: TypographyFamilies.sansMedium, fontSize: 13, flex: 1 },
});
