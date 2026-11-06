import { randomUUID } from "node:crypto";

import type { Prisma, PrismaClient } from "@prisma/client";

import {
  InquiryConflictError,
  InquiryNotFoundError,
  isInquiryStatus,
  type InquiryHistoryRecord,
  type InquiryListQuery,
  type InquiryNotificationRecord,
  type InquiryRecord,
  type InquiryStatus,
} from "@/lib/inquiries/model";
import type { InquiryRepository, NewInquiry } from "@/lib/inquiries/memory-repository";
import { STAFF_ROLES } from "@/lib/staff/permissions";

const include = {
  assignee: { select: { name: true } },
  notes: {
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  },
  history: {
    include: { actor: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  },
  notifications: { orderBy: { createdAt: "asc" } },
} satisfies Prisma.InquiryInclude;

type InquiryRow = Prisma.InquiryGetPayload<{ include: typeof include }>;

function mapInquiry(row: InquiryRow): InquiryRecord {
  const status: InquiryStatus = isInquiryStatus(row.status) ? row.status : "new";
  return {
    id: row.id,
    dedupeKey: row.dedupeKey,
    contentHash: row.contentHash,
    status,
    playerCount: row.playerCount,
    preferredDate: row.preferredDate,
    preferredTime: row.preferredTime,
    alternateDate: row.alternateDate,
    packageId: row.packageId,
    eventType: row.eventType,
    name: row.name,
    preferredContact: row.preferredContact,
    phone: row.phone,
    email: row.email,
    message: row.message,
    privacyAccepted: row.privacyAccepted,
    privacyNoticeVersion: row.privacyNoticeVersion,
    assigneeId: row.assigneeId,
    assigneeName: row.assignee?.name ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    notes: row.notes.map((note) => ({
      id: note.id,
      authorId: note.authorId,
      authorName: note.author.name,
      body: note.body,
      createdAt: note.createdAt,
    })),
    history: row.history.map((entry) => ({
      id: entry.id,
      actorId: entry.actorId,
      actorName: entry.actor?.name ?? null,
      action: entry.action,
      fromStatus: entry.fromStatus,
      toStatus: entry.toStatus,
      createdAt: entry.createdAt,
    })),
    notifications: row.notifications.map((notification) => ({
      id: notification.id,
      status: notification.status as InquiryNotificationRecord["status"],
      attempts: notification.attempts,
      lastError: notification.lastError,
      createdAt: notification.createdAt,
    })),
  };
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

export function createPrismaInquiryRepository(
  db: PrismaClient,
): InquiryRepository {
  async function requireRow(id: string): Promise<InquiryRow> {
    const row = await db.inquiry.findUnique({ where: { id }, include });
    if (!row) {
      throw new InquiryNotFoundError();
    }
    return row;
  }

  return {
    async createIfAbsent(input: NewInquiry) {
      const existing = await db.inquiry.findUnique({
        where: { dedupeKey: input.record.dedupeKey },
        include,
      });
      if (existing) {
        if (existing.contentHash !== input.record.contentHash) {
          throw new InquiryConflictError();
        }
        return { record: mapInquiry(existing), created: false };
      }

      try {
        const created = await db.inquiry.create({
          data: {
            ...input.record,
            history: {
              create: {
                id: randomUUID(),
                action: "created",
                toStatus: "new",
              },
            },
            notifications: {
              create: {
                id: randomUUID(),
                channel: "email",
                status: "pending",
              },
            },
          },
          include,
        });
        return { record: mapInquiry(created), created: true };
      } catch (error) {
        if (!isUniqueViolation(error)) {
          throw error;
        }
        const winner = await db.inquiry.findUnique({
          where: { dedupeKey: input.record.dedupeKey },
          include,
        });
        if (!winner) {
          throw error;
        }
        if (winner.contentHash !== input.record.contentHash) {
          throw new InquiryConflictError();
        }
        return { record: mapInquiry(winner), created: false };
      }
    },

    async list(query: InquiryListQuery) {
      const where: Prisma.InquiryWhereInput = {
        ...(query.status ? { status: query.status } : {}),
        ...(query.q
          ? {
              OR: [
                { name: { contains: query.q, mode: "insensitive" } },
                { email: { contains: query.q, mode: "insensitive" } },
                { message: { contains: query.q, mode: "insensitive" } },
                { packageId: { contains: query.q, mode: "insensitive" } },
                { eventType: { contains: query.q, mode: "insensitive" } },
              ],
            }
          : {}),
      };
      const [total, rows] = await Promise.all([
        db.inquiry.count({ where }),
        db.inquiry.findMany({
          where,
          include,
          orderBy: { [query.sort]: query.direction },
          skip: (query.page - 1) * query.pageSize,
          take: query.pageSize,
        }),
      ]);
      return { total, items: rows.map(mapInquiry) };
    },

    async counts() {
      const [fresh, inProgress, waiting] = await Promise.all([
        db.inquiry.count({ where: { status: "new" } }),
        db.inquiry.count({ where: { status: "in_progress" } }),
        db.inquiry.count({ where: { status: "waiting_for_customer" } }),
      ]);
      return { fresh, inProgress, waiting };
    },

    async recent(limit: number) {
      const rows = await db.inquiry.findMany({
        include,
        orderBy: { createdAt: "desc" },
        take: limit,
      });
      return rows.map(mapInquiry);
    },

    async recentHistory(limit: number) {
      const rows = await db.inquiryHistory.findMany({
        include: { actor: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
      return rows.map((entry) => ({
        id: entry.id,
        inquiryId: entry.inquiryId,
        actorId: entry.actorId,
        actorName: entry.actor?.name ?? null,
        action: entry.action,
        fromStatus: entry.fromStatus,
        toStatus: entry.toStatus,
        createdAt: entry.createdAt,
      }));
    },

    async get(id: string) {
      const row = await db.inquiry.findUnique({ where: { id }, include });
      return row ? mapInquiry(row) : null;
    },

    async setStatus(id, status, actor) {
      const current = await requireRow(id);
      const updated = await db.inquiry.update({
        where: { id },
        data: {
          status,
          history: {
            create: {
              id: randomUUID(),
              actorId: actor.id,
              action: "status_changed",
              fromStatus: current.status,
              toStatus: status,
            },
          },
        },
        include,
      });
      return mapInquiry(updated);
    },

    async assign(id, assignee, actor) {
      await requireRow(id);
      const updated = await db.inquiry.update({
        where: { id },
        data: {
          assigneeId: assignee?.id ?? null,
          history: {
            create: {
              id: randomUUID(),
              actorId: actor.id,
              action: assignee ? "assigned" : "unassigned",
            },
          },
        },
        include,
      });
      return mapInquiry(updated);
    },

    async addNote(id, note) {
      await requireRow(id);
      const updated = await db.inquiry.update({
        where: { id },
        data: {
          notes: {
            create: {
              id: randomUUID(),
              authorId: note.authorId,
              body: note.body,
            },
          },
          history: {
            create: {
              id: randomUUID(),
              actorId: note.authorId,
              action: "note_added",
            },
          },
        },
        include,
      });
      return mapInquiry(updated);
    },

    async notificationFor(id) {
      const notification = await db.notificationOutbox.findFirst({
        where: { inquiryId: id },
        orderBy: { createdAt: "asc" },
      });
      if (!notification) {
        return null;
      }
      return {
        id: notification.id,
        status: notification.status as InquiryNotificationRecord["status"],
        attempts: notification.attempts,
        lastError: notification.lastError,
        createdAt: notification.createdAt,
      };
    },

    async markNotification(inquiryId, result) {
      const notification = await db.notificationOutbox.findFirst({
        where: { inquiryId },
        orderBy: { createdAt: "asc" },
      });
      if (!notification) {
        return;
      }
      await db.notificationOutbox.update({
        where: { id: notification.id },
        data: {
          status: result.status,
          lastError: result.error,
          attempts:
            result.status === "sent" || result.status === "failed"
              ? { increment: 1 }
              : undefined,
        },
      });
    },

    async deleteOlderThan(cutoff) {
      const result = await db.inquiry.deleteMany({
        where: { createdAt: { lt: cutoff } },
      });
      return result.count;
    },

    async listStaff() {
      const users = await db.user.findMany({
        where: { status: "active", role: { in: [...STAFF_ROLES] } },
        select: { id: true, name: true, role: true, status: true },
        orderBy: { name: "asc" },
      });
      return users;
    },

    async listRetryable(limit: number) {
      const rows = await db.inquiry.findMany({
        where: {
          notifications: {
            some: {
              status: { in: ["pending", "skipped", "failed"] },
              attempts: { lt: 5 },
            },
          },
        },
        include,
        orderBy: { createdAt: "asc" },
        take: limit,
      });
      return rows.map(mapInquiry);
    },
  };
}

export type { InquiryHistoryRecord };
