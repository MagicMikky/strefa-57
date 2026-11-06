import { describe, expect, it } from "vitest";

import type { PrismaClient } from "@prisma/client";

import { fallbackSiteCopy } from "@/lib/content/model";
import { readPublicSiteCopy } from "@/lib/content/public";
import { publishSiteDraft, readPublishedSite, saveSiteDraft } from "@/lib/content/store";

interface MemoryTable {
  findUnique(args: { where: { id: string } }): Promise<Record<string, unknown> | null>;
  upsert(args: { where: { id: string }; create: Record<string, unknown>; update: Record<string, unknown> }): Promise<Record<string, unknown>>;
}

interface MemoryDatabase {
  siteContent: MemoryTable;
  contentRevision: { create(args: { data: Record<string, unknown> }): Promise<void> };
  configChangeAudit: { create(args: { data: Record<string, unknown> }): Promise<void> };
  $transaction(run: (client: MemoryDatabase) => Promise<void>): Promise<void>;
}

function memoryDatabase() {
  const rows = new Map<string, Record<string, unknown>>();
  const revisions: Array<Record<string, unknown>> = [];
  const audits: Array<Record<string, unknown>> = [];
  const db: MemoryDatabase = {
    siteContent: {
      async findUnique({ where }) {
        return rows.get(where.id) ?? null;
      },
      async upsert({ where, create, update }) {
        const next = rows.has(where.id) ? { ...rows.get(where.id), ...update } : create;
        rows.set(where.id, next);
        return next;
      },
    },
    contentRevision: { async create({ data }) { revisions.push(data); } },
    configChangeAudit: { async create({ data }) { audits.push(data); } },
    async $transaction(run) {
      await run(db);
    },
  };
  return { db: db as unknown as PrismaClient, revisions, audits };
}

describe("site copy publication", () => {
  it("keeps a draft off the public site until publish and writes an audit row", async () => {
    const { db, revisions, audits } = memoryDatabase();
    const draft = fallbackSiteCopy();
    draft.seo.faq.title = "Nowe FAQ";
    expect((await publishSiteDraft(db, "owner-1")).ok).toBe(false);
    await saveSiteDraft(db, "owner-1", draft);
    expect(await readPublishedSite(db)).toBeNull();
    expect((await publishSiteDraft(db, "owner-1")).ok).toBe(true);
    expect((await readPublishedSite(db))?.seo.faq.title).toBe("Nowe FAQ");
    expect(revisions.map((item) => item.status)).toEqual(["draft", "published"]);
    expect(audits.map((item) => item.action)).toEqual(["save_draft", "publish"]);
  });

  it("uses the approved copy when the database fails", async () => {
    const fallback = fallbackSiteCopy();
    await expect(readPublicSiteCopy(false, async () => {
      throw new Error("draft");
    })).resolves.toEqual(fallback);
    const published = fallbackSiteCopy();
    published.seo.home.title = "Opublikowane";
    await expect(readPublicSiteCopy(true, async () => published)).resolves.toEqual(published);
    await expect(readPublicSiteCopy(true, async () => {
      throw new Error("offline");
    })).resolves.toEqual(fallback);
  });
});
