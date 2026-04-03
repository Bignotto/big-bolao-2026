import { useState } from 'react';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export type UpdateScoringRulesPayload = {
  exactScorePoints?: number;
  correctWinnerGoalDiffPoints?: number;
  correctWinnerPoints?: number;
  correctDrawPoints?: number;
  knockoutMultiplier?: number;
  finalMultiplier?: number;
};

export function useUpdateScoringRules(poolId: number | undefined, token: string | undefined) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function clearError() {
    setError(null);
  }

  async function updateRules(payload: UpdateScoringRulesPayload): Promise<boolean> {
    if (!poolId || !token) return false;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/pools/${poolId}/scoring-rules`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.message ?? `HTTP ${response.status}`);
      }

      return true;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido');
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { updateRules, loading, error, clearError };
}
