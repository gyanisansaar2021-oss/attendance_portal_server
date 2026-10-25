/**
 * Central registry of API paths (relative to config.apiBaseUrl, i.e. /api/v1).
 *
 * Keeping paths here (not scattered in components) means a contract change is a
 * one-line edit, and it documents the full surface in one place. Mirrors the
 * contract in client/README.md.
 */
export const endpoints = {
  auth: {
    teacherSendOtp: '/auth/teacher/send-otp',
    teacherVerifyOtp: '/auth/teacher/verify-otp',
    principalLogin: '/auth/principal/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  teacherAttendance: {
    checkIn: '/teacher-attendance/check-in',
    checkOut: '/teacher-attendance/check-out',
  },
  classSessions: {
    today: '/class-sessions/today',
    byId: (id: string) => `/class-sessions/${id}`,
    students: (sessionId: string) => `/class-sessions/${sessionId}/students`,
    attendance: (sessionId: string) => `/class-sessions/${sessionId}/attendance`,
  },
  substitutions: {
    create: '/substitutions',
    pending: '/substitutions/pending',
    accept: (id: string) => `/substitutions/${id}/accept`,
    reject: (id: string) => `/substitutions/${id}/reject`,
    cancel: (id: string) => `/substitutions/${id}/cancel`,
    adminAssign: (id: string) => `/admin/substitutions/${id}/assign`,
  },
  notifications: {
    list: '/notifications',
  },
  admin: {
    dashboard: '/admin/dashboard',
  },
  teachers: {
    list: '/teachers',
    byId: (id: string) => `/teachers/${id}`,
  },
  students: {
    list: '/students',
    byId: (id: string) => `/students/${id}`,
  },
  classes: {
    list: '/classes',
    byId: (id: string) => `/classes/${id}`,
  },
  subjects: {
    list: '/subjects',
    byId: (id: string) => `/subjects/${id}`,
  },
  timetable: {
    list: '/timetable',
    byId: (id: string) => `/timetable/${id}`,
  },
} as const;
