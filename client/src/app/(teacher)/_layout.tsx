/**
 * Teacher tab navigation: Home, Classes, Substitution, Notifications, Profile.
 * Mobile-first and shallow — the most common action (marking attendance) is
 * never more than a couple of taps away.
 */
import { Redirect, Tabs } from 'expo-router';

import { Icon, LoadingState } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { colors, typography } from '@/theme';

export default function TeacherLayout() {
  const { isBootstrapping, isAuthenticated, user } = useAuth();

  if (isBootstrapping) return <LoadingState message="Loading…" />;
  if (!isAuthenticated || !user) return <Redirect href="/(auth)/login" />;
  // A principal should never land in the teacher area.
  if (user.role !== 'TEACHER') return <Redirect href="/(admin)/dashboard" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: typography.small.fontSize, fontWeight: '600' },
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Icon name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="classes"
        options={{
          title: 'Classes',
          tabBarIcon: ({ color, size }) => <Icon name="classes" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="substitution"
        options={{
          title: 'Substitution',
          tabBarIcon: ({ color, size }) => <Icon name="substitution" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, size }) => <Icon name="alerts" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Icon name="profile" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
