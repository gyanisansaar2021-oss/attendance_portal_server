/**
 * Supporting authenticated stubs used by Phase 1A screens. These return
 * realistic but minimal shapes so the client can render loading/empty states.
 * They are fleshed out in later phases as the matching features are built.
 */
import { Router } from 'express';

import { fail, ok } from '../http.js';
import { requireAuth, type AuthedRequest } from '../middleware.js';
import { buildAdminDashboard, buildTodayClasses } from '../schoolData.js';

export const miscRouter = Router();

// Teacher: today's attendance status + class sessions.
miscRouter.get('/class-sessions/today', requireAuth, (req: AuthedRequest, res) => {
  if (req.user?.role !== 'TEACHER') {
    return fail(res, 403, 'FORBIDDEN', 'Only teachers have class sessions.');
  }
  return ok(res, buildTodayClasses(), 'OK', "Today's classes.");
});

// Notifications list (empty for now; built out in a later phase).
miscRouter.get('/notifications', requireAuth, (_req, res) => {
  return ok(res, { notifications: [] }, 'OK', 'Notifications.');
});

// Principal dashboard summary.
miscRouter.get('/admin/dashboard', requireAuth, (req: AuthedRequest, res) => {
  if (req.user?.role !== 'PRINCIPAL') {
    return fail(res, 403, 'FORBIDDEN', 'Only principals can view the dashboard.');
  }
  return ok(res, buildAdminDashboard(), 'OK', 'Dashboard summary.');
});
