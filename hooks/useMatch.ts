import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import { matchKeys } from './matchKeys';
import type { Match } from '@/domain/entities/Match';

export function useMatch(matchId: number | undefined) {
  return useQuery({
    queryKey: matchKeys.detail(matchId!),
    queryFn: async () => {
      const data = await apiFetch<{ match: Match } | Match>(`/matches/${matchId}`);
      return 'match' in data ? data.match : data;
    },
    enabled: matchId != null,
    staleTime: 30_000,
  });
}
