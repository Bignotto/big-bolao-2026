import { useCallback, useState, useMemo } from 'react';
import { useFocusEffect } from 'expo-router';
import { useQuery, useQueries } from '@tanstack/react-query';

import { apiFetch } from '@/lib/apiClient';
import { matchKeys } from './matchKeys';
import { TOURNAMENT_ID } from '@/constants/tournament';
import { fetchMyMatchPredictions } from '@/data/api/matches';
import { mapMatch } from '@/data/mappers/matchMapper';
import type { MatchDTO } from '@/data/dto/MatchDTO';
import type { Match } from '@/domain/entities/Match';

// ── Types ─────────────────────────────────────────────────────────────────────

export type LiveMatchEntry = {
  match: Match;
  poolId: number;
  poolName: string;
  participantsCount: number | null;
  userRank: number | null;
  predictedHomeScore: number;
  predictedAwayScore: number;
  currentPointsSwing: number;
};

// ── Scoring ───────────────────────────────────────────────────────────────────

function computeSwing(
  predHome: number,
  predAway: number,
  liveHome: number,
  liveAway: number,
  stage: string,
): number {
  const predWinner =
    predHome > predAway ? 'home' : predHome < predAway ? 'away' : 'draw';
  const liveWinner =
    liveHome > liveAway ? 'home' : liveHome < liveAway ? 'away' : 'draw';

  let base = 0;
  if (predHome === liveHome && predAway === liveAway) {
    base = 5;
  } else if (
    predWinner === liveWinner &&
    predHome - predAway === liveHome - liveAway
  ) {
    base = 3;
  } else if (predWinner === liveWinner) {
    base = 2;
  }

  const mult =
    stage === 'FINAL' ? 2.0 : stage === 'GROUP' ? 1.0 : 1.5;

  return Math.round(base * mult * 10) / 10;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useLiveMatches() {
  const [isFocused, setIsFocused] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, []),
  );

  // Fetch IN_PROGRESS matches; re-poll every 30s while focused
  const matchesQuery = useQuery({
    queryKey: matchKeys.byTournament(TOURNAMENT_ID, { status: 'IN_PROGRESS' }),
    queryFn: async () => {
      const url = `/tournaments/${TOURNAMENT_ID}/matches?status=IN_PROGRESS`;
      const data = await apiFetch<{ matches: MatchDTO[] } | MatchDTO[]>(url);
      const dtos = Array.isArray(data)
        ? data
        : (data as { matches: MatchDTO[] }).matches;
      return dtos.map(mapMatch).filter((m) => m.matchStatus === 'IN_PROGRESS');
    },
    enabled: isFocused,
    refetchInterval: isFocused ? 30_000 : false,
    staleTime: 0,
  });

  const liveMatches: Match[] = matchesQuery.data ?? [];

  // Fetch user predictions for each live match in parallel
  const predQueries = useQueries({
    queries: liveMatches.map((m) => ({
      queryKey: matchKeys.predictionsMe(m.id),
      queryFn: () => fetchMyMatchPredictions(m.id),
      enabled: isFocused,
      refetchInterval: isFocused ? 30_000 : false,
      staleTime: 0,
    })),
  });

  const liveMatchesWithMyPredictions = useMemo<LiveMatchEntry[]>(() => {
    return liveMatches.flatMap((match, i) => {
      const preds = predQueries[i]?.data;
      if (!preds || preds.length === 0) return [];

      const liveHome = match.homeTeamScore ?? 0;
      const liveAway = match.awayTeamScore ?? 0;

      // Only pools where the user has actually submitted a prediction
      const withPred = preds.filter((p) => p.prediction !== null);
      if (withPred.length === 0) return [];

      // Pick the pool where the user is currently scoring highest
      const best = withPred.reduce((acc, p) => {
        const swing = computeSwing(
          p.prediction!.predictedHomeScore,
          p.prediction!.predictedAwayScore,
          liveHome,
          liveAway,
          match.stage,
        );
        const accSwing = computeSwing(
          acc.prediction!.predictedHomeScore,
          acc.prediction!.predictedAwayScore,
          liveHome,
          liveAway,
          match.stage,
        );
        return swing >= accSwing ? p : acc;
      });

      return [
        {
          match,
          poolId: best.poolId,
          poolName: best.poolName,
          participantsCount: null, // not available from predictions endpoint
          userRank: best.userRank,
          predictedHomeScore: best.prediction!.predictedHomeScore,
          predictedAwayScore: best.prediction!.predictedAwayScore,
          currentPointsSwing: computeSwing(
            best.prediction!.predictedHomeScore,
            best.prediction!.predictedAwayScore,
            liveHome,
            liveAway,
            match.stage,
          ),
        },
      ];
    });
  }, [liveMatches, predQueries]);

  return {
    liveMatchesWithMyPredictions,
    isLoading: matchesQuery.isLoading,
  };
}
