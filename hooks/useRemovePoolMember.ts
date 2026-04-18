import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiFetch } from '@/lib/apiClient';
import { poolKeys } from './poolKeys';

export function useRemovePoolMember(poolId: number | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      apiFetch(`/pools/${poolId}/users/${userId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: poolKeys.members(poolId!) });
      queryClient.invalidateQueries({ queryKey: poolKeys.detail(poolId!) });
    },
  });
}
