import { useCallback, useState, useMemo } from 'react';
import { useFocusEffect } from 'expo-router';
import { useQuery, useQueries } from '@tanstack/react-query';

import { apiFetch } from '@/lib/apiClient';
import { matchKeys } from './matchKeys';
import { TOURNAMENT_ID } from '@/constants/tournament';
import { fetchMyMatchPredictions } from '@/data/api/matches';
import { mapMatch } from '@/data/mappers/matchMapper';
import { computeSwing, DEFAULT_SCORING_RULES } from '@/lib/scoring';
import type { MatchDTO } from '@/data/dto/MatchDTO';
import type { Match } from '@/domain/entities/Match';

// ── Types ─────────────────────────────────────────────────────────────────────

export type LiveMatchEntry = {
  match: Match;
  poolId: number | null;
  poolName: string | null;
  participantsCount: number | null;
  userRank: number | null;
  predictedHomeScore: number | null;
  predictedAwayScore: number | null;
  currentPointsSwing: number | null;
};

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
    return liveMatches.map((match, i) => {
      const preds = predQueries[i]?.data ?? [];
      const liveHome = match.homeTeamScore ?? 0;
      const liveAway = match.awayTeamScore ?? 0;

      const withPred = preds.filter((p) => p.prediction !== null);

      if (withPred.length === 0) {
        return {
          match,
          poolId: null,
          poolName: null,
          participantsCount: null,
          userRank: null,
          predictedHomeScore: null,
          predictedAwayScore: null,
          currentPointsSwing: null,
        };
      }

      // Pick the pool where the user is currently scoring highest
      const best = withPred.reduce((acc, p) => {
        const swing = computeSwing(
          p.prediction!.predictedHomeScore,
          p.prediction!.predictedAwayScore,
          liveHome,
          liveAway,
          match.stage,
          DEFAULT_SCORING_RULES,
        );
        const accSwing = computeSwing(
          acc.prediction!.predictedHomeScore,
          acc.prediction!.predictedAwayScore,
          liveHome,
          liveAway,
          match.stage,
          DEFAULT_SCORING_RULES,
        );
        return swing >= accSwing ? p : acc;
      });

      return {
        match,
        poolId: best.poolId,
        poolName: best.poolName,
        participantsCount: null,
        userRank: best.userRank,
        predictedHomeScore: best.prediction!.predictedHomeScore,
        predictedAwayScore: best.prediction!.predictedAwayScore,
        currentPointsSwing: computeSwing(
          best.prediction!.predictedHomeScore,
          best.prediction!.predictedAwayScore,
          liveHome,
          liveAway,
          match.stage,
          DEFAULT_SCORING_RULES,
        ),
      };
    });
  }, [liveMatches, predQueries]);

  return {
    liveMatchesWithMyPredictions,
    isLoading: matchesQuery.isLoading,
  };
}
