import { timingSafeEqual } from "node:crypto";

export const STAFF_ROLES = ["owner", "manager", "employee"] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

export const PERMISSIONS = [
  "inquiries.read",
  "inquiries.update",
  "inquiries.assign",
  "inquiries.note",
  "staff.manage",
  "settings.manage",
  "business.publish",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const matrix: Record<StaffRole, ReadonlySet<Permission>> = {
  owner: new Set(PERMISSIONS),
  manager: new Set([
    "inquiries.read",
    "inquiries.update",
    "inquiries.assign",
    "inquiries.note",
  ]),
  // business.publish stays with the owner. Managers do not publish company data.
  employee: new Set(["inquiries.read", "inquiries.note"]),
};

export function isStaffRole(value: string): value is StaffRole {
  return (STAFF_ROLES as readonly string[]).includes(value);
}

export function can(role: string, permission: Permission): boolean {
  if (!isStaffRole(role)) {
    return false;
  }
  return matrix[role].has(permission);
}

export type AccessDecision = "ok" | "unauthenticated" | "forbidden";

export function authorize(
  role: string | null | undefined,
  permission: Permission,
): AccessDecision {
  if (!role) {
    return "unauthenticated";
  }
  return can(role, permission) ? "ok" : "forbidden";
}

export function secretsMatch(expected: string, provided: string): boolean {
  const left = Buffer.from(expected);
  const right = Buffer.from(provided);
  if (left.length !== right.length) {
    timingSafeEqual(left, left);
    return false;
  }
  return timingSafeEqual(left, right);
}

export function passwordProblem(password: string): string | null {
  if (password.length < 12 || password.length > 128) {
    return "Hasło musi mieć od 12 do 128 znaków.";
  }
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    return "Hasło musi zawierać literę i cyfrę.";
  }
  return null;
}

export function emailProblem(email: string): string | null {
  const value = email.trim().toLowerCase();
  if (value.length < 6 || value.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "Podaj prawidłowy adres e-mail.";
  }
  return null;
}
