import { randomUUID } from "node:crypto";

import type { Prisma, PrismaClient } from "@prisma/client";

import { BUSINESS_SLOT } from "@/lib/business/model";
import { normalizeSchedule, type ScheduleCatalog } from "@/lib/schedule/model";
import { ContentVersionConflictError } from "@/lib/content/version";

type Db = PrismaClient | Prisma.TransactionClient;

export async function readScheduleSlot(db: Db, slot: string, slotStartTimes: readonly string[]) {
  const row = await db.scheduleCatalog.findUnique({ where: { id: slot } });
  if (!row) return null;
  const parsed = normalizeSchedule(row.body, slotStartTimes);
  return parsed.ok ? parsed.value : null;
}

export async function readScheduleDraftVersion(db: Db): Promise<number> {
  const row = await db.scheduleCatalog.findUnique({
    where: { id: BUSINESS_SLOT.draft },
    select: { version: true },
  });
  return row?.version ?? 0;
}

export async function saveScheduleDraft(
  db: PrismaClient,
  actorId: string,
  catalog: ScheduleCatalog,
  slotStartTimes: readonly string[],
  expected?: number,
) {
  const before = await readScheduleSlot(db, BUSINESS_SLOT.draft, slotStartTimes);
  await db.$transaction(async (tx) => {
    const current = await tx.scheduleCatalog.findUnique({ where: { id: BUSINESS_SLOT.draft }, select: { version: true } });
    const version = expected === undefined ? (current?.version ?? 0) + 1 : expected + 1;
    if (expected === undefined) {
      await tx.scheduleCatalog.upsert({
        where: { id: BUSINESS_SLOT.draft },
        create: { id: BUSINESS_SLOT.draft, body: catalog as unknown as Prisma.InputJsonValue, version, updatedById: actorId },
        update: { body: catalog as unknown as Prisma.InputJsonValue, version, updatedById: actorId },
      });
    } else if (expected === 0) {
      if (current) throw new ContentVersionConflictError();
      await tx.scheduleCatalog.create({
        data: { id: BUSINESS_SLOT.draft, body: catalog as unknown as Prisma.InputJsonValue, version, updatedById: actorId },
      });
    } else {
      const updated = await tx.scheduleCatalog.updateMany({
        where: { id: BUSINESS_SLOT.draft, version: expected },
        data: { body: catalog as unknown as Prisma.InputJsonValue, version, updatedById: actorId },
      });
      if (updated.count !== 1) throw new ContentVersionConflictError();
    }
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
