import { randomUUID } from "node:crypto";

import type { Prisma, PrismaClient } from "@prisma/client";

import { BUSINESS_SLOT } from "@/lib/business/model";
import { normalizeSchedule, type ScheduleCatalog } from "@/lib/schedule/model";

type Db = PrismaClient | Prisma.TransactionClient;

export async function readScheduleSlot(db: Db, slot: string, slotStartTimes: readonly string[]) {
  const row = await db.scheduleCatalog.findUnique({ where: { id: slot } });
  if (!row) return null;
  const parsed = normalizeSchedule(row.body, slotStartTimes);
  return parsed.ok ? parsed.value : null;
}

export async function saveScheduleDraft(
  db: PrismaClient,
  actorId: string,
  catalog: ScheduleCatalog,
  slotStartTimes: readonly string[],
) {
  const before = await readScheduleSlot(db, BUSINESS_SLOT.draft, slotStartTimes);
  await db.$transaction(async (tx) => {
    const current = await tx.scheduleCatalog.findUnique({ where: { id: BUSINESS_SLOT.draft }, select: { version: true } });
    const version = (current?.version ?? 0) + 1;
    await tx.scheduleCatalog.upsert({
      where: { id: BUSINESS_SLOT.draft },
      create: { id: BUSINESS_SLOT.draft, body: catalog as unknown as Prisma.InputJsonValue, version, updatedById: actorId },
      update: { body: catalog as unknown as Prisma.InputJsonValue, version, updatedById: actorId },
    });
    await tx.contentRevision.create({
      data: { id: randomUUID(), entity: "schedule", version, status: BUSINESS_SLOT.draft, snapshot: catalog as unknown as Prisma.InputJsonValue, actorId },
    });
    await tx.configChangeAudit.create({
      data: {
        id: randomUUID(),
        actorId,
        entity: "schedule",
        action: "save_draft",
        before: (before ?? undefined) as Prisma.InputJsonValue | undefined,
        after: catalog as unknown as Prisma.InputJsonValue,
      },
    });
  });
}

export async function publishScheduleDraft(db: PrismaClient, actorId: string, slotStartTimes: readonly string[]) {
  const draft = await readScheduleSlot(db, BUSINESS_SLOT.draft, slotStartTimes);
  if (!draft) return { ok: false as const, error: "Brak wersji roboczej harmonogramu." };
  const before = await readScheduleSlot(db, BUSINESS_SLOT.published, slotStartTimes);
  await db.$transaction(async (tx) => {
    const current = await tx.scheduleCatalog.findUnique({ where: { id: BUSINESS_SLOT.published }, select: { version: true } });
    const version = (current?.version ?? 0) + 1;
    await tx.scheduleCatalog.upsert({
      where: { id: BUSINESS_SLOT.published },
      create: { id: BUSINESS_SLOT.published, body: draft as unknown as Prisma.InputJsonValue, version, updatedById: actorId },
      update: { body: draft as unknown as Prisma.InputJsonValue, version, updatedById: actorId },
    });
    await tx.contentRevision.create({
      data: { id: randomUUID(), entity: "schedule", version, status: BUSINESS_SLOT.published, snapshot: draft as unknown as Prisma.InputJsonValue, actorId },
    });
    await tx.configChangeAudit.create({
      data: {
        id: randomUUID(),
        actorId,
        entity: "schedule",
        action: "publish",
        before: (before ?? undefined) as Prisma.InputJsonValue | undefined,
        after: draft as unknown as Prisma.InputJsonValue,
      },
    });
  });
  return { ok: true as const };
}
