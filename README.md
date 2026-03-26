# XBorg Technical Challenge

Full-stack Google OAuth with NestJS and Next.js, using **server-side sessions** (not JWT) stored in PostgreSQL.

## Tech Stack

- **Frontend**: Next.js (App Router), TypeScript, shadcn/ui-style components
- **Backend**: NestJS, TypeScript
- **Database**: PostgreSQL (TypeORM + Docker for local DB)
- **Auth**: Google OAuth 2.0, `express-session` + `connect-pg-simple`
- **Monorepo**: Turborepo, pnpm

## Prerequisites

Challenge brief: [XBorg tech challenge](https://xborg.notion.site/tech-challenge)

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

Copy `.env.example` to `.env` at the **repository root** and fill in values (or set the same keys in your host’s env UI).

| Variable              | Role                                                                                      |
| --------------------- | ----------------------------------------------------------------------------------------- |
| `DATABASE_URL`        | Postgres connection string                                                                |
| `SESSION_SECRET`      | Signs session cookies                                                                     |
| `GOOGLE_*`            | OAuth client + callback URL (must match Google Console)                                   |
| `CLIENT_ORIGIN`       | Public origin of the Next app (CORS + redirect after OAuth); e.g. `http://localhost:4000` |
| `NEXT_PUBLIC_API_URL` | API base URL as called from the browser; e.g. `http://localhost:3000`                     |
| `NEXT_PUBLIC_APP_URL` | Optional canonical site URL (e.g. production); not required locally                       |
| `POSTGRES_*`          | Used by Docker Compose; keep aligned with `DATABASE_URL`                                  |

### 4. Google OAuth

1. In [Google Cloud Console](https://console.cloud.google.com/), create or select a project.
2. Configure the OAuth consent screen (scopes, test users if external).
3. Create **OAuth 2.0 Client ID** (Web application).
4. Add authorized redirect URI: `http://localhost:3000/auth/validate/google` (adjust host/port if your API differs).
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

- API: http://localhost:3000
- Web: http://localhost:4000

## Project structure

- `apps/api` — NestJS API (auth, user, feedback)
- `apps/web` — Next.js app (sign-in, profile, feedback modal)
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
- Profile read/update with validation
- Feedback submission persisted to the database
- TypeScript, ESLint, Prettier

## Security (backend)

Helmet, CORS restricted to `CLIENT_ORIGIN`, global validation pipe, session guard on private routes, serialized entities to limit exposed fields.

## Sessions vs JWT

Sessions fit a **single API** that owns auth: revocation is immediate on logout, and the browser only holds a session id cookie. JWT as a _session substitute_ adds signing, expiry, and revocation tradeoffs that rarely pay off at this scale; JWTs remain useful for **service-to-service** or third-party API access where no shared session store exists.

**Production extras** you’d typically add: Redis (or similar) for sessions at scale, rate limiting, observability, stricter cookie policy review.

## Architecture note

One NestJS app is enough for OAuth + profile + feedback. Splitting into microservices would be justified when multiple teams or scaling bottlenecks require it; async workflows (e.g. feedback → queue → worker) are the usual next step after a synchronous DB write.

## Scripts

```bash
pnpm format          # Prettier write
pnpm format:check    # Prettier check
pnpm lint            # ESLint (all packages)
pnpm check-types     # Typecheck
```
