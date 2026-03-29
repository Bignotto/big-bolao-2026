import { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export type Pool = {
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
};

export function usePools(userId: string | undefined, token: string | undefined) {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPools = useCallback(async () => {
    if (!userId || !token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/users/${userId}/pools`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const msg = body?.message ?? `HTTP ${response.status}`;
        console.error('[usePools] error:', response.status, body);
        throw new Error(msg);
      }

      const data = await response.json();
      const list: { id: number }[] = Array.isArray(data) ? data : (data.pools ?? []);

      const details = await Promise.all(
        list.map((p) =>
          fetch(`${API_URL}/pools/${p.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => r.json()),
        ),
      );

      const pools: Pool[] = details.map((d) => {
        const pool: Pool = d.pool ?? d;
        return { ...pool, isCreator: pool.isCreator ?? pool.creatorId === userId };
      });

      setPools(pools);
    } catch (e: unknown) {
      setPools([]);
      setError(e instanceof Error ? e.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  useEffect(() => {
    fetchPools();
  }, [fetchPools]);

  return { pools, loading, error, refresh: fetchPools };
}
