import 'express-session';
import { User } from '../user/user.entity';

declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

declare module 'express' {
  interface Request {
    user?: User;
  }
}
