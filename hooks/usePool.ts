import { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export type ScoringRule = {
  id: number;
  poolId: number;
  exactScorePoints: number;
  correctWinnerGoalDiffPoints: number;
  correctWinnerPoints: number;
  correctDrawPoints: number;
  specialEventPoints: number;
  knockoutMultiplier: number;
  finalMultiplier: number;
};

export type PoolDetail = {
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
  scoringRules: ScoringRule;
};

export function usePool(
  poolId: number | undefined,
  userId: string | undefined,
  token: string | undefined,
) {
  const [pool, setPool] = useState<PoolDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPool = useCallback(async () => {
    if (!poolId || !token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/pools/${poolId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.message ?? `HTTP ${response.status}`);
      }

      const data = await response.json();
      const raw: PoolDetail = data.pool ?? data;
      setPool({ ...raw, isCreator: raw.isCreator ?? raw.creatorId === userId });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [poolId, userId, token]);

  useEffect(() => {
    fetchPool();
  }, [fetchPool]);

  return { pool, loading, error, refresh: fetchPool };
}
