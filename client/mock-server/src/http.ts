/**
 * Response envelope helpers. Every mock response uses the same shape the Java
 * Spring Boot backend will use:
 *
 *   { success, message, code, data }
 */
import type { Response } from 'express';

export function ok<T>(res: Response, data: T, code = 'OK', message = 'OK'): Response {
  return res.status(200).json({ success: true, message, code, data });
}

export function created<T>(res: Response, data: T, code: string, message: string): Response {
  return res.status(201).json({ success: true, message, code, data });
}

export function fail(
  res: Response,
  status: number,
  code: string,
  message: string,
): Response {
  return res.status(status).json({ success: false, message, code, data: null });
}
