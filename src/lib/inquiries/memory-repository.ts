import { randomUUID } from "node:crypto";

import {
  InquiryConflictError,
  InquiryNotFoundError,
  type InquiryHistoryRecord,
  type InquiryListQuery,
  type InquiryNoteRecord,
  type InquiryNotificationRecord,
  type InquiryRecord,
  type InquiryStatus,
} from "@/lib/inquiries/model";

export interface NewInquiry {
  record: Omit<InquiryRecord, "notes" | "history" | "notifications" | "assigneeName">;
}

export interface InquiryRepository {
  createIfAbsent(input: NewInquiry): Promise<{ record: InquiryRecord; created: boolean }>;
  list(query: InquiryListQuery): Promise<{ items: InquiryRecord[]; total: number }>;
  counts(): Promise<{ fresh: number; inProgress: number; waiting: number }>;
  recent(limit: number): Promise<InquiryRecord[]>;
  recentHistory(limit: number): Promise<Array<InquiryHistoryRecord & { inquiryId: string }>>;
  get(id: string): Promise<InquiryRecord | null>;
  setStatus(
    id: string,
    status: InquiryStatus,
    actor: { id: string; name: string },
  ): Promise<InquiryRecord>;
  assign(
    id: string,
    assignee: { id: string; name: string } | null,
    actor: { id: string; name: string },
  ): Promise<InquiryRecord>;
  addNote(
    id: string,
    note: { authorId: string; authorName: string; body: string },
  ): Promise<InquiryRecord>;
  notificationFor(id: string): Promise<InquiryNotificationRecord | null>;
  markNotification(
    inquiryId: string,
    result: { status: InquiryNotificationRecord["status"]; error: string | null },
  ): Promise<void>;
  deleteOlderThan(cutoff: Date): Promise<number>;
  listStaff(): Promise<Array<{ id: string; name: string; role: string; status: string }>>;
  listRetryable(limit: number): Promise<InquiryRecord[]>;
}

function emptyRecord(
  input: NewInquiry["record"],
): InquiryRecord {
  return {
    ...input,
    assigneeName: null,
    notes: [],
    history: [
      {
        id: randomUUID(),
        actorId: null,
        actorName: null,
        action: "created",
        fromStatus: null,
        toStatus: "new",
        createdAt: input.createdAt,
      },
    ],
    notifications: [
      {
        id: randomUUID(),
        status: "pending",
        attempts: 0,
        lastError: null,
        createdAt: input.createdAt,
      },
    ],
  };
}

export class MemoryInquiryRepository implements InquiryRepository {
  private readonly records = new Map<string, InquiryRecord>();

  async createIfAbsent(input: NewInquiry): Promise<{ record: InquiryRecord; created: boolean }> {
    const existing = [...this.records.values()].find(
      (record) => record.dedupeKey === input.record.dedupeKey,
    );
    if (existing) {
      if (existing.contentHash !== input.record.contentHash) {
        throw new InquiryConflictError();
      }
      return { record: structuredClone(existing), created: false };
    }

    const record = emptyRecord(input.record);
    this.records.set(record.id, record);
    return { record: structuredClone(record), created: true };
  }

  async list(query: InquiryListQuery): Promise<{ items: InquiryRecord[]; total: number }> {
    const needle = query.q.toLowerCase();
    const filtered = [...this.records.values()].filter((record) => {
      if (query.status && record.status !== query.status) {
        return false;
      }
      if (!needle) {
        return true;
      }
      return [record.name, record.email, record.message, record.packageId, record.eventType]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
    filtered.sort((left, right) => {
      const delta = left[query.sort].getTime() - right[query.sort].getTime();
      return query.direction === "asc" ? delta : -delta;
    });
    const start = (query.page - 1) * query.pageSize;
    return {
      total: filtered.length,
      items: filtered.slice(start, start + query.pageSize).map((record) => structuredClone(record)),
    };
  }

  async counts(): Promise<{ fresh: number; inProgress: number; waiting: number }> {
    const values = [...this.records.values()];
    return {
      fresh: values.filter((record) => record.status === "new").length,
      inProgress: values.filter((record) => record.status === "in_progress").length,
      waiting: values.filter((record) => record.status === "waiting_for_customer").length,
    };
  }

  async recent(limit: number): Promise<InquiryRecord[]> {
    return [...this.records.values()]
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
      .slice(0, limit)
      .map((record) => structuredClone(record));
  }

  async recentHistory(limit: number): Promise<Array<InquiryHistoryRecord & { inquiryId: string }>> {
    return [...this.records.values()]
      .flatMap((record) =>
        record.history.map((entry) => ({ ...entry, inquiryId: record.id })),
      )
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
      .slice(0, limit);
  }

  async get(id: string): Promise<InquiryRecord | null> {
    const record = this.records.get(id);
    return record ? structuredClone(record) : null;
  }

  async setStatus(
    id: string,
    status: InquiryStatus,
    actor: { id: string; name: string },
  ): Promise<InquiryRecord> {
    const record = this.require(id);
    const fromStatus = record.status;
    record.status = status;
    record.updatedAt = new Date();
    record.history.push({
      id: randomUUID(),
      actorId: actor.id,
      actorName: actor.name,
      action: "status_changed",
      fromStatus,
      toStatus: status,
      createdAt: record.updatedAt,
    });
    return structuredClone(record);
  }

  async assign(
    id: string,
    assignee: { id: string; name: string } | null,
    actor: { id: string; name: string },
  ): Promise<InquiryRecord> {
    const record = this.require(id);
    record.assigneeId = assignee?.id ?? null;
    record.assigneeName = assignee?.name ?? null;
    record.updatedAt = new Date();
    record.history.push({
      id: randomUUID(),
      actorId: actor.id,
      actorName: actor.name,
      action: assignee ? "assigned" : "unassigned",
      fromStatus: record.status,
      toStatus: record.status,
      createdAt: record.updatedAt,
    });
    return structuredClone(record);
  }

  async addNote(
    id: string,
    note: { authorId: string; authorName: string; body: string },
  ): Promise<InquiryRecord> {
    const record = this.require(id);
    const createdAt = new Date();
    const stored: InquiryNoteRecord = {
      id: randomUUID(),
      authorId: note.authorId,
      authorName: note.authorName,
      body: note.body,
      createdAt,
    };
    record.notes.push(stored);
    record.updatedAt = createdAt;
    record.history.push({
      id: randomUUID(),
      actorId: note.authorId,
      actorName: note.authorName,
      action: "note_added",
      fromStatus: record.status,
      toStatus: record.status,
      createdAt,
    });
    return structuredClone(record);
  }

  async notificationFor(id: string): Promise<InquiryNotificationRecord | null> {
    const record = this.records.get(id);
    return record?.notifications[0] ? { ...record.notifications[0] } : null;
  }

  async markNotification(
    inquiryId: string,
    result: { status: InquiryNotificationRecord["status"]; error: string | null },
  ): Promise<void> {
    const record = this.require(inquiryId);
    const notification = record.notifications[0];
    if (!notification) {
      return;
    }
    notification.attempts += result.status === "sent" || result.status === "failed" ? 1 : 0;
    notification.status = result.status;
    notification.lastError = result.error;
  }

  async deleteOlderThan(cutoff: Date): Promise<number> {
    let deleted = 0;
    for (const [id, record] of this.records) {
      if (record.createdAt < cutoff) {
        this.records.delete(id);
        deleted += 1;
      }
    }
    return deleted;
  }

  async listStaff(): Promise<Array<{ id: string; name: string; role: string; status: string }>> {
    return [];
  }

  async listRetryable(limit: number): Promise<InquiryRecord[]> {
    return [...this.records.values()]
      .filter((record) => {
        const notification = record.notifications[0];
        return (
          notification &&
          notification.status !== "sent" &&
          notification.attempts < 5
        );
      })
      .slice(0, limit)
      .map((record) => structuredClone(record));
  }

  private require(id: string): InquiryRecord {
    const record = this.records.get(id);
    if (!record) {
      throw new InquiryNotFoundError();
    }
    return record;
  }
}

export class FailingInquiryRepository implements InquiryRepository {
  async createIfAbsent(): Promise<{ record: InquiryRecord; created: boolean }> {
    throw new Error("database unavailable");
  }
  async list(): Promise<{ items: InquiryRecord[]; total: number }> {
    throw new Error("database unavailable");
  }
  async counts(): Promise<{ fresh: number; inProgress: number; waiting: number }> {
    throw new Error("database unavailable");
  }
  async recent(): Promise<InquiryRecord[]> {
    throw new Error("database unavailable");
  }
  async recentHistory(): Promise<Array<InquiryHistoryRecord & { inquiryId: string }>> {
    throw new Error("database unavailable");
  }
  async get(): Promise<InquiryRecord | null> {
    throw new Error("database unavailable");
  }
  async setStatus(): Promise<InquiryRecord> {
    throw new Error("database unavailable");
  }
  async assign(): Promise<InquiryRecord> {
    throw new Error("database unavailable");
  }
  async addNote(): Promise<InquiryRecord> {
    throw new Error("database unavailable");
  }
  async notificationFor(): Promise<InquiryNotificationRecord | null> {
    throw new Error("database unavailable");
  }
  async markNotification(): Promise<void> {
    throw new Error("database unavailable");
  }
  async deleteOlderThan(): Promise<number> {
    throw new Error("database unavailable");
  }
  async listStaff(): Promise<Array<{ id: string; name: string; role: string; status: string }>> {
    throw new Error("database unavailable");
  }
  async listRetryable(): Promise<InquiryRecord[]> {
    throw new Error("database unavailable");
  }
}
