import 'express-session';
import type { User } from '../../../../packages/api/dist/entry';

declare module 'express-session' {
  interface SessionData {
    userId: string;
    postLoginRedirect?: string; // sanitized post-login path,set on OAuth login start
  }
}

declare module 'express' {
  interface Request {
    user?: User;
  }
}
