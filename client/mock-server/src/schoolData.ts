/**
 * Realistic domain data for Teacher Home and Principal Dashboard.
 *
 * Times are generated relative to "now" each request so session states
 * (upcoming / in-progress / attendance-pending / completed) look realistic
 * during development regardless of the clock.
 *
 * Shapes intentionally match the client types in:
 *   src/types/attendance.ts  and  src/types/dashboard.ts
 */

const SCHOOL_NAME = 'Greenwood Public School';

function atToday(hour: number, minute: number): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

type SessionState = 'UPCOMING' | 'IN_PROGRESS' | 'ATTENDANCE_PENDING' | 'COMPLETED';

function deriveState(start: Date, end: Date): SessionState {
  const now = Date.now();
  if (now < start.getTime()) return 'UPCOMING';
  if (now >= start.getTime() && now <= end.getTime()) return 'IN_PROGRESS';
  // Past sessions: mark the most recent as attendance-pending, older as completed.
  const minsSinceEnd = (now - end.getTime()) / 60000;
  return minsSinceEnd <= 90 ? 'ATTENDANCE_PENDING' : 'COMPLETED';
}

/** Build today's attendance status + class sessions for a teacher. */
export function buildTodayClasses() {
  const slots = [
    { h: 8, m: 30, dur: 45, subject: 'Mathematics', className: 'Grade 8', section: 'A', room: 'R-201', students: 32 },
    { h: 9, m: 30, dur: 45, subject: 'Mathematics', className: 'Grade 9', section: 'B', room: 'R-204', students: 29 },
    { h: 11, m: 0, dur: 45, subject: 'Mathematics', className: 'Grade 7', section: 'C', room: 'R-105', students: 34 },
    { h: 13, m: 30, dur: 45, subject: 'Mathematics', className: 'Grade 10', section: 'A', room: 'R-301', students: 27 },
  ];

  const sessions = slots.map((s, i) => {
    const start = atToday(s.h, s.m);
    const end = new Date(start.getTime() + s.dur * 60000);
    return {
      id: `session_${i + 1}`,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      subject: s.subject,
      className: s.className,
      section: s.section,
      room: s.room,
      state: deriveState(start, end),
      studentCount: s.students,
    };
  });

  const checkIn = atToday(8, 15);
  return {
    date: new Date().toISOString(),
    attendance: {
      status: 'CHECKED_IN' as const,
      checkInTime: checkIn.toISOString(),
      locationStatus: 'INSIDE_SCHOOL' as const,
      schoolName: SCHOOL_NAME,
    },
    sessions,
  };
}

/** Build the principal dashboard summary. */
export function buildAdminDashboard() {
  const teacherAttendance = [
    { teacherId: 'teacher_001', name: 'Rahul Kumar', status: 'PRESENT' as const, checkInTime: atToday(8, 15).toISOString() },
    { teacherId: 'teacher_002', name: 'Priya Sharma', status: 'PRESENT' as const, checkInTime: atToday(8, 22).toISOString() },
    { teacherId: 'teacher_003', name: 'Imran Qureshi', status: 'ON_SUBSTITUTION' as const },
    { teacherId: 'teacher_004', name: 'Meera Nair', status: 'ABSENT' as const },
    { teacherId: 'teacher_005', name: 'Sanjay Patel', status: 'NOT_CHECKED_IN' as const },
  ];

  const teachersTotal = teacherAttendance.length;
  const teachersPresent = teacherAttendance.filter((t) => t.status === 'PRESENT').length;
  const teachersAbsent = teacherAttendance.filter((t) => t.status === 'ABSENT').length;
  const onSubstitution = teacherAttendance.filter((t) => t.status === 'ON_SUBSTITUTION').length;
  const pendingSubstitutionRequests = 2;
  const attendancePercentage = Math.round((teachersPresent / teachersTotal) * 100);

  const attentionItems = [
    {
      id: 'att_1',
      severity: 'DANGER' as const,
      code: 'TEACHER_ABSENT',
      title: 'Meera Nair is absent today',
      description: 'No substitute assigned for 2 classes.',
    },
    {
      id: 'att_2',
      severity: 'WARNING' as const,
      code: 'SUBSTITUTION_PENDING',
      title: '2 substitution requests pending',
      description: 'Awaiting your assignment.',
    },
    {
      id: 'att_3',
      severity: 'WARNING' as const,
      code: 'TEACHER_NOT_CHECKED_IN',
      title: 'Sanjay Patel has not checked in',
      description: 'Expected by 8:45 AM.',
    },
  ];

  return {
    date: new Date().toISOString(),
    schoolName: SCHOOL_NAME,
    attendancePercentage,
    teachersTotal,
    teachersPresent,
    teachersAbsent,
    onSubstitution,
    pendingSubstitutionRequests,
    teacherAttendance,
    attentionItems,
  };
}
