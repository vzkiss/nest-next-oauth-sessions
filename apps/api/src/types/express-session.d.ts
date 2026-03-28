import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId: string;
    /** Sanitized post-login path, set when OAuth login starts. */
    postLoginRedirect?: string;
  }
}
