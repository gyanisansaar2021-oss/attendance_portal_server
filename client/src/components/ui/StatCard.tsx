/**
 * StatCard — a compact KPI tile for the principal dashboard (value + label,
 * optional icon and tone accent). Designed to sit in a responsive grid.
 */
import { StyleSheet, Text, View } from 'react-native';

import { Card } from './Card';
import { Icon, type IconName } from './Icon';
import { colors, radius, spacing, typography } from '@/theme';

export type StatTone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: IconName;
  tone?: StatTone;
  testID?: string;
}

const TONES: Record<StatTone, { fg: string; bg: string }> = {
  primary: { fg: colors.primary, bg: colors.primarySubtle },
  success: { fg: colors.success, bg: colors.successSubtle },
  warning: { fg: colors.warning, bg: colors.warningSubtle },
  danger: { fg: colors.danger, bg: colors.dangerSubtle },
  neutral: { fg: colors.textSecondary, bg: colors.surfaceAlt },
};

export function StatCard({ label, value, icon, tone = 'primary', testID }: StatCardProps) {
  const t = TONES[tone];
  return (
    <Card padding="md" style={styles.card} testID={testID}>
      {icon ? (
        <View style={[styles.iconWrap, { backgroundColor: t.bg }]}>
          <Icon name={icon} size={18} color={t.fg} />
        </View>
      ) : null}
      <Text style={styles.value} numberOfLines={1} accessibilityLabel={`${value}`}>
        {value}
      </Text>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    flexBasis: '45%',
    gap: spacing.xs,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  value: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
