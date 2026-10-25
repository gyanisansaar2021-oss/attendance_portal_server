/**
 * In-memory mock data. Deterministic test users so the two developers always
 * get the same login behavior. No real personal information is used.
 *
 * This is NOT a database and NOT production security — it exists only to let
 * the frontend develop against a realistic contract until the Spring Boot API
 * is ready.
 */

export type UserRole = 'TEACHER' | 'PRINCIPAL';

export interface MockUser {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  phone?: string;
  schoolId: string;
  isActive: boolean;
  /** Principal-only: plaintext password for dev login (mock only). */
  password?: string;
}

export const SCHOOL_ID = 'school_demo_001';

/** Fixed OTP every teacher receives in the mock — easy, deterministic dev login. */
export const FIXED_DEV_OTP = '123456';
export const OTP_TTL_SECONDS = 300;

export const users: MockUser[] = [
  {
    id: 'teacher_001',
    role: 'TEACHER',
    name: 'Rahul Kumar',
    email: 'rahul.kumar@school.example',
    phone: '9876543210',
    schoolId: SCHOOL_ID,
    isActive: true,
  },
  {
    id: 'teacher_002',
    role: 'TEACHER',
    name: 'Priya Sharma',
    email: 'priya.sharma@school.example',
    phone: '9876500000',
    schoolId: SCHOOL_ID,
    isActive: true,
  },
  {
    id: 'principal_001',
    role: 'PRINCIPAL',
    name: 'Anita Desai',
    email: 'principal@school.com',
    schoolId: SCHOOL_ID,
    isActive: true,
    password: 'password123',
  },
];

export function findTeacherByPhone(phone: string): MockUser | undefined {
  return users.find((u) => u.role === 'TEACHER' && u.phone === phone);
}

export function findPrincipalByEmail(email: string): MockUser | undefined {
  return users.find(
    (u) => u.role === 'PRINCIPAL' && u.email.toLowerCase() === email.toLowerCase(),
  );
}

export function findById(id: string): MockUser | undefined {
  return users.find((u) => u.id === id);
}

/** The public (safe) shape of a user returned to the client. */
export function toAuthUser(u: MockUser) {
  return {
    id: u.id,
    role: u.role,
    name: u.name,
    email: u.email,
    phone: u.phone,
    schoolId: u.schoolId,
    isActive: u.isActive,
  };
}
