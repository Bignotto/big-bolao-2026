import { useState } from 'react';

import { apiFetch } from '@/lib/apiClient';
import type { Pool } from './usePools';

export function useSearchPools() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search(query: string): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ name: query, page: '1', limit: '20' });
      const data = await apiFetch<{ pools?: Pool[]; total?: number } | Pool[]>(`/pools?${params}`);
      const list: Pool[] = Array.isArray(data) ? data : (data.pools ?? []);
      setPools(list);
      setTotal((data as { total?: number }).total ?? list.length);
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
