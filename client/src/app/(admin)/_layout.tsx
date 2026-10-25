/**
 * Admin (Principal) area layout. Guards the route group by auth + role.
 * Phase 1A uses a simple Stack; the full sections (Teachers, Students, Classes,
 * Timetable, Attendance, Substitutions, Reports, Settings) arrive in Phase 3.
 */
import { Redirect, Stack } from 'expo-router';

import { LoadingState } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

export default function AdminLayout() {
  const { isBootstrapping, isAuthenticated, user } = useAuth();

  if (isBootstrapping) return <LoadingState message="Loading…" />;
  if (!isAuthenticated || !user) return <Redirect href="/(auth)/login" />;
  if (user.role !== 'PRINCIPAL') return <Redirect href="/(teacher)/home" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
