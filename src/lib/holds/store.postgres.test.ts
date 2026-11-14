import { afterAll, describe, expect, it } from "vitest";

import { PrismaClient } from "@prisma/client";

import { fallbackBusiness } from "@/lib/business/model";
import { createCapacityHold } from "@/lib/holds/store";
import type { HoldRequest } from "@/lib/holds/model";

const enabled = process.env.HOLD_PG_TEST === "1" && Boolean(process.env.DATABASE_URL);
const date = "2026-11-14";
const slot = "08:00";
const keys = ["pg-hold-first", "pg-hold-second"];

function request(key: string): HoldRequest {
  return {
    idempotencyKey: key,
    date,
    slot,
    players: 4,
    teams: 1,
    privateSlot: false,
    holdMinutes: 10,
    now: new Date("2026-11-06T10:00:00.000Z"),
  };
}

describe.skipIf(!enabled)("capacity hold store on PostgreSQL", () => {
  const prisma = new PrismaClient();
  const settings = { ...fallbackBusiness().settings, maxPlayersPerSlot: 8, maxTeamsPerMatch: 1, slotStartTimes: ["08:00"] };
  const schedule = { weekdays: ["sb" as const], blocks: [] };

  afterAll(async () => {
    await prisma.capacityHold.deleteMany({ where: { idempotencyKey: { in: keys } } });
    await prisma.$disconnect();
  });

  it("lets only one concurrent hold take the last team slot", async () => {
    await prisma.capacityHold.deleteMany({ where: { date, slot } });
    const results = await Promise.all([
      createCapacityHold(prisma, request(keys[0]), settings, schedule),
      createCapacityHold(prisma, request(keys[1]), settings, schedule),
    ]);
    expect(results.filter((result) => result.ok)).toHaveLength(1);
    expect(await prisma.capacityHold.count({ where: { date, slot } })).toBe(1);
  });
});
