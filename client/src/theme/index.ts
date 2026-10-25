/**
 * Theme entry point. Import tokens from here across the app:
 *
 *   import { colors, spacing, radius, typography, shadows, theme } from '@/theme';
 */
export { colors, palette, type ColorToken } from './colors';
export { spacing, touchTarget, type SpacingToken } from './spacing';
export { radius, type RadiusToken } from './radius';
export {
  typography,
  fontSize,
  fontWeight,
  lineHeight,
  type TypographyToken,
} from './typography';
export { shadows, type ShadowToken } from './shadows';

import { colors } from './colors';
import { radius } from './radius';
import { shadows } from './shadows';
import { spacing, touchTarget } from './spacing';
import { fontSize, fontWeight, typography } from './typography';

/** Convenience object bundling every token group. */
export const theme = {
  colors,
  spacing,
  touchTarget,
  radius,
  typography,
  fontSize,
  fontWeight,
  shadows,
} as const;

export type Theme = typeof theme;
