import { prismaAdapter } from "better-auth/adapters/prisma";

import { createAuth, isAuthConfigured } from "@/lib/auth-factory";
import { getPrisma } from "@/lib/prisma";

type Auth = ReturnType<typeof createAuth>;

const globalForAuth = globalThis as typeof globalThis & { staffAuth?: Auth };

export function getAuth(): Auth {
  if (!isAuthConfigured()) {
    throw new Error("Staff authentication is not configured");
  }
  if (!globalForAuth.staffAuth) {
    const prisma = getPrisma();
    globalForAuth.staffAuth = createAuth({
      database: prismaAdapter(prisma, { provider: "postgresql" }),
      useNextCookies: true,
      findUserStatus: async (userId) => {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { status: true },
        });
        return user?.status ?? null;
      },
    });
  }
  return globalForAuth.staffAuth;
}

export { isAuthConfigured };
