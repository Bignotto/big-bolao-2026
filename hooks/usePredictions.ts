import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import { predictionKeys } from './predictionKeys';
import type { Prediction } from '@/domain/entities/Prediction';

type PredictionsResponse = { predictions: Prediction[] } | Prediction[];

export function usePredictions(
  poolId: number | undefined,
  matchIds: number[],
  userId: string | undefined,
) {
  return useQuery({
    queryKey: predictionKeys.byPool(poolId!),
    queryFn: async () => {
      const params = new URLSearchParams({ poolId: String(poolId) });
      const data = await apiFetch<PredictionsResponse>(`/users/me/predictions?${params}`);
      const list = Array.isArray(data) ? data : data.predictions;
      const allowedMatchIds = new Set(matchIds);

      return list.filter(
        (prediction) =>
          prediction.poolId === poolId &&
          prediction.userId === userId &&
          (allowedMatchIds.size === 0 || allowedMatchIds.has(prediction.matchId)),
      );
    },
    enabled: poolId != null && userId != null,
    staleTime: 30_000,
  });
}
