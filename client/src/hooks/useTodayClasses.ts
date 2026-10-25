/**
 * Teacher Home data: attendance status + today's class sessions.
 * Wraps GET /class-sessions/today via TanStack Query.
 */
import { useQuery } from '@tanstack/react-query';

import { classSessionsApi } from '@/api/classSessions';
import { queryKeys } from './queryKeys';
import type { TodayClasses } from '@/types/attendance';

export function useTodayClasses() {
  return useQuery<TodayClasses>({
    queryKey: queryKeys.classSessions.today,
    queryFn: ({ signal }) => classSessionsApi.today(signal),
  });
}
