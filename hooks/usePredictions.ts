import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import { predictionKeys } from './predictionKeys';
import type { Prediction } from '@/domain/entities/Prediction';

// TODO: N+1 pattern — one request per match. Replace with a dedicated
// GET /pools/:poolId/predictions?userId=X endpoint when available on the backend.

type PredictionsResponse = { predictions: Prediction[] } | Prediction[];

export function usePredictions(
  poolId: number | undefined,
  matchIds: number[],   // pass the IDs of all matches in the tournament
  userId: string | undefined,
) {
  return useQuery({
    queryKey: predictionKeys.byPool(poolId!),
    queryFn: async () => {
      const results = await Promise.allSettled(
        matchIds.map((matchId) =>
          apiFetch<PredictionsResponse>(`/matches/${matchId}/predictions`)
        )
      );

      const all: Prediction[] = [];
      for (const result of results) {
        if (result.status === 'fulfilled') {
          const data = result.value;
          const list = Array.isArray(data) ? data : data.predictions;
          // Filter to only this user's predictions in this pool
          const mine = list.filter(
            (p) => p.userId === userId && p.poolId === poolId
          );
          all.push(...mine);
        }
        // rejected: silently skip — partial data is better than no data
      }
      return all;
    },
    enabled: poolId != null && userId != null && matchIds.length > 0,
    staleTime: 30_000,
  });
}
