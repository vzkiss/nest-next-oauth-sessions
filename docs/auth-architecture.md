# Auth architecture

Companion to the root [README](../README.md). This file has the **full step-by-step flows**; the README keeps a short overview and the mermaid diagram.

## Step-by-step flows (Web vs API)

Paths match this repo (`/signin`, `GET /auth/login/google`, `GET /auth/validate/google`). Replace origins with your deploy URLs (`CLIENT_ORIGIN`, `NEXT_PUBLIC_API_URL` / `API_ORIGIN`).

### Web (Next.js)

```text
User → GET /profile
  ↓
proxy.ts (Next 16 root proxy; matcher: /profile/:path*)
  - checks for connect.sid on this request (optimistic; session row may be gone)
  - no cookie → redirect → /signin?redirect=/profile (redirect preserves pathname + search)
  ↓
/signin
  ↓
User clicks “Continue with Google”
  ↓
browser navigates to API (leaves Next):
  GET {API}/auth/login/google?redirect=...   (optional; from ?redirect= on /signin)
  ↓
… → NestJS + Google (see below)
```

### API (NestJS + Google OAuth)

```text
GET /auth/login/google?redirect=/profile
  ↓
sanitizeRedirect(raw) → safe same-origin path; stored on session as postLoginRedirect
  Passport (state: true) adds OAuth state nonce (CSRF); not the same field as postLoginRedirect
  ↓
302 → Google consent screen
```

### Google → API callback

```text
Google → GET /auth/validate/google?…   (must match GOOGLE_CALLBACK_URL + Google Console)
  ↓
NestJS:
  - validate OAuth state / complete Google strategy
  - create or load user; session.userId = user.id
  - express-session sets HttpOnly connect.sid (API origin); connect-pg-simple persists session row
  - read postLoginRedirect from session; sanitizeRedirect again; clear postLoginRedirect
  ↓
302 → {CLIENT_ORIGIN}/profile   (or other sanitized path)
```

### Back to Web (Next.js)

```text
User lands on /profile (Next)
  ↓
app/(protected)/layout.tsx + page (RSC)
  ↓
requireAuth()
  ↓
cached auth() → GET /user/profile on API (cookies forwarded from RSC)
  ↓
200 + User → render protected UI
```

Client-side calls use [`apiFetch`](../apps/web/lib/api.ts) (`credentials: 'include'`); **`SessionGuard`** on the API is the source of truth for **401** if the session is invalid.

### What each service owns

| | Next.js (`apps/web`) | NestJS (`apps/api`) |
|---|----------------------|----------------------|
| **Role** | UX, optimistic route gate (`proxy.ts`), sign-in page, RSC guard (`requireAuth`), UI | OAuth with Google, session cookie + DB store, **`sanitizeRedirect`**, post-login redirect |
| **Critical guarantee** | User should not get a stable protected UI without the API accepting the session (RSC + client **401** handling) | **Redirect targets are safe** (no open redirect); identity and session creation |

**One-line summary:** the **web** layer handles UX and gating; the **API** handles identity, session security, and validated redirects.

If Google returns **`error=access_denied`**, middleware redirects to **`/signin?oauth=cancelled`** (see [`oauth-callback-error.middleware.ts`](../apps/api/src/auth/middleware/oauth-callback-error.middleware.ts)).

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
