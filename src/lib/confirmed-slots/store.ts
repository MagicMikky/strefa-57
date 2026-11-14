import { randomUUID } from "node:crypto";
import type { Prisma, PrismaClient } from "@prisma/client";
import { slotsOverlap, warsawDate, weekdayCode } from "@/lib/availability/model";
import type { BusinessSettingsInput } from "@/lib/business/model";
import type { ScheduleCatalog } from "@/lib/schedule/model";

type Settings = Pick<BusinessSettingsInput, "minPlayersPerBooking" | "maxPlayersPerSlot" | "slotStartTimes" | "slotDurationMinutes">;
type Tx = Prisma.TransactionClient;
export type BookingResult = { ok: true; id: string; date: string; slot: string } | { ok: false; error: "missing" | "invalid" | "unavailable" | "already-confirmed" };
export interface PhoneBookingInput { id?: string; date: string; slot: string; players: number; privateSlot: boolean; contactName: string; contactPhone: string; notes: string; actorId: string; now: Date }

export function canConfirmSlot(date: string, slot: string, settings: Settings, schedule: ScheduleCatalog, now: Date): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < warsawDate(now) || !settings.slotStartTimes.includes(slot) || !schedule.weekdays.includes(weekdayCode(date) as ScheduleCatalog["weekdays"][number])) return false;
  const parsed = new Date(`${date}T12:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) return false;
  return !schedule.blocks.some((block) => block.date === date && (block.slot === "day" || slotsOverlap(block.slot, slot, settings.slotDurationMinutes)));
}
async function lock(tx: Tx, date: string, slot: string) { await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`${date}|${slot}`}))`; }
async function fits(tx: Tx, input: { date: string; slot: string; players: number; privateSlot: boolean; now: Date; excludeId?: string }, settings: Settings): Promise<boolean> {
  const [bookings, holds] = await Promise.all([
    tx.confirmedSlot.findMany({ where: { date: input.date, cancelledAt: null, ...(input.excludeId ? { id: { not: input.excludeId } } : {}) }, select: { slot: true, players: true, privateSlot: true } }),
    tx.capacityHold.findMany({ where: { date: input.date, expiresAt: { gt: input.now } }, select: { slot: true } }),
  ]);
  if (bookings.some((item) => item.slot !== input.slot && slotsOverlap(item.slot, input.slot, settings.slotDurationMinutes))) return false;
  if (holds.some((item) => slotsOverlap(item.slot, input.slot, settings.slotDurationMinutes))) return false;
  const same = bookings.filter((item) => item.slot === input.slot);
  if (input.privateSlot) return same.length === 0;
  return same.every((item) => !item.privateSlot) && same.reduce((sum, item) => sum + item.players, input.players) <= settings.maxPlayersPerSlot;
}
const validPlayers = (players: number, settings: Settings) => Number.isInteger(players) && players >= settings.minPlayersPerBooking && players <= settings.maxPlayersPerSlot;
function validPhone(input: PhoneBookingInput, settings: Settings, schedule: ScheduleCatalog) {
  const digits = input.contactPhone.replace(/\D/g, "");
  return canConfirmSlot(input.date, input.slot, settings, schedule, input.now) && validPlayers(input.players, settings)
    && input.contactName.trim().length >= 2 && input.contactName.trim().length <= 100 && !/[<>\u0000-\u001f]/.test(input.contactName)
    && /^[+0-9 ()-]+$/.test(input.contactPhone) && digits.length >= 7 && digits.length <= 15
    && input.notes.length <= 1000 && !/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(input.notes);
}

export async function confirmInquirySlot(db: PrismaClient, input: { inquiryId: string; date: string; slot: string; actorId: string; now: Date }, settings: Settings, schedule: ScheduleCatalog): Promise<BookingResult> {
  if (!canConfirmSlot(input.date, input.slot, settings, schedule, input.now)) return { ok: false, error: "invalid" };
  return db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`inquiry:${input.inquiryId}`}))`;
    await lock(tx, input.date, input.slot);
    const inquiry = await tx.inquiry.findUnique({ where: { id: input.inquiryId }, select: { status: true, playerCount: true, allowSharing: true } });
    if (!inquiry) return { ok: false, error: "missing" };
    if (!validPlayers(inquiry.playerCount, settings)) return { ok: false, error: "invalid" };
    const prior = await tx.confirmedSlot.findUnique({ where: { inquiryId: input.inquiryId } });
    if (prior && !prior.cancelledAt) return prior.date === input.date && prior.slot === input.slot
      ? { ok: true, id: prior.id, date: prior.date, slot: prior.slot } : { ok: false, error: "already-confirmed" };
    const privateSlot = !inquiry.allowSharing;
    if (!await fits(tx, { ...input, players: inquiry.playerCount, privateSlot, excludeId: prior?.id }, settings)) return { ok: false, error: "unavailable" };
    const booking = prior
      ? await tx.confirmedSlot.update({ where: { id: prior.id }, data: { date: input.date, slot: input.slot, players: inquiry.playerCount, privateSlot, cancelledAt: null } })
      : await tx.confirmedSlot.create({ data: { id: randomUUID(), inquiryId: input.inquiryId, date: input.date, slot: input.slot, players: inquiry.playerCount, privateSlot, source: "inquiry" } });
    await tx.inquiry.update({ where: { id: input.inquiryId }, data: { status: "handled", history: { create: { id: randomUUID(), actorId: input.actorId, action: `slot_confirmed:${input.date}:${input.slot}`, fromStatus: inquiry.status, toStatus: "handled" } } } });
    return { ok: true, id: booking.id, date: booking.date, slot: booking.slot };
  });
}

export async function createPhoneBooking(db: PrismaClient, input: PhoneBookingInput, settings: Settings, schedule: ScheduleCatalog): Promise<BookingResult> {
  if (!validPhone(input, settings, schedule)) return { ok: false, error: "invalid" };
  return db.$transaction(async (tx) => {
    await lock(tx, input.date, input.slot);
    if (!await fits(tx, input, settings)) return { ok: false, error: "unavailable" };
    const booking = await tx.confirmedSlot.create({ data: { id: randomUUID(), date: input.date, slot: input.slot, players: input.players, privateSlot: input.privateSlot, source: "phone", contactName: input.contactName.trim(), contactPhone: input.contactPhone.trim(), notes: input.notes.trim() } });
    await tx.staffAudit.create({ data: { id: randomUUID(), actorId: input.actorId, action: "phone_booking_created", targetId: booking.id } });
    return { ok: true, id: booking.id, date: booking.date, slot: booking.slot };
  });
}
export async function updatePhoneBooking(db: PrismaClient, input: PhoneBookingInput & { id: string }, settings: Settings, schedule: ScheduleCatalog): Promise<BookingResult> {
  if (!validPhone(input, settings, schedule)) return { ok: false, error: "invalid" };
  return db.$transaction(async (tx) => {
    const original = await tx.confirmedSlot.findUnique({ where: { id: input.id } });
    if (!original || original.source !== "phone" || original.cancelledAt) return { ok: false, error: "missing" };
    for (const key of [...new Set([`${original.date}|${original.slot}`, `${input.date}|${input.slot}`])].sort()) { const [date, slot] = key.split("|"); await lock(tx, date, slot); }
    const current = await tx.confirmedSlot.findUnique({ where: { id: input.id } });
    if (!current || current.cancelledAt || current.updatedAt.getTime() !== original.updatedAt.getTime()) return { ok: false, error: "unavailable" };
    if (!await fits(tx, { ...input, excludeId: input.id }, settings)) return { ok: false, error: "unavailable" };
    const updated = await tx.confirmedSlot.update({ where: { id: input.id }, data: { date: input.date, slot: input.slot, players: input.players, privateSlot: input.privateSlot, contactName: input.contactName.trim(), contactPhone: input.contactPhone.trim(), notes: input.notes.trim() } });
    await tx.staffAudit.create({ data: { id: randomUUID(), actorId: input.actorId, action: `phone_booking_updated:${original.date}:${original.slot}:${input.date}:${input.slot}`, targetId: input.id } });
    return { ok: true, id: updated.id, date: updated.date, slot: updated.slot };
  });
}
export async function cancelPhoneBooking(db: PrismaClient, id: string, actorId: string): Promise<boolean> {
  return db.$transaction(async (tx) => {
    const existing = await tx.confirmedSlot.findUnique({ where: { id } });
    if (!existing || existing.source !== "phone" || existing.cancelledAt) return false;
    await lock(tx, existing.date, existing.slot);
    const current = await tx.confirmedSlot.findUnique({ where: { id } });
    if (!current || current.cancelledAt || current.updatedAt.getTime() !== existing.updatedAt.getTime()) return false;
    await tx.confirmedSlot.update({ where: { id }, data: { cancelledAt: new Date() } });
    await tx.staffAudit.create({ data: { id: randomUUID(), actorId, action: `phone_booking_cancelled:${existing.date}:${existing.slot}`, targetId: id } });
    return true;
  });
}
export async function cancelInquirySlot(db: PrismaClient, inquiryId: string, actorId: string): Promise<boolean> {
  return db.$transaction(async (tx) => {
    const existing = await tx.confirmedSlot.findUnique({ where: { inquiryId } });
    if (!existing || existing.cancelledAt) return false;
    await lock(tx, existing.date, existing.slot);
    const current = await tx.confirmedSlot.findUnique({ where: { inquiryId } });
    if (!current || current.cancelledAt || current.updatedAt.getTime() !== existing.updatedAt.getTime()) return false;
    await tx.confirmedSlot.update({ where: { id: existing.id }, data: { cancelledAt: new Date() } });
    await tx.inquiryHistory.create({ data: { id: randomUUID(), inquiryId, actorId, action: `slot_cancelled:${existing.date}:${existing.slot}` } });
    return true;
  });
}
export async function readConfirmedSlots(db: PrismaClient, fromDate?: string) {
  return db.confirmedSlot.findMany({ where: { cancelledAt: null, ...(fromDate ? { date: { gte: fromDate } } : {}) }, select: { inquiryId: true, date: true, slot: true, players: true, privateSlot: true }, orderBy: [{ date: "asc" }, { slot: "asc" }] });
}
