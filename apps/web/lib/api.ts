import { config } from '@/config/application';

/** API base URL with no trailing slash (from `NEXT_PUBLIC_API_URL`). */
export function apiUrl(path: string): string {
  const base = config.apiUrl.replace(/\/$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}

/**
 * Low-level `fetch` to the Nest API with session cookies. No status handling.
 * Use for flows where 401 should not trigger global handling (e.g. logout).
 */
export function apiRequest(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  return fetch(apiUrl(path), {
    ...init,
    credentials: 'include',
  });
}

let onSessionInvalid: (() => void) | undefined;

/**
 * Register once (e.g. from `AuthProvider`) to clear client auth, redirect, and
 * toast when any `apiFetch` sees 401/403. Pass `undefined` on cleanup.
 */
export function configureApiSessionInvalidHandler(
  handler: (() => void) | undefined
) {
  onSessionInvalid = handler;
}

/** Thrown when the API responds with 401 or 403 (after `onSessionInvalid` runs). */
export class ApiUnauthorizedError extends Error {
  override name = 'ApiUnauthorizedError';
}

/** Thrown for other non-OK responses from `apiFetch`. */
export class ApiHttpError extends Error {
  constructor(
    readonly status: number,
    message?: string
  ) {
    super(message ?? `HTTP ${status}`);
    this.name = 'ApiHttpError';
  }
}

/**
 * Like `apiRequest`, but treats 401/403 as a dead session (runs registered
 * handler, then throws `ApiUnauthorizedError`). Other errors throw `ApiHttpError`.
 * Returns the `Response` only when `response.ok`.
 */
export async function apiFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const res = await apiRequest(path, init);

  if (res.status === 401 || res.status === 403) {
    onSessionInvalid?.();
    throw new ApiUnauthorizedError('Session expired or not authorized');
  }

  if (!res.ok) {
    throw new ApiHttpError(res.status, res.statusText);
  }

  return res;
}
