/**
 * Typography tokens: font sizes, weights, line heights, and ready-made text styles.
 *
 *   import { typography } from '@/theme';
 *   <Text style={typography.h2}>Title</Text>
 *
 * Font sizes stay readable on mobile (no tiny text). System fonts are used by
 * default for performance and a native feel; a custom font can be wired later
 * via expo-font without changing these tokens.
 */
import type { TextStyle } from 'react-native';

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 36,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const satisfies Record<string, TextStyle['fontWeight']>;

export const lineHeight = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
} as const;

/** Pre-composed text styles. Components should prefer these over ad-hoc sizes. */
export const typography = {
  display: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.bold,
    lineHeight: Math.round(fontSize.display * lineHeight.tight),
  },
  h1: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    lineHeight: Math.round(fontSize.xxxl * lineHeight.tight),
  },
  h2: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    lineHeight: Math.round(fontSize.xxl * lineHeight.tight),
  },
  h3: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    lineHeight: Math.round(fontSize.xl * lineHeight.normal),
  },
  h4: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    lineHeight: Math.round(fontSize.lg * lineHeight.normal),
  },
  bodyLarge: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.regular,
    lineHeight: Math.round(fontSize.lg * lineHeight.relaxed),
  },
  body: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    lineHeight: Math.round(fontSize.md * lineHeight.relaxed),
  },
  bodyMedium: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    lineHeight: Math.round(fontSize.md * lineHeight.normal),
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    lineHeight: Math.round(fontSize.sm * lineHeight.normal),
  },
  caption: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: Math.round(fontSize.sm * lineHeight.normal),
  },
  small: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    lineHeight: Math.round(fontSize.xs * lineHeight.normal),
  },
  button: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    lineHeight: Math.round(fontSize.md * lineHeight.tight),
  },
} as const satisfies Record<string, TextStyle>;

export type TypographyToken = keyof typeof typography;
