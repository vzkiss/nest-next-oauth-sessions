# Auth architecture (draft)

This doc complements the root [README](../README.md). Refine as the app evolves.

## Split stack

- **Next.js (`apps/web`)** — UI only for session-backed flows. It does **not** issue the login session cookie.
- **Nest (`apps/api`)** — Google OAuth, `express-session`, and **connect-pg-simple** (session rows in Postgres). **Authorization** for data is enforced here (`SessionGuard` → `401` when unauthenticated).

## Cookie: `connect.sid`

- Default cookie name from **`express-session`** (see [`main.ts`](../apps/api/src/main.ts)).
- **connect-pg-simple** only provides the **store** (Postgres); it does not define the cookie. The cookie is set on responses from the **API origin** after login (e.g. [`auth.controller.ts`](../apps/api/src/auth/auth.controller.ts) sets `req.session.userId` and the session middleware persists it).

## Browser ↔ two origins

Locally, UI is often `http://localhost:4000` and API `http://localhost:3000`. The session cookie is scoped to the **API** host/port. The web app uses `fetch(..., { credentials: 'include' })` (centralized in [`apps/web/lib/api.ts`](../apps/web/lib/api.ts)) so the browser attaches that cookie to API requests.

**Server Components:** [`lib/auth.ts`](../apps/web/lib/auth.ts) forwards `cookies()` from `next/headers` to **`GET /user/profile`** on the API (cached per request). **`requireAuth()`** redirects to **`/signin`** when invalid and returns **`User`** when valid, so **`app/(protected)/layout.tsx`** and nested pages **dedupe** the profile fetch. Protected UI still hydrates with **`AuthProvider`** client state for interactive flows.

## Next `proxy.ts` (if enabled)

Any check based only on cookies on the **Next** request is **optimistic**. It cannot see whether the session row still exists in Postgres. Treat **Nest `401`** as the real signal for expired/revoked sessions.

**Document request vs client transition:** A plain HTTP `GET /profile` is redirected at the edge when `connect.sid` is missing (verified with `curl -I`). A **`router.push('/profile')`** is a **client transition** that can still **paint the static `/profile` shell** briefly before the RSC request completes, which looks like “the profile page loaded anyway.” For the home → profile entry point we use **`window.location.assign('/profile')`** so the browser performs a **full navigation** and the proxy runs like `curl`. OAuth callback may keep **`router.replace('/profile')`** after the session is established.

## Client reconciliation

[`apps/web/lib/api.ts`](../apps/web/lib/api.ts): **`apiRequest`** is transport-only (used for logout so 401 does not loop). **`apiFetch`** wraps it: on **401/403** it runs a handler registered via **`configureApiSessionInvalidHandler`** from **`AuthProvider`** (clear user, redirect to sign-in; **toast only if `user` was already set**, so guests who never signed in are not told their “session expired”). Then throws **`ApiUnauthorizedError`**. **`logout`** stays on **`apiRequest`**.

## Contrast with “Next-native” auth guides

Patterns like `getSession({ headers })` on the **Next** server assume the session (or JWT) is visible to Next. Here the session lives in the **Nest** API; the Next server **re-validates** by calling the API with forwarded cookies (`requireAuth` / cached lookup in `lib/auth.ts`), analogous to a guard, without duplicating session storage on Next.

## Protected layout + `cache()`

- `app/(protected)/layout.tsx` runs **`await requireAuth()`** (for the redirect side effect; return value unused) so the whole segment is gated.
- Nested pages (e.g. profile) run **`const user = await requireAuth()`** for props. React **`cache()`** on the session helper in **`lib/auth.ts`** ensures **one** `fetch` per request.
