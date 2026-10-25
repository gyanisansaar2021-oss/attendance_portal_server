# Attendance Portal — Client

React Native + Expo (TypeScript) client for the School Attendance Management
System, plus a temporary Node.js + Express **mock API** used until the Java
Spring Boot backend is ready.

> **This README is the shared source of truth between the frontend and backend
> developers.** It documents the API contract, business rules, and development
> status. The Java backend should implement the contract described here. If this
> document and any other instruction disagree, **this document wins** — raise a
> discussion before changing the contract.

---

## 1. Tech stack

| Area | Choice |
|---|---|
| App framework | React Native + Expo (SDK 57) |
| Language | TypeScript (strict) |
| Routing | Expo Router (file-based, routes in `src/app/`) |
| Server state | TanStack Query |
| Global/auth state | Zustand |
| Forms | React Hook Form |
| Secure storage | expo-secure-store (tokens) |
| HTTP | `fetch` wrapped in a single API client (`src/api/client.ts`) |
| Mock API | Node.js + Express + TypeScript (`mock-server/`) |

---

## 2. Project structure

```
client/
├── src/
│   ├── app/                 # Expo Router routes (screens only)
│   │   ├── index.tsx        # auth-gated redirect
│   │   ├── (auth)/          # login, teacher OTP, principal login
│   │   ├── (teacher)/       # teacher tabs: home, classes, substitution, alerts, profile
│   │   └── (admin)/         # principal: dashboard (more sections in Phase 3)
│   ├── api/                 # API client, endpoints, per-feature API modules, queryClient
│   ├── components/          # AppProviders + reusable UI (components/ui)
│   ├── hooks/               # React hooks (useAuth, ...)
│   ├── services/            # device/platform services (tokenStorage, ...)
│   ├── store/               # Zustand stores (authStore)
│   ├── types/               # shared TypeScript types (api, auth)
│   ├── constants/           # config (env), app constants
│   └── theme/               # colors, typography, spacing, radius, shadows
├── mock-server/             # temporary Express mock API (own package.json)
│   └── src/
├── assets/
├── .env.example
└── README.md                # ← you are here (source of truth)
```

**Architecture rule:** components never call the network directly. The flow is
always `component → hook → src/api/<feature> → apiClient → backend/mock API`.

---

## 3. Environment configuration

The API base URL is driven **entirely** by environment configuration so that
switching between the mock API and the Spring Boot API requires **no source
changes** — only an env var.

```
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
```

Copy `.env.example` → `.env` and set the value for your situation:

| Target | `EXPO_PUBLIC_API_BASE_URL` |
|---|---|
| iOS simulator / web | `http://localhost:4000/api/v1` |
| Android emulator | `http://10.0.2.2:4000/api/v1` |
| **Physical phone** | `http://<your-LAN-IP>:4000/api/v1` |
| Spring Boot (later) | `https://api.yourschool.com/api/v1` |

> **Physical phone note:** `localhost` on a phone refers to the **phone itself**,
> not your computer. Use your dev machine's LAN IP (Windows: `ipconfig`,
> macOS/Linux: `ifconfig`/`ip addr`). The phone and computer must share the same
> Wi-Fi network. If left unset, the client defaults to
> `http://localhost:4000/api/v1`.

---

## 4. Running the project

### Client (Expo)

```bash
cd client
npm install            # first time only
npm start              # then press a (Android), i (iOS), or w (web)
```

### Mock API server

```bash
cd client/mock-server
npm install            # first time only
npm run dev            # starts on http://localhost:4000, watches for changes
```

Health check: `GET http://localhost:4000/health`.

---

## 5. API conventions

- Base path: **`/api/v1`**.
- Every response — success **and** error — uses the same envelope:

```json
{
  "success": true,
  "message": "Human readable string",
  "code": "MACHINE_READABLE_CODE",
  "data": {}
}
```

```json
{
  "success": false,
  "message": "Teacher is outside school premises",
  "code": "TEACHER_OUTSIDE_GEOFENCE",
  "data": null
}
```

- **Frontend business logic branches on `code`, never on the English `message`.**
  Messages are for display only and may change / be localized.
- Auth: send `Authorization: Bearer <accessToken>` on authenticated requests.
- The client treats HTTP `401` (or `code: UNAUTHORIZED`) as a trigger to attempt
  **one** transparent token refresh, then retry; if refresh fails, the session
  ends.

### Business / technical codes

| Code | Meaning |
|---|---|
| `NETWORK_ERROR` / `TIMEOUT` | Client could not reach the server |
| `VALIDATION_ERROR` | Request body failed validation (HTTP 422) |
| `UNAUTHORIZED` / `FORBIDDEN` / `NOT_FOUND` | Standard auth/permission/missing |
| `OTP_SENT` | OTP dispatched |
| `OTP_INVALID` / `OTP_EXPIRED` | OTP verification failed |
| `LOGIN_OK` | Login / OTP verification succeeded |
| `INVALID_CREDENTIALS` | Wrong principal email/password |
| `TOKEN_REFRESHED` / `TOKEN_INVALID` | Refresh outcome |
| `LOGOUT_OK` | Logout succeeded |
| `CHECKED_IN` / `CHECKED_OUT` | Teacher attendance recorded |
| `ALREADY_CHECKED_IN` / `ALREADY_CHECKED_OUT` | Duplicate attendance action |
| `TEACHER_OUTSIDE_GEOFENCE` | Teacher not within school premises |
| `GPS_ACCURACY_TOO_LOW` | Location fix too imprecise to trust |
| `TEACHER_NOT_ACTIVE` | Teacher account inactive |
| `ATTENDANCE_SUBMITTED` | Student attendance saved |
| `ATTENDANCE_NOT_ALLOWED` | Attendance not permitted for this session |
| `SESSION_NOT_FOUND` | Class session does not exist |
| `SUBSTITUTION_CREATED` / `_ACCEPTED` / `_REJECTED` / `_CANCELLED` / `_ASSIGNED` | Substitution lifecycle |

---

## 6. Authentication flow

**Teacher (OTP):**

1. `POST /auth/teacher/send-otp` with `{ phone }` → `OTP_SENT`.
2. `POST /auth/teacher/verify-otp` with `{ phone, otp }` → `LOGIN_OK` with
   `{ user, tokens }`.

**Principal (password):**

1. `POST /auth/principal/login` with `{ email, password }` → `LOGIN_OK` with
   `{ user, tokens }`.

**Session lifecycle:**

- Tokens (`accessToken`, `refreshToken`, optional `accessTokenExpiresAt`) are
  stored with `expo-secure-store` (web dev falls back to `localStorage`, which is
  **not** production-secure and is dev-only).
- `GET /auth/me` resolves the current user on app start (session persistence).
- `POST /auth/refresh` with `{ refreshToken }` → new token pair.
- `POST /auth/logout` ends the session (client clears tokens regardless of the
  server response).

### Auth endpoints

| Method | Path | Auth | Body | Success `code` / `data` |
|---|---|---|---|---|
| POST | `/auth/teacher/send-otp` | no | `{ phone }` | `OTP_SENT` / `{ expiresInSeconds, devOtp? }` |
| POST | `/auth/teacher/verify-otp` | no | `{ phone, otp }` | `LOGIN_OK` / `{ user, tokens }` |
| POST | `/auth/principal/login` | no | `{ email, password }` | `LOGIN_OK` / `{ user, tokens }` |
| POST | `/auth/refresh` | no | `{ refreshToken }` | `TOKEN_REFRESHED` / `tokens` |
| POST | `/auth/logout` | yes | – | `LOGOUT_OK` / `null` |
| GET | `/auth/me` | yes | – | `OK` / `user` |

**Request example** — send OTP:

```json
POST /api/v1/auth/teacher/send-otp
{ "phone": "9876543210" }
```

**Response example** — verify OTP:

```json
{
  "success": true,
  "message": "Signed in successfully.",
  "code": "LOGIN_OK",
  "data": {
    "user": {
      "id": "teacher_001",
      "role": "TEACHER",
      "name": "Rahul Kumar",
      "email": "rahul.kumar@school.example",
      "phone": "9876543210",
      "schoolId": "school_demo_001",
      "isActive": true
    },
    "tokens": {
      "accessToken": "…",
      "refreshToken": "…",
      "accessTokenExpiresAt": 1730000000000
    }
  }
}
```

> `devOtp` is a **mock-only** convenience (the fixed code `123456`). The Spring
> Boot backend must **not** return the OTP in the response.

---

## 7. Teacher attendance & geofence rules

> **Not implemented in the UI yet (Phase 2).** Documented here so the backend
> contract is stable.

The client sends the raw device location only:

```json
POST /api/v1/teacher-attendance/check-in
{ "latitude": 13.082680, "longitude": 80.270718, "accuracy": 8.5 }
```

**Critical rule — the frontend does NOT decide geofence eligibility.**

- The client sends `{ latitude, longitude, accuracy }`.
- The **backend** computes whether the teacher is inside the school geofence and
  whether accuracy is acceptable.
- The client must **never** send or trust a flag like `isInsideSchool: true`.
- No continuous GPS tracking — a single fix is taken at the moment of check-in /
  check-out.

Expected outcomes (by `code`): `CHECKED_IN`, `CHECKED_OUT`,
`ALREADY_CHECKED_IN`, `ALREADY_CHECKED_OUT`, `TEACHER_OUTSIDE_GEOFENCE`,
`GPS_ACCURACY_TOO_LOW`, `TEACHER_NOT_ACTIVE`.

| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/teacher-attendance/check-in` | yes | `{ latitude, longitude, accuracy }` |
| POST | `/teacher-attendance/check-out` | yes | `{ latitude, longitude, accuracy }` |

---

## 8. Class sessions & student attendance rules

> **`GET /class-sessions/today` is implemented (Phase 1B)** and powers the
> Teacher Home screen. Student-roster + attendance submission remain Phase 2.

Planned flow: teacher opens today's session → loads students → marks absentees
(default present) → submits once. Attendance submission is idempotent per
session; the backend decides whether submission is still allowed
(`ATTENDANCE_NOT_ALLOWED`).

| Method | Path | Auth | Status | Notes |
|---|---|---|---|---|
| GET | `/class-sessions/today` | yes | 🟢 1B | Teacher's attendance status + today's sessions |
| GET | `/class-sessions/{id}` | yes | ⬜ 2 | Session detail |
| GET | `/class-sessions/{sessionId}/students` | yes | ⬜ 2 | Roster for marking |
| POST | `/class-sessions/{sessionId}/attendance` | yes | ⬜ 2 | Submit attendance → `ATTENDANCE_SUBMITTED` |

### `GET /class-sessions/today` — response `data` (implemented)

```json
{
  "date": "2026-05-05T00:00:00.000Z",
  "attendance": {
    "status": "CHECKED_IN",
    "checkInTime": "2026-05-05T08:15:00.000Z",
    "locationStatus": "INSIDE_SCHOOL",
    "schoolName": "Greenwood Public School"
  },
  "sessions": [
    {
      "id": "session_1",
      "startTime": "2026-05-05T08:30:00.000Z",
      "endTime": "2026-05-05T09:15:00.000Z",
      "subject": "Mathematics",
      "className": "Grade 8",
      "section": "A",
      "room": "R-201",
      "state": "COMPLETED",
      "studentCount": 32
    }
  ]
}
```

- `attendance.status`: `NOT_CHECKED_IN` | `CHECKED_IN` | `CHECKED_OUT`
- `attendance.locationStatus`: `UNKNOWN` | `INSIDE_SCHOOL` | `OUTSIDE_SCHOOL`
  (backend-decided; the client only displays it — see §7)
- `session.state`: `UPCOMING` | `IN_PROGRESS` | `ATTENDANCE_PENDING` | `COMPLETED`

Planned attendance submission body (Phase 2):

```json
{ "entries": [ { "studentId": "stu_1", "status": "ABSENT" } ] }
```

Statuses: `PRESENT` | `ABSENT` | `LATE` (final list TBD with backend).

---

## 9. Substitution flow

> **Not implemented in the UI yet (Phase 2).**

Lifecycle: a teacher requests a substitution → eligible teachers can
accept/reject → requester can cancel → an admin can directly assign.

| Method | Path | Auth | Success `code` |
|---|---|---|---|
| POST | `/substitutions` | yes | `SUBSTITUTION_CREATED` |
| GET | `/substitutions/pending` | yes | `OK` |
| POST | `/substitutions/{id}/accept` | yes | `SUBSTITUTION_ACCEPTED` |
| POST | `/substitutions/{id}/reject` | yes | `SUBSTITUTION_REJECTED` |
| POST | `/substitutions/{id}/cancel` | yes | `SUBSTITUTION_CANCELLED` |
| POST | `/admin/substitutions/{id}/assign` | yes (principal) | `SUBSTITUTION_ASSIGNED` |

---

## 10. Admin / management endpoints

### `GET /admin/dashboard` — implemented (Phase 1B)

Principal-only (returns `403 FORBIDDEN` for non-principals). Powers the Principal
Dashboard screen. Response `data`:

```json
{
  "date": "2026-05-05T00:00:00.000Z",
  "schoolName": "Greenwood Public School",
  "attendancePercentage": 40,
  "teachersTotal": 5,
  "teachersPresent": 2,
  "teachersAbsent": 1,
  "onSubstitution": 1,
  "pendingSubstitutionRequests": 2,
  "teacherAttendance": [
    { "teacherId": "teacher_001", "name": "Rahul Kumar", "status": "PRESENT", "checkInTime": "2026-05-05T08:15:00.000Z" }
  ],
  "attentionItems": [
    { "id": "att_1", "severity": "DANGER", "code": "TEACHER_ABSENT", "title": "…", "description": "…" }
  ]
}
```

- `teacherAttendance[].status`: `PRESENT` | `ABSENT` | `ON_SUBSTITUTION` | `NOT_CHECKED_IN`
- `attentionItems[].severity`: `INFO` | `WARNING` | `DANGER` (drives icon + color;
  the UI never relies on color alone). Each item has a machine `code` so the UI
  can route/act without parsing text.

> **Management CRUD reserved for Phase 3.** Teachers, Students, Classes,
> Subjects, Timetable follow standard REST CRUD under `/api/v1`:
>
> - `GET|POST /teachers`, `GET|PUT|DELETE /teachers/{id}`
> - `GET|POST /students`, `GET|PUT|DELETE /students/{id}`
> - `GET|POST /classes`, `PUT|DELETE /classes/{id}`
> - `GET|POST /subjects`, `PUT /subjects/{id}`
> - `GET|POST /timetable`, `PUT|DELETE /timetable/{id}`

---

## 11. Mock API server

Location: `client/mock-server/`. Node.js + Express + TypeScript. It mirrors the
contract above — no invented endpoints.

**Deterministic test users** (no real personal data):

| Role | Credentials |
|---|---|
| Teacher (Rahul Kumar) | phone `9876543210`, OTP `123456` |
| Teacher (Priya Sharma) | phone `9876500000`, OTP `123456` |
| Principal (Anita Desai) | `principal@school.com` / `password123` |

> The OTP is a **fixed dev code (`123456`)** echoed as `devOtp`. Mock tokens are
> opaque base64 strings — **dev-safe only, not production security.** The Spring
> Boot backend replaces these with real JWTs and real OTP delivery.

### Implemented mock endpoints

| Endpoint | Status |
|---|---|
| `GET /health` | 🟢 |
| `POST /api/v1/auth/teacher/send-otp` | 🟢 |
| `POST /api/v1/auth/teacher/verify-otp` | 🟢 |
| `POST /api/v1/auth/principal/login` | 🟢 |
| `POST /api/v1/auth/refresh` | 🟢 |
| `POST /api/v1/auth/logout` | 🟢 |
| `GET /api/v1/auth/me` | 🟢 |
| `GET /api/v1/class-sessions/today` | 🟢 realistic data (teacher-only) |
| `GET /api/v1/admin/dashboard` | 🟢 realistic data (principal-only) |
| `GET /api/v1/notifications` | 🟡 stub (empty) |

---

## 12. Development status

| Feature | Status |
|---|---|
| Project setup (Expo SDK 57 + Expo Router + TS) | 🟢 Completed |
| Theme system (colors/typography/spacing/radius/shadows) | 🟢 Completed |
| Reusable UI (Button, Card, Input, Header, Loading/Empty states) | 🟢 Completed |
| API client + error normalization + env base URL | 🟢 Completed |
| Auth store + secure token storage + refresh | 🟢 Completed |
| App navigation (auth / teacher / admin groups + guards) | 🟢 Completed |
| Icon system (Ionicons behind `Icon` abstraction) | 🟢 Completed (1B) |
| Teacher Login (role chooser) | 🟢 Completed |
| Teacher OTP (validation, resend, keyboard UX) | 🟢 Completed (polished 1B) |
| Principal Login (validation, show/hide, error states) | 🟢 Completed (polished 1B) |
| Teacher Home (live `class-sessions/today`, states, pull-to-refresh) | 🟢 Completed (1B) |
| Principal Dashboard (live `admin/dashboard`, KPIs, states, refresh) | 🟢 Completed (1B) |
| Mock server (auth + today's classes + dashboard) | 🟢 Completed |
| Teacher Classes / Student attendance | ⬜ Not Started (Phase 2) |
| Teacher Check-in / Check-out (GPS) | ⬜ Not Started (Phase 2) |
| Substitution | ⬜ Not Started (Phase 2) |
| Admin management (teachers/students/classes/timetable/reports) | ⬜ Not Started (Phase 3) |
| Notifications | ⬜ Not Started (Phase 4) |

Legend: 🟢 Completed · 🟡 In Progress · ⬜ Not Started

---

## 13. Development notes & known limitations

- **Phased delivery.** Phase 1A established the foundation (theme, components,
  API/auth plumbing, navigation, mock auth). **Phase 1B** adds the icon system
  (Ionicons behind the `Icon` abstraction), polished auth screens, and the two
  flagship screens (Teacher Home, Principal Dashboard) wired to live mock data
  with loading / empty / error / pull-to-refresh states.
- **Icons.** Icons use `@react-native-vector-icons/ionicons` but are **only**
  imported inside `src/components/ui/Icon.tsx`. Screens use the semantic `Icon`
  component (`<Icon name="check-in" />`), so switching icon libraries later is a
  one-file change.
- **Error copy.** Error text is derived from the error `code` via
  `src/api/errorMessages.ts` (`toUiError`) — the single place codes become UI
  copy. Screens never parse the English `message`.
- **Node version.** Development was set up with Node v24.1.0. Some Expo tooling
  prints `EBADENGINE` warnings for Node < 24.3; these are warnings, not errors.
  A current Node LTS (20.x or 22.x) is recommended for the smoothest experience.
- **Mock auth is not secure.** Fixed OTP, plaintext principal password, and
  opaque (unsigned) tokens exist only for local development.
- **Geofence is a backend decision.** The client never computes or trusts
  in/out-of-premises state (see §7).
- **No continuous GPS**, no features outside V1 (no payroll/fees/transport/parent
  app/face recognition).

---

## 14. For the backend (Java Spring Boot) developer

To replace the mock with the real backend:

1. Implement the endpoints in §§6–10 under `/api/v1` using the envelope in §5.
2. Use the exact `code` values in §5 — the client switches on them.
3. Issue real JWT access/refresh tokens; honor `Authorization: Bearer`.
4. Implement geofence + GPS-accuracy evaluation server-side (§7).
5. Point the client at the new base URL via `EXPO_PUBLIC_API_BASE_URL` — no
   client code changes required.
