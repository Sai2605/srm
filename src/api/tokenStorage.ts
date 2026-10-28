import * as Keychain from 'react-native-keychain';
import type { AuthTokens } from './../types/api';

const SERVICE = 'com.saferide.auth.tokens';

let cache: AuthTokens | null | undefined;

export const tokenStorage = {
  async get(): Promise<AuthTokens | null> {
    if (cache !== undefined) {
      return cache;
    }

    try { 
      const credentials = await Keychain.getGenericPassword({
        service: SERVICE,
      });

      if (!credentials) {
        cache = null;
        return null;
      }

      const tokens: AuthTokens = JSON.parse(credentials.password);

      cache = tokens;
      return tokens;
    } catch (error) {
      console.error('Failed to retrieve tokens:', error);
      cache = null;
      return null;
    }
  },

  async set(tokens: AuthTokens): Promise<void> {
    await Keychain.setGenericPassword(
      'auth',
      JSON.stringify(tokens),
      { service: SERVICE },
    );

    cache = tokens;
  },

  async clear(): Promise<void> {
    try {
      await Keychain.resetGenericPassword({
        service: SERVICE,
      });
    } finally {
      cache = null;
    }
  },
};
