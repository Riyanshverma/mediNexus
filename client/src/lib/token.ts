const KEYS = {
  ACCESS: 'mdn_access_token',
  REFRESH: 'mdn_refresh_token',
  EXPIRES_AT: 'mdn_expires_at',
} as const;

export function saveTokens(
  access_token: string,
  refresh_token: string,
  expires_at?: number | null,
): void {
  localStorage.setItem(KEYS.ACCESS, access_token);
  localStorage.setItem(KEYS.REFRESH, refresh_token);
  if (expires_at != null) {
    localStorage.setItem(KEYS.EXPIRES_AT, String(expires_at));
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem(KEYS.ACCESS);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(KEYS.REFRESH);
}

export function getExpiresAt(): number | null {
  const raw = localStorage.getItem(KEYS.EXPIRES_AT);
  return raw ? Number(raw) : null;
}

/** Returns true if the stored access token is expired or within 30 s of expiry. */
export function isTokenExpired(): boolean {
  const expiresAt = getExpiresAt();
  if (!expiresAt) return true;
  return Date.now() / 1000 >= expiresAt - 30;
}

export function clearTokens(): void {
  localStorage.removeItem(KEYS.ACCESS);
  localStorage.removeItem(KEYS.REFRESH);
  localStorage.removeItem(KEYS.EXPIRES_AT);
}
