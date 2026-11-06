import { cache } from "react";

import { fallbackGallery, selectPublishedGallery, toPublicPhotos, type ManagedPhoto } from "@/lib/gallery/model";
import { readPublishedGallery } from "@/lib/gallery/store";
import { getPrisma } from "@/lib/prisma";

export async function readPublicGallery(
  hasDatabase: boolean,
  load: () => Promise<ManagedPhoto[] | null>,
) {
  const fallback = fallbackGallery();
  if (!hasDatabase) return toPublicPhotos(fallback);
  try {
    return toPublicPhotos(selectPublishedGallery(await load(), fallback));
  } catch {
    return toPublicPhotos(fallback);
  }
}

export const getPublishedGallery = cache(async () => {
  return readPublicGallery(Boolean(process.env.DATABASE_URL), () => readPublishedGallery(getPrisma()));
});
