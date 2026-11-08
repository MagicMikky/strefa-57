import { randomUUID } from "node:crypto";

import type { PrismaClient } from "@prisma/client";

import { warsawDate } from "@/lib/availability/model";
import type { BusinessSettingsInput } from "@/lib/business/model";
import type { ScheduleCatalog } from "@/lib/schedule/model";

type Settings = Pick<BusinessSettingsInput, "maxPlayersPerTeam" | "maxTeamsPerMatch" | "maxPlayersPerSlot" | "slotStartTimes" | "slotDurationMinutes">;

export type ConfirmationResult =
  | { ok: true; date: string; slot: string }
  | { ok: false; error: "missing" | "invalid" | "unavailable" | "already-confirmed" };

export function canConfirmSlot(date: string, slot: string, settings: Settings, schedule: ScheduleCatalog, now: Date): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < warsawDate(now) || !settings.slotStartTimes.includes(slot)) return false;
  const parsed = new Date(`${date}T12:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) return false;
  return !schedule.blocks.some((block) => block.date === date && (block.slot === "day" || block.slot === slot));
}

export async function confirmInquirySlot(
  db: PrismaClient,
  input: { inquiryId: string; date: string; slot: string; actorId: string; now: Date },
  settings: Settings,
  schedule: ScheduleCatalog,
): Promise<ConfirmationResult> {
  if (!canConfirmSlot(input.date, input.slot, settings, schedule, input.now)) return { ok: false, error: "invalid" };
  try {
    return await db.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`${input.date}|${input.slot}`}))`;
      const inquiry = await tx.inquiry.findUnique({ where: { id: input.inquiryId }, select: { id: true, status: true, playerCount: true } });
      if (!inquiry) return { ok: false, error: "missing" };
      if (inquiry.playerCount < 1 || inquiry.playerCount > settings.maxPlayersPerSlot) return { ok: false, error: "invalid" };
      const prior = await tx.confirmedSlot.findUnique({ where: { inquiryId: input.inquiryId } });
      if (prior) {
        return prior.date === input.date && prior.slot === input.slot
          ? { ok: true, date: prior.date, slot: prior.slot }
          : { ok: false, error: "already-confirmed" };
      }
      const [occupied, activeHold] = await Promise.all([
        tx.confirmedSlot.findUnique({ where: { date_slot: { date: input.date, slot: input.slot } } }),
        tx.capacityHold.findFirst({ where: { date: input.date, slot: input.slot, expiresAt: { gt: input.now } } }),
      ]);
      if (occupied || activeHold) return { ok: false, error: "unavailable" };
      await tx.confirmedSlot.create({ data: { id: randomUUID(), inquiryId: input.inquiryId, date: input.date, slot: input.slot } });
      await tx.inquiry.update({
        where: { id: input.inquiryId },
        data: {
          status: "handled",
          history: { create: { id: randomUUID(), actorId: input.actorId, action: `slot_confirmed:${input.date}:${input.slot}`, fromStatus: inquiry.status, toStatus: "handled" } },
        },
      });
      return { ok: true, date: input.date, slot: input.slot };
    });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return { ok: false, error: "already-confirmed" };
    }
    throw error;
  }
}

export async function cancelInquirySlot(db: PrismaClient, inquiryId: string, actorId: string): Promise<boolean> {
  const existing = await db.confirmedSlot.findUnique({ where: { inquiryId } });
  if (!existing) return false;
  return db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`${existing.date}|${existing.slot}`}))`;
    const removed = await tx.confirmedSlot.deleteMany({ where: { id: existing.id, inquiryId } });
    if (!removed.count) return false;
    await tx.inquiryHistory.create({ data: { id: randomUUID(), inquiryId, actorId, action: `slot_cancelled:${existing.date}:${existing.slot}` } });
    return true;
  });
}

export async function readConfirmedSlots(db: PrismaClient, fromDate?: string) {
  return db.confirmedSlot.findMany({
    where: fromDate ? { date: { gte: fromDate } } : undefined,
    select: { inquiryId: true, date: true, slot: true },
    orderBy: [{ date: "asc" }, { slot: "asc" }],
  });
}
