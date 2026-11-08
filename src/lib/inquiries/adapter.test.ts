import { describe, expect, it } from "vitest";

import { POST as bootstrap } from "@/app/api/staff/bootstrap/route";
import { GET as authGet } from "@/app/api/auth/[...all]/route";
import { POST as notifications } from "@/app/api/internal/notifications/route";
import { POST as retention } from "@/app/api/internal/retention/route";
import { createPrismaInquiryRepository } from "@/lib/inquiries/prisma-repository";
import {
  inquiryContentHash,
  inquiryFromPayload,
  parseInquiryListQuery,
  resolveDedupeKey,
} from "@/lib/inquiries/model";
import { createInitialOwner, createStaffMember, setStaffStatus } from "@/lib/staff/accounts";
import { getAuth } from "@/lib/auth";
import type { ValidInquiry } from "@/lib/inquiry";

const inquiry = {
  playerCount: 8,
  preferredDate: "2027-06-01",
  preferredTime: "12:00",
  alternateDate: "",
  packageId: "pierwsza-misja",
  eventType: "znajomi",
  name: "Anna",
  preferredContact: "email",
  phone: "500600700",
  email: "anna@example.com",
  message: "Proszę o kontakt",
  privacyAccepted: true,
  website: "",
} as ValidInquiry;

describe("staff and inquiry edge paths", () => {
  it("parses list filters and idempotency keys", () => {
    expect(parseInquiryListQuery({ page: "2", pageSize: "500", sort: "updatedAt", direction: "asc", status: "closed", q: "a".repeat(90) })).toMatchObject({
      page: 2,
      pageSize: 50,
      sort: "updatedAt",
      direction: "asc",
      status: "closed",
    });
    expect(parseInquiryListQuery({ page: "0", status: "booked" }).status).toBe("");
    const first = resolveDedupeKey("abc", null);
    const second = resolveDedupeKey("abc", null);
    expect("dedupeKey" in first && first.dedupeKey).toMatch(/^submission:/);
    expect(first).not.toEqual(second);
    expect("error" in resolveDedupeKey("abc", "short")).toBe(true);
    expect(resolveDedupeKey("abc", "idempotency-key-1")).toEqual({
      dedupeKey: "idem:idempotency-key-1",
    });
  });

  it("rejects incomplete staff accounts before opening the database", async () => {
    await expect(createInitialOwner({ name: "A", email: "owner@example.com", password: "longpassword1" })).rejects.toThrow(/imię/i);
    await expect(createStaffMember({
      actorId: "owner",
      name: "Ola Nowak",
      email: "ola@example.com",
      password: "longpassword1",
      role: "owner",
    })).rejects.toThrow(/managera/);
    await expect(setStaffStatus({
      actorId: "same",
      userId: "same",
      status: "disabled",
    })).rejects.toThrow(/własnego/);
  });

  it("hides auth and retention routes when secrets are absent", async () => {
    delete process.env.DATABASE_URL;
    delete process.env.BETTER_AUTH_SECRET;
    delete process.env.NOTIFICATION_WORKER_TOKEN;
    expect((await authGet(new Request("http://localhost:3000/api/auth/ok"))).status).toBe(503);
    expect(getAuth).toThrow(/not configured/);
    expect((await retention(new Request("http://localhost:3000/api/internal/retention", { method: "POST" }))).status).toBe(404);
    process.env.STAFF_BOOTSTRAP_TOKEN = "short";
    expect((await bootstrap(new Request("http://localhost:3000/api/staff/bootstrap", { method: "POST" }))).status).toBe(404);
    delete process.env.STAFF_BOOTSTRAP_TOKEN;
  });

  it("keeps the legacy e-mail worker permanently disabled", async () => {
    process.env.NOTIFICATION_WORKER_TOKEN = "a".repeat(32);
    const response = await notifications();
    expect(response.status).toBe(410);
    expect(await response.json()).toMatchObject({ ok: false });
    delete process.env.NOTIFICATION_WORKER_TOKEN;
  });

});

describe("prisma inquiry repository", () => {
  it("saves, updates, lists and purges through the database adapter", async () => {
    const rows: Array<Record<string, unknown>> = [];
    const audits: unknown[] = [];
    const db = fakeDb(rows, audits);
    const repository = createPrismaInquiryRepository(db as never);
    const hash = inquiryContentHash(inquiry);
    const created = await repository.createIfAbsent({
      record: inquiryFromPayload(inquiry, hash, hash),
    });
    expect(created.created).toBe(true);
    const again = await repository.createIfAbsent({
      record: inquiryFromPayload(inquiry, hash, hash),
    });
    expect(again.created).toBe(false);

    const changed = await repository.setStatus(created.record.id, "waiting_for_customer", {
      id: "staff-1",
      name: "Ola",
    });
    expect(changed.status).toBe("waiting_for_customer");
    const assigned = await repository.assign(created.record.id, { id: "staff-1", name: "Ola" }, {
      id: "staff-1",
      name: "Ola",
    });
    expect(assigned.assigneeName).toBe("Ola");
    const noted = await repository.addNote(created.record.id, {
      authorId: "staff-1",
      authorName: "Ola",
      body: "Notatka",
    });
    expect(noted.notes).toHaveLength(1);
    expect((await repository.list({
      q: "anna",
      status: "waiting_for_customer",
      sort: "createdAt",
      direction: "desc",
      page: 1,
      pageSize: 10,
    })).total).toBe(1);
    expect((await repository.counts()).waiting).toBe(1);
    expect(await repository.recent(5)).toHaveLength(1);
    expect((await repository.recentHistory(5))[0]?.action).toBeTruthy();
    expect(created.record.notifications).toEqual([]);
    expect((await repository.listStaff())[0]?.name).toBe("Ola");
    expect(await repository.deleteOlderThan(new Date(Date.now() + 60_000))).toBe(1);
    expect(await repository.get(created.record.id)).toBeNull();
    expect(audits).toEqual([]);
  });
});

function fakeDb(rows: Array<Record<string, unknown>>, audits: unknown[]) {
  const decorate = (row: Record<string, unknown>) => ({
    assignee: row.assigneeId ? { name: "Ola" } : null,
    notes: (row.notes as unknown[]) ?? [],
    history: (row.history as unknown[]) ?? [],
    notifications: (row.notifications as unknown[]) ?? [],
    ...row,
  });

  return {
    confirmedSlot: { findMany: async () => [] },
    inquiry: {
      findUnique: async ({ where }: { where: { id?: string; dedupeKey?: string } }) => {
        const row = rows.find((item) => item.id === where.id || item.dedupeKey === where.dedupeKey);
        return row ? decorate(row) : null;
      },
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const history = (data.history as { create: Record<string, unknown> }).create;
        const createdAt = new Date();
        const stored = {
          ...data,
          createdAt,
          updatedAt: createdAt,
          assigneeId: null,
          notes: [],
          history: [{ ...history, actorId: null, actor: null, fromStatus: null, createdAt }],
          notifications: [],
        };
        rows.push(stored);
        return decorate(stored);
      },
      count: async ({ where }: { where?: { status?: string; OR?: unknown[] } }) =>
        rows.filter((row) => !where?.status || row.status === where.status).length,
      findMany: async () => rows.map((row) => decorate(row)),
      update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const row = rows.find((item) => item.id === where.id);
        if (!row) {
          throw new Error("missing");
        }
        if (typeof data.status === "string") {
          row.status = data.status;
        }
        if ("assigneeId" in data) {
          row.assigneeId = data.assigneeId;
        }
        const history = data.history as { create?: Record<string, unknown> } | undefined;
        if (history?.create) {
          (row.history as unknown[]).push({
            ...history.create,
            actor: { name: "Ola" },
            fromStatus: history.create.fromStatus ?? row.status,
            toStatus: history.create.toStatus ?? row.status,
            createdAt: new Date(),
          });
        }
        const notes = data.notes as { create?: Record<string, unknown> } | undefined;
        if (notes?.create) {
          (row.notes as unknown[]).push({
            ...notes.create,
            author: { name: "Ola" },
            createdAt: new Date(),
          });
        }
        row.updatedAt = new Date();
        return decorate(row);
      },
      deleteMany: async () => {
        const count = rows.length;
        rows.splice(0, rows.length);
        return { count };
      },
    },
    inquiryHistory: {
      findMany: async () =>
        rows.flatMap((row) =>
          ((row.history as Array<Record<string, unknown>>) ?? []).map((entry) => ({
            ...entry,
            inquiryId: row.id,
            actor: entry.actor ?? null,
          })),
        ),
    },
    user: {
      findMany: async () => [{ id: "staff-1", name: "Ola", role: "employee", status: "active" }],
    },
    staffAudit: { create: async ({ data }: { data: unknown }) => audits.push(data) },
  };
}
