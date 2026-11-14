import { randomUUID } from "node:crypto";

import { afterAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";

import { evaluateDay } from "@/lib/availability/model";
import { fallbackBusiness } from "@/lib/business/model";
import { canConfirmSlot, confirmInquirySlot, createPhoneBooking, updatePhoneBooking, cancelPhoneBooking } from "@/lib/confirmed-slots/store";
import { readConfirmedSlots } from "@/lib/confirmed-slots/store";
import { createCapacityHold } from "@/lib/holds/store";

const settings = fallbackBusiness().settings;
const schedule = { weekdays: ["sb" as const], blocks: [] };
const now = new Date("2026-11-08T10:00:00.000Z");

describe("confirmed visits", () => {
  it("requires a future configured slot and respects explicit closures", () => {
    expect(canConfirmSlot("2026-11-14", "10:00", settings, schedule, now)).toBe(true);
    expect(canConfirmSlot("2026-11-13", "10:00", settings, schedule, now)).toBe(false);
    expect(canConfirmSlot("2026-11-11", "10:00", settings, { weekdays: [], blocks: [] }, now)).toBe(false);
    expect(canConfirmSlot("2026-11-14", "09:00", settings, schedule, now)).toBe(false);
    expect(canConfirmSlot("2026-11-07", "10:00", settings, schedule, now)).toBe(false);
    expect(canConfirmSlot("2026-11-14", "10:00", settings, { ...schedule, blocks: [{ date: "2026-11-14", slot: "11:00", reason: "Stara blokada" }] }, now)).toBe(false);
  });
});

const enabled = process.env.CONFIRMED_PG_TEST === "1" && Boolean(process.env.DATABASE_URL);

describe.skipIf(!enabled)("confirmed visits on PostgreSQL", () => {
  const db = new PrismaClient();
  const actorId = randomUUID();
  const inquiryIds = [randomUUID(), randomUUID(), randomUUID()];
  const date = "2027-01-02";
  const slot = "12:00";
  const holdKey = `calendar-race-${randomUUID()}`;
  const phoneIds: string[] = [];

  afterAll(async () => {
    await db.confirmedSlot.deleteMany({ where: { inquiryId: { in: inquiryIds } } });
    await db.staffAudit.deleteMany({ where: { targetId: { in: phoneIds } } });
    await db.confirmedSlot.deleteMany({ where: { id: { in: phoneIds } } });
    await db.capacityHold.deleteMany({ where: { idempotencyKey: holdKey } });
    await db.inquiry.deleteMany({ where: { id: { in: inquiryIds } } });
    await db.user.deleteMany({ where: { id: actorId } });
    await db.$disconnect();
  });

  it("allows only one concurrent confirmation and closes that slot in the calendar", async () => {
    await db.user.create({ data: { id: actorId, name: "Test calendar", email: `${actorId}@example.invalid`, role: "employee" } });
    for (const id of inquiryIds.slice(0, 2)) {
      await db.inquiry.create({ data: {
        id, dedupeKey: `test:${id}`, contentHash: id, status: "new", playerCount: 8,
        preferredDate: date, preferredTime: slot, alternateDate: "", packageId: "nie-wiem",
        eventType: "znajomi", name: "Test", preferredContact: "email", phone: "", email: "test@example.invalid",
        message: "", privacyAccepted: true, privacyNoticeVersion: "1.1",
      } });
    }
    const results = await Promise.all(inquiryIds.slice(0, 2).map((inquiryId) => confirmInquirySlot(db, { inquiryId, date, slot, actorId, now }, settings, schedule)));
    expect(results.filter((result) => result.ok)).toHaveLength(1);
    const confirmed = await readConfirmedSlots(db, date);
    expect(confirmed.filter((item) => item.date === date && item.slot === slot)).toHaveLength(1);
    const day = evaluateDay(date, settings, schedule, [{ slot, players: 8, teams: 1, privateSlot: true }], { players: 8, privateSlot: false }, "2026-11-08");
    expect(day.slots.find((item) => item.start === slot)?.fitsRequest).toBe(false);
  });

  it("does not let a temporary hold and a confirmation occupy the same slot", async () => {
    const raceDate = "2027-01-09";
    const raceSlot = "15:00";
    const raceNow = new Date();
    const inquiryId = inquiryIds[2];
    await db.inquiry.create({ data: {
      id: inquiryId, dedupeKey: `test:${inquiryId}`, contentHash: inquiryId, status: "new", playerCount: 8,
      preferredDate: raceDate, preferredTime: raceSlot, alternateDate: "", packageId: "nie-wiem",
      eventType: "znajomi", name: "Test", preferredContact: "email", phone: "", email: "test@example.invalid",
      message: "", privacyAccepted: true, privacyNoticeVersion: "1.1",
    } });
    const [confirmation, hold] = await Promise.all([
      confirmInquirySlot(db, { inquiryId, date: raceDate, slot: raceSlot, actorId, now: raceNow }, settings, schedule),
      createCapacityHold(db, { idempotencyKey: holdKey, date: raceDate, slot: raceSlot, players: 8, teams: 1, privateSlot: false, holdMinutes: 10, now: raceNow }, settings, schedule),
    ]);
    expect([confirmation.ok, hold.ok].filter(Boolean)).toHaveLength(1);
  });
  it("serializes phone entries, enforces fifty seats, and audits edits and cancellation", async () => {
    const phoneDate = "2027-01-16";
    const base = { date: phoneDate, slot: "18:00", privateSlot: false, contactName: "Test telefon", contactPhone: "577203783", notes: "", actorId, now: new Date() };
    const first = await Promise.all([
      createPhoneBooking(db, { ...base, players: 30 }, settings, schedule),
      createPhoneBooking(db, { ...base, players: 30 }, settings, schedule),
    ]);
    expect(first.filter((item) => item.ok)).toHaveLength(1);
    const firstId = first.find((item) => item.ok)?.id;
    if (!firstId) throw new Error("missing first booking");
    phoneIds.push(firstId);
    const second = await createPhoneBooking(db, { ...base, players: 20 }, settings, schedule);
    expect(second.ok).toBe(true);
    if (!second.ok) return;
    phoneIds.push(second.id);
    expect((await createPhoneBooking(db, { ...base, players: 8, privateSlot: true }, settings, schedule)).ok).toBe(false);
    expect((await updatePhoneBooking(db, { ...base, id: second.id, players: 21 }, settings, schedule)).ok).toBe(false);
    expect((await updatePhoneBooking(db, { ...base, id: second.id, players: 19 }, settings, schedule)).ok).toBe(true);
    expect(await cancelPhoneBooking(db, second.id, actorId)).toBe(true);
    expect(await db.staffAudit.count({ where: { targetId: second.id } })).toBe(3);
  });
});
