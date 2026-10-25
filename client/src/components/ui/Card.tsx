/**
 * Card — white surface container with rounded corners and a subtle shadow.
 * The building block for most screens (class cards, stat cards, list items).
 */
import { type ReactNode } from 'react';
import {
  type GestureResponderEvent,
  Pressable,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';

import { colors, radius, shadows, spacing } from '@/theme';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';
export type CardElevation = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps {
  children: ReactNode;
  padding?: CardPadding;
  elevation?: CardElevation;
  style?: StyleProp<ViewStyle>;
  /** When provided, the whole card becomes pressable. */
  onPress?: (event: GestureResponderEvent) => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

const PADDING: Record<CardPadding, number> = {
  none: 0,
  sm: spacing.md,
  md: spacing.lg,
  lg: spacing.xl,
};

export function Card({
  children,
  padding = 'md',
  elevation = 'sm',
  style,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: CardProps) {
  const containerStyle: StyleProp<ViewStyle> = [
    styles.card,
    { padding: PADDING[padding] },
    shadows[elevation],
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        style={({ pressed }) => [containerStyle, pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={containerStyle} testID={testID} accessibilityLabel={accessibilityLabel}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.85,
  },
});
