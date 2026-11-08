import { randomUUID } from "node:crypto";

import type { ValidInquiry } from "@/lib/inquiry";
import { getEmailConfig, sendInquiryEmail } from "@/lib/inquiries/email";
import type { InquiryRepository } from "@/lib/inquiries/memory-repository";

const MAX_ATTEMPTS = 5;
const LEASE_DURATION_MS = 60_000;

function retryAt(now: Date, attempts: number): Date {
  const delayMs = Math.min(2 ** attempts * 60_000, 60 * 60_000);
  return new Date(now.getTime() + delayMs);
}

export async function dispatchInquiryNotification(
  repository: InquiryRepository,
  inquiryId: string,
  inquiry: ValidInquiry,
): Promise<"sent" | "failed" | "skipped" | "already"> {
  const now = new Date();
  const token = randomUUID();
  const claim = await repository.claimNotification(inquiryId, {
    token,
    now,
    expiresAt: new Date(now.getTime() + LEASE_DURATION_MS),
  });
  if (!claim) {
    const current = await repository.notificationFor(inquiryId);
    if (current?.status === "sent") {
      return "already";
    }
    if (current?.status === "failed" && current.attempts >= MAX_ATTEMPTS) {
      return "failed";
    }
    return "skipped";
  }

  const config = getEmailConfig();
  if (!config) {
    await repository.completeNotification(inquiryId, token, {
      status: "skipped",
      error: "email_not_configured",
      nextAttemptAt: new Date(now.getTime() + 5 * 60_000),
    });
    return "skipped";
  }

  const result = await sendInquiryEmail(inquiry, config, claim.id);
  await repository.completeNotification(inquiryId, token, {
    status: result,
    error: result === "sent" ? null : "provider_rejected",
    nextAttemptAt: result === "sent" ? now : retryAt(now, claim.attempts),
  });
  return result;
}
