import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiFetch } from '@/lib/apiClient';
import { poolKeys } from './poolKeys';

export type UpdateScoringRulesPayload = {
  exactScorePoints?: number;
  correctWinnerGoalDiffPoints?: number;
  correctWinnerPoints?: number;
  correctDrawPoints?: number;
  knockoutMultiplier?: number;
  finalMultiplier?: number;
};

export function useUpdateScoringRules(poolId: number | undefined) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: UpdateScoringRulesPayload) =>
      apiFetch(`/pools/${poolId}/scoring-rules`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: poolKeys.detail(poolId!) });
      queryClient.invalidateQueries({ queryKey: poolKeys.standings(poolId!) });
    },
  });

  return {
    updateRules: (payload: UpdateScoringRulesPayload) =>
      mutation.mutateAsync(payload).then(() => true).catch(() => false),
    loading: mutation.isPending,
    error: mutation.error ? (mutation.error as Error).message : null,
    clearError: () => mutation.reset(),
  };
}
