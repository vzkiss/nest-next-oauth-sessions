/**
 * Post-login redirect contract (OAuth `state` / `?redirect=` query).
 *
 * - After Google OAuth, Nest redirects to `{clientOrigin}{path}` where `path` is
 *   validated with {@link sanitizePostLoginRedirect}.
 * - Next.js passes the current path when sending users to `/signin` (protected or
 *   voluntary sign-in); the same sanitization applies before it is sent to the API.
 *
 * Security: rejects open redirects — only same-app absolute paths on this origin.
 */

/** Default when `redirect` is missing or invalid (must exist in the Next app). */
export const DEFAULT_POST_LOGIN_PATH = '/profile';

/** Query param name for “return here after sign-in” (Next → Nest). */
export const POST_LOGIN_REDIRECT_QUERY_KEY = 'redirect' as const;

/** Max path length (OAuth state and URLs stay bounded). */
export const MAX_POST_LOGIN_PATH_LENGTH = 512;

const CONTROL_CHARS = /[\u0000-\u001F\u007F]/;

/**
 * Returns a safe in-app path for post-login navigation, or {@link DEFAULT_POST_LOGIN_PATH}.
 * Accepts any new route under the web app without an allowlist, as long as it is a
 * normal same-origin path segment.
 */
export function sanitizePostLoginRedirect(
  raw: string | undefined | null
): string {
  if (raw == null) {
    return DEFAULT_POST_LOGIN_PATH;
  }

  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return DEFAULT_POST_LOGIN_PATH;
  }

  if (trimmed.length > MAX_POST_LOGIN_PATH_LENGTH) {
    return DEFAULT_POST_LOGIN_PATH;
  }

  if (CONTROL_CHARS.test(trimmed)) {
    return DEFAULT_POST_LOGIN_PATH;
  }

  // Single leading slash, same-origin path only (not //evil.com, not \/).
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return DEFAULT_POST_LOGIN_PATH;
  }

  if (trimmed.includes('\\')) {
    return DEFAULT_POST_LOGIN_PATH;
  }

  // Disallow scheme-like or userinfo confusion in the path string.
  if (trimmed.includes('://') || trimmed.includes('@')) {
    return DEFAULT_POST_LOGIN_PATH;
  }

  return trimmed;
}
