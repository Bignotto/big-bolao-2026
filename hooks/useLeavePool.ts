import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiFetch } from '@/lib/apiClient';
import { poolKeys } from './poolKeys';

export function useLeavePool(poolId: number | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiFetch(`/pools/${poolId}/users/me`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: poolKeys.all });
    },
  });
}
