/**
 * Icon — the single abstraction over the icon library.
 *
 * Screens and components import THIS, never the icon library directly, so
 * swapping libraries later is a one-file change. We use semantic names (e.g.
 * 'check-in', 'location') that stay stable even if the underlying glyph changes.
 *
 * Backed by @react-native-vector-icons/ionicons (the actively maintained package
 * Expo recommends over the deprecated @expo/vector-icons; integrates with
 * expo-font and works in Expo Go, dev builds, and production).
 */
import Ionicons from '@react-native-vector-icons/ionicons';
import type { ComponentProps } from 'react';
import { type ColorValue } from 'react-native';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export type IconName =
  // navigation / tabs
  | 'back'
  | 'home'
  | 'classes'
  | 'substitution'
  | 'alerts'
  | 'profile'
  // status / meaning
  | 'empty'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  // domain
  | 'check-in'
  | 'check-out'
  | 'location'
  | 'location-off'
  | 'time'
  | 'calendar'
  | 'people'
  | 'teacher'
  | 'chevron-right'
  | 'refresh'
  | 'logout'
  | 'eye'
  | 'eye-off';

/** Map stable semantic names to concrete Ionicons glyphs. */
const GLYPH: Record<IconName, IoniconName> = {
  back: 'chevron-back',
  home: 'home-outline',
  classes: 'book-outline',
  substitution: 'swap-horizontal-outline',
  alerts: 'notifications-outline',
  profile: 'person-outline',
  empty: 'file-tray-outline',
  success: 'checkmark-circle',
  warning: 'alert-circle',
  danger: 'close-circle',
  info: 'information-circle',
  'check-in': 'log-in-outline',
  'check-out': 'log-out-outline',
  location: 'location-outline',
  'location-off': 'location-outline',
  time: 'time-outline',
  calendar: 'calendar-outline',
  people: 'people-outline',
  teacher: 'person-circle-outline',
  'chevron-right': 'chevron-forward',
  refresh: 'refresh-outline',
  logout: 'log-out-outline',
  eye: 'eye-outline',
  'eye-off': 'eye-off-outline',
};

export interface IconProps {
  name: IconName;
  size?: number;
  color?: ColorValue;
}

export function Icon({ name, size = 24, color = '#334155' }: IconProps) {
  return <Ionicons name={GLYPH[name]} size={size} color={color} />;
}
