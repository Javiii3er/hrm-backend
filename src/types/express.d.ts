import { AuthRequest } from '../modules/auth/auth.middleware.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthRequest['user'];
    }
  }
}

export {};