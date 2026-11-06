import { beforeEach, describe, expect, it, vi } from "vitest";

const findUnique = vi.fn();
const signInEmail = vi.fn();

vi.mock("@/lib/prisma", () => ({
  getPrisma: () => ({
    user: { findUnique },
  }),
}));

vi.mock("@/lib/auth", () => ({
  isAuthConfigured: () =>
    Boolean(process.env.DATABASE_URL && (process.env.BETTER_AUTH_SECRET ?? "").trim().length >= 32),
  getAuth: () => ({
    api: { signInEmail },
  }),
}));

import { POST } from "./route";

const secret = "test-secret-test-secret-test-secret";

function request(body: unknown) {
  return new Request("http://localhost:3000/api/staff/sign-in", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  findUnique.mockReset();
  signInEmail.mockReset();
  process.env.DATABASE_URL = "postgresql://test:test@127.0.0.1:5432/strefa";
  process.env.BETTER_AUTH_SECRET = secret;
});

describe("POST /api/staff/sign-in", () => {
  it("stays unavailable until the database and session secret exist", async () => {
    delete process.env.DATABASE_URL;
    const response = await POST(request({ login: "kopik1230", password: "longpassword1" }));
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("longpassword1");
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("rejects a malformed login before looking it up", async () => {
    const response = await POST(request({ login: "a", password: "longpassword1" }));
    expect(response.status).toBe(401);
    expect(findUnique).not.toHaveBeenCalled();
    expect(await response.text()).not.toContain("longpassword1");
  });

  it("rejects an unknown login and a missing password the same way", async () => {
    findUnique.mockResolvedValue(null);
    const unknown = await POST(request({ login: "Kopik1230", password: "longpassword1" }));
    const missing = await POST(request({ login: "Kopik1230", password: "" }));
    expect(unknown.status).toBe(401);
    expect(missing.status).toBe(401);
    expect(findUnique).toHaveBeenCalledWith({
      where: { login: "kopik1230" },
      select: { email: true },
    });
    expect(signInEmail).not.toHaveBeenCalled();
  });

  it("signs in through the stored staff email and does not echo the password", async () => {
    findUnique.mockResolvedValue({ email: "kopik1230@staff.invalid" });
    signInEmail.mockResolvedValue(new Response(null, { status: 200 }));
    const response = await POST(request({ login: "Kopik1230", password: "longpassword1" }));
    expect(response.status).toBe(200);
    expect(signInEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        body: { email: "kopik1230@staff.invalid", password: "longpassword1" },
      }),
    );
    expect(await response.text()).not.toContain("longpassword1");
  });
});
