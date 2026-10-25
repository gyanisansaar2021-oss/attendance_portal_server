/**
 * Global auth state (Zustand).
 *
 * Holds the current user + tokens and persists tokens to secure storage. The
 * store is the single source of truth for "am I logged in and as who"; screens
 * read `user`/`status` and call the actions. TanStack Query handles server data
 * fetching; this store handles identity/session only.
 */
import { create } from 'zustand';

import { authApi } from '@/api/auth';
import { registerAuthBridge } from '@/api/client';
import { tokenStorage } from '@/services/tokenStorage';
import type { AuthSession, AuthTokens, AuthUser } from '@/types/auth';

export type AuthStatus =
  | 'idle' // not yet bootstrapped
  | 'loading' // bootstrapping from storage
  | 'authenticated'
  | 'unauthenticated';

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  tokens: AuthTokens | null;

  /** Load persisted tokens on app start and resolve the current user. */
  bootstrap: () => Promise<void>;
  /** Persist a fresh session after login / OTP verification. */
  setSession: (session: AuthSession) => Promise<void>;
  /** Replace tokens (used by the transparent refresh flow). */
  updateTokens: (tokens: AuthTokens) => Promise<void>;
  /** Clear the session locally and on the server. */
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'idle',
  user: null,
  tokens: null,

  async bootstrap() {
    set({ status: 'loading' });
    const tokens = await tokenStorage.load();
    if (!tokens) {
      set({ status: 'unauthenticated', user: null, tokens: null });
      return;
    }
    set({ tokens });
    try {
      const user = await authApi.me();
      set({ status: 'authenticated', user, tokens });
    } catch {
      // Tokens invalid/expired and refresh failed — force a clean logout.
      await tokenStorage.clear();
      set({ status: 'unauthenticated', user: null, tokens: null });
    }
  },

  async setSession(session) {
    await tokenStorage.save(session.tokens);
    set({ status: 'authenticated', user: session.user, tokens: session.tokens });
  },

  async updateTokens(tokens) {
    await tokenStorage.save(tokens);
    set({ tokens });
  },

  async logout() {
    try {
      await authApi.logout();
    } catch {
      // Ignore network/logout errors — we clear locally regardless.
    }
    await tokenStorage.clear();
    set({ status: 'unauthenticated', user: null, tokens: null });
  },
}));

/**
 * Connect the HTTP client to the store so it can read tokens and react to
 * refresh / expiry without importing the store directly (avoids a cycle).
 * Call once during app bootstrap.
 */
export function wireAuthBridge(): void {
  registerAuthBridge({
    getTokens: () => useAuthStore.getState().tokens,
    onTokensRefreshed: (tokens) => useAuthStore.getState().updateTokens(tokens),
    onAuthExpired: async () => {
      await tokenStorage.clear();
      useAuthStore.setState({ status: 'unauthenticated', user: null, tokens: null });
    },
  });
}
