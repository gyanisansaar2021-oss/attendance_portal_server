/**
 * Attendance Portal — mock API server.
 *
 * Temporary Node.js + Express backend that mirrors the API contract documented
 * in client/README.md. It exists so the React Native client can be developed
 * before the Java Spring Boot backend is ready. Swapping backends later is a
 * client env-var change (EXPO_PUBLIC_API_BASE_URL) — no client code changes.
 *
 * All responses use the shared envelope: { success, message, code, data }.
 */
import cors from 'cors';
import express from 'express';

import { fail, ok } from './http.js';
import { authRouter } from './routes/auth.js';
import { miscRouter } from './routes/misc.js';

const PORT = Number(process.env.PORT ?? 4000);
const API_PREFIX = '/api/v1';

const app = express();
app.use(cors());
app.use(express.json());

// Lightweight request log (dev only).
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Health check (outside the versioned prefix).
app.get('/health', (_req, res) => ok(res, { status: 'up' }, 'OK', 'Mock server is running.'));

// Versioned API.
app.use(`${API_PREFIX}/auth`, authRouter);
app.use(API_PREFIX, miscRouter);

// 404 — unknown route, still using the standard envelope.
app.use((req, res) => {
  fail(res, 404, 'NOT_FOUND', `No mock handler for ${req.method} ${req.path}.`);
});

// Error handler — normalize unexpected errors into the envelope.
app.use(
  (err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    fail(res, 500, 'UNKNOWN', 'Something went wrong on the mock server.');
  },
);

app.listen(PORT, () => {
  console.log(`\nAttendance Portal mock API running:`);
  console.log(`  Local:   http://localhost:${PORT}${API_PREFIX}`);
  console.log(`  Health:  http://localhost:${PORT}/health`);
  console.log(`\nDeterministic test users:`);
  console.log(`  Teacher   -> phone 9876543210, OTP 123456 (Rahul Kumar)`);
  console.log(`  Principal -> principal@school.com / password123 (Anita Desai)`);
  console.log(
    `\nOn a physical phone, set the client EXPO_PUBLIC_API_BASE_URL to your` +
      ` machine's LAN IP, e.g. http://192.168.x.x:${PORT}${API_PREFIX}\n`,
  );
});
