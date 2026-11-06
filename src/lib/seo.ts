import type { Metadata } from "next";
import { getSiteUrl } from "@/data/site";

export function isSearchIndexingAllowed(): boolean {
  if (process.env.NEXT_PUBLIC_ALLOW_INDEXING !== "true") {
    return false;
  }

  try {
    const url = new URL(getSiteUrl());
    const hostname = url.hostname.toLowerCase();
    return (
      url.protocol === "https:" &&
      hostname !== "localhost" &&
      hostname !== "127.0.0.1" &&
      hostname !== "::1"
    );
  } catch {
    return false;
  }
}

export function searchRobots(): NonNullable<Metadata["robots"]> {
  if (!isSearchIndexingAllowed()) {
    return { index: false, follow: false, nocache: true };
  }

  return { index: true, follow: true };
}
