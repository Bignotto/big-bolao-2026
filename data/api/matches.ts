import { apiFetch } from '@/lib/apiClient';
import type { MyMatchPredictionEntry } from '@/domain/entities/MatchPredictionStatus';

export async function fetchMyMatchPredictions(
  matchId: number,
): Promise<MyMatchPredictionEntry[]> {
  const data = await apiFetch<{ predictions: MyMatchPredictionEntry[] }>(
    `/matches/${matchId}/predictions/me`,
  );
  return data.predictions;
}
