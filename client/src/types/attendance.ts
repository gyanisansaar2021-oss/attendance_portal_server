/**
 * Teacher attendance + class session domain types.
 * Mirrors the contract documented in client/README.md.
 */

/** Teacher's own check-in state for the day. */
export type CheckInStatus = 'NOT_CHECKED_IN' | 'CHECKED_IN' | 'CHECKED_OUT';

/** Backend-decided school/location state (frontend never computes this). */
export type LocationStatus = 'UNKNOWN' | 'INSIDE_SCHOOL' | 'OUTSIDE_SCHOOL';

/** Lifecycle state of a single class session for the teacher. */
export type SessionState = 'UPCOMING' | 'IN_PROGRESS' | 'ATTENDANCE_PENDING' | 'COMPLETED';

/** Teacher's attendance/check-in summary shown on Home. */
export interface AttendanceStatus {
  status: CheckInStatus;
  /** ISO datetime string when the teacher checked in, if available. */
  checkInTime?: string;
  /** ISO datetime string when the teacher checked out, if available. */
  checkOutTime?: string;
  /** Backend-decided location state; display-only. */
  locationStatus: LocationStatus;
  /** Human-readable school name for the status card, when available. */
  schoolName?: string;
}

/** A single class session in the teacher's day. */
export interface ClassSession {
  id: string;
  /** ISO datetime for the session start. */
  startTime: string;
  /** ISO datetime for the session end. */
  endTime: string;
  subject: string;
  className: string; // e.g. "Grade 8"
  section: string; // e.g. "A"
  room?: string;
  state: SessionState;
  /** Count of students in the roster, when known. */
  studentCount?: number;
}

/** Response shape for GET /class-sessions/today. */
export interface TodayClasses {
  date: string; // ISO date
  attendance: AttendanceStatus;
  sessions: ClassSession[];
}
