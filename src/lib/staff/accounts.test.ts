import { beforeEach, describe, expect, it, vi } from "vitest";

const count = vi.fn();
const create = vi.fn();

vi.mock("@/lib/prisma", () => ({
  getPrisma: () => ({
    user: { count, create },
  }),
}));

import { createInitialOwner, StaffAccessError } from "@/lib/staff/accounts";

beforeEach(() => {
  count.mockReset();
  create.mockReset();
});

describe("createInitialOwner", () => {
  it("turns a unique-owner collision into a conflict", async () => {
    count.mockResolvedValueOnce(0).mockResolvedValueOnce(1);
    create.mockRejectedValue(Object.assign(new Error("unique"), { code: "P2002" }));

    const error = await createInitialOwner({
      name: "Kopik1230",
      login: "Kopik1230",
      password: "longpassword1",
    }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(StaffAccessError);
    expect(error).toMatchObject({ status: 409, message: "Konto właściciela już istnieje." });
  });
});
