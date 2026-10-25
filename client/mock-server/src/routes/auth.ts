/**
 * Auth routes. Mirrors the auth contract in client/README.md.
 *
 *   POST /auth/teacher/send-otp
 *   POST /auth/teacher/verify-otp
 *   POST /auth/principal/login
 *   POST /auth/refresh
 *   POST /auth/logout
 *   GET  /auth/me
 */
import { Router } from 'express';

import {
  FIXED_DEV_OTP,
  OTP_TTL_SECONDS,
  findPrincipalByEmail,
  findTeacherByPhone,
  toAuthUser,
} from '../data.js';
import { fail, ok } from '../http.js';
import { requireAuth, type AuthedRequest } from '../middleware.js';
import { issueTokens, userFromRefreshToken } from '../tokens.js';

export const authRouter = Router();

// Step 1 — teacher requests an OTP for their phone.
authRouter.post('/teacher/send-otp', (req, res) => {
  const phone = String(req.body?.phone ?? '').trim();
  if (!phone) {
    return fail(res, 422, 'VALIDATION_ERROR', 'Phone number is required.');
  }
  const teacher = findTeacherByPhone(phone);
  if (!teacher) {
    // Do not reveal whether a number exists in a real backend; for dev we 404.
    return fail(res, 404, 'NOT_FOUND', 'No teacher found for this phone number.');
  }
  if (!teacher.isActive) {
    return fail(res, 403, 'TEACHER_NOT_ACTIVE', 'This teacher account is not active.');
  }
  // Dev convenience: echo the fixed OTP so there's no real SMS. The Spring Boot
  // backend will NOT return the OTP.
  return ok(
    res,
    { expiresInSeconds: OTP_TTL_SECONDS, devOtp: FIXED_DEV_OTP },
    'OTP_SENT',
    'OTP sent successfully.',
  );
});

// Step 2 — teacher verifies the OTP and receives a session.
authRouter.post('/teacher/verify-otp', (req, res) => {
  const phone = String(req.body?.phone ?? '').trim();
  const otp = String(req.body?.otp ?? '').trim();
  if (!phone || !otp) {
    return fail(res, 422, 'VALIDATION_ERROR', 'Phone and OTP are required.');
  }
  const teacher = findTeacherByPhone(phone);
  if (!teacher) {
    return fail(res, 404, 'NOT_FOUND', 'No teacher found for this phone number.');
  }
  if (otp !== FIXED_DEV_OTP) {
    return fail(res, 401, 'OTP_INVALID', 'The code you entered is incorrect.');
  }
  const tokens = issueTokens(teacher.id);
  return ok(res, { user: toAuthUser(teacher), tokens }, 'LOGIN_OK', 'Signed in successfully.');
});

// Principal email/password login.
authRouter.post('/principal/login', (req, res) => {
  const email = String(req.body?.email ?? '').trim();
  const password = String(req.body?.password ?? '');
  if (!email || !password) {
    return fail(res, 422, 'VALIDATION_ERROR', 'Email and password are required.');
  }
  const principal = findPrincipalByEmail(email);
  if (!principal || principal.password !== password) {
    return fail(res, 401, 'INVALID_CREDENTIALS', 'Incorrect email or password.');
  }
  const tokens = issueTokens(principal.id);
  return ok(res, { user: toAuthUser(principal), tokens }, 'LOGIN_OK', 'Signed in successfully.');
});

// Refresh — exchange a refresh token for a new token pair.
authRouter.post('/refresh', (req, res) => {
  const refreshToken = String(req.body?.refreshToken ?? '');
  const user = userFromRefreshToken(refreshToken);
  if (!user) {
    return fail(res, 401, 'TOKEN_INVALID', 'Your session has expired. Please sign in again.');
  }
  const tokens = issueTokens(user.id);
  return ok(res, tokens, 'TOKEN_REFRESHED', 'Session refreshed.');
});

// Current user.
authRouter.get('/me', requireAuth, (req: AuthedRequest, res) => {
  return ok(res, toAuthUser(req.user!), 'OK', 'Current user.');
});

// Logout — stateless in the mock; the client clears its tokens.
authRouter.post('/logout', requireAuth, (_req, res) => {
  return ok(res, null, 'LOGOUT_OK', 'Signed out.');
});
