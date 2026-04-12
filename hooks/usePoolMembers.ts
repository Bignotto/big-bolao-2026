import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '@/lib/apiClient';
import { poolKeys } from './poolKeys';

export type PoolMember = {
  id: string;
  fullName?: string;
  name?: string;
  avatarUrl?: string | null;
  photoUrl?: string | null;
  picture?: string | null;
  profileImageUrl: string | null;
};

type PoolMemberResponseItem = PoolMember | { user: PoolMember };

function normalizeMember(item: PoolMemberResponseItem): PoolMember {
  const user = 'user' in item ? item.user : item;
  return {
    ...user,
    profileImageUrl:
      user.profileImageUrl ?? user.avatarUrl ?? user.photoUrl ?? user.picture ?? null,
  };
}

export function usePoolMembers(poolId: number | undefined) {
  const query = useQuery({
    queryKey: poolKeys.members(poolId!),
    queryFn: async () => {
      const data = await apiFetch<
        { users?: PoolMemberResponseItem[]; members?: PoolMemberResponseItem[] } | PoolMemberResponseItem[]
      >(`/pools/${poolId}/users`);

      const list = Array.isArray(data) ? data : data.users ?? data.members ?? [];
      return list.map(normalizeMember);
    },
    enabled: !!poolId,
  });

  return {
    members: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refresh: query.refetch,
  };
}
