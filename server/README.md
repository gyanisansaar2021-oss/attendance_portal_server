# School Attendance Management System — Backend API

**Base URL**: `http://localhost:48120`  
**Swagger UI**: http://localhost:48120/swagger-ui.html  
**OpenAPI JSON**: http://localhost:48120/v3/api-docs

---

## Quick Start

### Prerequisites
- Java 21
- Maven 3.9+
- Docker & Docker Compose

### Run locally
```bash
# Start MongoDB
docker-compose up -d

# Build & run
cd app
mvn spring-boot:run
```

### MongoDB Connection (Compass / Mongo Express)
```
mongodb://admin:admin123@localhost:27017/?authSource=admin
```
- **Database**: `aps`
- **Mongo Express UI**: http://localhost:8081 (admin / admin123)

---

## API Response Format

Every endpoint returns a consistent JSON envelope:

```json
{
  "success": true,
  "message": "Human-readable message",
  "data": { },
  "errors": null,
  "timestamp": "2026-10-25T11:53:34.215Z"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | `true` for 2xx, `false` for errors |
| `message` | string | Description of the result |
| `data` | object/array/null | Response payload |
| `errors` | object/null | Validation errors (field → message map) |
| `timestamp` | ISO 8601 | Server timestamp |

### Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "name": "School name is required",
    "code": "Code must be 3-20 uppercase alphanumeric characters or hyphens"
  },
  "timestamp": "2026-10-25T12:00:00.000Z"
}
```

### HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created (check `Location` header for new resource URL) |
| 400 | Validation error or bad request |
| 401 | Not authenticated |
| 403 | Not authorized |
| 404 | Resource not found |
| 409 | Conflict (duplicate, already exists, concurrent update) |
| 500 | Server error |

### Correlation ID
Every request/response includes an `X-Correlation-ID` header. Send your own or the server generates one. Use it for debugging.

---

## 1. Health and Ping

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/actuator/health` | No | Health check with MongoDB status |
| GET | `/api/v1/ping` | No | Smoke test — returns `"pong"` |

---

## 2. Auth — OTP

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/otp/send` | No | Send OTP to mobile |
| POST | `/api/v1/auth/otp/verify` | No | Verify OTP |

### POST `/api/v1/auth/otp/send`
**Request:**
```json
{ "mobileNumber": "+919876543210" }
```
**Response (200):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "OTP sent successfully",
    "mobileNumber": "+919876543210",
    "expiresInSeconds": 300
  }
}
```
> OTP is printed in the server console for testing.

### POST `/api/v1/auth/otp/verify`
**Request:**
```json
{ "mobileNumber": "+919876543210", "otp": "123456" }
```

---

## 3. School Management

**Base path**: `/api/v1/schools`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/schools` | Create a school |
| GET | `/api/v1/schools` | List all active schools |
| GET | `/api/v1/schools/{id}` | Get school by ID |
| GET | `/api/v1/schools/code/{code}` | Get school by code |
| PUT | `/api/v1/schools/{id}` | Update school details |
| PATCH | `/api/v1/schools/{id}/settings` | Update school settings |
| POST | `/api/v1/schools/{id}/deactivate` | Deactivate school |
| POST | `/api/v1/schools/{id}/activate` | Activate school |

### Create School
**POST** `/api/v1/schools`
```json
{
  "name": "Springfield Elementary",
  "code": "SPR-001",
  "contactEmail": "admin@springfield.edu",
  "contactPhone": "+11234567890",
  "timezone": "America/Chicago",
  "address": {
    "street": "742 Evergreen Terrace",
    "city": "Springfield",
    "state": "IL",
    "zipCode": "62704",
    "country": "US"
  },
  "coordinates": { "latitude": 39.7817, "longitude": -89.6501 }
}
```
| Field | Required | Validation |
|-------|----------|------------|
| `name` | Yes | 2-200 characters |
| `code` | Yes | 3-20 uppercase alphanumeric/hyphens, **unique** |
| `contactEmail` | Yes | Valid email |
| `contactPhone` | No | International format `+XXXXXXXXXXX` |
| `timezone` | Yes | Valid IANA timezone (e.g. `Asia/Kolkata`) |
| `address` | No | street, city, state, zipCode, country |
| `coordinates` | No | latitude (-90 to 90), longitude (-180 to 180) |

> `code` is **immutable** after creation.

### Update School Settings
**PATCH** `/api/v1/schools/{id}/settings`
```json
{
  "timezone": "Asia/Kolkata",
  "attendanceStartTime": "08:30",
  "lateThresholdMinutes": 20,
  "workingDays": ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"],
  "maxAbsencesBeforeAlert": 5,
  "parentNotificationsEnabled": true,
  "geofence": {
    "enabled": true,
    "radiusMeters": 300,
    "center": { "latitude": 12.97, "longitude": 77.59 }
  }
}
```
All fields optional — send only what you want to change.

| Setting | Type | Validation |
|---------|------|------------|
| `timezone` | string | Valid IANA timezone |
| `attendanceStartTime` | string | `HH:mm` format |
| `lateThresholdMinutes` | int | 1–120 |
| `workingDays` | string[] | MONDAY through SUNDAY |
| `maxAbsencesBeforeAlert` | int | 1–30 |
| `geofence.radiusMeters` | double | 50–5000 meters |

---

## 4. Teacher Management

**Base path**: `/api/v1/schools/{schoolId}/teachers`

> All teacher endpoints are school-scoped. Teachers in school A are invisible from school B.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `.../teachers` | Create teacher |
| GET | `.../teachers` | List teachers (paginated) |
| GET | `.../teachers/{id}` | Get teacher by ID |
| PUT | `.../teachers/{id}` | Update teacher |
| POST | `.../teachers/{id}/deactivate` | Deactivate (soft delete) |
| POST | `.../teachers/{id}/activate` | Re-activate |
| POST | `.../teachers/{id}/profile-image/upload-url` | Get S3 presigned upload URL |
| POST | `.../teachers/{id}/profile-image/confirm` | Confirm image upload |

### Create Teacher
**POST** `/api/v1/schools/{schoolId}/teachers`
```json
{
  "employeeCode": "TCH-001",
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@springfield.edu",
  "phone": "+11234567891",
  "designation": "Senior Teacher",
  "department": "Mathematics",
  "dateOfJoining": "2020-06-15",
  "qualifications": ["M.Sc Mathematics", "B.Ed"],
  "subjects": ["MATH", "SCIENCE"]
}
```
| Field | Required | Validation |
|-------|----------|------------|
| `employeeCode` | Yes | 3-20 uppercase alphanumeric/hyphens, **unique per school** |
| `firstName` | Yes | 1-100 chars |
| `lastName` | Yes | 1-100 chars |
| `email` | Yes | Valid email, **unique per school** |
| `phone` | No | International format, **unique per school** |
| `designation` | No | Max 100 chars |
| `department` | No | Max 100 chars |
| `dateOfJoining` | No | `YYYY-MM-DD` |
| `qualifications` | No | String array |
| `subjects` | No | String array |

### List Teachers (Paginated + Search)
**GET** `/api/v1/schools/{schoolId}/teachers?page=0&size=20&sortBy=lastName&sortDir=asc&search=jane&activeOnly=true`

| Param | Default | Description |
|-------|---------|-------------|
| `page` | 0 | Page number (0-indexed) |
| `size` | 20 | Page size |
| `sortBy` | lastName | Sort field |
| `sortDir` | asc | `asc` or `desc` |
| `activeOnly` | true | Filter by active status |
| `search` | — | Search by name, employee code, or email |

**Response:**
```json
{
  "success": true,
  "data": {
    "teachers": [ { ... } ],
    "page": 0,
    "size": 20,
    "totalElements": 42,
    "totalPages": 3
  }
}
```

---

## 5. Student Management

**Base path**: `/api/v1/schools/{schoolId}/students`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `.../students` | Create student |
| GET | `.../students` | List students (paginated) |
| GET | `.../students/{id}` | Get student by ID |
| PUT | `.../students/{id}` | Update student |
| POST | `.../students/{id}/deactivate` | Deactivate (preserves history) |
| POST | `.../students/{id}/activate` | Re-activate |

### Create Student
**POST** `/api/v1/schools/{schoolId}/students`
```json
{
  "admissionNumber": "STU-2024-001",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "2012-05-15",
  "gender": "MALE",
  "guardianName": "Jane Doe",
  "guardianPhone": "+11234567892",
  "guardianEmail": "jane.doe@gmail.com",
  "bloodGroup": "O+",
  "medicalNotes": "No known allergies"
}
```
| Field | Required | Validation |
|-------|----------|------------|
| `admissionNumber` | Yes | 3-30 uppercase alphanumeric/hyphens, **unique per school** |
| `firstName` | Yes | 1-100 chars |
| `lastName` | Yes | 1-100 chars |
| `dateOfBirth` | Yes | `YYYY-MM-DD`, must be in the past |
| `gender` | No | `MALE`, `FEMALE`, or `OTHER` |
| `guardianName` | Yes | 1-200 chars |
| `guardianPhone` | Yes | International format |
| `guardianEmail` | No | Valid email |

Pagination works the same as teachers — `page`, `size`, `sortBy`, `sortDir`, `search`, `activeOnly`.

---

## 6. Student Enrollment

**Base path**: `/api/v1/schools/{schoolId}/students/{studentId}/enrollments`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `.../enrollments` | Enroll in academic year + class + section |
| GET | `.../enrollments` | Get full enrollment history |
| POST | `.../enrollments/{id}/withdraw` | Withdraw from enrollment |
| POST | `.../enrollments/{id}/promote` | Promote to next year/class |
| POST | `.../enrollments/{id}/transfer` | Transfer to another section |

### Enroll Student
**POST** `.../enrollments`
```json
{
  "academicYearId": "...",
  "classId": "cls-5",
  "sectionId": "sec-a",
  "rollNumber": "01"
}
```
> `classId` and `sectionId` must exist in the academic year's embedded structure.  
> One active enrollment per academic year per student.

### Withdraw
**POST** `.../enrollments/{id}/withdraw?reason=Family relocated`

### Promote
**POST** `.../enrollments/{id}/promote`
```json
{
  "targetAcademicYearId": "...",
  "targetClassId": "cls-6",
  "targetSectionId": "sec-a",
  "rollNumber": "05"
}
```
> Marks current as `PROMOTED`, creates new `ACTIVE` enrollment.

### Transfer Section
**POST** `.../enrollments/{id}/transfer?targetClassId=cls-5&targetSectionId=sec-b`

### Enrollment Status Flow
```
ACTIVE  →  WITHDRAWN   (student leaves)
ACTIVE  →  PROMOTED    (moves to next year/class)
ACTIVE  →  TRANSFERRED (section change)
ACTIVE  →  GRADUATED   (completes school)
```

### Enrollment Response
```json
{
  "id": "...",
  "schoolId": "...",
  "academicYearId": "...",
  "studentId": "...",
  "classId": "cls-5",
  "className": "Grade 5",
  "sectionId": "sec-a",
  "sectionName": "Section A",
  "rollNumber": "01",
  "status": "ACTIVE",
  "statusReason": null,
  "enrolledAt": "2026-10-25T12:00:00Z",
  "withdrawnAt": null
}
```

---

## MongoDB Collections

Database: **`aps`**

| Collection | Description |
|------------|-------------|
| `schools` | School profiles with embedded settings |
| `users` | User accounts (auth) |
| `refresh_tokens` | JWT refresh token sessions (TTL indexed) |
| `teachers` | Teacher profiles |
| `students` | Student profiles |
| `academic_years` | Year definitions with embedded classes/sections/subjects |
| `enrollments` | Student enrollments per academic year |
| `teacher_assignments` | Teacher-subject-section assignments |
| `timetable_slots` | Weekly timetable schedule |
| `class_sessions` | Individual class session events |
| `student_attendance` | Per-student per-session attendance |
| `teacher_attendance` | Daily teacher attendance |
| `substitutions` | Substitution requests |
| `notifications` | Notifications (TTL indexed) |
| `audit_events` | Audit log (TTL indexed) |

---

## Important Notes for Frontend

1. **School ID is in the URL path** for all teacher/student/enrollment APIs.
2. **Pagination** is 0-indexed — `page=0` is the first page.
3. **Deactivation** is soft-delete — records stay, `active` becomes `false`.
4. **Deactivated schools** block all mutations (can't create/update teachers, students, etc.).
5. **Unique fields** — duplicates within a school return `409 Conflict`.
6. **Null fields are omitted** from JSON responses.
7. **Dates**: ISO 8601 — `2026-10-25T11:53:34.139Z` for timestamps, `2026-10-25` for dates.
8. **Auth** — currently open for testing. JWT will be added later.

---

## Tech Stack

- Java 21, Spring Boot 3.3.4
- Spring Data MongoDB, Spring Security
- MongoDB 7.0
- Bean Validation (Jakarta)
- OpenAPI 3 (Springdoc)
- Lombok, ModelMapper
