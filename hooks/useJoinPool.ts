import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiFetch, ApiError } from '@/lib/apiClient';
import { poolKeys } from './poolKeys';
import type { Pool } from './usePools';

export function useJoinPool() {
  const queryClient = useQueryClient();

  const [previewPool, setPreviewPool] = useState<Pool | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const joinByIdMutation = useMutation({
    mutationFn: async (poolId: number) => {
      try {
        return await apiFetch(`/pools/${poolId}/users`, {
          method: 'POST',
          body: JSON.stringify({}),
        });
      } catch (e) {
        if (e instanceof ApiError && e.status === 409) {
          throw new Error('Você já participa deste grupo.');
        }
        throw e;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: poolKeys.myPools });
    },
  });

  const joinByCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      try {
        return await apiFetch(`/pool-invites/${code}`, { method: 'POST', body: JSON.stringify({}) });
      } catch (e) {
        if (e instanceof ApiError && e.status === 409) {
          throw new Error('Você já participa deste grupo.');
        }
        throw e;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: poolKeys.myPools });
    },
  });

  async function fetchByCode(code: string): Promise<void> {
    setPreviewing(true);
    setPreviewError(null);
    setPreviewPool(null);
    try {
      const data = await apiFetch<{ pool?: Pool } | Pool>(`/pool-invites/${code}`);
      setPreviewPool((data as { pool?: Pool }).pool ?? (data as Pool));
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setPreviewError('Código de convite não encontrado.');
      } else {
        setPreviewError(e instanceof Error ? e.message : 'Erro desconhecido');
      }
    } finally {
      setPreviewing(false);
    }
  }

  function clearPreview() {
    setPreviewPool(null);
    setPreviewError(null);
  }

  const joining = joinByIdMutation.isPending || joinByCodeMutation.isPending;
  const joinError = joinByIdMutation.error
    ? (joinByIdMutation.error as Error).message
    : joinByCodeMutation.error
      ? (joinByCodeMutation.error as Error).message
      : null;

  return {
    previewPool,
    previewing,
    previewError,
    fetchByCode,
    clearPreview,
    joining,
    joinError,
    joinById: (poolId: number) =>
      joinByIdMutation.mutateAsync(poolId).then(() => true).catch(() => false),
    joinByCode: (code: string) =>
      joinByCodeMutation.mutateAsync(code).then(() => true).catch(() => false),
    clearJoinError: () => {
      joinByIdMutation.reset();
      joinByCodeMutation.reset();
    },
  };
}
