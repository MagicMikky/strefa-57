import {
  FailingInquiryRepository,
  MemoryInquiryRepository,
  type InquiryRepository,
} from "@/lib/inquiries/memory-repository";
import { createPrismaInquiryRepository } from "@/lib/inquiries/prisma-repository";
import { getPrisma } from "@/lib/prisma";

let memoryRepository: MemoryInquiryRepository | undefined;

export function resetInquiryRepositoryForTests(): void {
  memoryRepository = undefined;
}

export function getInquiryRepository(): InquiryRepository | null {
  if (process.env.NODE_ENV === "test" && process.env.INQUIRY_STORE === "fail") {
    return new FailingInquiryRepository();
  }

  if (process.env.INQUIRY_STORE === "memory" && process.env.NODE_ENV !== "production") {
    memoryRepository ??= new MemoryInquiryRepository();
    return memoryRepository;
  }

  if (process.env.DATABASE_URL) {
    return createPrismaInquiryRepository(getPrisma());
  }

  if (process.env.NODE_ENV === "test") {
    memoryRepository ??= new MemoryInquiryRepository();
    return memoryRepository;
  }

  return null;
}
