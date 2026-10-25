/**
 * Shared API envelope types.
 *
 * Every endpoint (mock Express today, Java Spring Boot later) returns the same
 * envelope:
 *
 *   {
 *     "success": true,
 *     "message": "Human readable string (DO NOT use for business logic)",
 *     "code": "MACHINE_READABLE_CODE",
 *     "data": { ... } | null
 *   }
 *
 * Frontend business logic must branch on `code`, never on the English `message`.
 */

/** Successful response envelope. */
export interface ApiSuccess<T> {
  success: true;
  message: string;
  code: string;
  data: T;
}

/** Error response envelope (same shape, data is null). */
export interface ApiErrorBody {
  success: false;
  message: string;
  code: string;
  data: null;
}

/** Raw envelope as it arrives over the wire. */
export type ApiEnvelope<T> = ApiSuccess<T> | ApiErrorBody;

/**
 * Normalized error thrown by the API client. All screens/hooks catch this
 * single shape instead of parsing responses themselves.
 */
export class ApiError extends Error {
  /** Machine-readable business/technical code. Branch on this. */
  readonly code: string;
  /** HTTP status (0 when the request never reached the server). */
  readonly status: number;
  /** True when the failure was a network/timeout issue, not a server response. */
  readonly isNetworkError: boolean;

  constructor(params: {
    code: string;
    message: string;
    status: number;
    isNetworkError?: boolean;
  }) {
    super(params.message);
    this.name = 'ApiError';
    this.code = params.code;
    this.status = params.status;
    this.isNetworkError = params.isNetworkError ?? false;
  }
}

/**
 * Canonical business/technical error codes shared with the backend.
 * Keep this list in sync with client/README.md (source of truth).
 */
export const ApiErrorCode = {
  // Transport / generic
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN: 'UNKNOWN',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',

  // Auth
  OTP_SENT: 'OTP_SENT',
  OTP_INVALID: 'OTP_INVALID',
  OTP_EXPIRED: 'OTP_EXPIRED',
  LOGIN_OK: 'LOGIN_OK',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_REFRESHED: 'TOKEN_REFRESHED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  LOGOUT_OK: 'LOGOUT_OK',

  // Teacher attendance / geofence
  CHECKED_IN: 'CHECKED_IN',
  CHECKED_OUT: 'CHECKED_OUT',
  ALREADY_CHECKED_IN: 'ALREADY_CHECKED_IN',
  ALREADY_CHECKED_OUT: 'ALREADY_CHECKED_OUT',
  TEACHER_OUTSIDE_GEOFENCE: 'TEACHER_OUTSIDE_GEOFENCE',
  GPS_ACCURACY_TOO_LOW: 'GPS_ACCURACY_TOO_LOW',
  TEACHER_NOT_ACTIVE: 'TEACHER_NOT_ACTIVE',

  // Attendance / sessions
  ATTENDANCE_SUBMITTED: 'ATTENDANCE_SUBMITTED',
  ATTENDANCE_NOT_ALLOWED: 'ATTENDANCE_NOT_ALLOWED',
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',

  // Substitution
  SUBSTITUTION_CREATED: 'SUBSTITUTION_CREATED',
  SUBSTITUTION_ACCEPTED: 'SUBSTITUTION_ACCEPTED',
  SUBSTITUTION_REJECTED: 'SUBSTITUTION_REJECTED',
  SUBSTITUTION_CANCELLED: 'SUBSTITUTION_CANCELLED',
  SUBSTITUTION_ASSIGNED: 'SUBSTITUTION_ASSIGNED',
} as const;

export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];
