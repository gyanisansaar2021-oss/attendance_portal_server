/**
 * Secure token storage.
 *
 * Tokens are persisted with expo-secure-store (Keychain on iOS, Keystore on
 * Android). On web, SecureStore is unavailable, so we fall back to localStorage
 * for development convenience — this is NOT production-secure and is only used
 * when running the app in a browser during development.
 */
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { AuthTokens } from '@/types/auth';

const ACCESS_TOKEN_KEY = 'ap_access_token';
const REFRESH_TOKEN_KEY = 'ap_refresh_token';
const EXPIRES_AT_KEY = 'ap_access_expires_at';

const isWeb = Platform.OS === 'web';

async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    globalThis.localStorage?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string): Promise<string | null> {
  if (isWeb) {
    return globalThis.localStorage?.getItem(key) ?? null;
  }
  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string): Promise<void> {
  if (isWeb) {
    globalThis.localStorage?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export const tokenStorage = {
  async save(tokens: AuthTokens): Promise<void> {
    await Promise.all([
      setItem(ACCESS_TOKEN_KEY, tokens.accessToken),
      setItem(REFRESH_TOKEN_KEY, tokens.refreshToken),
      tokens.accessTokenExpiresAt != null
        ? setItem(EXPIRES_AT_KEY, String(tokens.accessTokenExpiresAt))
        : deleteItem(EXPIRES_AT_KEY),
    ]);
  },

  async load(): Promise<AuthTokens | null> {
    const [accessToken, refreshToken, expiresAtRaw] = await Promise.all([
      getItem(ACCESS_TOKEN_KEY),
      getItem(REFRESH_TOKEN_KEY),
      getItem(EXPIRES_AT_KEY),
    ]);
    if (!accessToken || !refreshToken) {
      return null;
    }
    const accessTokenExpiresAt = expiresAtRaw ? Number(expiresAtRaw) : undefined;
    return { accessToken, refreshToken, accessTokenExpiresAt };
  },

  async getAccessToken(): Promise<string | null> {
    return getItem(ACCESS_TOKEN_KEY);
  },

  async clear(): Promise<void> {
    await Promise.all([
      deleteItem(ACCESS_TOKEN_KEY),
      deleteItem(REFRESH_TOKEN_KEY),
      deleteItem(EXPIRES_AT_KEY),
    ]);
  },
};
