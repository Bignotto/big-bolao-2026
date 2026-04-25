import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from 'styled-components/native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useMatch } from '@/hooks/useMatch';
import { usePool } from '@/hooks/usePool';
import { usePredictions } from '@/hooks/usePredictions';
import { useUpsertPrediction } from '@/hooks/useUpsertPrediction';
import { useSession } from '@/context/SessionContext';
import { isMatchLocked } from '@/domain/entities/Match';
import type { MatchStage } from '@/domain/entities/Match';
import { MatchStatus } from '@/domain/enums/MatchStatus';
import type { PredictionPayload } from '@/domain/entities/Prediction';

import AppButton from '@/components/AppComponents/AppButton';
import ScoreStepper from '@/components/AppComponents/ScoreStepper';
import { TypographyFamilies } from '@/constants/tokens';

// ─── Labels ───────────────────────────────────────────────────────────────────

const STAGE_LABELS: Record<MatchStage, string> = {
  GROUP: 'Grupo',
  ROUND_OF_32: 'Dezesseis Avos',
  ROUND_OF_16: 'Oitavas de Final',
  QUARTER_FINAL: 'Quartas de Final',
  SEMI_FINAL: 'Semifinal',
  THIRD_PLACE: '3º Lugar',
  LOSERS_MATCH: '3º Lugar',
  FINAL: 'Final',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

type MatchAny = { stage: MatchStage; group?: string | null; round?: number | null };

function stageEyebrow(m: MatchAny): string {
  if (m.stage === 'GROUP') {
    const g = m.group ? `GRUPO ${m.group}` : 'GRUPO';
    const r = m.round ? ` · RODADA ${m.round}` : '';
    return `${g}${r}`;
  }
  return STAGE_LABELS[m.stage].toUpperCase();
}

function formatDateLine(iso: string, stadium: string | null): string {
  const date = new Date(iso);
  const tz = 'America/Sao_Paulo';
  const wday = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', timeZone: tz })
    .format(date).replace('.', '');
  const day = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', timeZone: tz }).format(date);
  const mon = new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: tz })
    .format(date).replace('.', '');
  const time = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz,
  }).format(date);
  const w = wday.charAt(0).toUpperCase() + wday.slice(1);
  return `${w}, ${day} ${mon} · ${time}${stadium ? ` · ${stadium}` : ''}`;
}

function formatKickoffTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Sao_Paulo',
  });
}

type Rules = {
  exactScorePoints: number;
  correctWinnerGoalDiffPoints: number;
  correctWinnerPoints: number;
  correctDrawPoints: number;
};

function getInterpretation(
  homeScore: number,
  awayScore: number,
  homeName: string,
  awayName: string,
  rules: Rules | null | undefined,
) {
  if (homeScore === awayScore) {
    return {
      outcome: `Empate · ${homeScore}–${awayScore}`,
      detail: rules
        ? `Placar exato = ${rules.exactScorePoints} pts · empate correto = ${rules.correctDrawPoints} pts`
        : '',
    };
  }
  const winner = homeScore > awayScore ? homeName : awayName;
  const diff = Math.abs(homeScore - awayScore);
  return {
    outcome: `Vitória de ${winner} · saldo ${diff}`,
    detail: rules
      ? `Placar exato = ${rules.exactScorePoints} pts · vencedor + saldo = ${rules.correctWinnerGoalDiffPoints} pts`
      : '',
  };
}

// ─── Flag ─────────────────────────────────────────────────────────────────────

function Flag({ flagUrl, countryCode }: { flagUrl: string | null; countryCode: string | null }) {
  const [failed, setFailed] = useState(false);
  if (flagUrl && !failed) {
    return (
      <Image
        source={{ uri: flagUrl }}
        style={s.flag}
        resizeMode="cover"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <View style={[s.flag, s.flagFallback]}>
      <Text style={s.flagFallbackTxt}>{countryCode?.slice(0, 2) ?? '?'}</Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PredictScreen() {
  const { id, matchId: matchIdParam } = useLocalSearchParams<{ id: string; matchId: string }>();
  const poolId = id ? Number(id) : undefined;
  const matchId = matchIdParam ? Number(matchIdParam) : undefined;

  const router = useRouter();
  const theme = useTheme();
  const { apiUser } = useSession();

  const { data: match, isLoading: matchLoading } = useMatch(matchId);
  const { pool, loading: poolLoading } = usePool(poolId);
  const { data: predictions, isLoading: predsLoading } = usePredictions(
    poolId,
    matchId != null ? [matchId] : [],
    apiUser?.id,
  );

  const existingPrediction = predictions?.[0] ?? null;
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [rulesOpen, setRulesOpen] = useState(true);

  React.useEffect(() => {
    if (existingPrediction) {
      setHomeScore(existingPrediction.predictedHomeScore);
      setAwayScore(existingPrediction.predictedAwayScore);
    } else {
      setHomeScore(0);
      setAwayScore(0);
    }
  }, [
    matchId,
    existingPrediction?.id,
    existingPrediction?.predictedHomeScore,
    existingPrediction?.predictedAwayScore,
  ]);

  const mutation = useUpsertPrediction(poolId!);

  if (matchLoading || poolLoading || predsLoading) {
    return (
      <SafeAreaView style={[s.root, { backgroundColor: theme.colors.background }]}>
        <View style={s.centered}>
          <ActivityIndicator size="large" color={theme.colors.pitch} />
        </View>
      </SafeAreaView>
    );
  }

  if (!match || !pool) {
    return (
      <SafeAreaView style={[s.root, { backgroundColor: theme.colors.background }]}>
        <View style={s.centered}>
          <Text style={[s.errorTxt, { color: theme.colors.ink400 }]}>
            Não foi possível carregar os dados da partida.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const locked = isMatchLocked(match);
  const isDone = match.matchStatus === MatchStatus.COMPLETED;
  const rules = pool.scoringRules;
  const matchAny = match as typeof match & { round?: number | null };

  const interpretation = getInterpretation(
    homeScore,
    awayScore,
    match.homeTeam.countryCode ?? match.homeTeam.name,
    match.awayTeam.countryCode ?? match.awayTeam.name,
    rules,
  );

  function handleSubmit() {
    if (locked) {
      Alert.alert('Palpites encerrados', 'Este jogo já começou.');
      return;
    }
    const payload: PredictionPayload = {
      poolId: poolId!,
      matchId: matchId!,
      predictedHomeScore: homeScore,
      predictedAwayScore: awayScore,
      predictedHasExtraTime: false,
      predictedHasPenalties: false,
      predictedPenaltyHomeScore: null,
      predictedPenaltyAwayScore: null,
      predictionId: existingPrediction?.id,
    };
    mutation.mutate(payload, {
      onSuccess: () => router.back(),
      onError: (err) => Alert.alert('Erro', (err as Error).message),
    });
  }

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.colors.background }]}>
      {/* Top bar */}
      <View style={s.topBar}>
        <Pressable
          onPress={() => router.back()}
          style={[s.closeBtn, { backgroundColor: theme.colors.ink800 }]}
        >
          <Ionicons name="close" size={16} color={theme.colors.ink300} />
        </Pressable>
        <Text style={[s.poolEyebrow, { color: theme.colors.ink500 }]} numberOfLines={1}>
          {pool.name.toUpperCase()}
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Eyebrows */}
        <View style={s.eyebrowArea}>
          <Text style={[s.stageEyebrow, { color: theme.colors.pitch }]}>
            {stageEyebrow({ stage: match.stage, group: (match as any).group, round: matchAny.round })}
          </Text>
          <Text style={[s.dateLine, { color: theme.colors.ink400 }]}>
            {formatDateLine(match.matchDatetime, match.stadium ?? null)}
          </Text>
        </View>

        {/* Teams + Steppers */}
        <View style={s.stepperSection}>
          <View style={s.teamCol}>
            <Flag flagUrl={match.homeTeam.flagUrl} countryCode={match.homeTeam.countryCode} />
            <Text style={[s.teamName, { color: theme.colors.ink100 }]}>
              {match.homeTeam.countryCode ?? match.homeTeam.name}
            </Text>
            <View style={{ height: 16 }} />
            <ScoreStepper value={homeScore} onChange={setHomeScore} accent disabled={locked} />
          </View>

          <View style={s.vsCol}>
            <Text style={[s.vsTxt, { color: theme.colors.ink600 }]}>VS</Text>
          </View>

          <View style={s.teamCol}>
            <Flag flagUrl={match.awayTeam.flagUrl} countryCode={match.awayTeam.countryCode} />
            <Text style={[s.teamName, { color: theme.colors.ink100 }]}>
              {match.awayTeam.countryCode ?? match.awayTeam.name}
            </Text>
            <View style={{ height: 16 }} />
            <ScoreStepper value={awayScore} onChange={setAwayScore} accent disabled={locked} />
          </View>
        </View>

        {/* Interpretation card */}
        {!locked && (
          <View style={s.section}>
            <View style={[s.interpCard, { borderColor: theme.colors.ink700, backgroundColor: 'rgba(200,255,62,0.07)' }]}>
              <View style={s.interpRow}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.pitch} />
                <Text style={[s.interpOutcome, { color: theme.colors.pitch }]}>
                  {interpretation.outcome}
                </Text>
              </View>
              {!!interpretation.detail && (
                <Text style={[s.interpDetail, { color: theme.colors.ink400 }]}>
                  {interpretation.detail}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Result card (COMPLETED) */}
        {isDone && existingPrediction && (
          <View style={s.section}>
            <View style={[s.interpCard, { borderColor: 'rgba(200,255,62,0.3)', backgroundColor: 'rgba(200,255,62,0.07)' }]}>
              <Text style={[s.interpOutcome, { color: theme.colors.pitch }]}>
                Resultado: {match.homeTeamScore}–{match.awayTeamScore}
              </Text>
              <Text style={[s.interpDetail, { color: theme.colors.ink400 }]}>
                Você marcou {existingPrediction.pointsEarned ?? 0} pts · palpite {existingPrediction.predictedHomeScore}–{existingPrediction.predictedAwayScore}
              </Text>
            </View>
          </View>
        )}

        {/* COMO PONTUA collapsible — hidden when locked */}
        {!locked && rules && (
          <View style={s.section}>
            <Pressable
              onPress={() => setRulesOpen(!rulesOpen)}
              style={[
                s.rulesHeader,
                {
                  backgroundColor: theme.colors.ink900,
                  borderColor: theme.colors.ink800,
                  borderBottomLeftRadius: rulesOpen ? 0 : 14,
                  borderBottomRightRadius: rulesOpen ? 0 : 14,
                },
              ]}
            >
              <Text style={[s.rulesTitle, { color: theme.colors.ink500 }]}>COMO PONTUA</Text>
              <Ionicons
                name={rulesOpen ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={theme.colors.ink500}
              />
            </Pressable>
            {rulesOpen && (
              <View
                style={[
                  s.rulesBody,
                  { backgroundColor: theme.colors.ink900, borderColor: theme.colors.ink800 },
                ]}
              >
                <View style={s.rulesGrid}>
                  {[
                    { label: 'Placar exato', pts: rules.exactScorePoints },
                    { label: 'Vencedor + saldo', pts: rules.correctWinnerGoalDiffPoints },
                    { label: 'Vencedor', pts: rules.correctWinnerPoints },
                    { label: 'Empate', pts: rules.correctDrawPoints },
                  ].map((item) => (
                    <View key={item.label} style={s.rulesCell}>
                      <Text style={[s.rulesCellLabel, { color: theme.colors.ink400 }]}>
                        {item.label}
                      </Text>
                      <Text style={[s.rulesCellValue, { color: theme.colors.ink100 }]}>
                        {item.pts} pts
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Sticky CTA */}
      <View
        style={[
          s.cta,
          { backgroundColor: theme.colors.background, borderTopColor: theme.colors.ink800 },
        ]}
      >
        {locked ? (
          <View
            style={[
              s.lockedBanner,
              { backgroundColor: theme.colors.ink850, borderColor: theme.colors.ink800 },
            ]}
          >
            <Ionicons name="lock-closed" size={14} color={theme.colors.ink500} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[s.lockedTitle, { color: theme.colors.ink300 }]}>
                Palpite travado em {formatKickoffTime(match.matchDatetime)}
              </Text>
              {existingPrediction && (
                <Text style={[s.lockedSub, { color: theme.colors.ink500 }]}>
                  Você palpitou {existingPrediction.predictedHomeScore}–{existingPrediction.predictedAwayScore}
                </Text>
              )}
            </View>
          </View>
        ) : (
          <AppButton
            title={`${existingPrediction ? 'Atualizar' : 'Salvar'} palpite · ${homeScore}–${awayScore} →`}
            variant="primary"
            size="lg"
            isLoading={mutation.isPending}
            onPress={handleSubmit}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorTxt: { fontFamily: TypographyFamilies.sans, fontSize: 14, textAlign: 'center' },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  poolEyebrow: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 10,
    letterSpacing: 1,
    flex: 1,
    textAlign: 'center',
    includeFontPadding: false,
  },

  eyebrowArea: { paddingHorizontal: 20, paddingBottom: 20 },
  stageEyebrow: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 10,
    letterSpacing: 1,
    includeFontPadding: false,
    marginBottom: 4,
  },
  dateLine: {
    fontFamily: TypographyFamilies.sans,
    fontSize: 13,
    includeFontPadding: false,
  },

  stepperSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  teamCol: { flex: 1, alignItems: 'center' },
  vsCol: {
    width: 40,
    alignItems: 'center',
    paddingTop: 140,
  },
  vsTxt: {
    fontFamily: TypographyFamilies.sansSemi,
    fontSize: 13,
    letterSpacing: 1,
    includeFontPadding: false,
  },
  teamName: {
    fontFamily: TypographyFamilies.sansSemi,
    fontSize: 14,
    marginTop: 8,
    includeFontPadding: false,
  },
  flag: {
    width: 48, height: 34, borderRadius: 3,
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)',
  },
  flagFallback: { backgroundColor: '#262E36', alignItems: 'center', justifyContent: 'center' },
  flagFallbackTxt: { fontFamily: TypographyFamilies.mono, fontSize: 11, color: '#8A949E' },

  section: { paddingHorizontal: 16, marginBottom: 12 },

  interpCard: { borderRadius: 14, borderWidth: 1, padding: 14 },
  interpRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  interpOutcome: {
    fontFamily: TypographyFamilies.sansSemi,
    fontSize: 14,
    flex: 1,
    includeFontPadding: false,
  },
  interpDetail: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 11,
    includeFontPadding: false,
  },

  rulesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rulesTitle: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 10,
    letterSpacing: 0.8,
    includeFontPadding: false,
  },
  rulesBody: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    padding: 16,
  },
  rulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 14,
    columnGap: 0,
  },
  rulesCell: { width: '50%' },
  rulesCellLabel: {
    fontFamily: TypographyFamilies.sans,
    fontSize: 11,
    includeFontPadding: false,
    marginBottom: 2,
  },
  rulesCellValue: {
    fontFamily: TypographyFamilies.display,
    fontSize: 16,
    includeFontPadding: false,
  },

  cta: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
  },
  lockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  lockedTitle: {
    fontFamily: TypographyFamilies.sansMedium,
    fontSize: 14,
    includeFontPadding: false,
  },
  lockedSub: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 12,
    marginTop: 2,
    includeFontPadding: false,
  },
});
