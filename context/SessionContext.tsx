import { Session, User } from '@supabase/supabase-js';
import { useRouter, useSegments } from 'expo-router';
import { createContext, useContext, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export type ApiUser = {
  id: string;
  fullName: string;
  email: string;
  profileImageUrl: string | null;
  role: 'USER' | 'ADMIN';
};

async function fetchOrCreateApiUser(session: Session): Promise<ApiUser | null> {
  const token = session.access_token;
  const supabaseUser = session.user;

  // Try to fetch existing user from API
  const checkRes = await fetch(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (checkRes.ok) {
    const data = await checkRes.json();
    return data.user ?? data;
  }

  // Unexpected error — cannot recover without a cache
  if (checkRes.status !== 404) {
    console.error('[SessionContext] GET /users/me unexpected status:', checkRes.status);
    return null;
  }

  // No user in DB — create them
  const meta = supabaseUser.user_metadata ?? {};
  const fullName: string = meta.full_name ?? meta.name ?? supabaseUser.email ?? 'User';
  const profileImageUrl: string | null = meta.avatar_url ?? meta.picture ?? null;

  const createRes = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      id: supabaseUser.id,
      fullName,
      email: supabaseUser.email,
      passwordHash: null,
      profileImageUrl,
    }),
  });

  if (!createRes.ok) {
    console.error(
      '[SessionContext] POST /users failed:',
      createRes.status,
      await createRes.json().catch(() => ({})),
    );
    return null;
  }

  const created = await createRes.json();
  return created.user ?? created;
}

type SessionContextValue = {
  session: Session | null;
  user: User | null;
  apiUser: ApiUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue>({
  session: null,
  user: null,
  apiUser: null,
  loading: true,
  signOut: async () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [apiUser, setApiUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // onAuthStateChange fires INITIAL_SESSION on mount, covering the initial load.
    // No need to call getSession separately — avoids a race condition where both
    // fire simultaneously and POST /users is called twice.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        try {
          setApiUser(await fetchOrCreateApiUser(session));
        } catch {
          setApiUser(null);
        }
      } else {
        setApiUser(null);
      }
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Redirect based on auth state once loading is done
  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, loading, segments]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <SessionContext.Provider
      value={{ session, user: session?.user ?? null, apiUser, loading, signOut }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
