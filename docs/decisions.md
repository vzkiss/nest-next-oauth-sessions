# Architecture decisions

How it runs (flows, files, edges): [`auth-architecture.md`](auth-architecture.md). Quick comparisons: [`tradeoffs.md`](tradeoffs.md).

## 1. API owns sessions and identity

**Decision**

- Sessions are created, stored, and validated on the NestJS API.
- Next.js only consumes session state (RSC forwards `Cookie` to Nest; the browser uses `credentials: 'include'`).

**Why**

- Avoids trust leakage into the UI layer for “who is logged in.”
- Multiple clients (e.g. web, mobile) can share one auth system.
- Invalidation and expiry live in one place.
- OAuth and post-login redirect validation stay on the server.

**Alternative considered**

- Handling auth fully inside Next.js.

**Why not**

- Couples identity to a single frontend.
- Harder to reuse or scale the same auth across services or apps.
- Higher risk of validation logic drifting between layers.

See: [Split stack](auth-architecture.md#split-stack), [Cookie (connect.sid)](auth-architecture.md#cookie-connectsid).

---

## 2. Root proxy (`proxy.ts`) is UX, not security

**Decision**

- Next’s root **`proxy.ts`** only checks for **cookie presence** on the incoming web request.
- Real session validation happens on the API (`SessionGuard`, session store).

**Why**

- This layer cannot see the API’s session store or row lifecycle.
- Avoids false confidence when the cookie exists but the session is expired or revoked.
- Avoids duplicating auth rules in two runtimes.

**Implication**

- The UI may render briefly; **`401`** from Nest plus RSC / client handling is the authoritative outcome.

See: [Next.js `proxy.ts`](auth-architecture.md#nextjs-proxyts).

---

## 3. Server-side sessions over JWT (for this browser story)

**Decision**

- User-facing auth uses **server-side sessions** (`express-session` + **connect-pg-simple** / Postgres).

**Why**

- Immediate invalidation (logout and revoke behave predictably).
- HttpOnly cookie to the API origin; sidesteps typical bearer-token-in-JS handling for this sample ([`tradeoffs.md`](tradeoffs.md)).
- Simpler mental model for this sample than access/refresh flows.

**Tradeoff**

- Requires a **shared session store** (stateful).

---

## 4. Clear trust boundary

**Decision**

- The API is the only trusted authority for **identity** and **auth state** for JSON/data access.

**Why**

- Clean separation between UI and backend.
- Room to grow toward more distributed setups without redefining “who is the source of truth.”
- Smaller security surface on the frontend (fewer places that must get auth exactly right).

See: [What each service owns](auth-architecture.md#what-each-service-owns).

---

## 5. RSC and protected routes delegate session truth to the API

**Decision**

- Protected App Router segments call **`requireAuth()`** (layout and/or pages).
- That path calls **`GET /user/profile`** on Nest with request cookies forwarded; React **`cache()`** in [`lib/auth.ts`](../apps/web/lib/auth.ts) dedupes one profile fetch per request.
- Client calls use [`apiFetch` / `apiRequest`](../apps/web/lib/api.ts) with `credentials: 'include'`.
- **`SessionGuard`** on Nest returns **401** when the session is not valid.

**Why**

- Next does not validate session secrets or DB rows on its own—same boundary as (1) and (4).

**Alternative considered**

- `getSession()`-style helpers that resolve the user entirely inside Next (local session or JWT).

**Why not**

- Duplicates validation or drifts from the API’s view of “logged in.”

See: [Back to Web (Next.js)](auth-architecture.md#back-to-web-nextjs), [Protected layout and cache()](auth-architecture.md#protected-layout-and-cache), [Contrast with Next-native auth guides](auth-architecture.md#contrast-with-next-native-auth-guides).
