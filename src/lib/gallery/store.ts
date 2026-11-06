import { randomUUID } from "node:crypto";

import type { Prisma, PrismaClient } from "@prisma/client";

import { BUSINESS_SLOT } from "@/lib/business/model";
import { normalizeGallery, type ManagedPhoto } from "@/lib/gallery/model";
import { managedSrc, publishGalleryFile } from "@/lib/gallery/storage";

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

export async function saveGalleryDraft(db: PrismaClient, actorId: string, photos: ManagedPhoto[]) {
  await db.$transaction(async (tx) => {
    const current = await tx.galleryCatalog.findUnique({ where: { id: BUSINESS_SLOT.draft }, select: { version: true } });
    await writeSlot(tx, BUSINESS_SLOT.draft, photos, (current?.version ?? 0) + 1, actorId);
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
    const current = await tx.galleryCatalog.findUnique({ where: { id: BUSINESS_SLOT.published }, select: { version: true } });
    const version = (current?.version ?? 0) + 1;
    await writeSlot(tx, BUSINESS_SLOT.published, ready, version, actorId);
    await writeSlot(tx, BUSINESS_SLOT.draft, ready, version, actorId);
  });
  return { ok: true as const };
}
