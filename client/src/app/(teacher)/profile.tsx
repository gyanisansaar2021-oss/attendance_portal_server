/**
 * Teacher profile. Shows identity and the logout action (clears the session
 * and returns to the auth flow).
 */
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, Header } from '@/components/ui';
import { useAuth, useLogout } from '@/hooks/useAuth';
import { colors, spacing, typography } from '@/theme';

export default function TeacherProfile() {
  const { user } = useAuth();
  const logout = useLogout();

  async function handleLogout() {
    await logout.mutateAsync();
    router.replace('/(auth)/login');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Profile" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card padding="lg" style={styles.card}>
          <Text style={styles.name}>{user?.name ?? 'Teacher'}</Text>
          {user?.email ? <Text style={styles.meta}>{user.email}</Text> : null}
          {user?.phone ? <Text style={styles.meta}>{user.phone}</Text> : null}
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>Teacher</Text>
          </View>
        </Card>

        <Button
          label="Log out"
          variant="danger"
          fullWidth
          size="lg"
          loading={logout.isPending}
          onPress={handleLogout}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.xl },
  card: { gap: spacing.xs, alignItems: 'flex-start' },
  name: { ...typography.h2, color: colors.textPrimary },
  meta: { ...typography.body, color: colors.textSecondary },
  roleBadge: {
    marginTop: spacing.sm,
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  roleText: { ...typography.label, color: colors.primary },
});
