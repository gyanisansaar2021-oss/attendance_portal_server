import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, Header } from '@/components/ui';
import { colors } from '@/theme';

export default function TeacherNotifications() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Alerts" />
      <EmptyState
        icon="alerts"
        title="You're all caught up"
        description="Important notifications will appear here."
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
});
