/**
 * Button — the primary action control.
 *
 * Variants map to semantic colors; sizes keep touch targets accessible.
 * Supports loading and disabled states, optional leading/trailing icons.
 */
import { type ReactNode } from 'react';
import {
  ActivityIndicator,
  type GestureResponderEvent,
  Pressable,
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

import { colors, radius, spacing, touchTarget, typography } from '@/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  label: string;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  /** Stretch to fill the parent width. */
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Accessibility hint describing the result of pressing. */
  accessibilityHint?: string;
  testID?: string;
}

interface VariantStyle {
  background: string;
  backgroundPressed: string;
  text: string;
  border?: string;
}

const VARIANTS: Record<ButtonVariant, VariantStyle> = {
  primary: {
    background: colors.primary,
    backgroundPressed: colors.primaryDark,
    text: colors.onPrimary,
  },
  secondary: {
    background: colors.surface,
    backgroundPressed: colors.surfaceAlt,
    text: colors.primary,
    border: colors.borderStrong,
  },
  success: {
    background: colors.success,
    backgroundPressed: colors.success,
    text: colors.onSuccess,
  },
  danger: {
    background: colors.danger,
    backgroundPressed: colors.danger,
    text: colors.onDanger,
  },
  ghost: {
    background: colors.transparent,
    backgroundPressed: colors.primarySubtle,
    text: colors.primary,
  },
};

const SIZES: Record<ButtonSize, { height: number; paddingHorizontal: number; fontSize: number }> = {
  sm: { height: touchTarget.min, paddingHorizontal: spacing.lg, fontSize: 14 },
  md: { height: touchTarget.comfortable, paddingHorizontal: spacing.xl, fontSize: 16 },
  lg: { height: 56, paddingHorizontal: spacing.xxl, fontSize: 17 },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  accessibilityHint,
  testID,
}: ButtonProps) {
  const v = VARIANTS[variant];
  const s = SIZES[size];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      hitSlop={6}
      style={({ pressed }) => [
        styles.base,
        {
          height: s.height,
          paddingHorizontal: s.paddingHorizontal,
          backgroundColor: pressed ? v.backgroundPressed : v.background,
          borderColor: v.border ?? 'transparent',
          borderWidth: v.border ? 1 : 0,
        },
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} />
      ) : (
        <View style={styles.content}>
          {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
          <Text
            numberOfLines={1}
            style={[typography.button, { color: v.text, fontSize: s.fontSize }]}
          >
            {label}
          </Text>
          {rightIcon ? <View style={styles.icon}>{rightIcon}</View> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
