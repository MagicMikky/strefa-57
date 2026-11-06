import type { ValidInquiry } from "@/lib/inquiry";
import { getEmailConfig, sendInquiryEmail } from "@/lib/inquiries/email";
import type { InquiryRepository } from "@/lib/inquiries/memory-repository";

const MAX_ATTEMPTS = 5;

export async function dispatchInquiryNotification(
  repository: InquiryRepository,
  inquiryId: string,
  inquiry: ValidInquiry,
): Promise<"sent" | "failed" | "skipped" | "already"> {
  const current = await repository.notificationFor(inquiryId);
  if (!current) {
    return "skipped";
  }
  if (current.status === "sent") {
    return "already";
  }
  if (current.attempts >= MAX_ATTEMPTS && current.status === "failed") {
    return "failed";
  }

  const config = getEmailConfig();
  if (!config) {
    await repository.markNotification(inquiryId, {
      status: "skipped",
      error: "email_not_configured",
    });
    return "skipped";
  }

  const result = await sendInquiryEmail(inquiry, config);
  await repository.markNotification(inquiryId, {
    status: result,
    error: result === "sent" ? null : "provider_rejected",
  });
  return result;
}
