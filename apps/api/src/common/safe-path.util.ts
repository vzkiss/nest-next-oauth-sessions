/**
 * Same-origin path validation (open-redirect hardening for OAuth / `?redirect=`).
 *
 * **Where this matters:** The API must call {@link sanitizeRedirect} before
 * building the post-OAuth redirect URL — that is the trust boundary (attackers can
 * bypass any browser). Using it only in Nest (guard + controller) is enough for
 * security.
 *
 * **Client:** Optional. Calling the same helper in Next for `?redirect=` only keeps
 * URLs tidy or avoids sending junk; it does **not** replace server checks and does
 * not change the threat model if you skip it.
 *
 * After Google OAuth, Nest redirects to `{clientOrigin}{path}` where `path` is
 * validated here. Rejects open redirects: same-app path only (`/` …, not `//…`).
 */

/** Default when `redirect` is missing or invalid (must exist in the Next app). */
export const DEFAULT_POST_LOGIN_PATH = '/profile';

/** Query param name for “return here after sign-in” (Next → Nest). */
export const POST_LOGIN_REDIRECT_QUERY_KEY = 'redirect' as const;

/** Max path length (OAuth state and URLs stay bounded). */
export const MAX_POST_LOGIN_PATH_LENGTH = 512;

/**
 * Returns a safe in-app path for post-login navigation, or {@link DEFAULT_POST_LOGIN_PATH}.
 * Accepts any new route under the web app without an allowlist, as long as it is a
 * normal same-origin path segment.
 */
export function sanitizeRedirect(raw: string | undefined | null): string {
  if (!raw) return DEFAULT_POST_LOGIN_PATH;
  const safe = normalizeSafePath(raw);
  return safe ?? DEFAULT_POST_LOGIN_PATH;
}

export function normalizeSafePath(input: string): string | null {
  const path = input.trim();
  return isSafePath(path) ? path : null;
}

const CONTROL_CHARS = /[\u0000-\u001F\u007F]/;

export function isSafePath(path: string): boolean {
  if (!path) return false;

  if (path.length > MAX_POST_LOGIN_PATH_LENGTH) return false;
  if (CONTROL_CHARS.test(path)) return false;

  // Must be same-origin path
  if (!path.startsWith('/') || path.startsWith('//')) return false;

  // Disallow weird path tricks
  if (path.includes('\\')) return false;
  if (path.includes('://')) return false;
  if (path.includes('@')) return false;

  return true;
}
