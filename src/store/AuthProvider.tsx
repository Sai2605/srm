import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { setUnauthorizedHandler } from '@/api/client';
import { tokenStorage } from '@/api/tokenStorage';
import { authService } from '@/api/services';
import type { VerifyOtpResponse } from '@/types/api';

type Status = 'loading' | 'signedOut' | 'signedIn';

interface AuthContextValue {
  status: Status;
  signIn: (res: VerifyOtpResponse) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const queryClient = useQueryClient();

  // Restore session on launch.
  useEffect(() => {
    tokenStorage.get().then((t) => setStatus(t?.accessToken ? 'signedIn' : 'signedOut'));
  }, []);

  const clearSession = useCallback(async () => {
    await tokenStorage.clear();
    queryClient.clear();
    setStatus('signedOut');
  }, [queryClient]);

  // The API client calls this when refresh fails (session expired).
  useEffect(() => {
    setUnauthorizedHandler(() => void clearSession());
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  const signIn = useCallback(
    async (res: VerifyOtpResponse) => {
      await tokenStorage.set({ accessToken: res.accessToken, refreshToken: res.refreshToken });
      queryClient.setQueryData(['me'], res.parent);
      setStatus('signedIn');
    },
    [queryClient],
  );

  const signOut = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      /* logout is best-effort */
    }
    await clearSession();
  }, [clearSession]);

  const value = useMemo(() => ({ status, signIn, signOut }), [status, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
