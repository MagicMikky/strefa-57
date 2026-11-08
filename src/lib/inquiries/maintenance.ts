import type { InquiryRepository } from "@/lib/inquiries/memory-repository";
import { retentionCutoff } from "@/lib/inquiries/retention";

export async function purgeExpiredInquiries(repository: InquiryRepository) {
  const cutoff = retentionCutoff();
  if (!cutoff) {
    return { configured: false as const, deleted: 0 };
  }
  const deleted = await repository.deleteOlderThan(cutoff);
  return { configured: true as const, deleted };
}
