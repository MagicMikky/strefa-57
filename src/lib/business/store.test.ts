import { describe, expect, it } from "vitest";

import type { PrismaClient } from "@prisma/client";

import { fallbackBusiness } from "@/lib/business/model";
import { readPublicBusiness } from "@/lib/business/public";
import { publishCompanyDraft, readPublished, saveCompanyDraft } from "@/lib/business/store";

interface MemoryTable {
  findUnique(args: { where: { id: string } }): Promise<Record<string, unknown> | null>;
  upsert(args: { where: { id: string }; create: Record<string, unknown>; update: Record<string, unknown> }): Promise<Record<string, unknown>>;
}

interface MemoryDatabase {
  businessProfile: MemoryTable;
  businessContact: MemoryTable;
  businessSettings: MemoryTable;
  contentRevision: { create(args: { data: Record<string, unknown> }): Promise<void> };
  configChangeAudit: { create(args: { data: Record<string, unknown> }): Promise<void> };
  $transaction(run: (client: MemoryDatabase) => Promise<void>): Promise<void>;
}

function memoryDatabase() {
  const rows = new Map<string, Map<string, Record<string, unknown>>>();
  const revisions: Array<Record<string, unknown>> = [];
  const audits: Array<Record<string, unknown>> = [];
  for (const name of ["profile", "contact", "settings"]) rows.set(name, new Map());

  function table(name: string): MemoryTable {
    return {
      async findUnique({ where }) {
        return rows.get(name)?.get(where.id) ?? null;
      },
      async upsert({ where, create, update }) {
        const current = rows.get(name)?.get(where.id);
        const next = current ? { ...current, ...update } : create;
        rows.get(name)?.set(where.id, next);
        return next;
      },
    };
  }

  const db: MemoryDatabase = {
    businessProfile: table("profile"),
    businessContact: table("contact"),
    businessSettings: table("settings"),
    contentRevision: { async create({ data }) { revisions.push(data); } },
    configChangeAudit: { async create({ data }) { audits.push(data); } },
    async $transaction(run) {
      await run(db);
    },
  };

  return { db: db as unknown as PrismaClient, revisions, audits };
}

describe("company draft and publication", () => {
  it("keeps a draft private until the owner publishes it and records both actions", async () => {
    const { db, revisions, audits } = memoryDatabase();
    const draft = fallbackBusiness();
    draft.contact.phoneDisplay = "+48 500 600 700";
    draft.contact.phoneHref = "tel:+48500600700";

    expect(await publishCompanyDraft(db, "owner-1")).toEqual({
      ok: false,
      error: "Brak wersji roboczej do publikacji.",
    });

    await saveCompanyDraft(db, "owner-1", draft);
    expect(await readPublished(db)).toBeNull();

    const published = await publishCompanyDraft(db, "owner-1");
    expect(published.ok).toBe(true);
    expect((await readPublished(db))?.contact.phoneHref).toBe("tel:+48500600700");
    expect(revisions.map((item) => item.status)).toEqual(["draft", "published"]);
    expect(audits.map((item) => item.action)).toEqual(["save_draft", "publish"]);
    expect(audits[1]?.actorId).toBe("owner-1");
  });

  it("uses the approved snapshot when the database is missing and never a thrown draft", async () => {
    const fallback = fallbackBusiness();
    await expect(readPublicBusiness(false, async () => {
      throw new Error("draft leaked");
    })).resolves.toEqual(fallback);

    const published = fallbackBusiness();
    published.profile.city = "Czaple";
    await expect(readPublicBusiness(true, async () => published)).resolves.toEqual(published);
    await expect(readPublicBusiness(true, async () => {
      throw new Error("database offline");
    })).resolves.toEqual(fallback);
    await expect(readPublicBusiness(true, async () => null)).resolves.toEqual(fallback);
  });
});