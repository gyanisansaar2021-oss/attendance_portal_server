import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, Header } from '@/components/ui';
import { colors } from '@/theme';

export default function TeacherSubstitution() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Substitution" />
      <EmptyState
        icon="substitution"
        title="No substitution requests"
        description="Request or respond to substitutions here. Coming in the next phase."
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
});
