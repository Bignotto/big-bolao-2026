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

const USE_MOCK = true;

const MOCK_POOLS: Pool[] = [
  {
    id: 1,
    tournamentId: 1,
    name: 'Bolão da Firma',
    description: 'Quem acertar mais jogos paga o churrasco!',
    creatorId: 'mock-user-1',
    isPrivate: false,
    inviteCode: 'FIRMA2026',
    createdAt: new Date().toISOString(),
    maxParticipants: 20,
    registrationDeadline: null,
    participantsCount: 12,
    isCreator: true,
    isParticipant: true,
  },
  {
    id: 2,
    tournamentId: 1,
    name: 'Copa da Família',
    description: null,
    creatorId: 'mock-user-2',
    isPrivate: true,
    inviteCode: 'FAMILIA26',
    createdAt: new Date().toISOString(),
    maxParticipants: null,
    registrationDeadline: null,
    participantsCount: 5,
    isCreator: false,
    isParticipant: true,
  },
];

export function usePools(userId: string | undefined, token: string | undefined) {
  const [pools, setPools] = useState<Pool[]>(MOCK_POOLS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPools = useCallback(async () => {
    if (USE_MOCK) return;
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
      setPools(Array.isArray(data) ? data : (data.pools ?? []));
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
