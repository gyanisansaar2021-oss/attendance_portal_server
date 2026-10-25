/**
 * LoadingState — centered spinner with an optional message. Used for full-screen
 * loading (route bootstrap) and inside cards/lists while data loads.
 */
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';

export interface LoadingStateProps {
  message?: string;
  /** Fill the available space and center (full-screen style). */
  fullScreen?: boolean;
  testID?: string;
}

export function LoadingState({ message, fullScreen = true, testID }: LoadingStateProps) {
  return (
    <View
      style={[styles.container, fullScreen && styles.fullScreen]}
      accessibilityRole="progressbar"
      accessibilityLabel={message ?? 'Loading'}
      testID={testID}
    >
      <ActivityIndicator size="large" color={colors.primary} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
