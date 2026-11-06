import { cache } from "react";

import { fallbackBusiness, selectPublicBundle, type BusinessBundle } from "@/lib/business/model";
import { readPublished } from "@/lib/business/store";
import { getPrisma } from "@/lib/prisma";

export const getPublicBusiness = cache(async (): Promise<BusinessBundle> => {
  const fallback = fallbackBusiness();
  if (!process.env.DATABASE_URL) return fallback;
  try {
    const published = await readPublished(getPrisma());
    return selectPublicBundle(published, fallback);
  } catch {
    return fallback;
  }
});
