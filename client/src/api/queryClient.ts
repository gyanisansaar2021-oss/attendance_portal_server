/**
 * Shared TanStack Query client. Sensible defaults for a mobile app:
 * retry network/5xx a couple of times, but never retry auth/validation errors.
 */
import { QueryClient } from '@tanstack/react-query';

import { ApiError, ApiErrorCode } from '@/types/api';

/** Errors that should never be retried — retrying won't change the outcome. */
const NON_RETRYABLE = new Set<string>([
  ApiErrorCode.UNAUTHORIZED,
  ApiErrorCode.FORBIDDEN,
  ApiErrorCode.NOT_FOUND,
  ApiErrorCode.VALIDATION_ERROR,
  ApiErrorCode.OTP_INVALID,
  ApiErrorCode.OTP_EXPIRED,
  ApiErrorCode.INVALID_CREDENTIALS,
]);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && NON_RETRYABLE.has(error.code)) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
