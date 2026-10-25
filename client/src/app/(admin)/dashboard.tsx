/**
 * Principal Dashboard — the command center. Shows attendance at a glance (KPI
 * tiles), a per-teacher attendance summary, and prioritized attention items.
 *
 * Data: GET /admin/dashboard via useAdminDashboard (TanStack Query).
 * Handles loading, empty, error, and pull-to-refresh.
 */
import { router } from 'expo-router';
import { useCallback } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { toUiError } from '@/api/errorMessages';
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Header,
  Icon,
  LoadingState,
  Screen,
  StatCard,
  StatusBadge,
  type StatusTone,
} from '@/components/ui';
import { useAuth, useLogout } from '@/hooks/useAuth';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import type { AttentionItem, TeacherAttendanceRow } from '@/types/dashboard';
import { formatTime } from '@/utils/datetime';
import { colors, radius, spacing, typography } from '@/theme';

export default function AdminDashboard() {
  const { user } = useAuth();
  const logout = useLogout();
  const query = useAdminDashboard();

  const onRefresh = useCallback(() => {
    void query.refetch();
  }, [query]);

  async function handleLogout() {
    await logout.mutateAsync();
    router.replace('/(auth)/login');
  }

  const right = (
    <Button
      label="Log out"
      variant="ghost"
      size="sm"
      onPress={handleLogout}
      loading={logout.isPending}
    />
  );

  if (query.isLoading) {
    return (
      <Screen>
        <Header title="Dashboard" subtitle={user?.name} right={right} />
        <LoadingState message="Loading dashboard…" />
      </Screen>
    );
  }

  if (query.isError && !query.data) {
    const ui = toUiError(query.error);
    return (
      <Screen>
        <Header title="Dashboard" subtitle={user?.name} right={right} />
        <ErrorState
          title={ui.title}
          message={ui.message}
          onRetry={onRefresh}
          retrying={query.isRefetching}
        />
      </Screen>
    );
  }

  const data = query.data!;

  return (
    <Screen>
      <Header title="Dashboard" subtitle={data.schoolName} right={right} />
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
        {/* Attendance headline */}
        <Card padding="lg" style={styles.headline}>
          <View style={styles.headlineText}>
            <Text style={styles.headlineLabel}>Teacher attendance today</Text>
            <Text style={styles.headlineValue}>{data.attendancePercentage}%</Text>
            <Text style={styles.headlineSub}>
              {data.teachersPresent} of {data.teachersTotal} present
            </Text>
          </View>
          <AttendanceRing percentage={data.attendancePercentage} />
        </Card>

        {/* KPI grid */}
        <View style={styles.grid}>
          <StatCard label="Present" value={data.teachersPresent} icon="success" tone="success" />
          <StatCard label="Absent" value={data.teachersAbsent} icon="danger" tone="danger" />
          <StatCard
            label="On substitution"
            value={data.onSubstitution}
            icon="substitution"
            tone="warning"
          />
          <StatCard
            label="Pending requests"
            value={data.pendingSubstitutionRequests}
            icon="alerts"
            tone="primary"
          />
        </View>

        {/* Attention items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Needs attention</Text>
          {data.attentionItems.length === 0 ? (
            <Card padding="lg">
              <EmptyState
                icon="success"
                title="All clear"
                description="Nothing needs your attention right now."
              />
            </Card>
          ) : (
            <View style={styles.list}>
              {data.attentionItems.map((item) => (
                <AttentionRow key={item.id} item={item} />
              ))}
            </View>
          )}
        </View>

        {/* Teacher attendance summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Teacher attendance</Text>
          <Card padding="none">
            {data.teacherAttendance.map((row, i) => (
              <TeacherRow key={row.teacherId} row={row} isLast={i === data.teacherAttendance.length - 1} />
            ))}
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}

/** Simple circular percentage indicator (no extra deps). */
function AttendanceRing({ percentage }: { percentage: number }) {
  const tone =
    percentage >= 90 ? colors.success : percentage >= 70 ? colors.warning : colors.danger;
  return (
    <View style={[styles.ring, { borderColor: tone }]}>
      <Text style={[styles.ringText, { color: tone }]}>{percentage}%</Text>
    </View>
  );
}

const ATTENTION_TONE: Record<AttentionItem['severity'], StatusTone> = {
  INFO: 'info',
  WARNING: 'warning',
  DANGER: 'danger',
};

function AttentionRow({ item }: { item: AttentionItem }) {
  const tone = ATTENTION_TONE[item.severity];
  const iconName = item.severity === 'DANGER' ? 'danger' : item.severity === 'WARNING' ? 'warning' : 'info';
  return (
    <Card padding="md" style={styles.attentionRow}>
      <Icon name={iconName} size={20} color={toneColor(tone)} />
      <View style={styles.attentionText}>
        <Text style={styles.attentionTitle}>{item.title}</Text>
        {item.description ? (
          <Text style={styles.attentionDesc}>{item.description}</Text>
        ) : null}
      </View>
    </Card>
  );
}

const TEACHER_STATUS: Record<
  TeacherAttendanceRow['status'],
  { label: string; tone: StatusTone }
> = {
  PRESENT: { label: 'Present', tone: 'success' },
  ABSENT: { label: 'Absent', tone: 'danger' },
  ON_SUBSTITUTION: { label: 'Substituting', tone: 'warning' },
  NOT_CHECKED_IN: { label: 'Not in', tone: 'neutral' },
};

function TeacherRow({ row, isLast }: { row: TeacherAttendanceRow; isLast: boolean }) {
  const meta = TEACHER_STATUS[row.status];
  const initials = row.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('');
  return (
    <View style={[styles.teacherRow, !isLast && styles.teacherRowBorder]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={styles.teacherInfo}>
        <Text style={styles.teacherName}>{row.name}</Text>
        {row.checkInTime ? (
          <Text style={styles.teacherMeta}>In at {formatTime(row.checkInTime)}</Text>
        ) : null}
      </View>
      <StatusBadge label={meta.label} tone={meta.tone} />
    </View>
  );
}

function toneColor(tone: StatusTone): string {
  switch (tone) {
    case 'success':
      return colors.success;
    case 'warning':
      return colors.warning;
    case 'danger':
      return colors.danger;
    case 'info':
      return colors.info;
    default:
      return colors.textSecondary;
  }
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg },

  headline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headlineText: { gap: spacing.xxs },
  headlineLabel: { ...typography.label, color: colors.textSecondary },
  headlineValue: { ...typography.display, color: colors.textPrimary },
  headlineSub: { ...typography.caption, color: colors.textSecondary },
  ring: {
    width: 76,
    height: 76,
    borderRadius: radius.pill,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringText: { ...typography.h4 },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },

  section: { gap: spacing.md },
  sectionTitle: { ...typography.h3, color: colors.textPrimary },
  list: { gap: spacing.sm },

  attentionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  attentionText: { flex: 1, gap: 2 },
  attentionTitle: { ...typography.bodyMedium, color: colors.textPrimary },
  attentionDesc: { ...typography.caption, color: colors.textSecondary },

  teacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  teacherRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typography.label, color: colors.primary },
  teacherInfo: { flex: 1, gap: 2 },
  teacherName: { ...typography.bodyMedium, color: colors.textPrimary },
  teacherMeta: { ...typography.small, color: colors.textMuted },
});
