import { useQuery } from '@tanstack/react-query';
import { fetchMyMatchPredictions } from '@/data/api/matches';
import { matchKeys } from './matchKeys';

export function useMyMatchPredictions(matchId: number | undefined) {
  return useQuery({
    queryKey: matchKeys.predictionsMe(matchId!),
    queryFn: () => fetchMyMatchPredictions(matchId!),
    enabled: matchId != null,
    staleTime: 30_000,
  });
}
