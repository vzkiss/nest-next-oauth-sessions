# Full-stack OAuth session demo

Full-stack Google OAuth with NestJS and Next.js, using **server-side sessions** stored in PostgreSQL.

Scope: clear, review-friendly example — not a full production platform. Configuration is explicit and validated at API startup; see **Production / deploy** below for what you’d still do on a real host.

## Tech Stack

- **Frontend**: Next.js (App Router), TypeScript, shadcn/ui-style components
- **Backend**: NestJS, TypeScript
- **Database**: PostgreSQL (TypeORM + Docker for local DB)
- **Auth**: Google OAuth 2.0, `express-session` + `connect-pg-simple`
- **Monorepo**: Turborepo, pnpm

## Prerequisites

- Node.js ≥ 20
- pnpm
- Docker (for local Postgres)

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Session secret

```bash
openssl rand -base64 32
```

### 3. Environment variables

Copy `.env.example` to **`.env.local` at the repository root**. Both the API and the Next app load that file (Nest: `apps/api/src/app.module.ts`; web: `loadEnvConfig` in `apps/web/next.config.js`). You can still set the same keys in your host’s env UI for deploys.

Do not commit `.env`, `.env.local`, or real secrets; `.env.example` is the template only.

| Variable | Role |
| -------- | ---- |
| `DATABASE_URL` | Postgres connection string |
| `SESSION_SECRET` | Signs session cookies |
| `API_ORIGIN` | Public base URL of the **API** (no trailing slash); use for deploy docs / parity with `NEXT_PUBLIC_API_URL` |
| `GOOGLE_CALLBACK_URL` | **Full** OAuth redirect URI Passport sends to Google (must match Console **and** the callback route implemented on this API) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth client credentials |
| `CLIENT_ORIGIN` | Public origin of the **Next** app (CORS + redirect after OAuth) |
| `NEXT_PUBLIC_API_URL` | Same API base URL as used in the browser (usually matches `API_ORIGIN`) |
| `NEXT_PUBLIC_APP_URL` | Optional canonical site URL for the Next app |
| `POSTGRES_*` | Docker Compose; align with `DATABASE_URL` |

### 4. Google OAuth

1. In [Google Cloud Console](https://console.cloud.google.com/), create or select a project.
2. Configure the OAuth consent screen (scopes, test users if external).
3. Create **OAuth 2.0 Client ID** (Web application).
4. Add an authorized redirect URI that matches **`GOOGLE_CALLBACK_URL`** exactly (same as the `GET …/auth/validate/google` route on the API, e.g. `http://localhost:3000/auth/validate/google` locally).
5. Copy **Client ID** and **Client Secret** into `.env`.

## Running the app

**Database (Docker):**

```bash
docker compose up --build
```

**API + web:**

```bash
pnpm dev
```

[Turborepo](https://turbo.build/) runs **`@repo/api` `build` once** before starting dev servers (`dependsOn: ["^build"]` in [`turbo.json`](turbo.json)), so `packages/api/dist` exists before Nest and Next boot. You will see **`@repo/api#build`** (one-shot) and **`@repo/api#dev`** (`tsc --watch`) in the task list—that is expected.

- API: http://localhost:3000
- Web: http://localhost:4000

## Project structure

- `apps/api` — NestJS API (auth, user, feedback)
- `apps/web` — Next.js app; App Router groups `app/(public)/…` (e.g. `/signin`) and `app/(protected)/…` (e.g. `/profile`) — segment names in parentheses are **not** part of the URL. **`requireAuth()`** in [`lib/auth.ts`](apps/web/lib/auth.ts) gates protected RSCs (redirects to `/signin` if needed) and returns the **`User`**; it uses a React-cached profile fetch so layout + page in the **same request** share one `GET /user/profile`. Browser calls go through [`apps/web/lib/api.ts`](apps/web/lib/api.ts)
- `docs/` — extra notes (e.g. [`docs/auth-architecture.md`](docs/auth-architecture.md))
- `packages/api` — shared **TypeORM entities** (e.g. `User`, `Feedback`), **DTOs** for request bodies (class-validator / Nest `mapped-types`), and the public **`@repo/api`** package consumed by the API and typed imports in the web app
- `packages/typescript-config` — shared TS config (`extends` for apps)
- `packages/eslint-config` — shared ESLint config

## API routes

**Auth (public)**

- `GET /auth/login/google` — start OAuth
- `GET /auth/validate/google` — OAuth callback
- `GET /auth/logout` — destroy session; clears `connect.sid`

**User (session required)**

- `GET /user/profile` — current user
- `PUT /user/profile` — update profile

**Feedback (session required)**

- `POST /feedback` — body `{ "message": string }`; returns `202` with `{ id, status: "received" }`; message stored in Postgres (demo intake; production might enqueue for email/Slack).

## Features

- Google OAuth and server-side sessions (HttpOnly `connect.sid`, `SameSite=lax`, `secure` in production)
- Sessions persisted in Postgres (survive API restarts)
- Protected Next routes: `(protected)` layout calls **`requireAuth()`**; pages that need the user call it again for **`User`** — session lookup in [`lib/auth.ts`](apps/web/lib/auth.ts) is React-cached per request (one profile fetch)
- Profile read/update with validation
- Feedback submission persisted to the database
- TypeScript, ESLint, Prettier

There is **no** Next.js Route Handler API under `app/api/` — **all** OAuth, sessions, and protected JSON live in the **Nest** app (`apps/api`). Next only calls that API from the browser and from RSC (`fetch` with forwarded cookies).

## Auth flows: Web (Next.js) vs API (NestJS)

Flows below use **this repo’s real paths** (`/signin`, not `/sign-in`; `GET /auth/login/google` and `GET /auth/validate/google`, not generic `/auth/google` names). Replace origins with your deploy URLs (`CLIENT_ORIGIN`, `API_ORIGIN` / `NEXT_PUBLIC_API_URL`).

### Web (Next.js)

```text
User → GET /profile
  ↓
proxy.ts (Next 16 root proxy; `matcher`: `/profile/:path*`)
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

Client-side calls use [`apiFetch`](apps/web/lib/api.ts) (`credentials: 'include'`); **`SessionGuard`** on the API is the source of truth for **401** if the session is invalid.

### What each service owns

| | Next.js (`apps/web`) | NestJS (`apps/api`) |
|---|----------------------|----------------------|
| **Role** | UX, optimistic route gate (`proxy.ts`), sign-in page, RSC guard (`requireAuth`), UI | OAuth with Google, session cookie + DB store, **`sanitizeRedirect`**, post-login redirect |
| **Critical guarantee** | User should not get a stable protected UI without the API accepting the session (RSC + client **401** handling) | **Redirect targets are safe** (no open redirect); identity and session creation |

**One-line summary:** the **web** layer handles UX and gating; the **API** handles identity, session security, and validated redirects.

If Google returns **`error=access_denied`**, middleware redirects to **`/signin?oauth=cancelled`** (see [`oauth-callback-error.middleware.ts`](apps/api/src/auth/middleware/oauth-callback-error.middleware.ts)).

## Security (backend)

Helmet, CORS restricted to `CLIENT_ORIGIN`, global validation pipe, session guard on private routes, [`ClassSerializerInterceptor`](https://docs.nestjs.com/techniques/serialization) + `@Exclude()` on entities to limit exposed fields. **Rate limiting** via [`@nestjs/throttler`](https://github.com/nestjs/throttler): default **60 requests / minute / IP** globally ([`apps/api/src/app.module.ts`](apps/api/src/app.module.ts)); **`/auth/*`** is **stricter (10 / minute)** except **`GET /auth/logout`** ([`apps/api/src/auth/auth.controller.ts`](apps/api/src/auth/auth.controller.ts)). If Google returns **`error=access_denied`** (user cancelled consent), the API **redirects** to **`CLIENT_ORIGIN/signin?oauth=cancelled`** (and preserves **`redirect`** when it was stored in session).

## Sessions vs JWT

Sessions fit a **single API** that owns auth: revocation is immediate on logout, and the browser only holds a session id cookie. JWT as a _session substitute_ adds signing, expiry, and revocation tradeoffs that rarely pay off at this scale; JWTs remain useful for **service-to-service** or third-party API access where no shared session store exists.

**Production extras** you’d typically add: Redis (or similar) for sessions at scale, stricter or distributed rate limits (in-memory throttler resets on restart; use Redis storage for multiple instances), observability, stricter cookie policy review.

**Sessions:** cookie lifetime uses a **fixed `maxAge`** from login (not a rolling/sliding session). That keeps Postgres session writes predictable for this demo; production often uses **rolling** cookies and/or Redis for high traffic.

### Production / deploy

- **TLS**: terminate HTTPS at your reverse proxy or platform; session cookies already use `secure` when `NODE_ENV=production`.
- **OAuth**: register **production** `GOOGLE_CALLBACK_URL` and (if required) JavaScript origins in Google Cloud; keep `CLIENT_ORIGIN`, `API_ORIGIN`, and `NEXT_PUBLIC_API_URL` on real schemes/hosts (`https://…`).
- **Secrets**: generate a strong `SESSION_SECRET`; rotate if leaked.
- **Cross-subdomain cookies (optional):** locally, UI and API often differ by port; in production, if the web app and API use **different hosts** (e.g. `app.example.com` vs `api.example.com`), you typically set session **`cookie.domain`** / **`SameSite`** explicitly so the browser (and Next RSC cookie forwarding) behave as you intend — not wired in this demo.
- **Optional at scale**: Redis-backed sessions, distributed rate limiting, structured logging, health checks — not required to understand or run this repo.

### Web client: TanStack Query (not implemented)

Profile and other API-backed UI state use plain **`fetch`** via [`apps/web/lib/api.ts`](apps/web/lib/api.ts). For a production app, **[TanStack Query](https://tanstack.com/query)** (React Query) is a common next step: deduplicated requests, **`refetchOnWindowFocus`** so a tab that was idle picks up changes after another device or tab updated data, and **invalidation after mutations** (e.g. after `PUT /user/profile`). It is intentionally not wired in here to keep the scope small and dependency-light; a future pass would add a root **`QueryClientProvider`** and migrate profile load/update to **`useQuery` / `useMutation`**.

## Auth, sessions, and cookies (cross-origin)

The **login session is owned by the Nest API**, not by Next.js. After Google OAuth, [`express-session`](https://github.com/expressjs/session) sets an HttpOnly cookie (default name **`connect.sid`**) on the **API origin**. [**connect-pg-simple**](https://github.com/voxpelli/node-connect-pg-simple) stores session rows in Postgres; it does **not** define the cookie—that comes from `express-session` (see [`apps/api/src/main.ts`](apps/api/src/main.ts)).

The web app calls the API with **`credentials: 'include'`** (via [`apps/web/lib/api.ts`](apps/web/lib/api.ts): **`apiRequest`** / **`apiFetch`**) so the browser sends that cookie on `localhost:3000` (or your deployed API URL). **`apiFetch`** centralizes **401/403** handling (registered from **`AuthProvider`**). For **server** rendering, [`requireAuth`](apps/web/lib/auth.ts) forwards **`cookies()`** to `GET /user/profile` so protected RSC layouts/pages can gate routes without a same-origin BFF; the **browser** still relies on client state + **`401`** for interactive flows. If `requireAuth` fails, it redirects to **`/signin?redirect=/profile`** (fixed path while `/profile` is the only protected segment).

The Next.js root **[`proxy.ts`](apps/web/proxy.ts)** runs for matched routes (see **Auth flows** above): **optimistic** check for **`connect.sid`** on the incoming Next request. It cannot verify the Postgres session row—**`SessionGuard`** on the API does that and returns **`401`** when invalid. The client clears local auth state and redirects to sign-in when **`apiFetch`** receives **`401` / `403`**.

More detail: [`docs/auth-architecture.md`](docs/auth-architecture.md).

```mermaid
flowchart TB
  subgraph browser [Browser]
    NextUI[Next.js_UI]
  end
  subgraph api [Nest_API]
    ExpressSession[express_session]
    PgStore[connect_pg_simple]
  end
  DB[(Postgres)]
  NextUI -->|"fetch_apiRequest_credentials_include"| ExpressSession
  ExpressSession -->|"Set_Cookie_connect_sid"| browser
  ExpressSession --> PgStore
  PgStore --> DB
```

## Architecture note

One NestJS app is enough for OAuth + profile + feedback. Splitting into microservices would be justified when multiple teams or scaling bottlenecks require it; async workflows (e.g. feedback → queue → worker) are the usual next step after a synchronous DB write.

**Manual check:** With Docker, API, and web running, open `http://localhost:4000/signin?redirect=%2Fprofile`, complete Google sign-in, and confirm you land on **`/profile`** on the web app.

## Scripts

```bash
pnpm dev             # Turbo: all dev tasks (API, web, @repo/api watch); builds shared package first
pnpm build           # Turbo: production build (API, web, packages)
pnpm format          # Prettier write
pnpm format:check    # Prettier check
pnpm lint            # ESLint (workspace packages that define `lint`)
pnpm check-types     # Turbo runs each package’s `check-types` script (web: `next typegen && tsc --noEmit`)

# Optional — API tests (from repo root)
pnpm --filter api test       # Jest unit tests
pnpm --filter api test:e2e   # E2E (API should be reachable per Jest config)
```