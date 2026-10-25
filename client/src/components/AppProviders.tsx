/**
 * App-wide providers + bootstrap.
 *
 * Wraps the app in:
 *  - SafeAreaProvider (safe-area insets)
 *  - QueryClientProvider (TanStack Query server state)
 *
 * On mount it wires the API client's auth bridge and restores any persisted
 * session so routing can react to auth state immediately.
 */
import { QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useEffect, useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from '@/api/queryClient';
import { useAuthStore, wireAuthBridge } from '@/store/authStore';

export function AppProviders({ children }: { children: ReactNode }) {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    wireAuthBridge();
    void bootstrap();
  }, [bootstrap]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SafeAreaProvider>
  );
}
