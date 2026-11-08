import { randomUUID } from "node:crypto";

import type { Prisma, PrismaClient } from "@prisma/client";

import { BUSINESS_SLOT } from "@/lib/business/model";
import { normalizeGallery, type ManagedPhoto } from "@/lib/gallery/model";
import { managedSrc, publishGalleryFile } from "@/lib/gallery/storage";
import { ContentVersionConflictError } from "@/lib/content/version";

type Db = PrismaClient | Prisma.TransactionClient;

export async function readGallerySlot(db: Db, slot: string): Promise<ManagedPhoto[] | null> {
  const row = await db.galleryCatalog.findUnique({ where: { id: slot } });
  if (!row) return null;
  const parsed = normalizeGallery(row.body);
  return parsed.ok ? parsed.value : null;
}

export function readGalleryDraft(db: Db) {
  return readGallerySlot(db, BUSINESS_SLOT.draft);
}

export async function readGalleryDraftVersion(db: Db): Promise<number> {
  const row = await db.galleryCatalog.findUnique({
    where: { id: BUSINESS_SLOT.draft },
    select: { version: true },
  });
  return row?.version ?? 0;
}

export function readPublishedGallery(db: Db) {
  return readGallerySlot(db, BUSINESS_SLOT.published);
}

async function writeSlot(db: Db, slot: string, photos: ManagedPhoto[], version: number, actorId: string) {
  await db.galleryCatalog.upsert({
    where: { id: slot },
    create: { id: slot, body: photos as unknown as Prisma.InputJsonValue, version, updatedById: actorId },
    update: { body: photos as unknown as Prisma.InputJsonValue, version, updatedById: actorId },
  });
  await db.contentRevision.create({
    data: {
      id: randomUUID(),
      entity: "gallery",
      version,
      status: slot,
      snapshot: photos as unknown as Prisma.InputJsonValue,
      actorId,
    },
  });
  await db.configChangeAudit.create({
    data: {
      id: randomUUID(),
      actorId,
      entity: "gallery",
      action: slot === BUSINESS_SLOT.published ? "publish" : "save_draft",
      before: undefined,
      after: photos as unknown as Prisma.InputJsonValue,
    },
  });
}

export async function saveGalleryDraft(
  db: PrismaClient,
  actorId: string,
  photos: ManagedPhoto[],
  expected?: number,
) {
  await db.$transaction(async (tx) => {
    const current = await tx.galleryCatalog.findUnique({ where: { id: BUSINESS_SLOT.draft }, select: { version: true } });
    const version = expected === undefined ? (current?.version ?? 0) + 1 : expected + 1;
    if (expected === undefined) {
      await writeSlot(tx, BUSINESS_SLOT.draft, photos, version, actorId);
      return;
    }
    if (expected === 0) {
      if (current) throw new ContentVersionConflictError();
      await tx.galleryCatalog.create({
        data: { id: BUSINESS_SLOT.draft, body: photos as unknown as Prisma.InputJsonValue, version, updatedById: actorId },
      });
    } else {
      const updated = await tx.galleryCatalog.updateMany({
        where: { id: BUSINESS_SLOT.draft, version: expected },
        data: { body: photos as unknown as Prisma.InputJsonValue, version, updatedById: actorId },
      });
      if (updated.count !== 1) throw new ContentVersionConflictError();
    }
    await tx.contentRevision.create({
      data: { id: randomUUID(), entity: "gallery", version, status: BUSINESS_SLOT.draft, snapshot: photos as unknown as Prisma.InputJsonValue, actorId },
    });
    await tx.configChangeAudit.create({
      data: { id: randomUUID(), actorId, entity: "gallery", action: "save_draft", before: undefined, after: photos as unknown as Prisma.InputJsonValue },
    });
  });
}

export async function publishGalleryDraft(db: PrismaClient, actorId: string) {
  const draft = await readGalleryDraft(db);
  if (!draft) return { ok: false as const, error: "Brak wersji roboczej galerii." };
  const ready: ManagedPhoto[] = [];
  for (const photo of draft) {
    if (!photo.storageName) {
      ready.push(photo);
      continue;
    }
    const copied = await publishGalleryFile(photo.storageName);
    if (!copied) return { ok: false as const, error: "Nie udało się opublikować pliku zdjęcia." };
    ready.push({ ...photo, src: managedSrc(photo.storageName) });
  }
  await db.$transaction(async (tx) => {
    const [published, draftRow] = await Promise.all([
      tx.galleryCatalog.findUnique({ where: { id: BUSINESS_SLOT.published }, select: { version: true } }),
      tx.galleryCatalog.findUnique({ where: { id: BUSINESS_SLOT.draft }, select: { version: true } }),
    ]);
    await writeSlot(tx, BUSINESS_SLOT.published, ready, (published?.version ?? 0) + 1, actorId);
    await writeSlot(tx, BUSINESS_SLOT.draft, ready, (draftRow?.version ?? 0) + 1, actorId);
  });
  return { ok: true as const };
}
