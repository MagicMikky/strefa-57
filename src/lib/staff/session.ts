import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getAuth, isAuthConfigured } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import {
  can,
  isStaffRole,
  type Permission,
  type StaffRole,
} from "@/lib/staff/permissions";

export interface StaffSession {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
}

export async function requireStaff(permission?: Permission): Promise<StaffSession> {
  if (!isAuthConfigured()) {
    redirect("/panel/logowanie?error=config");
  }

  let session: Awaited<ReturnType<ReturnType<typeof getAuth>["api"]["getSession"]>>;
  try {
    session = await getAuth().api.getSession({ headers: await headers() });
  } catch {
    redirect("/panel/logowanie?error=config");
  }

  if (!session?.user) {
    redirect("/panel/logowanie");
  }

  const user = await getPrisma().user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true, status: true },
  });

  if (!user || user.status !== "active" || !isStaffRole(user.role)) {
    await getPrisma().session.deleteMany({ where: { userId: session.user.id } });
    redirect("/panel/logowanie?error=disabled");
  }

  if (permission && !can(user.role, permission)) {
    redirect("/panel?error=forbidden");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
