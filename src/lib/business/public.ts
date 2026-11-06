import { cache } from "react";

import { fallbackBusiness, selectPublicBundle, type BusinessBundle } from "@/lib/business/model";
import { readPublished } from "@/lib/business/store";
import { getPrisma } from "@/lib/prisma";

export async function readPublicBusiness(
  hasDatabase: boolean,
  load: () => Promise<BusinessBundle | null>,
): Promise<BusinessBundle> {
  const fallback = fallbackBusiness();
  if (!hasDatabase) return fallback;
  try {
    return selectPublicBundle(await load(), fallback);
  } catch {
    return fallback;
  }
}

export const getPublicBusiness = cache(async (): Promise<BusinessBundle> => {
  return readPublicBusiness(Boolean(process.env.DATABASE_URL), () => readPublished(getPrisma()));
});
