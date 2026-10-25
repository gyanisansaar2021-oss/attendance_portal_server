/**
 * Auth middleware. Reads the Bearer token and attaches the resolved user to the
 * request. Responds with the standard envelope on failure.
 */
import type { NextFunction, Request, Response } from 'express';

import type { MockUser } from './data.js';
import { fail } from './http.js';
import { userFromAccessToken } from './tokens.js';

export interface AuthedRequest extends Request {
  user?: MockUser;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const header = req.header('authorization') ?? '';
  const token = header.toLowerCase().startsWith('bearer ')
    ? header.slice(7).trim()
    : undefined;
  const user = userFromAccessToken(token);
  if (!user) {
    fail(res, 401, 'UNAUTHORIZED', 'Authentication required.');
    return;
  }
  req.user = user;
  next();
}
