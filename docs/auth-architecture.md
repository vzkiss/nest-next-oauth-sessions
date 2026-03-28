# Auth architecture

Companion to the root [README](../README.md). The **canonical step-by-step flows** live in [README § Auth flows: Web vs API](../README.md#auth-flows-web-nextjs-vs-api-nestjs).

## Split stack

- **Next.js (`apps/web`)** — UI only for session-backed flows. It does **not** issue the login session cookie (`connect.sid` is set by the Nest API).
- **Nest (`apps/api`)** — Google OAuth, `express-session`, and **connect-pg-simple** (session rows in Postgres). **Authorization** for data is enforced here (`SessionGuard` → `401` when unauthenticated).

## Cookie: `connect.sid`

- Default cookie name from **`express-session`** (see [`main.ts`](../apps/api/src/main.ts)).
- **connect-pg-simple** only provides the **store** (Postgres); it does not define the cookie. The cookie is set on responses from the **API origin** after login (e.g. [`auth.controller.ts`](../apps/api/src/auth/auth.controller.ts) sets `req.session.userId` and the session middleware persists it).

## Browser ↔ two origins

Locally, UI is often `http://localhost:4000` and API `http://localhost:3000`. The web app uses `fetch(..., { credentials: 'include' })` (centralized in [`apps/web/lib/api.ts`](../apps/web/lib/api.ts)) so the browser attaches the session cookie to **API** requests.

**Server Components:** [`lib/auth.ts`](../apps/web/lib/auth.ts) forwards `cookies()` from `next/headers` to **`GET /user/profile`** on the API (cached per request). **`requireAuth()`** redirects to **`/signin`** when invalid and returns **`User`** when valid, so **`app/(protected)/layout.tsx`** and nested pages **dedupe** the profile fetch. Protected UI still hydrates with **`AuthProvider`** client state for interactive flows.

## Next.js `proxy.ts`

[`apps/web/proxy.ts`](../apps/web/proxy.ts) is the Next 16 root **proxy** (edge-style gate before the App Router). It is **always part of this app** for matched routes (e.g. `/profile`). Any check based only on **`connect.sid` on the Next request** is **optimistic**: it cannot see whether the session row still exists in Postgres. Treat **Nest `401`** as the real signal for expired or revoked sessions.

**Document request vs client transition:** A plain HTTP `GET /profile` is redirected when the session cookie is missing on the Next request (e.g. `curl -I`). A **`router.push('/profile')`** from the home page is a **client transition**: Next can **paint the `/profile` shell briefly** before RSC runs `requireAuth()` and redirects—so you may see a flash. The home page currently uses **`router.push`** ([`app/page.tsx`](../apps/web/app/page.tsx)); **`window.location.assign(routes.profile)`** forces a full navigation so the proxy runs like a document request (optional UX hardening).

## Client reconciliation

[`apps/web/lib/api.ts`](../apps/web/lib/api.ts): **`apiRequest`** is transport-only (used for logout so 401 does not loop). **`apiFetch`** wraps it: on **401/403** it runs a handler registered via **`configureApiSessionInvalidHandler`** from **`AuthProvider`** (clear user, redirect to sign-in; **toast only if `user` was already set**, so guests who never signed in are not told their “session expired”). Then throws **`ApiUnauthorizedError`**. **`logout`** stays on **`apiRequest`**.

## Contrast with “Next-native” auth guides

Patterns like `getSession({ headers })` on the **Next** server assume the session (or JWT) is visible to Next. Here the session lives in the **Nest** API; the Next server **re-validates** by calling the API with forwarded cookies (`requireAuth` / cached lookup in `lib/auth.ts`), analogous to a guard, without duplicating session storage on Next.

## Protected layout + `cache()`

- `app/(protected)/layout.tsx` runs **`await requireAuth()`** (for the redirect side effect; return value unused) so the whole segment is gated.
- Nested pages (e.g. profile) run **`const user = await requireAuth()`** for props. React **`cache()`** on the session helper in **`lib/auth.ts`** ensures **one** `fetch` per request.

## Failure / edge behavior (short)

- **Expired or removed session row:** API returns **401**; **`apiFetch`** runs the session-invalid handler; RSC **`requireAuth`** redirects to **`/signin`** when profile fetch fails.
- **Tampered or unsafe redirect:** [`sanitizeRedirect`](../apps/api/src/common/safe-path.util.ts) on Nest falls back to a safe default (`/profile`).
- **User cancels Google:** **`error=access_denied`** → redirect to **`/signin?oauth=cancelled`** ([`oauth-callback-error.middleware.ts`](../apps/api/src/auth/middleware/oauth-callback-error.middleware.ts)).
