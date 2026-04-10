import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import type { MatchPredictionStatus } from '@/domain/entities/MatchPredictionStatus';

export function useMyMatchPredictions(matchId: number | undefined) {
  return useQuery({
    queryKey: ['match-predictions-me', matchId],
    queryFn: async () => {
      const data = await apiFetch<{ predictions: MatchPredictionStatus[] }>(
        `/matches/${matchId}/predictions/me`,
      );
      return data.predictions;
    },
    enabled: matchId != null,
    staleTime: 30_000,
  });
}
