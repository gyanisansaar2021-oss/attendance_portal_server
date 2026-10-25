/**
 * Screen — themed, safe-area-aware page container. Keeps background color and
 * safe-area handling consistent across screens so they don't each re-implement it.
 */
import { type ReactNode } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/theme';

export interface ScreenProps {
  children: ReactNode;
  /** Which safe-area edges to apply. Default: top only (tab bar handles bottom). */
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Screen({ children, edges = ['top'], style, testID }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safe} edges={edges} testID={testID}>
      <View style={[styles.content, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
});
