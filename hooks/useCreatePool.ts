import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiFetch } from '@/lib/apiClient';
import { poolKeys } from './poolKeys';

export type CreatePoolPayload = {
  name: string;
  description?: string;
  tournamentId: number;
  isPrivate: boolean;
  inviteCode?: string;
  maxParticipants?: number;
};

export function useCreatePool() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: CreatePoolPayload) =>
      apiFetch<{ pool: unknown }>('/pools', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: poolKeys.myPools });
    },
  });

  return {
    createPool: (payload: CreatePoolPayload) =>
      mutation.mutateAsync(payload).then(() => true).catch(() => false),
    loading: mutation.isPending,
    error: mutation.error ? (mutation.error as Error).message : null,
    clearError: () => mutation.reset(),
  };
}
