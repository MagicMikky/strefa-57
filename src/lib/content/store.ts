import { randomUUID } from "node:crypto";

import type { Prisma, PrismaClient } from "@prisma/client";

import { BUSINESS_SLOT } from "@/lib/business/model";
import { normalizeSiteCopy, type SiteCopy } from "@/lib/content/model";
import { ContentVersionConflictError } from "@/lib/content/version";

type Db = PrismaClient | Prisma.TransactionClient;

export async function readSiteSlot(db: Db, slot: string): Promise<SiteCopy | null> {
  const row = await db.siteContent.findUnique({ where: { id: slot } });
  if (!row) return null;
  const parsed = normalizeSiteCopy(row.body);
  return parsed.ok ? parsed.value : null;
}

export function readSiteDraft(db: Db) {
  return readSiteSlot(db, BUSINESS_SLOT.draft);
}

export async function readSiteDraftVersion(db: Db): Promise<number> {
  const row = await db.siteContent.findUnique({
    where: { id: BUSINESS_SLOT.draft },
    select: { version: true },
  });
  return row?.version ?? 0;
}

export function readPublishedSite(db: Db) {
  return readSiteSlot(db, BUSINESS_SLOT.published);
}

export async function saveSiteDraft(
  db: PrismaClient,
  actorId: string,
  next: SiteCopy,
  expected?: number,
) {
  const before = await readSiteDraft(db);
  await db.$transaction(async (tx) => {
    const current = await tx.siteContent.findUnique({ where: { id: BUSINESS_SLOT.draft }, select: { version: true } });
    const version = expected === undefined ? (current?.version ?? 0) + 1 : expected + 1;
    if (expected === undefined) {
      await tx.siteContent.upsert({
        where: { id: BUSINESS_SLOT.draft },
        create: { id: BUSINESS_SLOT.draft, body: next as unknown as Prisma.InputJsonValue, version, updatedById: actorId },
        update: { body: next as unknown as Prisma.InputJsonValue, version, updatedById: actorId },
      });
    } else if (expected === 0) {
      if (current) throw new ContentVersionConflictError();
      await tx.siteContent.create({
        data: { id: BUSINESS_SLOT.draft, body: next as unknown as Prisma.InputJsonValue, version, updatedById: actorId },
      });
    } else {
      const updated = await tx.siteContent.updateMany({
        where: { id: BUSINESS_SLOT.draft, version: expected },
        data: { body: next as unknown as Prisma.InputJsonValue, version, updatedById: actorId },
      });
      if (updated.count !== 1) throw new ContentVersionConflictError();
    }
    await tx.contentRevision.create({
      data: {
        id: randomUUID(),
        entity: "site-content",
        version,
        status: BUSINESS_SLOT.draft,
        snapshot: next as unknown as Prisma.InputJsonValue,
        actorId,
      },
    });
    await tx.configChangeAudit.create({
      data: {
        id: randomUUID(),
        actorId,
        entity: "site-content",
        action: "save_draft",
        before: (before ?? undefined) as Prisma.InputJsonValue | undefined,
        after: next as unknown as Prisma.InputJsonValue,
      },
    });
  });
}

export async function publishSiteDraft(db: PrismaClient, actorId: string) {
  const draft = await readSiteDraft(db);
  if (!draft) return { ok: false as const, error: "Brak wersji roboczej treści do publikacji." };
  const before = await readPublishedSite(db);
  await db.$transaction(async (tx) => {
    const current = await tx.siteContent.findUnique({ where: { id: BUSINESS_SLOT.published }, select: { version: true } });
    const version = (current?.version ?? 0) + 1;
    await tx.siteContent.upsert({
      where: { id: BUSINESS_SLOT.published },
      create: { id: BUSINESS_SLOT.published, body: draft as unknown as Prisma.InputJsonValue, version, updatedById: actorId },
      update: { body: draft as unknown as Prisma.InputJsonValue, version, updatedById: actorId },
    });
    await tx.contentRevision.create({
      data: {
        id: randomUUID(),
        entity: "site-content",
        version,
        status: BUSINESS_SLOT.published,
        snapshot: draft as unknown as Prisma.InputJsonValue,
        actorId,
      },
    });
    await tx.configChangeAudit.create({
      data: {
        id: randomUUID(),
        actorId,
        entity: "site-content",
        action: "publish",
        before: (before ?? undefined) as Prisma.InputJsonValue | undefined,
        after: draft as unknown as Prisma.InputJsonValue,
      },
    });
  });
  return { ok: true as const };
}
