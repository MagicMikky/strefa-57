import { cache } from "react";

import { fallbackSiteCopy, selectPublishedCopy, type SiteCopy } from "@/lib/content/model";
import { readPublishedSite } from "@/lib/content/store";
import { getPrisma } from "@/lib/prisma";

export async function readPublicSiteCopy(
  hasDatabase: boolean,
  load: () => Promise<SiteCopy | null>,
): Promise<SiteCopy> {
  const fallback = fallbackSiteCopy();
  if (!hasDatabase) return fallback;
  try {
    return selectPublishedCopy(await load(), fallback);
  } catch {
    return fallback;
  }
}

export const getPublishedSiteCopy = cache(async (): Promise<SiteCopy> => {
  return readPublicSiteCopy(Boolean(process.env.DATABASE_URL), () => readPublishedSite(getPrisma()));
});
