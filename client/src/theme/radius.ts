/**
 * Border radius scale. Rounded corners are a core part of the calm, modern look.
 *
 *   import { radius } from '@/theme';
 *   borderRadius: radius.lg
 */
export const radius = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  xxl: 28,
  pill: 999,
  full: 9999,
} as const;

export type RadiusToken = keyof typeof radius;
