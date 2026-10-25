/**
 * Centralized mapping from business/technical error CODES to user-facing copy.
 *
 * Business logic and UI text key off `code`, never the English `message` from
 * the server. This is the single place that decides how a code is presented, so
 * screens don't duplicate error parsing.
 */
import { ApiError, ApiErrorCode } from '@/types/api';

export interface UiError {
  title: string;
  message: string;
}

const MAP: Record<string, UiError> = {
  [ApiErrorCode.NETWORK_ERROR]: {
    title: 'No connection',
    message: 'We couldn’t reach the server. Check your internet and try again.',
  },
  [ApiErrorCode.TIMEOUT]: {
    title: 'Request timed out',
    message: 'The server took too long to respond. Please try again.',
  },
  [ApiErrorCode.UNAUTHORIZED]: {
    title: 'Session expired',
    message: 'Please sign in again to continue.',
  },
  [ApiErrorCode.FORBIDDEN]: {
    title: 'Not allowed',
    message: 'You don’t have access to this.',
  },
  [ApiErrorCode.NOT_FOUND]: {
    title: 'Not found',
    message: 'We couldn’t find what you were looking for.',
  },
  [ApiErrorCode.VALIDATION_ERROR]: {
    title: 'Check your input',
    message: 'Some details look incorrect. Please review and try again.',
  },
  [ApiErrorCode.OTP_INVALID]: {
    title: 'Incorrect code',
    message: 'The code you entered is incorrect. Please try again.',
  },
  [ApiErrorCode.OTP_EXPIRED]: {
    title: 'Code expired',
    message: 'That code has expired. Request a new one.',
  },
  [ApiErrorCode.INVALID_CREDENTIALS]: {
    title: 'Sign in failed',
    message: 'Incorrect email or password. Please try again.',
  },
  [ApiErrorCode.TEACHER_NOT_ACTIVE]: {
    title: 'Account inactive',
    message: 'Your account isn’t active. Contact your school admin.',
  },
};

const FALLBACK: UiError = {
  title: 'Something went wrong',
  message: 'Please try again in a moment.',
};

/** Resolve a normalized ApiError (or unknown error) into UI copy. */
export function toUiError(error: unknown): UiError {
  if (error instanceof ApiError) {
    return MAP[error.code] ?? { title: FALLBACK.title, message: error.message || FALLBACK.message };
  }
  return FALLBACK;
}
