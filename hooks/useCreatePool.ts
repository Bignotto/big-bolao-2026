import { useState } from 'react';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export type CreatePoolPayload = {
  name: string;
  description?: string;
  tournamentId: number;
  isPrivate: boolean;
  inviteCode?: string;
  maxParticipants?: number;
};

export function useCreatePool(token: string | undefined) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createPool(payload: CreatePoolPayload): Promise<boolean> {
    if (!token) {
      setError('Você precisa estar autenticado.');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/pools`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.message ?? `Erro ${response.status}`);
      }

      return true;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido');
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { createPool, loading, error, clearError: () => setError(null) };
}
