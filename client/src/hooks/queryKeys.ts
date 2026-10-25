/**
 * Centralized TanStack Query keys. Keeping keys in one place avoids typos and
 * makes targeted invalidation straightforward.
 */
export const queryKeys = {
  classSessions: {
    today: ['class-sessions', 'today'] as const,
  },
  admin: {
    dashboard: ['admin', 'dashboard'] as const,
  },
} as const;
