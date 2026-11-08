import { randomUUID } from "node:crypto";

import { afterAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";

import { evaluateDay } from "@/lib/availability/model";
import { fallbackBusiness } from "@/lib/business/model";
import { canConfirmSlot, confirmInquirySlot } from "@/lib/confirmed-slots/store";
import { readConfirmedSlots } from "@/lib/confirmed-slots/store";
import { createCapacityHold } from "@/lib/holds/store";

const settings = fallbackBusiness().settings;
const schedule = { weekdays: ["sb" as const], blocks: [] };
const now = new Date("2026-11-08T10:00:00.000Z");

describe("confirmed visits", () => {
  it("requires a future configured slot and respects explicit closures", () => {
    expect(canConfirmSlot("2026-11-14", "08:00", settings, schedule, now)).toBe(true);
    expect(canConfirmSlot("2026-11-13", "08:00", settings, schedule, now)).toBe(true);
    expect(canConfirmSlot("2026-11-11", "08:00", settings, { weekdays: [], blocks: [] }, now)).toBe(true);
    expect(canConfirmSlot("2026-11-14", "09:00", settings, schedule, now)).toBe(false);
    expect(canConfirmSlot("2026-11-07", "08:00", settings, schedule, now)).toBe(false);
    expect(canConfirmSlot("2026-11-14", "08:00", settings, { ...schedule, blocks: [{ date: "2026-11-14", slot: "08:00", reason: "Przerwa" }] }, now)).toBe(false);
  });
});

const enabled = process.env.CONFIRMED_PG_TEST === "1" && Boolean(process.env.DATABASE_URL);

describe.skipIf(!enabled)("confirmed visits on PostgreSQL", () => {
  const db = new PrismaClient();
  const actorId = randomUUID();
  const inquiryIds = [randomUUID(), randomUUID(), randomUUID()];
  const date = "2027-01-02";
  const slot = "11:00";
  const holdKey = `calendar-race-${randomUUID()}`;

  afterAll(async () => {
    await db.confirmedSlot.deleteMany({ where: { inquiryId: { in: inquiryIds } } });
    await db.capacityHold.deleteMany({ where: { idempotencyKey: holdKey } });
    await db.inquiry.deleteMany({ where: { id: { in: inquiryIds } } });
    await db.user.deleteMany({ where: { id: actorId } });
    await db.$disconnect();
  });

  it("allows only one concurrent confirmation and closes that slot in the calendar", async () => {
    await db.user.create({ data: { id: actorId, name: "Test calendar", email: `${actorId}@example.invalid`, role: "employee" } });
    for (const id of inquiryIds.slice(0, 2)) {
      await db.inquiry.create({ data: {
        id, dedupeKey: `test:${id}`, contentHash: id, status: "new", playerCount: 4,
        preferredDate: date, preferredTime: slot, alternateDate: "", packageId: "nie-wiem",
        eventType: "znajomi", name: "Test", preferredContact: "email", phone: "", email: "test@example.invalid",
        message: "", privacyAccepted: true, privacyNoticeVersion: "1.1",
      } });
    }
    const results = await Promise.all(inquiryIds.slice(0, 2).map((inquiryId) => confirmInquirySlot(db, { inquiryId, date, slot, actorId, now }, settings, schedule)));
    expect(results.filter((result) => result.ok)).toHaveLength(1);
    const confirmed = await readConfirmedSlots(db, date);
    expect(confirmed.filter((item) => item.date === date && item.slot === slot)).toHaveLength(1);
    const day = evaluateDay(date, settings, schedule, [{ slot, players: settings.maxPlayersPerSlot, teams: settings.maxTeamsPerMatch, privateSlot: true }], { players: 4, privateSlot: false }, "2026-11-08");
    expect(day.slots.find((item) => item.start === slot)?.fitsRequest).toBe(false);
  });

  it("does not let a temporary hold and a confirmation occupy the same slot", async () => {
    const raceDate = "2027-01-09";
    const raceSlot = "14:00";
    const raceNow = new Date();
    const inquiryId = inquiryIds[2];
    await db.inquiry.create({ data: {
      id: inquiryId, dedupeKey: `test:${inquiryId}`, contentHash: inquiryId, status: "new", playerCount: 4,
      preferredDate: raceDate, preferredTime: raceSlot, alternateDate: "", packageId: "nie-wiem",
      eventType: "znajomi", name: "Test", preferredContact: "email", phone: "", email: "test@example.invalid",
      message: "", privacyAccepted: true, privacyNoticeVersion: "1.1",
    } });
    const [confirmation, hold] = await Promise.all([
      confirmInquirySlot(db, { inquiryId, date: raceDate, slot: raceSlot, actorId, now: raceNow }, settings, schedule),
      createCapacityHold(db, { idempotencyKey: holdKey, date: raceDate, slot: raceSlot, players: 4, teams: 1, privateSlot: false, holdMinutes: 10, now: raceNow }, settings, schedule),
    ]);
    expect([confirmation.ok, hold.ok].filter(Boolean)).toHaveLength(1);
  });
});
