import { getPrisma } from "@/lib/prisma";
import { readActiveCapacityHolds } from "@/lib/holds/store";
import type { CapacityHold } from "@/lib/holds/model";

export interface CapacityHoldView {
  known: boolean;
  holds: CapacityHold[];
}

export async function readPublicCapacityHolds(
  hasDatabase: boolean,
  load: () => Promise<CapacityHold[]>,
): Promise<CapacityHoldView> {
  if (!hasDatabase) return { known: true, holds: [] };
  try {
    return { known: true, holds: await load() };
  } catch {
    return { known: false, holds: [] };
  }
}

export async function getPublicCapacityHolds(now = new Date()): Promise<CapacityHoldView> {
  return readPublicCapacityHolds(Boolean(process.env.DATABASE_URL), () => readActiveCapacityHolds(getPrisma(), now));
}
