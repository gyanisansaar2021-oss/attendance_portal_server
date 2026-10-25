/**
 * Class sessions API module. Wraps the class-session endpoints with typed
 * responses. UI never calls these directly — it goes through hooks.
 */
import { apiClient } from './client';
import { endpoints } from './endpoints';
import type { TodayClasses } from '@/types/attendance';

export const classSessionsApi = {
  /** Teacher's attendance status + today's class sessions. */
  today(signal?: AbortSignal) {
    return apiClient.get<TodayClasses>(endpoints.classSessions.today, { signal });
  },
};
