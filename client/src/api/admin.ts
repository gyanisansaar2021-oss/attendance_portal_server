/**
 * Admin (principal) API module. Wraps the admin dashboard endpoint with typed
 * responses. UI never calls these directly — it goes through hooks.
 */
import { apiClient } from './client';
import { endpoints } from './endpoints';
import type { AdminDashboard } from '@/types/dashboard';

export const adminApi = {
  /** Principal dashboard summary. */
  dashboard(signal?: AbortSignal) {
    return apiClient.get<AdminDashboard>(endpoints.admin.dashboard, { signal });
  },
};
