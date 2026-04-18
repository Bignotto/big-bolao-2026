import { supabase } from '@/lib/supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function getAuthHeader(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) throw new ApiError(401, 'No active session');
  return `Bearer ${data.session.access_token}`;
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const authHeader = await getAuthHeader();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body != null ? { 'Content-Type': 'application/json' } : {}),
      Authorization: authHeader,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const detail =
      body?.issues?.[0]?.message ??
      body?.message ??
      body?.error ??
      `HTTP ${response.status}`;
    throw new ApiError(response.status, detail);
  }

  const contentType = response.headers.get('content-type');
  if (response.status === 204 || !contentType?.includes('application/json')) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export { apiFetch, ApiError };
