import type { ValidInquiry } from "@/lib/inquiry";
import type { InquiryRecord } from "@/lib/inquiries/model";
import type { InquiryRepository } from "@/lib/inquiries/memory-repository";
import { dispatchInquiryNotification } from "@/lib/inquiries/dispatch";
import { retentionCutoff } from "@/lib/inquiries/retention";

export function recordToInquiry(record: InquiryRecord): ValidInquiry {
  return {
    playerCount: record.playerCount,
    preferredDate: record.preferredDate,
    preferredTime: record.preferredTime as ValidInquiry["preferredTime"],
    alternateDate: record.alternateDate,
    packageId: record.packageId,
    eventType: record.eventType as ValidInquiry["eventType"],
    name: record.name,
    preferredContact: record.preferredContact as ValidInquiry["preferredContact"],
    phone: record.phone,
    email: record.email,
    message: record.message,
    privacyAccepted: record.privacyAccepted,
    website: "",
  };
}

export async function retryPendingNotifications(repository: InquiryRepository) {
  const records = await repository.listRetryable(50);
  const summary = { examined: records.length, sent: 0, failed: 0, skipped: 0 };
  for (const record of records) {
    const result = await dispatchInquiryNotification(
      repository,
      record.id,
      recordToInquiry(record),
    );
    if (result === "sent") {
      summary.sent += 1;
    } else if (result === "failed") {
      summary.failed += 1;
    } else {
      summary.skipped += 1;
    }
  }
  return summary;
}

export async function purgeExpiredInquiries(repository: InquiryRepository) {
  const cutoff = retentionCutoff();
  if (!cutoff) {
    return { configured: false as const, deleted: 0 };
  }
  const deleted = await repository.deleteOlderThan(cutoff);
  return { configured: true as const, deleted };
}
