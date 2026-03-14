import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  isTokenExpired,
  saveTokens,
} from './token';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

// ─── Types ────────────────────────────────────────────────────────────────────

export type RequestOptions = Omit<RequestInit, 'headers'> & {
  /**
   * When true, no Authorization header is attached (login / register endpoints).
   * Ignored if `bearerToken` is provided.
   */
  skipAuth?: boolean;
  /**
   * Use this specific token as the Bearer credential instead of the one from
   * localStorage.  Useful for the doctor invite setup flow where Supabase
   * returns the token in the URL hash.
   */
  bearerToken?: string;
  headers?: Record<string, string>;
};

// ─── Token refresh queue ──────────────────────────────────────────────────────

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

async function doRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) {
      clearTokens();
      return null;
    }

    const body = await res.json();
    const session = body?.data?.session;
    if (!session?.access_token) {
      clearTokens();
      return null;
    }

    saveTokens(session.access_token, session.refresh_token, session.expires_at);
    return session.access_token as string;
  } catch {
    clearTokens();
    return null;
  }
}

async function getValidToken(): Promise<string | null> {
  if (!isTokenExpired()) {
    return getAccessToken();
  }

  // Serialise concurrent refresh attempts
  if (isRefreshing) {
    return new Promise<string | null>((resolve) => {
      refreshQueue.push(resolve);
    });
  }

  isRefreshing = true;
  const newToken = await doRefresh();
  isRefreshing = false;

  refreshQueue.forEach((cb) => cb(newToken));
  refreshQueue = [];

  return newToken;
}

// ─── Core request helper ──────────────────────────────────────────────────────

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth = false, bearerToken, headers: extraHeaders, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };

  if (bearerToken) {
    headers['Authorization'] = `Bearer ${bearerToken}`;
  } else if (!skipAuth) {
    const token = await getValidToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message: string = json?.message ?? `Request failed (${res.status})`;
    throw new Error(message);
  }

  return json as T;
}

// ─── Public API surface ───────────────────────────────────────────────────────

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
