/**
 * Auth & user domain types. Mirrors the auth contract documented in
 * client/README.md.
 */

export type UserRole = 'TEACHER' | 'PRINCIPAL';

/** The authenticated user as returned by GET /auth/me. */
export interface AuthUser {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  /** School the user belongs to. */
  schoolId: string;
  isActive: boolean;
}

/** Token pair issued on login / refresh. */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  /** Unix epoch (ms) when the access token expires, if provided by the server. */
  accessTokenExpiresAt?: number;
}

/** Response payload for a successful login / OTP verification. */
export interface AuthSession {
  user: AuthUser;
  tokens: AuthTokens;
}

// ---- Request payloads ----

export interface TeacherSendOtpRequest {
  phone: string;
}

export interface TeacherVerifyOtpRequest {
  phone: string;
  otp: string;
}

export interface PrincipalLoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
