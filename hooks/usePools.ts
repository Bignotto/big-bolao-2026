import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '@/lib/apiClient';
import { useSession } from '@/context/SessionContext';
import { poolKeys } from './poolKeys';

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

export function usePools() {
  const { apiUser } = useSession();

  const query = useQuery({
    queryKey: poolKeys.myPools,
    queryFn: async () => {
      const data = await apiFetch<{ pools?: { id: number }[] } | { id: number }[]>(
        `/users/${apiUser!.id}/pools`,
      );
      const list = Array.isArray(data) ? data : (data.pools ?? []);

      const details = await Promise.all(
        list.map((p) =>
          apiFetch<{ pool?: Pool } | Pool>(`/pools/${p.id}`).then((r) => {
            return (r as { pool?: Pool }).pool ?? (r as Pool);
          }),
        ),
      );
      return details;
    },
    enabled: !!apiUser,
  });

  return {
    pools: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refresh: query.refetch,
  };
}
