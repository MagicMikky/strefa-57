import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

export const PUBLIC_SIGN_UP_ENABLED = false;

const staffFields = {
  role: {
    type: "string" as const,
    required: false,
    defaultValue: "employee",
    input: false,
  },
  status: {
    type: "string" as const,
    required: false,
    defaultValue: "active",
    input: false,
  },
  mfaEnrolled: {
    type: "boolean" as const,
    required: false,
    defaultValue: false,
    input: false,
  },
};

export function createAuth(options: {
  database: Parameters<typeof betterAuth>[0]["database"];
  findUserStatus: (userId: string) => Promise<string | null>;
  secret?: string;
  baseURL?: string;
  useNextCookies?: boolean;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const trustedOrigins = [
    options.baseURL,
    process.env.BETTER_AUTH_URL,
    siteUrl,
    "http://localhost:3000",
  ].filter((value): value is string => Boolean(value));

  return betterAuth({
    appName: "Paintball Strefa 29",
    secret: options.secret ?? process.env.BETTER_AUTH_SECRET,
    baseURL: options.baseURL ?? process.env.BETTER_AUTH_URL ?? siteUrl ?? "http://localhost:3000",
    trustedOrigins,
    database: options.database,
    emailAndPassword: {
      enabled: true,
      disableSignUp: !PUBLIC_SIGN_UP_ENABLED,
      minPasswordLength: 12,
      maxPasswordLength: 128,
    },
    user: {
      additionalFields: staffFields,
    },
    session: {
      expiresIn: 60 * 60 * 8,
      updateAge: 60 * 60,
      cookieCache: {
        enabled: false,
      },
    },
    rateLimit: {
      enabled: true,
      window: 60,
      max: 30,
      storage: "memory",
      customRules: {
        "/sign-in/email": {
          window: 10 * 60,
          max: 5,
        },
      },
    },
    advanced: {
      useSecureCookies: process.env.NODE_ENV === "production",
      defaultCookieAttributes: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    },
    databaseHooks: {
      session: {
        create: {
          before: async (session) => {
            try {
              const status = await options.findUserStatus(session.userId);
              if (status !== "active") {
                return false;
              }
            } catch {
              return false;
            }
            return { data: session };
          },
        },
      },
    },
    plugins: options.useNextCookies ? [nextCookies()] : [],
  });
}

export function isAuthConfigured(): boolean {
  const secret = process.env.BETTER_AUTH_SECRET?.trim() ?? "";
  return Boolean(process.env.DATABASE_URL && secret.length >= 32);
}
