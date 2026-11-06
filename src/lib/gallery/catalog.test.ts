import { rm } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import type { PrismaClient } from "@prisma/client";

import { fallbackGallery } from "@/lib/gallery/model";
import { readPublicGallery } from "@/lib/gallery/public";
import { publishGalleryDraft, readPublishedGallery, saveGalleryDraft } from "@/lib/gallery/store";
import { galleryManagedDir, galleryStorageDir, publishGalleryFile, readGalleryUpload, saveGalleryUpload } from "@/lib/gallery/storage";

const png = Uint8Array.from(Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
));

interface MemoryDatabase {
  galleryCatalog: {
    findUnique(args: { where: { id: string } }): Promise<Record<string, unknown> | null>;
    upsert(args: { where: { id: string }; create: Record<string, unknown>; update: Record<string, unknown> }): Promise<Record<string, unknown>>;
  };
  contentRevision: { create(args: { data: Record<string, unknown> }): Promise<void> };
  configChangeAudit: { create(args: { data: Record<string, unknown> }): Promise<void> };
  $transaction(run: (client: MemoryDatabase) => Promise<void>): Promise<void>;
}

function memoryDatabase() {
  const rows = new Map<string, Record<string, unknown>>();
  const audits: Array<Record<string, unknown>> = [];
  const db: MemoryDatabase = {
    galleryCatalog: {
      async findUnique({ where }) { return rows.get(where.id) ?? null; },
      async upsert({ where, create, update }) {
        const next = rows.has(where.id) ? { ...rows.get(where.id), ...update } : create;
        rows.set(where.id, next);
        return next;
      },
    },
    contentRevision: { async create() { return undefined; } },
    configChangeAudit: { async create({ data }) { audits.push(data); } },
    async $transaction(run) { await run(db); },
  };
  return { db: db as unknown as PrismaClient, audits };
}

describe("gallery publication", () => {
  it("does not show a draft until it is published", async () => {
    const { db, audits } = memoryDatabase();
    const draft = fallbackGallery();
    draft[0].title = "Nowa okładka";
    expect((await publishGalleryDraft(db, "owner-1")).ok).toBe(false);
    await saveGalleryDraft(db, "owner-1", draft);
    expect(await readPublishedGallery(db)).toBeNull();
    expect((await publishGalleryDraft(db, "owner-1")).ok).toBe(true);
    expect((await readPublishedGallery(db))?.[0]?.title).toBe("Nowa okładka");
    expect(audits.some((item) => item.action === "publish")).toBe(true);
  });

  it("falls back when the catalog cannot be read", async () => {
    await expect(readPublicGallery(false, async () => { throw new Error("draft"); })).resolves.toHaveLength(3);
    await expect(readPublicGallery(true, async () => { throw new Error("offline"); })).resolves.toHaveLength(3);
  });

  it("stores an upload outside the public folder until publish", async () => {
    const name = await saveGalleryUpload(png, "png");
    expect(name.endsWith(".png")).toBe(true);
    expect(path.dirname(path.resolve(galleryStorageDir(), name))).toBe(path.resolve(galleryStorageDir()));
    expect(await readGalleryUpload("../secret.png")).toBeNull();
    expect(await readGalleryUpload(name)).not.toBeNull();
    expect(await publishGalleryFile(name)).toBe(true);
    await rm(path.join(galleryStorageDir(), name), { force: true });
    await rm(path.join(galleryManagedDir(), name), { force: true });
  });
});
