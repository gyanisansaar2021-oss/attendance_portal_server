/**
 * Header — screen top bar with optional back button, title/subtitle, and a
 * trailing slot for actions. Respects the device safe area.
 */
import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from './Icon';
import { colors, spacing, touchTarget, typography } from '@/theme';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  /** Show a back chevron and handle its press. */
  onBack?: () => void;
  /** Trailing content (e.g. an avatar or icon button). */
  right?: ReactNode;
  /** Center the title (defaults to left-aligned). */
  centerTitle?: boolean;
  testID?: string;
}

export function Header({
  title,
  subtitle,
  onBack,
  right,
  centerTitle = false,
  testID,
}: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]} testID={testID}>
      <View style={styles.row}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={10}
            style={styles.backButton}
          >
            <Icon name="back" size={28} color={colors.textPrimary} />
          </Pressable>
        ) : (
          <View style={styles.backSpacer} />
        )}

        <View style={[styles.titleWrap, centerTitle && styles.titleCentered]}>
          <Text
            numberOfLines={1}
            style={[styles.title, centerTitle && styles.textCentered]}
            accessibilityRole="header"
          >
            {title}
          </Text>
          {subtitle ? (
            <Text numberOfLines={1} style={[styles.subtitle, centerTitle && styles.textCentered]}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={styles.rightSlot}>{right}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: touchTarget.min,
  },
  backButton: {
    width: touchTarget.min,
    height: touchTarget.min,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -spacing.md,
  },
  backSpacer: {
    width: 0,
  },
  titleWrap: {
    flex: 1,
  },
  titleCentered: {
    alignItems: 'center',
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  textCentered: {
    textAlign: 'center',
  },
  rightSlot: {
    minWidth: touchTarget.min,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
