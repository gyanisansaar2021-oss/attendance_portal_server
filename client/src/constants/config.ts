/**
 * Runtime configuration.
 *
 * The API base URL is driven ENTIRELY by environment configuration so that
 * switching between the mock Express API and the Java Spring Boot API requires
 * NO source-code changes — only an env var.
 *
 *   EXPO_PUBLIC_API_BASE_URL=http://192.168.1.10:4000/api/v1
 *
 * `EXPO_PUBLIC_*` vars are inlined by Expo at build time and are safe to read
 * on the client. See client/.env.example and the README for the full setup,
 * including how to use your machine's LAN IP when testing on a physical phone
 * (localhost on the phone points to the phone itself, not your dev machine).
 */

const DEFAULT_API_BASE_URL = 'http://localhost:4000/api/v1';

function readApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (fromEnv && fromEnv.length > 0) {
    // Strip a trailing slash so endpoint joining is predictable.
    return fromEnv.replace(/\/+$/, '');
  }
  return DEFAULT_API_BASE_URL;
}

export const config = {
  /** Fully-qualified API base, including the /api/v1 prefix. */
  apiBaseUrl: readApiBaseUrl(),
  /** Network request timeout in milliseconds. */
  requestTimeoutMs: 15000,
} as const;
