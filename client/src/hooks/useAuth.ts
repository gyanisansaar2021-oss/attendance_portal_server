/**
 * Auth hooks for screens.
 *
 * `useAuth` exposes the current identity/status from the store.
 * The mutation hooks wrap the auth API with TanStack Query and persist the
 * resulting session into the store on success.
 */
import { useMutation } from '@tanstack/react-query';

import { authApi, type SendOtpResult } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import type {
  AuthSession,
  PrincipalLoginRequest,
  TeacherSendOtpRequest,
  TeacherVerifyOtpRequest,
} from '@/types/auth';

/** Read-only view of the current auth state. */
export function useAuth() {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  return {
    status,
    user,
    isAuthenticated: status === 'authenticated',
    isBootstrapping: status === 'idle' || status === 'loading',
  };
}

/** Send an OTP to a teacher's phone. */
export function useSendTeacherOtp() {
  return useMutation<SendOtpResult, Error, TeacherSendOtpRequest>({
    mutationFn: (payload) => authApi.teacherSendOtp(payload),
  });
}

/** Verify a teacher OTP and establish a session. */
export function useVerifyTeacherOtp() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation<AuthSession, Error, TeacherVerifyOtpRequest>({
    mutationFn: (payload) => authApi.teacherVerifyOtp(payload),
    onSuccess: (session) => setSession(session),
  });
}

/** Principal email/password login. */
export function usePrincipalLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation<AuthSession, Error, PrincipalLoginRequest>({
    mutationFn: (payload) => authApi.principalLogin(payload),
    onSuccess: (session) => setSession(session),
  });
}

/** Log out the current user. */
export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  return useMutation<void, Error, void>({
    mutationFn: () => logout(),
  });
}
