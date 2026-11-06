import { cache } from "react";

import { fallbackBusiness } from "@/lib/business/model";
import { readPublished } from "@/lib/business/store";
import { getPrisma } from "@/lib/prisma";
import { fallbackSchedule, selectPublishedSchedule, type ScheduleCatalog } from "@/lib/schedule/model";
import { readScheduleSlot } from "@/lib/schedule/store";

export async function readPublicSchedule(
  hasDatabase: boolean,
  load: () => Promise<ScheduleCatalog | null>,
) {
  const fallback = fallbackSchedule();
  if (!hasDatabase) return fallback;
  try {
    return selectPublishedSchedule(await load(), fallback);
  } catch {
    return fallback;
  }
}

export const getPublishedSchedule = cache(async () => {
  const fallback = fallbackBusiness();
  return readPublicSchedule(Boolean(process.env.DATABASE_URL), async () => {
    const db = getPrisma();
    const company = await readPublished(db);
    const times = company?.settings.slotStartTimes ?? fallback.settings.slotStartTimes;
    return readScheduleSlot(db, "published", times);
  });
});
