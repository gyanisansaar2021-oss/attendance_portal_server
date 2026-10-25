# Phase 1C — Technical Specification (PROPOSED)

> ⚠️ **This document is a PROPOSED Phase 1C contract. It is NOT the source of
> truth until the Frontend and Backend developers agree on it.**
>
> - `client/README.md` remains the authoritative contract for everything
>   already implemented (Phases 1A/1B).
> - Every item below marked **PROPOSED — BE confirmation required** is an
>   assumption, not an approved decision.
> - **No Phase 1C implementation should begin before this spec is approved** by
>   both FE and BE. Once agreed, the final version is folded into
>   `client/README.md` and this draft is archived.

**Audience:** Frontend (React Native/Expo) + Backend (Java Spring Boot) developers.
**Scope:** The first complete teacher attendance workflow.

---

## 0. Proposed defaults (decision log)

These are the five defaults to confirm first — everything else in the spec
depends on them.

| # | Topic | PROPOSED default | Status |
|---|---|---|---|
| 1 | Geofence shape | Circular: school `latitude` + `longitude` + `radiusMeters` | **PROPOSED — BE confirmation required** |
| 2 | GPS accuracy threshold | Reject when `accuracy > 50` (metres); tunable server-side | **PROPOSED — BE confirmation required** |
| 3 | Student attendance model | All `PRESENT` by default → teacher marks exceptions → single submit; post-submit editing **TBD** | **PROPOSED — BE confirmation required** |
| 4 | Check-in ↔ attendance coupling | Independent for V1 (teacher may mark attendance even if check-in had a GPS issue) | **PROPOSED — BE/product decision** |
| 5 | Attendance statuses | `PRESENT` \| `ABSENT` \| `LATE` — with `LATE` as **TBD** | **PROPOSED — BE confirmation required** |

---

## 1. Target workflow (end-to-end)

```
Login → Teacher Home → Check In (GPS) → Today's Classes → Open Class
      → Student List → Mark Present/Absent → Submit → Attendance Completed → Check Out
```

After Phase 1C, the core attendance product works end-to-end against the mock,
and (once the BE implements this contract) against Spring Boot with only an
`EXPO_PUBLIC_API_BASE_URL` change.

---

## 2. Conventions (unchanged from README §5)

- Base path `/api/v1`. Auth via `Authorization: Bearer <accessToken>`.
- Standard envelope on every response:
  ```json
  { "success": true, "message": "…", "code": "MACHINE_CODE", "data": {} }
  ```
- **Business logic branches on `code`, never the English `message`.**
- All datetimes are ISO‑8601 UTC strings.

---

## 3. GPS check-in / check-out

### 3.1 Client responsibility (hard rule — unchanged from README §7)

The client sends **only** the raw device fix. It never computes or sends an
in/out-of-geofence decision.

```json
{ "latitude": 13.082680, "longitude": 80.270718, "accuracy": 8.5 }
```

- `latitude`, `longitude`: decimal degrees (WGS‑84).
- `accuracy`: horizontal accuracy radius in metres from the OS (Expo Location
  `coords.accuracy`).
- A **single fix** is captured at the moment of the action. No continuous
  tracking.

### 3.2 Backend responsibility

The backend decides eligibility using the school geofence and accuracy rule:

- **Geofence (PROPOSED, circular):** compute distance from the fix to the
  school centre; eligible when `distance <= radiusMeters`. Haversine distance is
  assumed.
- **Accuracy (PROPOSED):** reject when `accuracy > 50` metres with
  `GPS_ACCURACY_TOO_LOW` (checked **before** the geofence test, so a low-quality
  fix never produces a false "outside" result).
- The teacher must be active (`TEACHER_NOT_ACTIVE` otherwise).

> **PROPOSED — BE confirmation required:** geofence shape (circular vs polygon),
> `radiusMeters` default (suggest **150 m**), accuracy threshold (**50 m**), and
> evaluation order (accuracy → geofence → state).

### 3.3 Endpoints

| Method | Path | Auth | Role |
|---|---|---|---|
| POST | `/teacher-attendance/check-in` | yes | TEACHER |
| POST | `/teacher-attendance/check-out` | yes | TEACHER |
| GET | `/teacher-attendance/today` | yes | TEACHER | (read current status — **PROPOSED new**, so Home can refresh without `/class-sessions/today`) |

**Request body (both check-in and check-out):**

```json
{ "latitude": 13.082680, "longitude": 80.270718, "accuracy": 8.5 }
```

**Check-in success (`code: CHECKED_IN`):**

```json
{
  "success": true,
  "code": "CHECKED_IN",
  "message": "Checked in successfully.",
  "data": {
    "status": "CHECKED_IN",
    "checkInTime": "2026-05-05T08:15:00.000Z",
    "locationStatus": "INSIDE_SCHOOL",
    "schoolName": "Greenwood Public School",
    "distanceMeters": 42
  }
}
```

**Check-out success (`code: CHECKED_OUT`):** same shape with `status: CHECKED_OUT`
and a `checkOutTime`.

> `distanceMeters` is **PROPOSED** (useful for debugging/telemetry; the client
> treats it as display/diagnostic only, never for logic). BE may omit it.

### 3.4 Error codes (check-in/out)

| `code` | HTTP | When |
|---|---|---|
| `GPS_ACCURACY_TOO_LOW` | 422 | `accuracy` worse than threshold |
| `TEACHER_OUTSIDE_GEOFENCE` | 422 | Fix outside the school radius |
| `ALREADY_CHECKED_IN` | 409 | Check-in attempted while already checked in |
| `ALREADY_CHECKED_OUT` | 409 | Check-out attempted while not checked in / already out |
| `TEACHER_NOT_ACTIVE` | 403 | Teacher account inactive |
| `VALIDATION_ERROR` | 422 | Missing/invalid lat/long/accuracy |

All already exist in `src/types/api.ts` (`ApiErrorCode`).

### 3.5 Client flow (FE)

1. Request foreground location permission (`expo-location`). If denied → show a
   permission-needed state with a settings prompt; do not fabricate a location.
2. Get a single fix (`getCurrentPositionAsync`, balanced accuracy).
3. `POST /teacher-attendance/check-in` with `{ latitude, longitude, accuracy }`.
4. Branch on `code`:
   - `CHECKED_IN` → update status card, refetch Home.
   - `TEACHER_OUTSIDE_GEOFENCE` / `GPS_ACCURACY_TOO_LOW` → inline, actionable
     error with a Retry.
   - `ALREADY_CHECKED_IN` → treat as success (sync state).

---

## 4. Class session detail + student roster

### 4.1 Session states (unchanged from README §8)

`UPCOMING` | `IN_PROGRESS` | `ATTENDANCE_PENDING` | `COMPLETED`

### 4.2 Endpoints

| Method | Path | Auth | Role |
|---|---|---|---|
| GET | `/class-sessions/{id}` | yes | TEACHER |
| GET | `/class-sessions/{sessionId}/students` | yes | TEACHER |
| POST | `/class-sessions/{sessionId}/attendance` | yes | TEACHER |

**`GET /class-sessions/{id}` → `data`:**

```json
{
  "id": "session_1",
  "startTime": "2026-05-05T08:30:00.000Z",
  "endTime": "2026-05-05T09:15:00.000Z",
  "subject": "Mathematics",
  "className": "Grade 8",
  "section": "A",
  "room": "R-201",
  "state": "ATTENDANCE_PENDING",
  "studentCount": 32,
  "attendanceSubmitted": false,
  "attendanceSubmittedAt": null
}
```

- `attendanceSubmitted` / `attendanceSubmittedAt` are **PROPOSED** additions so
  the UI can show "already submitted" and decide whether editing is offered.
- Error: `SESSION_NOT_FOUND` (404) if the id is unknown or not owned by the
  teacher; `FORBIDDEN` (403) if the session belongs to another teacher.

**`GET /class-sessions/{sessionId}/students` → `data`:**

```json
{
  "sessionId": "session_1",
  "students": [
    {
      "id": "stu_001",
      "rollNo": "08A-01",
      "name": "Aarav Gupta",
      "defaultStatus": "PRESENT",
      "currentStatus": "PRESENT"
    }
  ]
}
```

- `defaultStatus` is always `PRESENT` under the proposed model.
- `currentStatus` reflects a prior submission when re-opening a submitted
  session (equals `defaultStatus` on first open). **PROPOSED.**
- Roster ordering: by `rollNo` ascending. **PROPOSED.**

> **PROPOSED — BE confirmation required:** roster size expectations (pagination
> vs single payload). Suggest **no pagination for V1** (class sizes ≤ ~60);
> revisit if classes are larger.

---

## 5. Submit attendance

### 5.1 Model (PROPOSED)

- Every student starts `PRESENT`.
- The teacher toggles only the exceptions (`ABSENT`, optionally `LATE`).
- One **Submit** sends the full set of exceptions (not the whole roster) to keep
  payloads small and intent explicit.

### 5.2 `POST /class-sessions/{sessionId}/attendance`

**Request body (PROPOSED):**

```json
{
  "markedAt": "2026-05-05T08:40:00.000Z",
  "entries": [
    { "studentId": "stu_004", "status": "ABSENT" },
    { "studentId": "stu_010", "status": "LATE" }
  ]
}
```

- Only non-`PRESENT` entries are sent; all omitted students are `PRESENT`.
- `status`: `PRESENT` | `ABSENT` | `LATE` (**`LATE` is TBD** — BE may reject it
  until confirmed).
- `markedAt`: client timestamp (display/audit only; server authoritative time
  wins).

> **Alternative considered:** sending the full roster every time. Rejected for
> V1 (larger payloads, same result). **PROPOSED — BE confirmation required** on
> exceptions-only vs full-roster.

**Success (`code: ATTENDANCE_SUBMITTED`):**

```json
{
  "success": true,
  "code": "ATTENDANCE_SUBMITTED",
  "message": "Attendance submitted successfully.",
  "data": {
    "sessionId": "session_1",
    "submittedAt": "2026-05-05T08:40:12.000Z",
    "presentCount": 30,
    "absentCount": 1,
    "lateCount": 1,
    "totalCount": 32
  }
}
```

### 5.3 Error codes

| `code` | HTTP | When |
|---|---|---|
| `ATTENDANCE_NOT_ALLOWED` | 409 | Submission window closed / session not markable (backend decides) |
| `SESSION_NOT_FOUND` | 404 | Unknown session |
| `VALIDATION_ERROR` | 422 | Unknown `studentId`, invalid `status`, malformed body |
| `FORBIDDEN` | 403 | Session not owned by the requesting teacher |

### 5.4 Re-submission / editing (PROPOSED — TBD)

- **Default proposal:** allow re-submission while the backend considers the
  session open; the latest submission replaces the previous one. When closed,
  return `ATTENDANCE_NOT_ALLOWED`.
- The backend is the single authority on whether a submit is allowed — the FE
  never decides this locally; it just reacts to `ATTENDANCE_NOT_ALLOWED`.

> **PROPOSED — BE confirmation required:** is submit final-per-session, or
> editable within a window? What defines the window (session end + grace period,
> end-of-day, principal override)?

---

## 6. Concurrency & integrity considerations (for BE)

> All **PROPOSED**; listed so BE can design storage/locking deliberately.

1. **Idempotency / double-submit:** two rapid submits (double tap, retry after
   timeout) must not create duplicates. Proposal: attendance is keyed by
   `(sessionId)` and upserted; the latest wins. Consider an optional
   `Idempotency-Key` header. **PROPOSED.**
2. **Substitution overlap:** if a substitute teacher is assigned, who may submit
   attendance for the session — original, substitute, or both? **PROPOSED —
   BE/product decision.** (Out of 1C scope to *build*, but the ownership check in
   §4/§5 must not block a valid substitute later.)
3. **Check-in race:** concurrent check-in requests should resolve to a single
   state; second request returns `ALREADY_CHECKED_IN` rather than erroring.
4. **Clock skew:** server timestamps are authoritative; client `markedAt` /
   `checkInTime` from the device are advisory only.
5. **Time zone:** all persisted/returned times are UTC ISO strings; the client
   formats to local time for display.

---

## 7. Database expectations (for BE — PROPOSED, illustrative)

Not prescriptive about Spring/JPA specifics — just the entities the contract
implies:

- `school` — `id`, `name`, `latitude`, `longitude`, `radius_meters`.
- `teacher_attendance` — `id`, `teacher_id`, `date`, `check_in_time`,
  `check_out_time`, `check_in_lat`, `check_in_lng`, `check_in_accuracy`,
  `location_status`, `distance_meters` (nullable).
- `class_session` — `id`, `teacher_id`, `subject`, `class_name`, `section`,
  `room`, `start_time`, `end_time`, `state`, `attendance_submitted`,
  `attendance_submitted_at`.
- `student` — `id`, `roll_no`, `name`, `class_name`, `section`.
- `student_attendance` — `id`, `session_id`, `student_id`, `status`,
  `marked_at`, `source` (teacher/substitute). Unique on `(session_id, student_id)`.

---

## 8. Error codes summary (Phase 1C)

**Reused (already in `src/types/api.ts`):**
`CHECKED_IN`, `CHECKED_OUT`, `ALREADY_CHECKED_IN`, `ALREADY_CHECKED_OUT`,
`TEACHER_OUTSIDE_GEOFENCE`, `GPS_ACCURACY_TOO_LOW`, `TEACHER_NOT_ACTIVE`,
`ATTENDANCE_SUBMITTED`, `ATTENDANCE_NOT_ALLOWED`, `SESSION_NOT_FOUND`,
`VALIDATION_ERROR`, `FORBIDDEN`, `UNAUTHORIZED`.

**Proposed new codes (confirm with BE before adding to the canonical list):**

| `code` | Purpose | Status |
|---|---|---|
| `LOCATION_PERMISSION_DENIED` | FE-only state (not from server) when the OS denies location | **PROPOSED (client-side only)** |

> No other new server codes are needed if the reused set is accepted.

---

## 9. Frontend plan (for reference — built only after approval)

**Types** (`src/types/attendance.ts`, extend): `SessionDetail`, `RosterStudent`,
`StudentAttendanceStatus`, `AttendanceSubmission`, `SubmitAttendanceResult`.

**API modules** (`src/api/`):
- `teacherAttendance.ts` → `checkIn(body)`, `checkOut(body)`, `today()`
- `classSessions.ts` (extend) → `byId(id)`, `students(sessionId)`,
  `submitAttendance(sessionId, body)`

**Services** (`src/services/`): `location.ts` — permission + single fix via
`expo-location`, returning `{ latitude, longitude, accuracy }` only.

**Hooks** (`src/hooks/`): `useCheckIn`, `useCheckOut` (mutations, invalidate
Home), `useSessionDetail(id)`, `useSessionStudents(sessionId)`,
`useSubmitAttendance(sessionId)` (mutation).

**Screens** (`src/app/(teacher)/`):
- Check-in affordance on Home (button → location → mutation → status card).
- `class/[id].tsx` — session detail + roster + mark + submit.
- Attendance success + error states.

**New dependency (requires its own approval):** `expo-location`
(official Expo module for GPS). Flagged now; not added until Phase 1C is
approved.

**Mock server:** add `/teacher-attendance/check-in|check-out|today`,
`/class-sessions/{id}`, `/{id}/students`, `/{id}/attendance` to the existing
Express mock (single mock, no second implementation). The mock will **simulate**
geofence/accuracy outcomes deterministically for development (README §12), never
implying production security.

---

## 10. Open decisions checklist (BE sign-off needed)

- [ ] Geofence shape = circular; `radiusMeters` default (suggest 150).
- [ ] GPS accuracy threshold = 50 m; evaluation order accuracy → geofence → state.
- [ ] Attendance payload = exceptions-only (vs full roster).
- [ ] `LATE` status included in V1?
- [ ] Post-submit editing allowed within a window? What defines the window?
- [ ] Check-in and attendance independent for V1?
- [ ] Roster pagination needed, or single payload acceptable?
- [ ] Substitute-teacher attendance ownership rules.
- [ ] Idempotency strategy for submit (key vs upsert-latest-wins).
- [ ] `GET /teacher-attendance/today` added as a dedicated status read?

---

_Once every box above is agreed, the final contract is merged into
`client/README.md` and Phase 1C implementation can begin._
