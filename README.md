Full-stack authentication example using NestJS and Next.js, implementing Google OAuth 2.0 with server-side sessions.

# XBorg Technical Challenge

A full-stack application with Google OAuth authentication and simple user profile management.

This implementation prioritizes correctness, clarity, and convention over feature breadth or polish.

## Tech Stack

- **Frontend**: Next.js (React) with TypeScript
- **Backend**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM and Docker
- **Authentication**: Google OAuth 2.0 with server-side sessions
- **Monorepo**: Turborepo

## Prerequisites

This implementation follows the requirements described in the XBorg technical challenge:
https://xborg.notion.site/tech-challenge

## Setup

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Generate a session secret:**

   ```bash
   openssl rand -base64 32
   ```

3. **Set up environment variables:**

   Create a `.env.local` file in the root directory with the following variables:

   ```env
   # Database (local postgres)
   DATABASE_URL=postgresql://user:password@localhost:5432/xborg

   # Session
   SESSION_SECRET=your-session-secret-change-this-in-production

   # Public base URL of the backend API
   BACKEND_URL="http://localhost:3000"

   # OAuth (must match backend public URL)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:3000/auth/validate/google

   # Frontend public URL (used by backend for redirects / absolute links)
   FRONTEND_URL="http://localhost:4000"

   # Frontend (Next.js)

   # API endpoint exposed to the browser
   NEXT_PUBLIC_API_URL="http://localhost:3000"

   # Docker / Local DB (must match DATABASE_URL)
   POSTGRES_USER="postgres"
   POSTGRES_PASSWORD="postgres"
   POSTGRES_DB="xborg"
   ```

4. **Set up Google OAuth:**

- Creating an App on [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project or select an existing one
- Setup OAuth Consent Screen:
  - select User type (Internal or External) click Create
  - Fill in the App information details
  - On the Scopes page, click Add or Remove Scopes. Select the minimum required scopes for your app and click Update, then Save and Continue.
  - If using an external user type, add test users on the Test users page and click Save and Continue.
    Review the summary and return to the dashboard
- Create OAuth 2.0 credentials
- Add `http://localhost:3000/auth/validate/google` as an authorized redirect URI
- Copy the Client ID and Client Secret to your `.env.local`

## Running the Application

### Start local database (PostgreSQL via Docker):

```bash
docker compose up --build
```

### Start both frontend and backend:

```bash
pnpm dev
```

Local Development Ports:

- Backend (NestJS API): http://localhost:3000
- Frontend (Next.js): http://localhost:4000

## Project Structure

- `apps/api`: NestJS backend with OAuth and user profile endpoints
- `apps/web`: Next.js frontend with signin and profile pages
- `packages/typescript-config`: Shared TypeScript types
- `packages/eslint-config`: Shared eslint config

## API Endpoints

### Authentication (Public)

- `GET /auth/login/google` - Initiate Google OAuth login
- `GET /auth/validate/google` - OAuth callback handler
- `GET /auth/logout` - Logout user

### User Profile (Private - requires authentication)

- `GET /user/profile` - Get current user profile
- `PUT /user/profile` - Update user profile

## Features

- ✅ Google OAuth 2.0 authentication
- ✅ Server-side sessions with HttpOnly cookies
- ✅ Instant session revocation on logout
- ✅ User profile display and editing
- ✅ Persistent sessions between visits
- ✅ Input validation and security best practices
- ✅ TypeScript throughout
- ✅ ESLint and Prettier configured

## Baseline Security (backend)

✅ Helmet ✅ CORS ✅ Global validation ✅ Session-based route protection

## Authentication

The application uses server-side sessions via `express-session`, backed by PostgreSQL (`connect-pg-simple`). After Google OAuth login, the user's ID is stored in the session. A session ID cookie (`connect.sid`) is sent to the browser.

- **HttpOnly cookie** — not accessible from JavaScript (XSS protection)
- **Automatic** — cookies are included in requests via `credentials: 'include'`
- **SameSite=lax** — CSRF protection
- **Instant revocation** — logout destroys the session server-side; no stale tokens
- **Persistent** — sessions survive server restarts (stored in PostgreSQL)

This approach was chosen over JWT because the app is a single-server monolith — stateless tokens add complexity (signing, revocation workarounds) without providing meaningful scalability benefits at this scale.

### Production Considerations

For a production system at scale, I would add:

- Redis session store for faster lookups at high concurrency
- Rate limiting and monitoring
- HTTPS-only secure cookies
- Session rotation on privilege changes

## Architecture Decisions (Bonus)

The backend is implemented as a single NestJS application.  
Given the scope of the challenge (authentication + profile CRUD), introducing service boundaries would add complexity without clear benefits.

### When Microservices Would Make Sense

In a production XBorg system, I would advocate for event-driven microservices when:

- **User completes action** → action triggers business logic → Analytics tracks event → Notification service sends Discord/Slack message
- **Profile updates** → Need to invalidate caches across multiple services

I have production experience with RabbitMQ from my work at Vincit, where we used it for asynchronous workflows in enterprise SaaS products.

### Feedback Endpoint (Demo)

A simple feedback endpoint demonstrates where async message queues would be used:

```bash
POST /feedback
{
  "message": "Great app!"
}
```

**In production:** This would publish to a RabbitMQ queue for async processing by a worker service.

**Current implementation:** Returns `202 Accepted` and logs feedback to demonstrate async intent without introducing queue infrastructure.

### Formatting & Linting

```bash
# Format all code
pnpm format

# Check formatting
pnpm format:check

# Lint all projects
pnpm lint
```
