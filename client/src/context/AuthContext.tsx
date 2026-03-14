import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { authService, type AuthUser, type UserRole } from '@/services/auth.service';
import { clearTokens, getAccessToken, saveTokens } from '@/lib/token';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  /** The currently authenticated user, or null if not signed in. */
  user: AuthUser | null;
  /** Convenience boolean — true when user is not null. */
  isAuthenticated: boolean;
  /**
   * True while the initial session rehydration from localStorage is in
   * progress.  Consumers should render a loading state until this is false.
   */
  isLoading: boolean;

  /**
   * Signs the user in.  Persists the returned tokens to localStorage and
   * updates the auth state.  Returns the authenticated user so callers can
   * read the role immediately.
   */
  login: (email: string, password: string) => Promise<AuthUser>;

  /** Signs the user out — revokes the server session and clears local state. */
  logout: () => Promise<void>;

  /**
   * Saves an externally obtained session (e.g. after patient / hospital
   * registration) and fetches the current user profile.
   */
  applySession: (
    access_token: string,
    refresh_token: string,
    expires_at: number,
  ) => Promise<AuthUser>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Role → dashboard path map ────────────────────────────────────────────────

export const ROLE_DASHBOARD: Record<UserRole, string> = {
  patient: '/patient/dashboard',
  hospital_admin: '/admin/dashboard',
  doctor: '/doctor/dashboard',
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, try to rehydrate the session from localStorage.
  useEffect(() => {
    const init = async () => {
      const token = getAccessToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const { data } = await authService.getMe();
        setUser(data.user);
      } catch {
        // Token is invalid / expired and could not be refreshed.
        clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // ── login ──────────────────────────────────────────────────────────────────

  const login = async (email: string, password: string): Promise<AuthUser> => {
    const { data } = await authService.login({ email, password });
    saveTokens(data.session.access_token, data.session.refresh_token, data.session.expires_at);
    setUser(data.user);
    return data.user;
  };

  // ── logout ─────────────────────────────────────────────────────────────────

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore server-side errors — still clear local state.
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  // ── applySession ───────────────────────────────────────────────────────────

  const applySession = async (
    access_token: string,
    refresh_token: string,
    expires_at: number,
  ): Promise<AuthUser> => {
    saveTokens(access_token, refresh_token, expires_at);
    const { data } = await authService.getMe();
    setUser(data.user);
    return data.user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        logout,
        applySession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
