/**
 * StatusBadge — a compact lozenge conveying a status via color + icon + label.
 *
 * Accessibility: status is never communicated by color alone — every badge has
 * a text label (and an optional icon), so it's readable without color vision.
 */
import { StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from './Icon';
import { colors, radius, spacing, typography } from '@/theme';

export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface StatusBadgeProps {
  label: string;
  tone?: StatusTone;
  icon?: IconName;
  testID?: string;
}

const TONES: Record<StatusTone, { bg: string; fg: string }> = {
  success: { bg: colors.successSubtle, fg: colors.success },
  warning: { bg: colors.warningSubtle, fg: colors.warning },
  danger: { bg: colors.dangerSubtle, fg: colors.danger },
  info: { bg: colors.infoSubtle, fg: colors.info },
  neutral: { bg: colors.surfaceAlt, fg: colors.textSecondary },
};

export function StatusBadge({ label, tone = 'neutral', icon, testID }: StatusBadgeProps) {
  const t = TONES[tone];
  return (
    <View
      style={[styles.badge, { backgroundColor: t.bg }]}
      accessibilityRole="text"
      accessibilityLabel={label}
      testID={testID}
    >
      {icon ? <Icon name={icon} size={14} color={t.fg} /> : null}
      <Text style={[styles.label, { color: t.fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 2,
    borderRadius: radius.pill,
  },
  label: {
    ...typography.small,
    fontWeight: '600',
  },
});
