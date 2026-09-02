import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, TOKEN_STORAGE_KEY } from '@/lib/api';
import {
  AuthContext,
  type AuthContextValue,
  type AuthenticatedUser,
  type SignInCredentials,
} from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const signOut = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setUser(null);
  }, []);

  const loadProfile = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!token) {
      setIsLoadingUser(false);
      return;
    }

    try {
      const response = await api.get<{ user: AuthenticatedUser }>('/me');

      setUser(response.data.user);
    } catch {
      signOut();
    } finally {
      setIsLoadingUser(false);
    }
  }, [signOut]);

  const signIn = useCallback(
    async ({ email, password }: SignInCredentials) => {
      const response = await api.post<{ access_token: string }>('/sessions', {
        email,
        password,
      });

      localStorage.setItem(TOKEN_STORAGE_KEY, response.data.access_token);

      await loadProfile();
    },
    [loadProfile],
  );

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoadingUser,
      signIn,
      signOut,
    }),
    [user, isLoadingUser, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
