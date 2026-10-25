/**
 * Principal dashboard domain types.
 * Mirrors the contract documented in client/README.md.
 */

/** Severity for an attention item; drives icon + color (never color alone). */
export type AttentionSeverity = 'INFO' | 'WARNING' | 'DANGER';

/** A per-teacher row in the attendance summary. */
export interface TeacherAttendanceRow {
  teacherId: string;
  name: string;
  /** Present / absent / on substitution / not checked in. */
  status: 'PRESENT' | 'ABSENT' | 'ON_SUBSTITUTION' | 'NOT_CHECKED_IN';
  /** ISO datetime of check-in, when present. */
  checkInTime?: string;
}

/** An item needing the principal's attention. */
export interface AttentionItem {
  id: string;
  severity: AttentionSeverity;
  title: string;
  description?: string;
  /** Machine code so the UI can route/act without parsing text. */
  code: string;
}

/** Response shape for GET /admin/dashboard. */
export interface AdminDashboard {
  date: string; // ISO date
  schoolName: string;
  /** Attendance percentage for teachers today (0–100). */
  attendancePercentage: number;
  teachersTotal: number;
  teachersPresent: number;
  teachersAbsent: number;
  onSubstitution: number;
  pendingSubstitutionRequests: number;
  /** Compact per-teacher summary (may be truncated server-side). */
  teacherAttendance: TeacherAttendanceRow[];
  /** Items needing attention (absences, pending requests, etc.). */
  attentionItems: AttentionItem[];
}
