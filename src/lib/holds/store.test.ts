import { describe, expect, it } from "vitest";

import type { PrismaClient } from "@prisma/client";

import { fallbackBusiness } from "@/lib/business/model";
import { createCapacityHold } from "@/lib/holds/store";
import { readPublicCapacityHolds } from "@/lib/holds/public";
import type { HoldRequest } from "@/lib/holds/model";

interface HoldRow {
  id: string;
  idempotencyKey: string;
  date: string;
  slot: string;
  players: number;
  teams: number;
  privateSlot: boolean;
  expiresAt: Date;
}

interface MemoryHoldDb {
  confirmedSlot: { findFirst(): Promise<{ id: string } | null> };
  capacityHold: {
    findMany(args: { where: { OR: Array<Record<string, unknown>> } }): Promise<HoldRow[]>;
    create(args: { data: HoldRow }): Promise<HoldRow>;
    update(args: { where: { id: string }; data: HoldRow }): Promise<HoldRow>;
  };
  $executeRaw(): Promise<number>;
  $transaction<T>(run: (tx: MemoryHoldDb) => Promise<T>): Promise<T>;
}

function memoryDatabase() {
  const rows: HoldRow[] = [];
  let chain = Promise.resolve();
  const db: MemoryHoldDb = {
    confirmedSlot: { async findFirst() { return null; } },
    capacityHold: {
      async findMany({ where }: { where: { OR: Array<Record<string, unknown>> } }) {
        return rows.filter((row) => where.OR.some((clause) => {
          if ("idempotencyKey" in clause) return row.idempotencyKey === clause.idempotencyKey;
          const expiry = clause.expiresAt as { gt: Date };
          return row.date === clause.date && row.slot === clause.slot && row.expiresAt > expiry.gt;
        }));
      },
      async create({ data }: { data: HoldRow }) {
        rows.push(data);
        return data;
      },
      async update({ where, data }: { where: { id: string }; data: HoldRow }) {
        const index = rows.findIndex((row) => row.id === where.id);
        rows[index] = data;
        return data;
      },
    },
    async $executeRaw() {
      return 0;
    },
    async $transaction<T>(run: (tx: MemoryHoldDb) => Promise<T>) {
      const previous = chain;
      let release = () => {};
      chain = new Promise((resolve) => {
        release = resolve;
      });
      await previous;
      try {
        return await run(db);
      } finally {
        release();
      }
    },
  };
  return { db: db as unknown as PrismaClient, rows };
}

const settings = { ...fallbackBusiness().settings, maxPlayersPerSlot: 8, maxTeamsPerMatch: 1, slotStartTimes: ["08:00"] };
const schedule = { weekdays: ["sb" as const], blocks: [] };
const now = new Date("2026-11-06T10:00:00.000Z");

function request(key: string): HoldRequest {
  return {
    idempotencyKey: key,
    date: "2026-11-14",
    slot: "08:00",
    players: 4,
    teams: 1,
    privateSlot: false,
    holdMinutes: 10,
    now,
  };
}

describe("capacity hold store", () => {
  it("lets only one concurrent hold take the last team slot", async () => {
    const { db, rows } = memoryDatabase();
    const results = await Promise.all([
      createCapacityHold(db, request("first-key1"), settings, schedule),
      createCapacityHold(db, request("second-key"), settings, schedule),
    ]);
    expect(results.filter((result) => result.ok)).toHaveLength(1);
    expect(rows).toHaveLength(1);
  });

  it("reports an unread hold table instead of pretending the slots are free", async () => {
    await expect(readPublicCapacityHolds(false, async () => { throw new Error("offline"); })).resolves.toEqual({ known: true, holds: [] });
    await expect(readPublicCapacityHolds(true, async () => { throw new Error("offline"); })).resolves.toEqual({ known: false, holds: [] });
  });
});
