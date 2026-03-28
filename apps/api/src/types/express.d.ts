import type { User } from '@repo/api';

declare module 'express' {
  interface Request {
    /** Passport user (e.g. after Google OAuth validate). */
    user?: User;
  }
}
