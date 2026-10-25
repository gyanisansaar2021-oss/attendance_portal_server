/**
 * Principal dashboard data. Wraps GET /admin/dashboard via TanStack Query.
 */
import { useQuery } from '@tanstack/react-query';

import { adminApi } from '@/api/admin';
import { queryKeys } from './queryKeys';
import type { AdminDashboard } from '@/types/dashboard';

export function useAdminDashboard() {
  return useQuery<AdminDashboard>({
    queryKey: queryKeys.admin.dashboard,
    queryFn: ({ signal }) => adminApi.dashboard(signal),
  });
}
