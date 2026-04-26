import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'styled-components/native';

import { useMatches } from '@/hooks/useMatches';
import type { Match } from '@/domain/entities/Match';
import { MatchStage, STAGE_LABELS } from '@/domain/enums/MatchStage';
import {
  filterByGroup,
  filterByStage,
  filterByDate,
  groupByRound,
} from '@/domain/helpers/matchFilters';
import {
  getAvailableDates,
  getDefaultMatchDate,
  isGroupChip,
  ALL_MATCH_FILTER_CHIPS,
  type MatchFilterChipValue,
  type MatchFilterMode,
  GROUP_LETTERS,
  type GroupLetter,
} from '@/components/matches/MatchFilterControls';
import MatchCard from '@/components/AppComponents/MatchCard';
import { TypographyFamilies } from '@/constants/tokens';

// ─── Group standings computation ──────────────────────────────────────────────

type Team = Match['homeTeam'];

type TeamRow = {
  team: Team;
  points: number;
  goalDiff: number;
};

function computeGroupStandings(matches: Match[], group: string): TeamRow[] {
  const map = new Map<string, TeamRow>();

  function ensure(team: Team): TeamRow {
    if (!map.has(team.name)) map.set(team.name, { team, points: 0, goalDiff: 0 });
    return map.get(team.name)!;
  }

  for (const m of matches) {
    if ((m as any).group !== group) continue;
    const home = ensure(m.homeTeam);
    const away = ensure(m.awayTeam);
    if (m.matchStatus !== 'COMPLETED') continue;
    const hg = m.homeTeamScore ?? 0;
    const ag = m.awayTeamScore ?? 0;
    home.goalDiff += hg - ag;
    away.goalDiff += ag - hg;
    if (hg > ag) { home.points += 3; }
    else if (ag > hg) { away.points += 3; }
    else { home.points += 1; away.points += 1; }
  }

  return Array.from(map.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.goalDiff - a.goalDiff;
  });
}

// ─── Round header label ───────────────────────────────────────────────────────

function roundLabel(round: number, roundMatches: Match[]): string {
  const first = roundMatches[0];
  if (!first) return `RODADA ${round}`;
  const date = new Date(first.matchDatetime);
  const tz = 'America/Sao_Paulo';
  const wday = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', timeZone: tz })
    .format(date).replace('.', '').toUpperCase();
  const day = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', timeZone: tz }).format(date);
  const mon = new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: tz })
    .format(date).replace('.', '').toUpperCase();
  return `RODADA ${round} · ${wday} ${day} ${mon}`;
}

// ─── Flag ─────────────────────────────────────────────────────────────────────

function Flag({ team }: { team: Team }) {
  const [failed, setFailed] = useState(false);
  if (team.flagUrl && !failed) {
    return (
      <Image
        source={{ uri: team.flagUrl }}
        style={sf.flag}
        resizeMode="cover"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <View style={[sf.flag, sf.flagFallback]}>
      <Text style={sf.flagFallbackTxt}>{team.countryCode?.slice(0, 2) ?? '?'}</Text>
    </View>
  );
}

// ─── Mini standings table ─────────────────────────────────────────────────────

function GroupStandingsTable({ rows }: { rows: TeamRow[] }) {
  const theme = useTheme();
  if (rows.length === 0) return null;

  return (
    <View
      style={[
        sf.standingsCard,
        { backgroundColor: theme.colors.ink850, borderColor: theme.colors.ink800 },
      ]}
    >
      {rows.map((row, i) => {
        const isTop = i < 2;
        return (
          <View key={row.team.name} style={[sf.standingsRow, i < rows.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.ink800 }]}>
            <Text style={[sf.standingsPos, { color: isTop ? theme.colors.pitch : theme.colors.ink500 }]}>
              {i + 1}
            </Text>
            <Flag team={row.team} />
            <Text style={[sf.standingsName, { color: isTop ? theme.colors.pitch : theme.colors.ink300 }]} numberOfLines={1}>
              {row.team.countryCode ?? row.team.name}
            </Text>
            <Text style={[sf.standingsGD, { color: theme.colors.ink400 }]}>
              {row.goalDiff > 0 ? '+' : ''}{row.goalDiff}
            </Text>
            <Text style={[sf.standingsPts, { color: theme.colors.ink100 }]}>
              {row.points}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ─── Group view ───────────────────────────────────────────────────────────────

function GroupView({ group, matches }: { group: string; matches: Match[] }) {
  const theme = useTheme();
  const groupMatches = useMemo(
    () => filterByGroup(matches, group as GroupLetter),
    [matches, group],
  );
  const rounds = useMemo(() => groupByRound(groupMatches), [groupMatches]);
  const standings = useMemo(() => computeGroupStandings(matches, group), [matches, group]);

  const totalGames = groupMatches.length;
  const totalRounds = rounds.length;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      {/* Group letter header */}
      <View style={sf.groupHeader}>
        <Text style={[sf.groupLetter, { color: theme.colors.ink100 }]}>{group}</Text>
        <View>
          <Text style={[sf.groupMeta1, { color: theme.colors.ink500 }]}>GRUPO</Text>
          <Text style={[sf.groupMeta2, { color: theme.colors.ink400 }]}>
            {totalGames} jogos · {totalRounds} rodadas
          </Text>
        </View>
      </View>

      {/* Standings */}
      <View style={sf.section}>
        <GroupStandingsTable rows={standings} />
      </View>

      {/* Round sections */}
      {rounds.map(({ round, matches: roundMatches }) => (
        <View key={round}>
          <View style={sf.roundHeader}>
            <Text style={[sf.roundLabel, { color: theme.colors.pitch }]}>
              {roundLabel(round, roundMatches)}
            </Text>
            <View style={[sf.roundLine, { backgroundColor: theme.colors.ink800 }]} />
          </View>
          <View style={[sf.roundCard, { backgroundColor: theme.colors.ink850, borderColor: theme.colors.ink800 }]}>
            {roundMatches.map((m, i) => (
              <MatchCard
                key={m.id}
                match={m}
                showBorder={i < roundMatches.length - 1}
              />
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// ─── Knockout view ────────────────────────────────────────────────────────────

function KnockoutView({
  stage,
  matches,
  isFetching,
  refetch,
}: {
  stage: MatchStage;
  matches: Match[];
  isFetching: boolean;
  refetch: () => void;
}) {
  const theme = useTheme();
  const stageMatches = useMemo(() => filterByStage(matches, stage), [matches, stage]);

  return (
    <FlatList<Match>
      data={stageMatches}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={sf.listContent}
      refreshControl={
        <RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={theme.colors.pitch} />
      }
      ListEmptyComponent={
        <View style={sf.centered}>
          <Text style={[sf.emptyTxt, { color: theme.colors.ink500 }]}>
            Nenhuma partida encontrada
          </Text>
        </View>
      }
      renderItem={({ item }) => <MatchCard match={item} />}
    />
  );
}

// ─── Date view ────────────────────────────────────────────────────────────────

function DateView({
  dateMatches,
  isFetching,
  refetch,
}: {
  dateMatches: Match[];
  isFetching: boolean;
  refetch: () => void;
}) {
  const theme = useTheme();
  return (
    <FlatList<Match>
      data={dateMatches}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={sf.listContent}
      refreshControl={
        <RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={theme.colors.pitch} />
      }
      ListEmptyComponent={
        <View style={sf.centered}>
          <Text style={[sf.emptyTxt, { color: theme.colors.ink500 }]}>
            Nenhuma partida encontrada
          </Text>
        </View>
      }
      renderItem={({ item }) => <MatchCard match={item} />}
    />
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MatchesScreen() {
  const theme = useTheme();
  const [mode, setMode] = useState<MatchFilterMode>('group-stage');
  const [selectedChip, setSelectedChip] = useState<MatchFilterChipValue>('A');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { matches, isLoading, refetch, isFetching } = useMatches();

  const defaultDate = useMemo(() => getDefaultMatchDate(matches), [matches]);
  const effectiveDate = selectedDate ?? defaultDate;
  const availableDates = useMemo(() => getAvailableDates(matches), [matches]);
  const dateMatches = useMemo(
    () => filterByDate(matches, effectiveDate),
    [matches, effectiveDate],
  );

  const isGroup = isGroupChip(selectedChip);

  return (
    <SafeAreaView style={[sf.root, { backgroundColor: theme.colors.background }]}>
      {/* ── Fixed header ── */}
      <View style={sf.fixedTop}>
        {/* Eyebrow + title */}
        <View style={sf.titleArea}>
          <Text style={[sf.eyebrow, { color: theme.colors.ink500 }]}>
            COPA DO MUNDO · 2026
          </Text>
          <Text style={[sf.title, { color: theme.colors.ink100 }]}>Partidas</Text>
        </View>

        {/* Mode switcher */}
        <View style={sf.modeSwitcher}>
          {(['group-stage', 'by-date'] as MatchFilterMode[]).map((m) => {
            const active = mode === m;
            const label = m === 'group-stage' ? 'Por grupo' : 'Por data';
            return (
              <Pressable
                key={m}
                onPress={() => setMode(m)}
                style={[
                  sf.modeBtn,
                  active
                    ? { backgroundColor: theme.colors.ink800, borderColor: theme.colors.ink700 }
                    : { backgroundColor: 'transparent', borderColor: 'transparent' },
                ]}
              >
                <Text
                  style={[
                    sf.modeTxt,
                    { color: active ? theme.colors.ink100 : theme.colors.ink400 },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Chip row (group-stage mode) */}
        {mode === 'group-stage' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={sf.chipScroll}
            style={sf.chipRow}
          >
            {ALL_MATCH_FILTER_CHIPS.map(({ label, value }) => {
              const active = value === selectedChip;
              return (
                <Pressable
                  key={String(value)}
                  onPress={() => setSelectedChip(value)}
                  style={[
                    sf.chip,
                    active
                      ? { backgroundColor: theme.colors.pitch }
                      : { backgroundColor: 'transparent', borderColor: theme.colors.ink700 },
                  ]}
                >
                  <Text
                    style={[
                      sf.chipTxt,
                      { color: active ? theme.colors.pitchInk : theme.colors.ink300 },
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {/* Date pills (by-date mode) */}
        {mode === 'by-date' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={sf.chipScroll}
            style={sf.dateRow}
          >
            {availableDates.map((date) => {
              const active = date === effectiveDate;
              const d = new Date(`${date}T12:00:00`);
              const wday = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
              const day = d.getDate();
              return (
                <Pressable
                  key={date}
                  onPress={() => setSelectedDate(date)}
                  style={[
                    sf.datePill,
                    active
                      ? { backgroundColor: theme.colors.pitch }
                      : { backgroundColor: 'transparent', borderColor: theme.colors.ink700 },
                  ]}
                >
                  <Text style={[sf.datePillWday, { color: active ? theme.colors.pitchInk : theme.colors.ink400 }]}>
                    {wday.charAt(0).toUpperCase() + wday.slice(1)}
                  </Text>
                  <Text style={[sf.datePillDay, { color: active ? theme.colors.pitchInk : theme.colors.ink100 }]}>
                    {day}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* ── Content ── */}
      {mode === 'by-date' ? (
        <DateView dateMatches={dateMatches} isFetching={isFetching ?? isLoading} refetch={refetch} />
      ) : isGroup ? (
        <GroupView group={selectedChip as string} matches={matches} />
      ) : (
        <KnockoutView
          stage={selectedChip as MatchStage}
          matches={matches}
          isFetching={isFetching ?? isLoading}
          refetch={refetch}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const sf = StyleSheet.create({
  root: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTxt: {
    fontFamily: TypographyFamilies.sans,
    fontSize: 14,
    textAlign: 'center',
    includeFontPadding: false,
  },
  listContent: { flexGrow: 1, paddingBottom: 32 },

  // Fixed top
  fixedTop: { paddingBottom: 4 },
  titleArea: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  eyebrow: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 10,
    letterSpacing: 1,
    includeFontPadding: false,
    marginBottom: 4,
  },
  title: {
    fontFamily: TypographyFamilies.display,
    fontSize: 40,
    letterSpacing: -1.2,
    lineHeight: 44,
    includeFontPadding: false,
  },

  // Mode switcher
  modeSwitcher: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 4,
    marginBottom: 12,
  },
  modeBtn: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  modeTxt: {
    fontFamily: TypographyFamilies.sansMedium,
    fontSize: 13,
    includeFontPadding: false,
  },

  // Chips
  chipRow: { flexGrow: 0, height: 48 },
  chipScroll: {
    paddingHorizontal: 20,
    alignItems: 'center' as const,
    height: 48,
    gap: 8,
  },
  chip: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 100,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipTxt: {
    fontFamily: TypographyFamilies.sansMedium,
    fontSize: 13,
    includeFontPadding: false,
  },

  // Date pills
  dateRow: { flexGrow: 0, height: 68 },
  datePill: {
    width: 44,
    height: 56,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePillWday: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 10,
    includeFontPadding: false,
  },
  datePillDay: {
    fontFamily: TypographyFamilies.display,
    fontSize: 18,
    includeFontPadding: false,
  },

  // Group view
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
  },
  groupLetter: {
    fontFamily: TypographyFamilies.display,
    fontSize: 44,
    letterSpacing: -1.5,
    includeFontPadding: false,
    lineHeight: 48,
  },
  groupMeta1: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 9,
    letterSpacing: 0.8,
    includeFontPadding: false,
  },
  groupMeta2: {
    fontFamily: TypographyFamilies.sans,
    fontSize: 12,
    includeFontPadding: false,
    marginTop: 2,
  },
  section: { paddingHorizontal: 16, marginBottom: 8 },

  // Standings
  standingsCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  standingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  standingsPos: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 12,
    width: 16,
    textAlign: 'right',
    includeFontPadding: false,
  },
  flag: {
    width: 24, height: 16, borderRadius: 2,
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)',
  },
  flagFallback: { backgroundColor: '#262E36', alignItems: 'center', justifyContent: 'center' },
  flagFallbackTxt: { fontFamily: TypographyFamilies.mono, fontSize: 8, color: '#8A949E' },
  standingsName: {
    fontFamily: TypographyFamilies.sansMedium,
    fontSize: 13,
    flex: 1,
    includeFontPadding: false,
  },
  standingsGD: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 12,
    width: 28,
    textAlign: 'right',
    includeFontPadding: false,
  },
  standingsPts: {
    fontFamily: TypographyFamilies.display,
    fontSize: 18,
    width: 28,
    textAlign: 'right',
    includeFontPadding: false,
  },

  // Round sections
  roundHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  roundLabel: {
    fontFamily: TypographyFamilies.mono,
    fontSize: 10,
    letterSpacing: 0.8,
    includeFontPadding: false,
  },
  roundLine: { flex: 1, height: 1 },
  roundCard: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 4,
  },
});
