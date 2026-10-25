/**
 * Teacher Home — the first thing a teacher sees. Optimized for speed: greeting,
 * today's date, a prominent attendance/check-in status card, and today's classes
 * so the teacher can jump straight to marking attendance.
 *
 * Data: GET /class-sessions/today via useTodayClasses (TanStack Query).
 * Handles loading, empty, error, and pull-to-refresh.
 */
import { useCallback } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { toUiError } from '@/api/errorMessages';
import {
  Card,
  ClassCard,
  EmptyState,
  ErrorState,
  Icon,
  LoadingState,
  Screen,
  StatusBadge,
} from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useTodayClasses } from '@/hooks/useTodayClasses';
import type { AttendanceStatus } from '@/types/attendance';
import { formatLongDate, formatTime, greeting } from '@/utils/datetime';
import { colors, radius, spacing, typography } from '@/theme';

export default function TeacherHome() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const query = useTodayClasses();

  const onRefresh = useCallback(() => {
    void query.refetch();
  }, [query]);

  // Full-screen states only on first load (no cached data yet).
  if (query.isLoading) {
    return (
      <Screen>
        <HomeHeader name={firstName} />
        <LoadingState message="Loading your day…" />
      </Screen>
    );
  }

  if (query.isError && !query.data) {
    const ui = toUiError(query.error);
    return (
      <Screen>
        <HomeHeader name={firstName} />
        <ErrorState
          title={ui.title}
          message={ui.message}
          onRetry={onRefresh}
          retrying={query.isRefetching}
        />
      </Screen>
    );
  }

  const data = query.data;
  const sessions = data?.sessions ?? [];

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <HomeHeader name={firstName} />

        {data ? <AttendanceCard attendance={data.attendance} /> : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today&apos;s classes</Text>
          {sessions.length > 0 ? (
            <Text style={styles.sectionCount}>{sessions.length}</Text>
          ) : null}
        </View>

        {sessions.length === 0 ? (
          <Card padding="lg">
            <EmptyState
              icon="classes"
              title="No classes today"
              description="Enjoy the breather — nothing is scheduled for you today."
            />
          </Card>
        ) : (
          <View style={styles.classList}>
            {sessions.map((session) => (
              <ClassCard key={session.id} session={session} />
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

/** Greeting + date block. */
function HomeHeader({ name }: { name: string }) {
  return (
    <View style={styles.header}>
      <Text style={styles.greeting}>
        {greeting()}, {name}
      </Text>
      <Text style={styles.date}>{formatLongDate()}</Text>
    </View>
  );
}

/** Prominent attendance / check-in status card. */
function AttendanceCard({ attendance }: { attendance: AttendanceStatus }) {
  const checkedIn = attendance.status === 'CHECKED_IN';
  const checkedOut = attendance.status === 'CHECKED_OUT';

  const statusLabel = checkedIn
    ? 'Checked in'
    : checkedOut
      ? 'Checked out'
      : 'Not checked in';
  const statusTone = checkedIn ? 'success' : checkedOut ? 'neutral' : 'warning';

  const locationInside = attendance.locationStatus === 'INSIDE_SCHOOL';
  const locationLabel =
    attendance.locationStatus === 'INSIDE_SCHOOL'
      ? 'At school'
      : attendance.locationStatus === 'OUTSIDE_SCHOOL'
        ? 'Away from school'
        : 'Location unknown';

  return (
    <Card padding="lg" style={styles.attendanceCard}>
      <View style={styles.attendanceTop}>
        <View style={styles.attendanceIconWrap}>
          <Icon name={checkedIn ? 'check-in' : 'time'} size={22} color={colors.primary} />
        </View>
        <View style={styles.attendanceInfo}>
          <Text style={styles.attendanceLabel}>Attendance</Text>
          <StatusBadge
            label={statusLabel}
            tone={statusTone}
            icon={checkedIn ? 'success' : 'warning'}
          />
        </View>
      </View>

      <View style={styles.attendanceMeta}>
        {attendance.checkInTime ? (
          <View style={styles.metaItem}>
            <Icon name="time" size={15} color={colors.textMuted} />
            <Text style={styles.metaText}>Since {formatTime(attendance.checkInTime)}</Text>
          </View>
        ) : null}
        <View style={styles.metaItem}>
          <Icon
            name={locationInside ? 'location' : 'location-off'}
            size={15}
            color={locationInside ? colors.success : colors.textMuted}
          />
          <Text style={styles.metaText}>
            {locationLabel}
            {attendance.schoolName ? ` · ${attendance.schoolName}` : ''}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: { gap: spacing.xxs },
  greeting: { ...typography.h1, color: colors.textPrimary },
  date: { ...typography.body, color: colors.textSecondary },

  attendanceCard: { gap: spacing.md },
  attendanceTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  attendanceIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attendanceInfo: { flex: 1, gap: spacing.xs },
  attendanceLabel: { ...typography.label, color: colors.textSecondary },
  attendanceMeta: {
    gap: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  metaText: { ...typography.caption, color: colors.textSecondary },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { ...typography.h3, color: colors.textPrimary },
  sectionCount: {
    ...typography.label,
    color: colors.primary,
    backgroundColor: colors.primarySubtle,
    minWidth: 24,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  classList: { gap: spacing.md },
});
