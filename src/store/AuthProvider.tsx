
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { setUnauthorizedHandler } from './../api/client';
import { tokenStorage } from './../api/tokenStorage';
import { authService } from './../api/services';

import type { VerifyOtpResponse } from './../types/api';

type Status = 'loading' | 'signedOut' | 'signedIn';

interface AuthContextValue {
  status: Status;
  signIn: (res: VerifyOtpResponse) => Promise<void>;
  signOut: () => Promise<string>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');

  const queryClient = useQueryClient();

  // Restore session on app launch.
  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      try {
        const tokens = await tokenStorage.get();

        if (mounted) {
          setStatus(tokens?.accessToken ? 'signedIn' : 'signedOut');
        }
      } catch {
        if (mounted) {
          setStatus('signedOut');
        }
      }
    };

    void restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  // Clear local session.
  const clearSession = useCallback(async () => {
    await tokenStorage.clear();
    queryClient.clear();
    setStatus('signedOut');
  }, [queryClient]);

  // Handle expired sessions from protected API requests.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      void clearSession();
    });

    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  // Save JWT after successful OTP verification.
const signIn = useCallback(
  async (res: VerifyOtpResponse) => {
    console.log('JWT received:', !!res.token);
    console.log(
      'JWT format looks valid:',
      res.token?.split('.').length === 3,
    );

    await tokenStorage.set({
      accessToken: res.token,
    });

    const savedToken = await tokenStorage.get();

    console.log('JWT saved in Keychain:', !!savedToken?.accessToken);

    queryClient.clear();
    setStatus('signedIn');
  },
  [queryClient],
);

  // Logout.
  const signOut = useCallback(async (): Promise<string> => {
    let message = 'Logged out successfully';

    try {
      const response = await authService.logout();

      message = response?.message || message;
    } catch (error) {
      console.log('Logout API failed:', error);

      message =
        error instanceof Error
          ? error.message
          : 'Logged out from this device';
    }

    try {
      await clearSession();
    } catch (error) {
      console.log('Failed to clear local session:', error);
      message = 'Logout completed, but local session cleanup failed';
    }

    return message;
  }, [clearSession]);

  const value = useMemo(
    () => ({
      status,
      signIn,
      signOut,
    }),
    [status, signIn, signOut],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return ctx;
}
