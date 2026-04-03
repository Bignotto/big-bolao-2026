import { useState } from 'react';
import type { Pool } from './usePools';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export function useJoinPool(token: string | undefined) {
  const [previewPool, setPreviewPool] = useState<Pool | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  async function fetchByCode(code: string): Promise<void> {
    if (!token) {
      setPreviewError('Você precisa estar autenticado.');
      return;
    }

    setPreviewing(true);
    setPreviewError(null);
    setPreviewPool(null);

    try {
      const response = await fetch(`${API_URL}/pool-invites/${code}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 404) {
        throw new Error('Código de convite não encontrado.');
      }

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.message ?? `Erro ${response.status}`);
      }

      const data = await response.json();
      const pool = (data.pool ?? data) as Pool;
      setPreviewPool(pool);
    } catch (e: unknown) {
      setPreviewError(e instanceof Error ? e.message : 'Erro desconhecido');
    } finally {
      setPreviewing(false);
    }
  }

  function clearPreview() {
    setPreviewPool(null);
    setPreviewError(null);
  }

  async function joinById(poolId: number): Promise<boolean> {
    if (!token) {
      setJoinError('Você precisa estar autenticado.');
      return false;
    }

    setJoining(true);
    setJoinError(null);

    try {
      const response = await fetch(`${API_URL}/pools/${poolId}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      if (response.status === 409) {
        throw new Error('Você já participa deste grupo.');
      }

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.message ?? `Erro ${response.status}`);
      }

      return true;
    } catch (e: unknown) {
      setJoinError(e instanceof Error ? e.message : 'Erro desconhecido');
      return false;
    } finally {
      setJoining(false);
    }
  }

  async function joinByCode(code: string): Promise<boolean> {
    if (!token) {
      setJoinError('Você precisa estar autenticado.');
      return false;
    }

    setJoining(true);
    setJoinError(null);

    try {
      const response = await fetch(`${API_URL}/pool-invites/${code}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 409) {
        throw new Error('Você já participa deste grupo.');
      }

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.message ?? `Erro ${response.status}`);
      }

      return true;
    } catch (e: unknown) {
      setJoinError(e instanceof Error ? e.message : 'Erro desconhecido');
      return false;
    } finally {
      setJoining(false);
    }
  }

  return {
    previewPool,
    previewing,
    previewError,
    fetchByCode,
    clearPreview,
    joining,
    joinError,
    joinById,
    joinByCode,
    clearJoinError: () => setJoinError(null),
  };
}
