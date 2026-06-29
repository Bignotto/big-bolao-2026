import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '@/lib/apiClient';
import type { UserPredictionBreakdown } from '@/domain/entities/UserPredictionBreakdown';
import { poolKeys } from './poolKeys';

export function usePoolUserPredictions(poolId: number | undefined, userId: string | undefined) {
  const query = useQuery({
    queryKey: poolKeys.userPredictions(poolId!, userId!),
    queryFn: async () => {
      const data = await apiFetch<{ predictions: UserPredictionBreakdown[] }>(
        `/pools/${poolId}/users/${userId}/predictions`
      );
      return data.predictions;
    },
    enabled: !isNaN(poolId!) && !!poolId && !!userId,
  });

  return {
    predictions: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refresh: query.refetch,
  };
}
