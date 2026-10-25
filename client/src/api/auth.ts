/**
 * Auth API module. Wraps the auth endpoints with typed request/response shapes.
 * UI never touches these directly — it goes through hooks / the auth store.
 */
import { apiClient } from './client';
import { endpoints } from './endpoints';
import type {
  AuthSession,
  AuthTokens,
  AuthUser,
  PrincipalLoginRequest,
  TeacherSendOtpRequest,
  TeacherVerifyOtpRequest,
} from '@/types/auth';

/** Data returned when an OTP is dispatched. */
export interface SendOtpResult {
  /** Seconds until the OTP expires. */
  expiresInSeconds: number;
  /**
   * Dev-only convenience: the mock server echoes the OTP so you can log in
   * without a real SMS. The Spring Boot backend will NOT return this.
   */
  devOtp?: string;
}

export const authApi = {
  teacherSendOtp(payload: TeacherSendOtpRequest) {
    return apiClient.post<SendOtpResult>(endpoints.auth.teacherSendOtp, payload, {
      auth: false,
    });
  },

  teacherVerifyOtp(payload: TeacherVerifyOtpRequest) {
    return apiClient.post<AuthSession>(endpoints.auth.teacherVerifyOtp, payload, {
      auth: false,
    });
  },

  principalLogin(payload: PrincipalLoginRequest) {
    return apiClient.post<AuthSession>(endpoints.auth.principalLogin, payload, {
      auth: false,
    });
  },

  refresh(refreshToken: string) {
    return apiClient.post<AuthTokens>(
      endpoints.auth.refresh,
      { refreshToken },
      { auth: false },
    );
  },

  me() {
    return apiClient.get<AuthUser>(endpoints.auth.me);
  },

  logout() {
    return apiClient.post<null>(endpoints.auth.logout);
  },
};
