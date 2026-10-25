/**
 * ClassCard — compact card for one of the teacher's class sessions.
 *
 * Shows a time rail, subject + class/section, room and student count, and a
 * status badge reflecting the session state. Optionally pressable (to open the
 * session for attendance in a later phase).
 */
import { StyleSheet, Text, View } from 'react-native';

import { Card } from './Card';
import { Icon } from './Icon';
import { StatusBadge, type StatusTone } from './StatusBadge';
import type { ClassSession, SessionState } from '@/types/attendance';
import { formatTime, formatTimeRange } from '@/utils/datetime';
import { colors, spacing, typography } from '@/theme';

export interface ClassCardProps {
  session: ClassSession;
  onPress?: () => void;
  testID?: string;
}

const STATE_META: Record<SessionState, { label: string; tone: StatusTone }> = {
  UPCOMING: { label: 'Upcoming', tone: 'neutral' },
  IN_PROGRESS: { label: 'In progress', tone: 'info' },
  ATTENDANCE_PENDING: { label: 'Mark attendance', tone: 'warning' },
  COMPLETED: { label: 'Done', tone: 'success' },
};

export function ClassCard({ session, onPress, testID }: ClassCardProps) {
  const meta = STATE_META[session.state];

  return (
    <Card
      padding="md"
      onPress={onPress}
      testID={testID}
      accessibilityLabel={`${session.subject}, ${session.className} ${session.section}, ${formatTimeRange(
        session.startTime,
        session.endTime,
      )}, ${meta.label}`}
    >
      <View style={styles.row}>
        {/* Time rail */}
        <View style={styles.timeRail}>
          <Text style={styles.timeStart}>{formatTime(session.startTime)}</Text>
          <Text style={styles.timeEnd}>{formatTime(session.endTime)}</Text>
        </View>

        <View style={styles.divider} />

        {/* Details */}
        <View style={styles.details}>
          <Text style={styles.subject} numberOfLines={1}>
            {session.subject}
          </Text>
          <Text style={styles.classLine} numberOfLines={1}>
            {session.className} · Section {session.section}
          </Text>
          <View style={styles.metaRow}>
            {session.room ? (
              <View style={styles.metaItem}>
                <Icon name="location" size={13} color={colors.textMuted} />
                <Text style={styles.metaText}>{session.room}</Text>
              </View>
            ) : null}
            {session.studentCount != null ? (
              <View style={styles.metaItem}>
                <Icon name="people" size={13} color={colors.textMuted} />
                <Text style={styles.metaText}>{session.studentCount}</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.badgeRow}>
            <StatusBadge label={meta.label} tone={meta.tone} />
          </View>
        </View>

        {onPress ? (
          <View style={styles.chevron}>
            <Icon name="chevron-right" size={20} color={colors.textMuted} />
          </View>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.md,
  },
  timeRail: {
    width: 56,
    justifyContent: 'center',
  },
  timeStart: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  timeEnd: {
    ...typography.small,
    color: colors.textMuted,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  details: {
    flex: 1,
    gap: spacing.xxs,
  },
  subject: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  classLine: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xxs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  metaText: {
    ...typography.small,
    color: colors.textMuted,
  },
  badgeRow: {
    marginTop: spacing.xs,
  },
  chevron: {
    justifyContent: 'center',
    marginLeft: -spacing.xs,
  },
});
