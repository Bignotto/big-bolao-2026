import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import { teamKeys } from './teamKeys';
import type { FormResult } from '@/domain/helpers/teamForm';

type RecentFormEntry = {
  matchId: number;
  result: FormResult;
  teamScore: number;
  opponentScore: number;
  opponentId: number;
  opponentName: string;
  opponentCode: string;
  matchDatetime: string;
  stage: string;
  decidedOnPenalties: boolean;
};

type RecentFormResponse = {
  teamId: number;
  results: RecentFormEntry[];
};

export function useTeamRecentForm(teamId?: number, limit = 3) {
  const query = useQuery({
    queryKey: teamKeys.recentForm(teamId!, limit),
    queryFn: async () => {
      const data = await apiFetch<RecentFormResponse>(
        `/teams/${teamId}/recent-form?limit=${limit}`,
      );
      return data.results.map((r) => r.result);
    },
    enabled: teamId != null,
    staleTime: 60_000,
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
}
