import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';

type User = {
  id: string;
  email: string;
  name: string;
  profileImageUrl: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: string;
};

export const meKeys = {
  me: ['me'] as const,
};

export function useMe() {
  return useQuery({
    queryKey: meKeys.me,
    queryFn: async () => {
      const data = await apiFetch<{ user: User } | User>('/users/me');
      return 'user' in data ? data.user : data;
    },
    staleTime: 300_000,
  });
}
