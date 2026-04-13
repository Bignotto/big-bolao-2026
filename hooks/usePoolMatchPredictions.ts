import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '@/lib/apiClient';
import { poolKeys } from './poolKeys';
import type { PoolMatchPredictionEntry } from '@/domain/entities/PoolMatchPrediction';

type PoolMatchPredictionsResponse =
  | { predictions?: PoolMatchPredictionResponseItem[] }
  | PoolMatchPredictionResponseItem[];

type PoolMatchPredictionResponseItem = Partial<PoolMatchPredictionEntry> & {
  id?: string;
  user_id?: string;
  userId?: string;
  fullName?: string;
  full_name?: string;
  displayName?: string;
  display_name?: string;
  name?: string;
  avatarUrl?: string | null;
  avatar_url?: string | null;
  photoUrl?: string | null;
  picture?: string | null;
  profileImageUrl?: string | null;
  profile_image_url?: string | null;
  member?: PoolMatchPredictionResponseItem['user'];
  participant?: PoolMatchPredictionResponseItem['user'];
  user?: Partial<PoolMatchPredictionEntry['user']> & {
    name?: string;
    full_name?: string;
    displayName?: string;
    display_name?: string;
    avatarUrl?: string | null;
    avatar_url?: string | null;
    photoUrl?: string | null;
    picture?: string | null;
    profile_image_url?: string | null;
  };
};

function normalizeEntry(
  item: PoolMatchPredictionResponseItem,
  index: number,
): PoolMatchPredictionEntry {
  const user =
    item.user ??
    item.member ??
    item.participant ??
    ({} as NonNullable<PoolMatchPredictionResponseItem['user']>);
  const userId =
    item.userId ??
    item.user_id ??
    user.id ??
    item.id ??
    item.prediction?.userId ??
    item.prediction?.user_id ??
    item.prediction?.id?.toString() ??
    `participant-${index}`;
  const fullName =
    user.fullName ??
    user.full_name ??
    user.displayName ??
    user.display_name ??
    user.name ??
    item.fullName ??
    item.full_name ??
    item.displayName ??
    item.display_name ??
    item.name ??
    'Participante';

  return {
    userId,
    rank: item.rank ?? null,
    user: {
      id: user.id ?? userId,
      fullName,
      profileImageUrl:
        user.profileImageUrl ??
        user.profile_image_url ??
        user.avatarUrl ??
        user.avatar_url ??
        user.photoUrl ??
        user.picture ??
        item.profileImageUrl ??
        item.profile_image_url ??
        item.avatarUrl ??
        item.avatar_url ??
        item.photoUrl ??
        item.picture ??
        null,
    },
    prediction: item.prediction ?? null,
  };
}

export function usePoolMatchPredictions(
  poolId: number | undefined,
  matchId: number | undefined,
) {
  const query = useQuery({
    queryKey: poolKeys.matchPredictions(poolId!, matchId!),
    queryFn: async () => {
      const data = await apiFetch<PoolMatchPredictionsResponse>(
        `/pools/${poolId}/matches/${matchId}/predictions`,
      );
      const list = Array.isArray(data) ? data : data.predictions ?? [];
      return list.map(normalizeEntry);
    },
    enabled: poolId != null && matchId != null,
    staleTime: 30_000,
  });

  return {
    predictions: query.data ?? [],
    loading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error ? (query.error as Error).message : null,
    refresh: query.refetch,
  };
}
