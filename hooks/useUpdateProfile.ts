import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { apiFetch } from '@/lib/apiClient';
import { supabase } from '@/lib/supabase';
import { meKeys } from './useMe';

type User = {
  id: string;
  email: string;
  name: string;
  profileImageUrl: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: string;
};

type UpdateProfilePayload = {
  name: string;
};

export function useUpdateProfile(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const data = await apiFetch<{ user: User } | User>(
        `/users/${userId}`,
        { method: 'PUT', body: JSON.stringify(payload) }
      );
      return 'user' in data ? data.user : data;
    },

    onSuccess: (updatedUser) => {
      queryClient.setQueryData<User>(meKeys.me, (old) => {
        if (!old) return updatedUser;
        return { ...old, ...updatedUser };
      });
    },

    // onError: surface via mutation.error — no optimistic rollback needed
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return async () => {
    await supabase.auth.signOut();
    queryClient.clear();       // wipe cache before redirect to prevent stale flash
    router.replace('/login');
  };
}
