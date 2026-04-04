import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '@/lib/apiClient';
import { poolKeys } from './poolKeys';

export type LeaderboardEntry = {
  poolId: number;
  userId: string;
  totalPoints: number;
  exactScoresCount: number;
  correctWinnersCount: number;
  rank: number | null;
  lastUpdated: string | null;
  user: {
    id: string;
    fullName: string;
    profileImageUrl: string | null;
  };
};

export function usePoolStandings(poolId: number | undefined) {
  const query = useQuery({
    queryKey: poolKeys.standings(poolId!),
    queryFn: async () => {
      const data = await apiFetch<
        { standings?: LeaderboardEntry[] } | LeaderboardEntry[]
      >(`/pools/${poolId}/standings`);
      return Array.isArray(data) ? data : (data.standings ?? []);
    },
    enabled: !!poolId,
    refetchInterval: 60_000,
  });

  return {
    standings: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refresh: query.refetch,
  };
}
