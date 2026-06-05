import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from 'styled-components/native';

import { usePool } from '@/hooks/usePool';
import { usePoolMembers } from '@/hooks/usePoolMembers';
import { useJoinPool } from '@/hooks/useJoinPool';
import AppAvatar from '@/components/AppComponents/AppAvatar';
import AppButton from '@/components/AppComponents/AppButton';
import { TypographyFamilies } from '@/constants/tokens';

export default function JoinPoolScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const poolId = id ? Number(id) : undefined;
  const router = useRouter();
  const c = useTheme().colors;

  const { pool, loading: poolLoading } = usePool(poolId);
  const { members, loading: membersLoading } = usePoolMembers(poolId);
  const { joining, joinError, joinById, clearJoinError } = useJoinPool();

  async function handleJoin() {
    if (!poolId) return;
    clearJoinError();
    const success = await joinById(poolId);
    if (success) {
      router.replace(`/pool/${poolId}`);
    }
  }

  if (poolLoading || !pool) {
    return (
      <SafeAreaView style={[s.root, { backgroundColor: c.background }]}>
        <View style={s.centered}>
          <ActivityIndicator size="large" color={c.pitch} />
        </View>
      </SafeAreaView>
    );
  }

  const capacityText =
    pool.maxParticipants != null
      ? `${pool.participantsCount} / ${pool.maxParticipants} participantes`
      : `${pool.participantsCount} participantes`;

  return (
    <SafeAreaView style={[s.root, { backgroundColor: c.background }]}>
      {/* Nav row */}
      <View style={s.navRow}>
        <Pressable
          onPress={() => router.back()}
          style={[s.navBtn, { backgroundColor: c.ink800 }]}
        >
          <Ionicons name="chevron-back" size={18} color={c.ink300} />
        </Pressable>
        <Text style={[s.navEyebrow, { color: c.ink500 }]}>ENTRAR NO GRUPO</Text>
        <View style={s.navBtn} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Privacy badge */}
        <View style={[s.privacyBadge, { backgroundColor: c.ink800 }]}>
          <Ionicons
            name={pool.isPrivate ? 'lock-closed-outline' : 'globe-outline'}
            size={12}
            color={pool.isPrivate ? c.pitch : c.ink500}
          />
          <Text style={[s.privacyBadgeText, { color: pool.isPrivate ? c.pitch : c.ink500 }]}>
            {pool.isPrivate ? 'Privado' : 'Público'}
          </Text>
        </View>

        <View style={{ height: 10 }} />

        {/* Pool name */}
        <Text style={[s.heroTitle, { color: c.ink100 }]} numberOfLines={3}>
          {pool.name}
        </Text>

        {/* Description */}
        {!!pool.description && (
          <Text style={[s.description, { color: c.ink400 }]}>{pool.description}</Text>
        )}

        {/* Capacity */}
        <View style={s.capacityRow}>
          <Ionicons name="people-outline" size={15} color={c.ink500} />
          <Text style={[s.capacityText, { color: c.ink500 }]}>{capacityText}</Text>
        </View>

        <View style={{ height: 28 }} />

        {/* Members */}
        <Text style={[s.sectionLabel, { color: c.ink400 }]}>PARTICIPANTES</Text>
        <View style={{ height: 8 }} />
        <View style={[s.card, { backgroundColor: c.ink850 }]}>
          {membersLoading ? (
            <View style={s.cardCenter}>
              <ActivityIndicator size="small" color={c.pitch} />
            </View>
          ) : members.length === 0 ? (
            <Text style={[s.hint, { color: c.ink500 }]}>Nenhum participante ainda.</Text>
          ) : (
            members.map((member, i) => {
              const name = member.fullName ?? member.name ?? 'Participante';
              return (
                <View key={member.id || i}>
                  {i > 0 && <View style={[s.divider, { backgroundColor: c.ink700 }]} />}
                  <View style={s.memberRow}>
                    <AppAvatar
                      imagePath={member.profileImageUrl ?? undefined}
                      name={name}
                      size={36}
                    />
                    <Text style={[s.memberName, { color: c.ink100 }]} numberOfLines={1}>
                      {name}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky bottom action */}
      <View style={[s.bottomBar, { backgroundColor: c.background, borderTopColor: c.ink800 }]}>
        {!!joinError && (
          <View style={[s.errorBanner, { backgroundColor: c.ink850, borderColor: c.signalLose }]}>
            <Ionicons name="alert-circle-outline" size={16} color={c.signalLose} />
            <Text style={[s.errorText, { color: c.signalLose }]}>{joinError}</Text>
          </View>
        )}
        <AppButton
          title="Entrar no Grupo"
          variant="primary"
          size="lg"
          isLoading={joining}
          onPress={handleJoin}
        />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navEyebrow: { fontFamily: TypographyFamilies.sansSemi, fontSize: 11, letterSpacing: 0.8 },
  scroll: { paddingHorizontal: 16, paddingTop: 8 },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  privacyBadgeText: { fontFamily: TypographyFamilies.sansSemi, fontSize: 12 },
  heroTitle: { fontFamily: TypographyFamilies.display, fontSize: 32, lineHeight: 36 },
  description: { fontFamily: TypographyFamilies.sans, fontSize: 14, lineHeight: 20, marginTop: 8 },
  capacityRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  capacityText: { fontFamily: TypographyFamilies.sansMedium, fontSize: 13 },
  sectionLabel: { fontFamily: TypographyFamilies.sansSemi, fontSize: 11, letterSpacing: 0.8 },
  card: { borderRadius: 16, overflow: 'hidden' },
  cardCenter: { padding: 20, alignItems: 'center' },
  divider: { height: 1, marginHorizontal: 14 },
  hint: { fontFamily: TypographyFamilies.sans, fontSize: 13, padding: 14, lineHeight: 18 },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 12,
  },
  memberName: { flex: 1, fontFamily: TypographyFamilies.sansSemi, fontSize: 14 },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    gap: 10,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
  },
  errorText: { fontFamily: TypographyFamilies.sans, fontSize: 13, flex: 1 },
});
