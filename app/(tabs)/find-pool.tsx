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
  TextInput,
} from 'react-native';
import styled from 'styled-components/native';
import type { DefaultTheme } from 'styled-components/native';

import AppButton from '@/components/AppComponents/AppButton';
import AppSpacer from '@/components/AppComponents/AppSpacer';
import AppText from '@/components/AppComponents/AppText';
import { useSession } from '@/context/SessionContext';
import { useJoinPool } from '@/hooks/useJoinPool';
import { useSearchPools } from '@/hooks/useSearchPools';
import type { Pool } from '@/hooks/usePools';

type SearchMode = 'byName' | 'byCode';

export default function FindPoolScreen() {
  const router = useRouter();
  const { session } = useSession();
  const token = session?.access_token;

  const [mode, setMode] = useState<SearchMode>('byName');
  const [nameQuery, setNameQuery] = useState('');
  const [codeQuery, setCodeQuery] = useState('');
  const [joiningId, setJoiningId] = useState<number | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { pools, loading: searching, error: searchError, search, reset } = useSearchPools(token);
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
  } = useJoinPool(token);

  // Debounced name search
  useEffect(() => {
    if (mode !== 'byName') return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (nameQuery.trim().length < 2) {
      reset();
      return;
    }

    debounceRef.current = setTimeout(() => {
      search(nameQuery.trim());
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [nameQuery]);

  function handleSwitchMode(next: SearchMode) {
    if (next === mode) return;
    setMode(next);
    if (next === 'byName') clearPreview();
    if (next === 'byCode') reset();
  }

  // Show alert when joinError changes (for list mode)
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

  function renderPoolItem({ item }: { item: Pool }) {
    const isJoining = joiningId === item.id;
    const alreadyIn = item.isParticipant;
    const full = isFull(item);

    return (
      <CardPressable onPress={() => router.push(`/pool/${item.id}`)}>
        <CardHeader>
          <AppText size="md" bold numberOfLines={1} style={{ flex: 1 }}>
            {item.name}
          </AppText>
          <BadgeRow>
            {item.isPrivate && (
              <Ionicons name="lock-closed-outline" size={14} color="#5B7485" style={{ marginLeft: 6 }} />
            )}
          </BadgeRow>
        </CardHeader>

        {!!item.description && (
          <AppText size="sm" color="#5B7485" numberOfLines={2} style={{ marginTop: 6 }}>
            {item.description}
          </AppText>
        )}

        <AppSpacer verticalSpace="sm" />

        <CardFooter>
          <FooterItem>
            <Ionicons name="people-outline" size={14} color="#5B7485" />
            <AppText size="xsm" color="#5B7485" style={{ marginLeft: 4 }}>
              {item.participantsCount}{item.maxParticipants != null ? ` / ${item.maxParticipants}` : ''}
            </AppText>
          </FooterItem>

          <JoinButtonWrap>
            {alreadyIn ? (
              <AppButton title="Já participo" variant="transparent" size="sm" disabled />
            ) : full ? (
              <AppButton title="Lotado" variant="transparent" size="sm" disabled />
            ) : (
              <AppButton
                title="Entrar"
                variant="solid"
                color="#065894"
                size="sm"
                isLoading={isJoining}
                onPress={() => handleJoinById(item)}
              />
            )}
          </JoinButtonWrap>
        </CardFooter>
      </CardPressable>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen>
        {/* Header */}
        <ScreenHeader>
          <AppText size="lg" bold>
            Buscar Grupos
          </AppText>
          <AppText size="sm" color="#5B7485">
            Copa do Mundo 2026
          </AppText>
        </ScreenHeader>

        {/* Mode toggle */}
        <SegmentRow>
          <SegmentButton active={mode === 'byName'} onPress={() => handleSwitchMode('byName')}>
            <AppText size="sm" bold color={mode === 'byName' ? '#FFFFFF' : '#5B7485'}>
              Por nome
            </AppText>
          </SegmentButton>
          <SegmentButton active={mode === 'byCode'} onPress={() => handleSwitchMode('byCode')}>
            <AppText size="sm" bold color={mode === 'byCode' ? '#FFFFFF' : '#5B7485'}>
              Por código
            </AppText>
          </SegmentButton>
        </SegmentRow>

        {/* By Name mode */}
        {mode === 'byName' && (
          <>
            <SearchRow>
              <Ionicons name="search-outline" size={18} color="#5B7485" style={{ marginRight: 8 }} />
              <SearchInput
                placeholder="Nome do grupo..."
                value={nameQuery}
                onChangeText={setNameQuery}
                autoFocus
                autoCapitalize="none"
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
            </SearchRow>

            {nameQuery.trim().length < 2 && nameQuery.length > 0 && (
              <HintView>
                <AppText size="sm" color="#5B7485" align="center">
                  Digite pelo menos 2 caracteres para buscar.
                </AppText>
              </HintView>
            )}

            {nameQuery.trim().length === 0 && (
              <HintView>
                <Ionicons name="search-outline" size={40} color="#B2BCBF" />
                <AppSpacer verticalSpace="sm" />
                <AppText size="sm" color="#B2BCBF" align="center">
                  Digite o nome do grupo que você quer entrar.
                </AppText>
              </HintView>
            )}

            {searching && (
              <CenteredView>
                <ActivityIndicator size="large" color="#065894" />
              </CenteredView>
            )}

            {!searching && !!searchError && (
              <CenteredView>
                <Ionicons name="alert-circle-outline" size={40} color="#E83F5B" />
                <AppSpacer verticalSpace="sm" />
                <AppText size="sm" color="#E83F5B" align="center">
                  {searchError}
                </AppText>
                <AppSpacer verticalSpace="md" />
                <AppButton
                  title="Tentar novamente"
                  variant="solid"
                  size="sm"
                  onPress={() => search(nameQuery.trim())}
                />
              </CenteredView>
            )}

            {!searching && !searchError && nameQuery.trim().length >= 2 && (
              <FlatList<Pool>
                data={pools}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 12 }}
                renderItem={renderPoolItem}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <HintView>
                    <Ionicons name="search-outline" size={40} color="#B2BCBF" />
                    <AppSpacer verticalSpace="sm" />
                    <AppText size="sm" color="#B2BCBF" align="center">
                      Nenhum grupo encontrado para "{nameQuery}".
                    </AppText>
                  </HintView>
                }
              />
            )}

          </>
        )}

        {/* By Code mode */}
        {mode === 'byCode' && (
          <CodeSection>
            <CodeInputRow>
              <CodeInput
                placeholder="Ex: BOLAO2026"
                value={codeQuery}
                onChangeText={(t) => setCodeQuery(t.toUpperCase())}
                autoCapitalize="characters"
                autoFocus
                returnKeyType="search"
                onSubmitEditing={handleFindByCode}
                placeholderTextColor="#B2BCBF"
              />
              <AppSpacer horizontalSpace="sm" />
              <AppButton
                title="Buscar"
                variant="solid"
                color="#065894"
                size="sm"
                isLoading={previewing}
                onPress={handleFindByCode}
              />
            </CodeInputRow>

            <AppSpacer verticalSpace="md" />

            {previewing && (
              <CenteredView>
                <ActivityIndicator size="large" color="#065894" />
              </CenteredView>
            )}

            {!previewing && !!previewError && (
              <ErrorBox>
                <Ionicons name="alert-circle-outline" size={16} color="#E83F5B" />
                <AppText size="sm" color="#E83F5B" style={{ marginLeft: 6, flex: 1 }}>
                  {previewError}
                </AppText>
              </ErrorBox>
            )}

            {!previewing && !previewError && !!previewPool && (
              <PreviewCard>
                <PreviewHeader>
                  <AppText size="lg" bold style={{ flex: 1 }}>
                    {previewPool.name}
                  </AppText>
                  {previewPool.isPrivate && (
                    <Ionicons name="lock-closed-outline" size={18} color="#5B7485" style={{ marginLeft: 8 }} />
                  )}
                </PreviewHeader>

                {!!previewPool.description && (
                  <>
                    <AppSpacer verticalSpace="sm" />
                    <AppText size="sm" color="#5B7485">
                      {previewPool.description}
                    </AppText>
                  </>
                )}

                <AppSpacer verticalSpace="md" />

                <StatRow>
                  <Ionicons name="people-outline" size={16} color="#5B7485" />
                  <AppText size="sm" color="#5B7485" style={{ marginLeft: 6 }}>
                    {previewPool.participantsCount}{' '}
                    {previewPool.maxParticipants != null ? `/ ${previewPool.maxParticipants} participantes` : 'participantes'}
                  </AppText>
                </StatRow>

                <AppSpacer verticalSpace="lg" />

                {previewPool.isParticipant ? (
                  <InfoBanner>
                    <Ionicons name="checkmark-circle-outline" size={18} color="#065894" />
                    <AppText size="sm" color="#065894" style={{ marginLeft: 8 }}>
                      Você já participa deste grupo.
                    </AppText>
                  </InfoBanner>
                ) : isFull(previewPool) ? (
                  <InfoBanner>
                    <Ionicons name="close-circle-outline" size={18} color="#5B7485" />
                    <AppText size="sm" color="#5B7485" style={{ marginLeft: 8 }}>
                      Este grupo está lotado.
                    </AppText>
                  </InfoBanner>
                ) : (
                  <>
                    <AppButton
                      title="Entrar no Grupo"
                      variant="solid"
                      color="#065894"
                      size="md"
                      isLoading={joining}
                      onPress={handleJoinByCode}
                    />
                    {!!joinError && (
                      <>
                        <AppSpacer verticalSpace="sm" />
                        <ErrorBox>
                          <Ionicons name="alert-circle-outline" size={16} color="#E83F5B" />
                          <AppText size="sm" color="#E83F5B" style={{ marginLeft: 6, flex: 1 }}>
                            {joinError}
                          </AppText>
                        </ErrorBox>
                      </>
                    )}
                  </>
                )}
              </PreviewCard>
            )}

            {!previewing && !previewError && !previewPool && (
              <HintView>
                <Ionicons name="key-outline" size={40} color="#B2BCBF" />
                <AppSpacer verticalSpace="sm" />
                <AppText size="sm" color="#B2BCBF" align="center">
                  Digite o código de convite e toque em Buscar.
                </AppText>
              </HintView>
            )}
          </CodeSection>
        )}
      </Screen>
    </KeyboardAvoidingView>
  );
}

// --- Styled Components ---

const Screen = styled.View<{ theme: DefaultTheme }>`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const ScreenHeader = styled.View`
  padding: 16px 16px 8px;
`;

const SegmentRow = styled.View`
  flex-direction: row;
  background-color: #eaeeef;
  border-radius: 10px;
  padding: 4px;
  margin: 8px 16px 16px;
`;

const SegmentButton = styled(Pressable)<{ active: boolean }>`
  flex: 1;
  align-items: center;
  padding: 8px 0;
  border-radius: 8px;
  background-color: ${({ active }) => (active ? '#065894' : 'transparent')};
`;

const SearchRow = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 10px 12px;
  margin: 0 16px 8px;
  border-width: 1px;
  border-color: #ced5d7;
`;

const SearchInput = styled(TextInput)`
  flex: 1;
  font-size: 15px;
  color: #364a59;
`;

const HintView = styled.View`
  align-items: center;
  justify-content: center;
  padding: 48px 32px;
`;

const CenteredView = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 32px;
`;

const CardPressable = styled(Pressable)<{ theme: DefaultTheme }>`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 12px;
  padding: 16px;
`;

const CardHeader = styled.View`
  flex-direction: row;
  align-items: center;
`;

const BadgeRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-left: 8px;
`;

const CardFooter = styled.View`
  flex-direction: row;
  align-items: center;
`;

const FooterItem = styled.View`
  flex-direction: row;
  align-items: center;
`;

const JoinButtonWrap = styled.View`
  margin-left: auto;
`;

const CodeSection = styled.View`
  padding: 0 16px;
  flex: 1;
`;

const CodeInputRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const CodeInput = styled(TextInput)`
  flex: 1;
  font-size: 15px;
  color: #364a59;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 10px 12px;
  border-width: 1px;
  border-color: #ced5d7;
`;

const PreviewCard = styled.View<{ theme: DefaultTheme }>`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 12px;
  padding: 16px;
`;

const PreviewHeader = styled.View`
  flex-direction: row;
  align-items: center;
`;

const StatRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const InfoBanner = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: rgba(6, 88, 148, 0.08);
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
