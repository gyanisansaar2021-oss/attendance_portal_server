/**
 * Color tokens for the "Modern Calm Education UI".
 *
 * Do NOT hard-code hex values in components. Always import from the theme:
 *   import { colors } from '@/theme';
 *   backgroundColor: colors.primary
 *
 * Semantic roles (primary / success / warning / danger / etc.) are what
 * components should reference. The raw palette scales are provided for
 * fine-grained needs (borders, subtle backgrounds, pressed states).
 */

/** Raw palette scales. Prefer the semantic `colors` export below in UI code. */
export const palette = {
  // Indigo / blue — primary brand
  indigo50: '#EEF2FF',
  indigo100: '#E0E7FF',
  indigo200: '#C7D2FE',
  indigo300: '#A5B4FC',
  indigo400: '#818CF8',
  indigo500: '#6366F1',
  indigo600: '#4F46E5',
  indigo700: '#4338CA',
  indigo800: '#3730A3',
  indigo900: '#312E81',

  // Teal / green — success
  teal50: '#ECFDF5',
  teal100: '#D1FAE5',
  teal500: '#10B981',
  teal600: '#059669',
  teal700: '#047857',

  // Amber — warnings
  amber50: '#FFFBEB',
  amber100: '#FEF3C7',
  amber500: '#F59E0B',
  amber600: '#D97706',
  amber700: '#B45309',

  // Red — errors
  red50: '#FEF2F2',
  red100: '#FEE2E2',
  red500: '#EF4444',
  red600: '#DC2626',
  red700: '#B91C1C',

  // Neutral / slate — text, borders, surfaces
  white: '#FFFFFF',
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1E293B',
  slate900: '#0F172A',
  black: '#000000',
  transparent: 'transparent',
} as const;

/**
 * Semantic color roles. These are the tokens components should use.
 */
export const colors = {
  // Brand
  primary: palette.indigo600,
  primaryDark: palette.indigo700,
  primaryLight: palette.indigo100,
  primarySubtle: palette.indigo50,
  onPrimary: palette.white,

  // Status — success
  success: palette.teal600,
  successSubtle: palette.teal50,
  onSuccess: palette.white,

  // Status — warning
  warning: palette.amber500,
  warningSubtle: palette.amber50,
  onWarning: palette.slate900,

  // Status — danger / error
  danger: palette.red600,
  dangerSubtle: palette.red50,
  onDanger: palette.white,

  // Status — info (reuses brand)
  info: palette.indigo500,
  infoSubtle: palette.indigo50,

  // Surfaces
  background: palette.slate50, // very light app background
  surface: palette.white, // white cards
  surfaceAlt: palette.slate100,
  overlay: 'rgba(15, 23, 42, 0.45)', // modal / dialog scrim

  // Borders & dividers
  border: palette.slate200,
  borderStrong: palette.slate300,

  // Text
  textPrimary: palette.slate900,
  textSecondary: palette.slate600,
  textMuted: palette.slate400,
  textInverse: palette.white,

  // Controls
  inputBackground: palette.white,
  inputBorder: palette.slate300,
  inputBorderFocused: palette.indigo600,
  placeholder: palette.slate400,
  disabledBackground: palette.slate100,
  disabledText: palette.slate400,

  // Misc
  white: palette.white,
  black: palette.black,
  transparent: palette.transparent,
} as const;

export type ColorToken = keyof typeof colors;
