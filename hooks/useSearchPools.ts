import { useState } from 'react';
import type { Pool } from './usePools';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export function useSearchPools(token: string | undefined) {
  const [pools, setPools] = useState<Pool[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search(query: string): Promise<void> {
    if (!token) {
      setError('Você precisa estar autenticado.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ name: query, page: '1', limit: '20' });
      const response = await fetch(`${API_URL}/pools?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.message ?? `Erro ${response.status}`);
      }

      const data = await response.json();
      const list: Pool[] = Array.isArray(data) ? data : (data.pools ?? []);
      setPools(list);
      setTotal(data.total ?? list.length);
    } catch (e: unknown) {
      setPools([]);
      setError(e instanceof Error ? e.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setPools([]);
    setTotal(0);
    setError(null);
  }

  return { pools, total, loading, error, search, reset };
}
