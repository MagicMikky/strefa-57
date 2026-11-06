import { createHash, randomUUID } from "node:crypto";

import type { ValidInquiry } from "@/lib/inquiry";
import { PRIVACY_NOTICE_VERSION } from "@/lib/inquiry";

export const INQUIRY_STATUSES = [
  "new",
  "in_progress",
  "waiting_for_customer",
  "handled",
  "closed",
] as const;

export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  new: "Nowe",
  in_progress: "W trakcie",
  waiting_for_customer: "Oczekuje na klienta",
  handled: "Obsłużone",
  closed: "Zamknięte",
};

export interface InquiryNoteRecord {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: Date;
}

export interface InquiryHistoryRecord {
  id: string;
  actorId: string | null;
  actorName: string | null;
  action: string;
  fromStatus: string | null;
  toStatus: string | null;
  createdAt: Date;
}

export interface InquiryNotificationRecord {
  id: string;
  status: "pending" | "sent" | "failed" | "skipped";
  attempts: number;
  lastError: string | null;
  createdAt: Date;
}

export interface InquiryRecord {
  id: string;
  dedupeKey: string;
  contentHash: string;
  status: InquiryStatus;
  playerCount: number;
  preferredDate: string;
  preferredTime: string;
  alternateDate: string;
  packageId: string;
  eventType: string;
  name: string;
  preferredContact: string;
  phone: string;
  email: string;
  message: string;
  privacyAccepted: boolean;
  privacyNoticeVersion: string;
  assigneeId: string | null;
  assigneeName: string | null;
  createdAt: Date;
  updatedAt: Date;
  notes: InquiryNoteRecord[];
  history: InquiryHistoryRecord[];
  notifications: InquiryNotificationRecord[];
}

export interface InquiryListQuery {
  q: string;
  status: InquiryStatus | "";
  sort: "createdAt" | "updatedAt";
  direction: "asc" | "desc";
  page: number;
  pageSize: number;
}

export class InquiryConflictError extends Error {
  constructor() {
    super("Idempotency key was already used for different content");
    this.name = "InquiryConflictError";
  }
}

export class InquiryNotFoundError extends Error {
  constructor() {
    super("Inquiry was not found");
    this.name = "InquiryNotFoundError";
  }
}

export function isInquiryStatus(value: string): value is InquiryStatus {
  return (INQUIRY_STATUSES as readonly string[]).includes(value);
}

export function inquiryContentHash(inquiry: ValidInquiry): string {
  const canonical = JSON.stringify({
    playerCount: inquiry.playerCount,
    preferredDate: inquiry.preferredDate,
    preferredTime: inquiry.preferredTime,
    alternateDate: inquiry.alternateDate,
    packageId: inquiry.packageId,
    eventType: inquiry.eventType,
    name: inquiry.name.trim(),
    preferredContact: inquiry.preferredContact,
    phone: inquiry.phone.trim(),
    email: inquiry.email.trim().toLowerCase(),
    message: inquiry.message.trim(),
  });
  return createHash("sha256").update(canonical).digest("hex");
}

export function resolveDedupeKey(
  contentHash: string,
  idempotencyKey: string | null,
): { dedupeKey: string } | { error: string } {
  if (!idempotencyKey) {
    return { dedupeKey: contentHash };
  }

  const key = idempotencyKey.trim();
  if (key.length < 16 || key.length > 80 || !/^[A-Za-z0-9._:-]+$/.test(key)) {
    return { error: "Klucz idempotencji ma nieprawidłowy format." };
  }

  return { dedupeKey: "idem:" + key };
}

export function inquiryFromPayload(
  inquiry: ValidInquiry,
  dedupeKey: string,
  contentHash: string,
): Omit<InquiryRecord, "notes" | "history" | "notifications" | "assigneeName"> {
  const now = new Date();
  return {
    id: randomUUID(),
    dedupeKey,
    contentHash,
    status: "new",
    playerCount: inquiry.playerCount,
    preferredDate: inquiry.preferredDate,
    preferredTime: inquiry.preferredTime,
    alternateDate: inquiry.alternateDate,
    packageId: inquiry.packageId,
    eventType: inquiry.eventType,
    name: inquiry.name.trim(),
    preferredContact: inquiry.preferredContact,
    phone: inquiry.phone.trim(),
    email: inquiry.email.trim().toLowerCase(),
    message: inquiry.message.trim(),
    privacyAccepted: inquiry.privacyAccepted,
    privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
    assigneeId: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function parseInquiryListQuery(
  source: Record<string, string | string[] | undefined>,
): InquiryListQuery {
  const read = (key: string) => {
    const value = source[key];
    return (Array.isArray(value) ? value[0] : value ?? "").trim();
  };
  const status = read("status");
  const sort = read("sort");
  const direction = read("direction");
  const page = Number(read("page") || "1");
  const pageSize = Number(read("pageSize") || "20");

  return {
    q: read("q").slice(0, 80),
    status: isInquiryStatus(status) ? status : "",
    sort: sort === "updatedAt" ? "updatedAt" : "createdAt",
    direction: direction === "asc" ? "asc" : "desc",
    page: Number.isInteger(page) && page > 0 ? Math.min(page, 10_000) : 1,
    pageSize:
      Number.isInteger(pageSize) && pageSize > 0
        ? Math.min(pageSize, 50)
        : 20,
  };
}
