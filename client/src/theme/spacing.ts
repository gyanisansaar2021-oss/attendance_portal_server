/**
 * Spacing scale (4pt grid). Use consistent spacing tokens instead of magic numbers.
 *
 *   import { spacing } from '@/theme';
 *   padding: spacing.md
 */
export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  giant: 48,
} as const;

export type SpacingToken = keyof typeof spacing;

/** Minimum touch target size for accessible, mobile-first controls (pts). */
export const touchTarget = {
  min: 44,
  comfortable: 48,
} as const;
