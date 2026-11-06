import { afterEach, describe, expect, it } from "vitest";

import type { ValidInquiry } from "@/lib/inquiry";
import { MemoryInquiryRepository } from "@/lib/inquiries/memory-repository";
import { purgeExpiredInquiries } from "@/lib/inquiries/maintenance";
import { inquiryContentHash, inquiryFromPayload } from "@/lib/inquiries/model";
import { getInquiryRepository, resetInquiryRepositoryForTests } from "@/lib/inquiries/repository";
import { retentionCutoff } from "@/lib/inquiries/retention";

const inquiry = {
  playerCount: 8,
  preferredDate: "2027-06-01",
  preferredTime: "12:00",
  alternateDate: "",
  packageId: "pierwsza-misja",
  eventType: "znajomi",
  name: "Anna",
  preferredContact: "email",
  phone: "",
  email: "anna@example.com",
  message: "Proszę o kontakt",
  privacyAccepted: true,
  website: "",
} as ValidInquiry;

describe("inquiry repository", () => {
  it("stores one inquiry, then status, assignment, note and history", async () => {
    const repository = new MemoryInquiryRepository();
    const hash = inquiryContentHash(inquiry);
    const created = await repository.createIfAbsent({
      record: inquiryFromPayload(inquiry, hash, hash),
    });
    expect(created.created).toBe(true);
    expect(created.record.history[0]?.action).toBe("created");

    const duplicate = await repository.createIfAbsent({
      record: inquiryFromPayload(inquiry, hash, hash),
    });
    expect(duplicate.created).toBe(false);
    expect(duplicate.record.id).toBe(created.record.id);

    const updated = await repository.setStatus(
      created.record.id,
      "in_progress",
      { id: "staff-1", name: "Ola" },
    );
    expect(updated.status).toBe("in_progress");
    expect(updated.history.some((entry) => entry.action === "status_changed")).toBe(true);

    const assigned = await repository.assign(
      created.record.id,
      { id: "staff-1", name: "Ola" },
      { id: "staff-2", name: "Marek" },
    );
    expect(assigned.assigneeName).toBe("Ola");

    const noted = await repository.addNote(created.record.id, {
      authorId: "staff-1",
      authorName: "Ola",
      body: "Klient prosił o telefon.",
    });
    expect(noted.notes).toHaveLength(1);
    expect(noted.history.map((entry) => entry.action)).toContain("note_added");
  });

  it("does not delete inquiries when retention is not configured", async () => {
    expect(retentionCutoff(new Date("2026-11-06T00:00:00Z"), "")).toBeNull();
    expect(retentionCutoff(new Date("2026-11-06T00:00:00Z"), "30")).toBeInstanceOf(Date);
    const previous = process.env.DATA_RETENTION_DAYS;
    delete process.env.DATA_RETENTION_DAYS;
    const repository = new MemoryInquiryRepository();
    const hash = inquiryContentHash(inquiry);
    await repository.createIfAbsent({ record: inquiryFromPayload(inquiry, hash, hash) });
    const result = await purgeExpiredInquiries(repository);
    expect(result).toEqual({ configured: false, deleted: 0 });
    expect((await repository.counts()).fresh).toBe(1);
    if (previous === undefined) {
      delete process.env.DATA_RETENTION_DAYS;
    } else {
      process.env.DATA_RETENTION_DAYS = previous;
    }
  });
});

const original = {
  nodeEnv: process.env.NODE_ENV,
  store: process.env.INQUIRY_STORE,
  databaseUrl: process.env.DATABASE_URL,
};

afterEach(() => {
  (process.env as Record<string, string | undefined>).NODE_ENV = original.nodeEnv;
  if (original.store === undefined) delete process.env.INQUIRY_STORE;
  else process.env.INQUIRY_STORE = original.store;
  if (original.databaseUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = original.databaseUrl;
  resetInquiryRepositoryForTests();
});

describe("getInquiryRepository", () => {
  it("keeps the memory store available outside production", () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "test";
    process.env.INQUIRY_STORE = "memory";
    delete process.env.DATABASE_URL;
    expect(getInquiryRepository()).toBeInstanceOf(MemoryInquiryRepository);
  });

  it("does not keep inquiries in process memory during production", () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    process.env.INQUIRY_STORE = "memory";
    delete process.env.DATABASE_URL;
    expect(getInquiryRepository()).toBeNull();
  });
});
