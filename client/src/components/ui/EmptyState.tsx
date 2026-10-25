/**
 * EmptyState — friendly placeholder when a list/screen has no data yet.
 * Communicates meaning through an icon + text (not color alone).
 */
import { StyleSheet, Text, View } from 'react-native';

import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { colors, radius, spacing, typography } from '@/theme';

export interface EmptyStateProps {
  /** Semantic icon name (see Icon). */
  icon?: IconName;
  title: string;
  description?: string;
  /** Optional call-to-action. */
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
}

export function EmptyState({
  icon = 'empty',
  title,
  description,
  actionLabel,
  onAction,
  testID,
}: EmptyStateProps) {
  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.iconWrap}>
        <Icon name={icon} size={32} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} variant="secondary" onPress={onAction} style={styles.action} />
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
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h4,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  action: {
    marginTop: spacing.md,
  },
});
