import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '@/lib/apiClient';
import { poolKeys } from './poolKeys';

export type ScoringRule = {
  id: number;
  poolId: number;
  exactScorePoints: number;
  correctWinnerGoalDiffPoints: number;
  correctWinnerPoints: number;
  correctDrawPoints: number;
  specialEventPoints: number;
  knockoutMultiplier: number;
  finalMultiplier: number;
};

export type PoolDetail = {
  id: number;
  tournamentId: number;
  name: string;
  description: string | null;
  creatorId: string;
  isPrivate: boolean;
  inviteCode: string | null;
  createdAt: string;
  maxParticipants: number | null;
  registrationDeadline: string | null;
  participantsCount: number;
  isCreator: boolean;
  isParticipant: boolean;
  scoringRules: ScoringRule;
};

export function usePool(poolId: number | undefined) {
  const query = useQuery({
    queryKey: poolKeys.detail(poolId!),
    queryFn: async () => {
      const data = await apiFetch<{ pool?: PoolDetail } | PoolDetail>(`/pools/${poolId}`);
      return (data as { pool?: PoolDetail }).pool ?? (data as PoolDetail);
    },
    enabled: !!poolId,
  });

  return {
    pool: query.data ?? null,
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refresh: query.refetch,
  };
}
