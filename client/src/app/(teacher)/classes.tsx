import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, Header } from '@/components/ui';
import { colors } from '@/theme';

export default function TeacherClasses() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Classes" />
      <EmptyState
        icon="classes"
        title="No classes yet"
        description="Your class sessions will show here. Coming in the next phase."
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
});
