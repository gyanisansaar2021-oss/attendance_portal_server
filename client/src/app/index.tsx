/**
 * Entry route. Redirects to the correct area based on auth state:
 *  - bootstrapping -> show a loading screen
 *  - unauthenticated -> (auth) login
 *  - teacher -> (teacher) home
 *  - principal -> (admin) dashboard
 */
import { Redirect } from 'expo-router';

import { LoadingState } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

export default function Index() {
  const { isBootstrapping, isAuthenticated, user } = useAuth();

  if (isBootstrapping) {
    return <LoadingState message="Loading…" />;
  }

  if (!isAuthenticated || !user) {
    return <Redirect href="/(auth)/login" />;
  }

  return user.role === 'TEACHER' ? (
    <Redirect href="/(teacher)/home" />
  ) : (
    <Redirect href="/(admin)/dashboard" />
  );
}
