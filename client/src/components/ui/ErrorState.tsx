/**
 * ErrorState — friendly error view with an optional retry action. Used when a
 * query fails (network, server). Messages come from the normalized ApiError.
 */
import { StyleSheet, Text, View } from 'react-native';

import { Button } from './Button';
import { Icon } from './Icon';
import { colors, radius, spacing, typography } from '@/theme';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  /** Marks the retry button busy (e.g. while refetching). */
  retrying?: boolean;
  testID?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'Please try again.',
  onRetry,
  retrying = false,
  testID,
}: ErrorStateProps) {
  return (
    <View style={styles.container} testID={testID} accessibilityRole="alert">
      <View style={styles.iconWrap}>
        <Icon name="warning" size={32} color={colors.danger} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <Button
          label="Try again"
          variant="secondary"
          onPress={onRetry}
          loading={retrying}
          leftIcon={<Icon name="refresh" size={18} color={colors.primary} />}
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xxl,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.dangerSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h4,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  action: {
    marginTop: spacing.md,
  },
});
