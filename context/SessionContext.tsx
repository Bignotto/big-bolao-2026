import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User } from '@supabase/supabase-js';
import { useRouter, useSegments } from 'expo-router';
import { createContext, useContext, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

function apiUserCacheKey(supabaseId: string) {
  return `@big_bolao/api_user/${supabaseId}`;
}

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
  const cacheKey = apiUserCacheKey(supabaseUser.id);

  // Try to fetch existing user from API
  const checkRes = await fetch(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  //rconsole.log('[SessionContext] Checking API user existence, status:', checkRes.status);
  console.log(JSON.stringify({ checkRes }));

  if (checkRes.ok) {
    const data = await checkRes.json();
    console.log('[SessionContext] Fetched API user:', data);
    const apiUser = data.user ?? data;
    await AsyncStorage.setItem(cacheKey, JSON.stringify(apiUser));
    return apiUser;
  }

  // API couldn't find the user — try cache before attempting creation
  const cached = await AsyncStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached) as ApiUser;

  if (checkRes.status !== 404) {
    console.error('[SessionContext] GET /users/me unexpected status:', checkRes.status);
    return null;
  }

  // No cache, no existing user — create them
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
  const apiUser = created.user ?? created;
  await AsyncStorage.setItem(cacheKey, JSON.stringify(apiUser));
  return apiUser;
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
      if (session) setApiUser(await fetchOrCreateApiUser(session));
      else setApiUser(null);
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
