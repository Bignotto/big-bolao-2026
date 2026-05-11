import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import { TOURNAMENT_ID } from '@/constants/tournament';

type TournamentStats = {
  id: number;
  totalMatches: number;
  completedMatches: number;
};

export function useTournament() {
  const query = useQuery({
    queryKey: ['tournament', TOURNAMENT_ID],
    queryFn: async () => {
      const data = await apiFetch<{ tournament?: TournamentStats } | TournamentStats>(`/tournaments/${TOURNAMENT_ID}`);
      return (data as { tournament?: TournamentStats }).tournament ?? (data as TournamentStats);
    },
    staleTime: 60 * 1000, // 1 minute — short enough to reflect test changes quickly
  });

  return {
    totalMatches: query.data?.totalMatches ?? 0,
    completedMatches: query.data?.completedMatches ?? 0,
    isLoading: query.isLoading,
  };
}
