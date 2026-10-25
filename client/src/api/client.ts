/**
 * Central HTTP client. THE single place the app talks to the network.
 *
 * Components must never call fetch() directly. They go:
 *   component -> hook -> api/<feature> -> apiClient -> backend/mock API
 *
 * Responsibilities:
 *  - Prefix every path with the env-driven base URL (config.apiBaseUrl).
 *  - Attach the access token when available.
 *  - Parse the standard { success, message, code, data } envelope.
 *  - Normalize every failure into a single ApiError (never leak raw fetch errors).
 *  - Transparently refresh the access token once on a 401, then retry.
 *
 * Swapping mock Express -> Java Spring Boot needs no change here: only the
 * EXPO_PUBLIC_API_BASE_URL env var changes.
 */
import { config } from '@/constants/config';
import { ApiError, ApiErrorCode, type ApiEnvelope } from '@/types/api';
import type { AuthTokens } from '@/types/auth';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions {
  /** Request body; serialized as JSON. */
  body?: unknown;
  /** Extra headers merged over the defaults. */
  headers?: Record<string, string>;
  /** Skip attaching the Authorization header (e.g. for login/OTP). */
  auth?: boolean;
  /** Abort signal for cancellation (TanStack Query passes one). */
  signal?: AbortSignal;
}

/**
 * Hooks the client needs from the auth layer. Injected (rather than imported
 * directly from the store) to avoid a circular dependency: store -> api -> store.
 */
export interface AuthBridge {
  getTokens: () => AuthTokens | null;
  /** Persist refreshed tokens. */
  onTokensRefreshed: (tokens: AuthTokens) => void | Promise<void>;
  /** Called when refresh fails and the session must end. */
  onAuthExpired: () => void | Promise<void>;
}

let authBridge: AuthBridge | null = null;

/** Wire the client to the auth store. Called once during app bootstrap. */
export function registerAuthBridge(bridge: AuthBridge): void {
  authBridge = bridge;
}

/** Combine the base URL with a path (path should start with '/'). */
function buildUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${config.apiBaseUrl}${normalizedPath}`;
}

/** Map an HTTP status to a sensible fallback error code. */
function statusToCode(status: number): string {
  switch (status) {
    case 401:
      return ApiErrorCode.UNAUTHORIZED;
    case 403:
      return ApiErrorCode.FORBIDDEN;
    case 404:
      return ApiErrorCode.NOT_FOUND;
    case 422:
      return ApiErrorCode.VALIDATION_ERROR;
    default:
      return ApiErrorCode.UNKNOWN;
  }
}

async function parseEnvelope<T>(response: Response): Promise<ApiEnvelope<T>> {
  const text = await response.text();
  if (!text) {
    // Empty body — synthesize an envelope from the status.
    return response.ok
      ? { success: true, message: '', code: 'OK', data: null as T }
      : {
          success: false,
          message: response.statusText || 'Request failed',
          code: statusToCode(response.status),
          data: null,
        };
  }
  try {
    return JSON.parse(text) as ApiEnvelope<T>;
  } catch {
    throw new ApiError({
      code: ApiErrorCode.UNKNOWN,
      message: 'Received a malformed response from the server.',
      status: response.status,
    });
  }
}

interface RawResult<T> {
  status: number;
  envelope: ApiEnvelope<T>;
}

/** Perform one fetch with timeout and envelope parsing (no refresh logic). */
async function rawRequest<T>(
  method: HttpMethod,
  path: string,
  options: RequestOptions,
): Promise<RawResult<T>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.requestTimeoutMs);

  // Chain an external abort signal (e.g. from TanStack Query) to ours.
  if (options.signal) {
    if (options.signal.aborted) controller.abort();
    else options.signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...options.headers,
  };
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (options.auth !== false) {
    const token = authBridge?.getTokens()?.accessToken;
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(buildUrl(path), {
      method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
    const envelope = await parseEnvelope<T>(response);
    return { status: response.status, envelope };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const aborted = error instanceof Error && error.name === 'AbortError';
    throw new ApiError({
      code: aborted ? ApiErrorCode.TIMEOUT : ApiErrorCode.NETWORK_ERROR,
      message: aborted
        ? 'The request timed out. Check your connection and try again.'
        : 'Unable to reach the server. Check your connection and try again.',
      status: 0,
      isNetworkError: true,
    });
  } finally {
    clearTimeout(timeout);
  }
}

// --- Single-flight refresh: concurrent 401s share one refresh call. ---
let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  if (!authBridge) return false;
  const tokens = authBridge.getTokens();
  if (!tokens?.refreshToken) return false;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const { envelope } = await rawRequest<AuthTokens>('POST', '/auth/refresh', {
          body: { refreshToken: tokens.refreshToken },
          auth: false,
        });
        if (envelope.success && envelope.data) {
          await authBridge!.onTokensRefreshed(envelope.data);
          return true;
        }
        return false;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

/** Turn a parsed result into typed data or throw a normalized ApiError. */
function unwrap<T>(result: RawResult<T>): T {
  const { envelope, status } = result;
  if (envelope.success) {
    return envelope.data;
  }
  throw new ApiError({
    code: envelope.code || statusToCode(status),
    message: envelope.message || 'Request failed',
    status,
  });
}

async function request<T>(
  method: HttpMethod,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const result = await rawRequest<T>(method, path, options);

  // Attempt a one-time transparent refresh on auth failure.
  const authFailed =
    result.status === 401 ||
    (!result.envelope.success && result.envelope.code === ApiErrorCode.UNAUTHORIZED);

  if (authFailed && options.auth !== false) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      return unwrap<T>(await rawRequest<T>(method, path, options));
    }
    await authBridge?.onAuthExpired();
  }

  return unwrap<T>(result);
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, { ...options, body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PUT', path, { ...options, body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, { ...options, body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>('DELETE', path, options),
};
