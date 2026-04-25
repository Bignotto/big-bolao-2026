import { useMemo } from 'react';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import { useMatch } from './useMatch';
import { useMyMatchPredictions } from './useMyMatchPredictions';
import { usePools, type Pool } from './usePools';
import type { MyMatchPredictionEntry } from '@/domain/entities/MatchPredictionStatus';

export type PoolPredictionItem = {
  poolId: number;
  poolName: string;
  participantsCount: number | null;
  userRank: number | null;
  prediction: MyMatchPredictionEntry['prediction'];
};

export function useMatchPoolPredictions(matchId: number | undefined) {
  const matchQuery = useMatch(matchId);
  const predsQuery = useMyMatchPredictions(matchId);
  const { pools, loading: poolsLoading } = usePools();

  // Revalidate on screen focus so edits from predict screen reflect here
  useFocusEffect(
    useCallback(() => {
      if (matchId != null) predsQuery.refetch();
    }, [matchId]),
  );

  const poolsById = useMemo(() => {
    const map = new Map<number, Pool>();
    for (const p of pools) map.set(p.id, p);
    return map;
  }, [pools]);

  const poolPredictions: PoolPredictionItem[] = useMemo(() => {
    if (!predsQuery.data) return [];
    return predsQuery.data.map((entry) => ({
      poolId: entry.poolId,
      poolName: entry.poolName,
      participantsCount: poolsById.get(entry.poolId)?.participantsCount ?? null,
      userRank: entry.userRank,
      prediction: entry.prediction,
    }));
  }, [predsQuery.data, poolsById]);

  return {
    match: matchQuery.data,
    poolPredictions,
    isLoading: matchQuery.isLoading || predsQuery.isLoading || poolsLoading,
    refetch: predsQuery.refetch,
  };
}
