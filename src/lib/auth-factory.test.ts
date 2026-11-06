import { memoryAdapter } from "better-auth/adapters/memory";
import { describe, expect, it } from "vitest";

import { createAuth, PUBLIC_SIGN_UP_ENABLED } from "@/lib/auth-factory";

describe("staff authentication", () => {
  it("keeps public registration disabled", () => {
    expect(PUBLIC_SIGN_UP_ENABLED).toBe(false);
  });

  it("rejects public sign-up, accepts a password, and drops revoked or disabled sessions", async () => {
    const database: Record<string, unknown[]> = {};
    const auth = createAuth({
      database: memoryAdapter(database),
      secret: "test-secret-test-secret-test-secret",
      baseURL: "http://localhost:3000",
      findUserStatus: async (userId) => {
        const users = (database.user ?? []) as Array<{ id: string; status?: string }>;
        return users.find((user) => user.id === userId)?.status ?? null;
      },
    });

    const signUp = await auth.api.signUpEmail({
      body: {
        email: "owner@example.com",
        password: "longpassword1",
        name: "Wlasciciel",
      },
      asResponse: true,
    });
    expect(signUp.status).toBeGreaterThanOrEqual(400);
    expect(await signUp.text()).not.toContain("longpassword1");

    const context = await auth.$context;
    const user = await context.internalAdapter.createUser(
      {
        email: "owner@example.com",
        name: "Wlasciciel",
        role: "owner",
        status: "active",
      },
      { method: "email-password" },
    );
    await context.internalAdapter.linkAccount({
      userId: user.id,
      providerId: "credential",
      accountId: user.id,
      password: await context.password.hash("longpassword1"),
    });

    const wrong = await auth.api.signInEmail({
      body: { email: "owner@example.com", password: "wrong-password1" },
      asResponse: true,
    });
    expect(wrong.ok).toBe(false);

    const signedIn = await auth.api.signInEmail({
      body: { email: "owner@example.com", password: "longpassword1" },
      asResponse: true,
    });
    expect(signedIn.ok).toBe(true);
    const cookie = signedIn.headers.get("set-cookie") ?? "";
    expect(cookie.toLowerCase()).toContain("httponly");
    const session = await auth.api.getSession({
      headers: new Headers({ cookie }),
    });
    expect(session?.user.email).toBe("owner@example.com");

    database.session = [];
    const revoked = await auth.api.getSession({
      headers: new Headers({ cookie }),
    });
    expect(revoked).toBeNull();

    const users = database.user as Array<{ id: string; status?: string }>;
    const stored = users.find((entry) => entry.id === user.id);
    if (stored) {
      stored.status = "disabled";
    }
    const blocked = await auth.api.signInEmail({
      body: { email: "owner@example.com", password: "longpassword1" },
      asResponse: true,
    });
    expect(blocked.ok).toBe(false);

    if (stored) {
      stored.status = "active";
    }
    const again = await auth.api.signInEmail({
      body: { email: "owner@example.com", password: "longpassword1" },
      asResponse: true,
    });
    expect(again.ok).toBe(true);
    const freshCookie = again.headers.get("set-cookie") ?? "";
    const sessions = database.session as Array<{ expiresAt: Date | string }>;
    for (const entry of sessions) {
      entry.expiresAt = new Date(Date.now() - 60_000);
    }
    const expired = await auth.api.getSession({
      headers: new Headers({ cookie: freshCookie }),
    });
    expect(expired).toBeNull();
  });
});
