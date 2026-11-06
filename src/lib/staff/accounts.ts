import { randomUUID } from "node:crypto";

import { hashPassword } from "better-auth/crypto";

import { getPrisma } from "@/lib/prisma";
import {
  emailProblem,
  isStaffRole,
  loginProblem,
  normalizeLogin,
  passwordProblem,
  secretsMatch,
  staffEmailForLogin,
  type StaffRole,
} from "@/lib/staff/permissions";

export class StaffAccessError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "StaffAccessError";
  }
}

export function configuredSecret(name: string): string | null {
  const value = process.env[name]?.trim() ?? "";
  return value.length >= 32 ? value : null;
}

export function assertBearer(request: Request, secretName: string): void {
  const expected = configuredSecret(secretName);
  if (!expected) {
    throw new StaffAccessError(404, "Ten adres nie jest dostępny.");
  }
  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!provided || !secretsMatch(expected, provided)) {
    throw new StaffAccessError(401, "Brak autoryzacji.");
  }
}

export async function createInitialOwner(input: {
  name: string;
  email?: string;
  login?: string;
  password: string;
}): Promise<{ id: string }> {
  const name = input.name.trim();
  if (name.length < 2 || name.length > 100) {
    throw new StaffAccessError(422, "Podaj imię i nazwisko.");
  }
  const login = input.login?.trim() ? normalizeLogin(input.login) : "";
  if (login) {
    const loginError = loginProblem(login);
    if (loginError) throw new StaffAccessError(422, loginError);
  }
  const email = (input.email?.trim() ? input.email : login ? staffEmailForLogin(login) : "").toLowerCase();
  const emailError = emailProblem(email);
  if (emailError) {
    throw new StaffAccessError(422, emailError);
  }
  const passwordError = passwordProblem(input.password);
  if (passwordError) {
    throw new StaffAccessError(422, passwordError);
  }

  const prisma = getPrisma();
  const owners = await prisma.user.count({ where: { role: "owner" } });
  if (owners > 0) {
    throw new StaffAccessError(409, "Konto właściciela już istnieje.");
  }

  const id = randomUUID();
  const password = await hashPassword(input.password);
  await prisma.user.create({
    data: {
      id,
      name,
      email,
      login: login || null,
      emailVerified: true,
      role: "owner",
      status: "active",
      accounts: {
        create: {
          id: randomUUID(),
          accountId: id,
          providerId: "credential",
          password,
        },
      },
      staffAudits: {
        create: {
          id: randomUUID(),
          action: "owner_bootstrapped",
          targetId: id,
        },
      },
    },
  });
  return { id };
}

export async function createStaffMember(input: {
  actorId: string;
  name: string;
  email: string;
  password: string;
  role: string;
}): Promise<{ id: string }> {
  if (input.role !== "manager" && input.role !== "employee") {
    throw new StaffAccessError(422, "Można utworzyć konto managera albo pracownika.");
  }
  const name = input.name.trim();
  if (name.length < 2 || name.length > 100) {
    throw new StaffAccessError(422, "Podaj imię i nazwisko.");
  }
  const emailError = emailProblem(input.email);
  if (emailError) {
    throw new StaffAccessError(422, emailError);
  }
  const passwordError = passwordProblem(input.password);
  if (passwordError) {
    throw new StaffAccessError(422, passwordError);
  }

  const prisma = getPrisma();
  const email = input.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    throw new StaffAccessError(409, "Pracownik z tym adresem już istnieje.");
  }
  const id = randomUUID();
  const password = await hashPassword(input.password);
  const role: StaffRole = isStaffRole(input.role) ? input.role : "employee";
  await prisma.user.create({
    data: {
      id,
      name,
      email,
      emailVerified: true,
      role,
      status: "active",
      accounts: {
        create: {
          id: randomUUID(),
          accountId: id,
          providerId: "credential",
          password,
        },
      },
    },
  });
  await prisma.staffAudit.create({
    data: {
      id: randomUUID(),
      actorId: input.actorId,
      action: "staff_created",
      targetId: id,
    },
  });
  return { id };
}

export async function setStaffStatus(input: {
  actorId: string;
  userId: string;
  status: "active" | "disabled";
}): Promise<void> {
  if (input.actorId === input.userId && input.status === "disabled") {
    throw new StaffAccessError(422, "Nie można zablokować własnego konta.");
  }
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { id: true, role: true },
  });
  if (!user) {
    throw new StaffAccessError(404, "Nie znaleziono pracownika.");
  }
  if (user.role === "owner" && input.status === "disabled") {
    throw new StaffAccessError(422, "Konta właściciela nie blokuje się z panelu.");
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { status: input.status },
  });
  if (input.status === "disabled") {
    await prisma.session.deleteMany({ where: { userId: user.id } });
  }
  await prisma.staffAudit.create({
    data: {
      id: randomUUID(),
      actorId: input.actorId,
      action: input.status === "disabled" ? "staff_disabled" : "staff_enabled",
      targetId: user.id,
    },
  });
}
