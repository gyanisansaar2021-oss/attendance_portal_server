/**
 * Dev-only token helpers. NOT secure — do not treat as production auth.
 *
 * A token is just base64url("<type>:<userId>:<issuedAt>"). The Spring Boot
 * backend will replace these with real signed JWTs; the client only cares that
 * it receives an accessToken + refreshToken pair and sends the access token as
 * `Authorization: Bearer <token>`.
 */
import { findById, type MockUser } from './data.js';

const ACCESS_TTL_MS = 60 * 60 * 1000; // 1 hour

function encode(type: 'access' | 'refresh', userId: string): string {
  return Buffer.from(`${type}:${userId}:${Date.now()}`).toString('base64url');
}

function decode(token: string): { type: string; userId: string; issuedAt: number } | null {
  try {
    const [type, userId, issuedAt] = Buffer.from(token, 'base64url')
      .toString('utf8')
      .split(':');
    if (!type || !userId || !issuedAt) return null;
    return { type, userId, issuedAt: Number(issuedAt) };
  } catch {
    return null;
  }
}

export function issueTokens(userId: string) {
  return {
    accessToken: encode('access', userId),
    refreshToken: encode('refresh', userId),
    accessTokenExpiresAt: Date.now() + ACCESS_TTL_MS,
  };
}

/** Resolve the user from a Bearer access token, or null if invalid. */
export function userFromAccessToken(token: string | undefined): MockUser | null {
  if (!token) return null;
  const decoded = decode(token);
  if (!decoded || decoded.type !== 'access') return null;
  return findById(decoded.userId) ?? null;
}

/** Resolve the user from a refresh token, or null if invalid. */
export function userFromRefreshToken(token: string | undefined): MockUser | null {
  if (!token) return null;
  const decoded = decode(token);
  if (!decoded || decoded.type !== 'refresh') return null;
  return findById(decoded.userId) ?? null;
}
