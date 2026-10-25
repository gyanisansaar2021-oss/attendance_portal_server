/**
 * Login landing — choose how to sign in. Teachers use phone + OTP; principals
 * use email + password. Kept deliberately simple and fast.
 */
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card } from '@/components/ui';
import { colors, spacing, typography } from '@/theme';

export default function LoginScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.brand}>
          <View style={styles.logoDot} />
          <Text style={styles.appName}>Attendance Portal</Text>
          <Text style={styles.tagline}>Fast, calm school attendance.</Text>
        </View>

        <Card padding="lg" style={styles.card}>
          <Text style={styles.cardTitle}>Sign in</Text>
          <Text style={styles.cardSubtitle}>Choose your role to continue.</Text>

          <View style={styles.actions}>
            <Button
              label="I'm a Teacher"
              fullWidth
              size="lg"
              onPress={() => router.push('/(auth)/teacher-otp')}
              accessibilityHint="Sign in with your phone number and a one-time code"
            />
            <Button
              label="I'm a Principal"
              variant="secondary"
              fullWidth
              size="lg"
              onPress={() => router.push('/(auth)/principal-login')}
              accessibilityHint="Sign in with your email and password"
            />
          </View>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    gap: spacing.xxxl,
  },
  brand: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoDot: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.primary,
    marginBottom: spacing.sm,
  },
  appName: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
  },
  card: {
    gap: spacing.lg,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  cardSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: -spacing.sm,
  },
  actions: {
    gap: spacing.md,
  },
});
