import { beforeEach, describe, expect, it, vi } from "vitest";

const { state, getSession, findUnique, deleteMany } = vi.hoisted(() => ({
  state: { configured: true },
  getSession: vi.fn(),
  findUnique: vi.fn(),
  deleteMany: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: async () => new Headers(),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));

vi.mock("@/lib/auth", () => ({
  isAuthConfigured: () => state.configured,
  getAuth: () => ({ api: { getSession } }),
}));

vi.mock("@/lib/prisma", () => ({
  getPrisma: () => ({
    user: { findUnique },
    session: { deleteMany },
  }),
}));

import { requireStaff } from "@/lib/staff/session";

const owner = {
  id: "owner-1",
  name: "Kopik1230",
  email: "kopik1230@staff.invalid",
  role: "owner",
  status: "active",
};

async function destination(permission?: Parameters<typeof requireStaff>[0]) {
  try {
    await requireStaff(permission);
    return "";
  } catch (error) {
    return error instanceof Error ? error.message : "unknown";
  }
}

beforeEach(() => {
  state.configured = true;
  getSession.mockReset();
  findUnique.mockReset();
  deleteMany.mockReset();
  getSession.mockResolvedValue({ user: { id: owner.id } });
  findUnique.mockResolvedValue(owner);
  deleteMany.mockResolvedValue({ count: 1 });
});

describe("requireStaff", () => {
  it("sends an unconfigured panel to login", async () => {
    state.configured = false;
    expect(await destination()).toBe("REDIRECT:/panel/logowanie?error=config");
    expect(getSession).not.toHaveBeenCalled();
  });

  it("sends a missing session to login", async () => {
    getSession.mockResolvedValue(null);
    expect(await destination()).toBe("REDIRECT:/panel/logowanie");
  });

  it("drops the session when the account is missing or disabled", async () => {
    findUnique.mockResolvedValue({ ...owner, status: "disabled" });
    expect(await destination()).toBe("REDIRECT:/panel/logowanie?error=disabled");
    expect(deleteMany).toHaveBeenCalledWith({ where: { userId: owner.id } });
  });

  it("rejects a role that is not staff", async () => {
    findUnique.mockResolvedValue({ ...owner, role: "customer" });
    expect(await destination()).toBe("REDIRECT:/panel/logowanie?error=staff");
  });

  it("rejects an employee who tries to publish", async () => {
    findUnique.mockResolvedValue({ ...owner, role: "employee" });
    expect(await destination("business.publish")).toBe("REDIRECT:/panel?error=forbidden");
  });

  it("returns the owner when the permission matches", async () => {
    const staff = await requireStaff("business.publish");
    expect(staff).toEqual({
      id: owner.id,
      name: owner.name,
      email: owner.email,
      role: "owner",
    });
    expect(deleteMany).not.toHaveBeenCalled();
  });
});
