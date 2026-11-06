import { describe, expect, it } from "vitest";

import type { PrismaClient } from "@prisma/client";

import { initialBusinessSettings } from "@/lib/business/model";
import { readPublicSchedule } from "@/lib/schedule/public";
import { fallbackSchedule } from "@/lib/schedule/model";
import { publishScheduleDraft, readScheduleSlot, saveScheduleDraft } from "@/lib/schedule/store";

interface MemoryDatabase {
  scheduleCatalog: {
    findUnique(args: { where: { id: string } }): Promise<Record<string, unknown> | null>;
    upsert(args: { where: { id: string }; create: Record<string, unknown>; update: Record<string, unknown> }): Promise<Record<string, unknown>>;
  };
  contentRevision: { create(args: { data: Record<string, unknown> }): Promise<void> };
  configChangeAudit: { create(args: { data: Record<string, unknown> }): Promise<void> };
  $transaction(run: (client: MemoryDatabase) => Promise<void>): Promise<void>;
}

function memoryDatabase() {
  const rows = new Map<string, Record<string, unknown>>();
  const audits: Array<Record<string, unknown>> = [];
  const db: MemoryDatabase = {
    scheduleCatalog: {
      async findUnique({ where }) { return rows.get(where.id) ?? null; },
      async upsert({ where, create, update }) {
        const next = rows.has(where.id) ? { ...rows.get(where.id), ...update } : create;
        rows.set(where.id, next);
        return next;
      },
    },
    contentRevision: { async create() { return undefined; } },
    configChangeAudit: { async create({ data }) { audits.push(data); } },
    async $transaction(run) { await run(db); },
  };
  return { db: db as unknown as PrismaClient, audits };
}

describe("schedule publication", () => {
  it("keeps a block private until publish and records the actor", async () => {
    const { db, audits } = memoryDatabase();
    const times = initialBusinessSettings.slotStartTimes;
    const draft = fallbackSchedule();
    draft.blocks.push({ date: "2026-12-24", slot: "11:00", reason: "Serwis" });
    expect((await publishScheduleDraft(db, "owner-1", times)).ok).toBe(false);
    await saveScheduleDraft(db, "owner-1", draft, times);
    expect(await readScheduleSlot(db, "published", times)).toBeNull();
    expect((await publishScheduleDraft(db, "owner-1", times)).ok).toBe(true);
    expect((await readScheduleSlot(db, "published", times))?.blocks[0]?.reason).toBe("Serwis");
    expect(audits.some((item) => item.action === "publish" && item.actorId === "owner-1")).toBe(true);
  });

  it("returns no invented closures when the database fails", async () => {
    await expect(readPublicSchedule(false, async () => { throw new Error("draft"); })).resolves.toEqual(fallbackSchedule());
    await expect(readPublicSchedule(true, async () => { throw new Error("offline"); })).resolves.toEqual({ weekdays: [], blocks: [] });
  });
});
