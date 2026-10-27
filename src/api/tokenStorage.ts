import * as SecureStore from 'expo-secure-store';
import type { AuthTokens } from '@/types/api';

const KEY = 'saferide.auth.tokens';

/** In-memory copy so every request doesn't hit secure storage. */
let cache: AuthTokens | null | undefined;

export const tokenStorage = {
  async get(): Promise<AuthTokens | null> {
    if (cache !== undefined) return cache;
    try {
      const raw = await SecureStore.getItemAsync(KEY);
      cache = raw ? (JSON.parse(raw) as AuthTokens) : null;
    } catch {
      cache = null;
    }
    return cache;
  },

  async set(tokens: AuthTokens): Promise<void> {
    cache = tokens;
    await SecureStore.setItemAsync(KEY, JSON.stringify(tokens));
  },

  async clear(): Promise<void> {
    cache = null;
    await SecureStore.deleteItemAsync(KEY);
  },
};
