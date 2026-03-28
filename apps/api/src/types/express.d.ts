import 'express-session';
import { User } from '../user/user.entity';

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
