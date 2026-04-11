import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import { matchKeys, MatchFilters } from './matchKeys';
import { MatchDTO } from '@/data/dto/MatchDTO';
import { mapMatch } from '@/data/mappers/matchMapper';
import { TOURNAMENT_ID } from '@/constants/tournament';

export function useMatches(filters?: MatchFilters) {
  const query = useQuery({
    queryKey: matchKeys.byTournament(TOURNAMENT_ID, filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.stage)  params.set('stage',  filters.stage);
      if (filters?.group)  params.set('group',  filters.group);
      if (filters?.status) params.set('status', filters.status);
      const qs  = params.toString();
      const url = `/tournaments/${TOURNAMENT_ID}/matches${qs ? `?${qs}` : ''}`;

      const data = await apiFetch<{ matches: MatchDTO[] } | MatchDTO[]>(url);
      const dtos = Array.isArray(data) ? data : (data as { matches: MatchDTO[] }).matches;
      return dtos.map(mapMatch);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    matches: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
