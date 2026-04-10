import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import { matchKeys, MatchFilters } from './matchKeys';
import type { Match } from '@/domain/entities/Match';

const TOURNAMENT_ID = Number(process.env.EXPO_PUBLIC_TOURNAMENT_ID ?? '1');

export function useMatches(filters?: MatchFilters) {
  return useQuery({
    queryKey: matchKeys.byTournament(TOURNAMENT_ID, filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.stage)  params.set('stage',  filters.stage);
      if (filters?.group)  params.set('group',  filters.group);
      if (filters?.status) params.set('status', filters.status);
      const qs  = params.toString();
      const url = `/tournaments/${TOURNAMENT_ID}/matches${qs ? `?${qs}` : ''}`;
      const data = await apiFetch<{ matches: Match[] } | Match[]>(url);
      // API may return { matches: [...] } or a bare array — handle both
      return Array.isArray(data) ? data : (data as { matches: Match[] }).matches;
    },
    staleTime: 60_000,
  });
}
