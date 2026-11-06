import { describe, expect, it } from "vitest";

import { pendingGalleryAssets } from "@/data/gallery";
import { inspectImage } from "@/lib/gallery/files";
import {
  fallbackGallery,
  normalizeGallery,
  selectPublishedGallery,
  toPublicPhotos,
} from "@/lib/gallery/model";
import { authorize } from "@/lib/staff/permissions";

const png = Uint8Array.from(Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
));

describe("gallery catalog", () => {
  it("keeps the approved photos and rejects markup or a swapped file", () => {
    const result = normalizeGallery(fallbackGallery());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(toPublicPhotos(result.value)).toHaveLength(3);
    const broken = fallbackGallery();
    broken[0].alt = "<script>alert(1)</script>";
    expect(normalizeGallery(broken).ok).toBe(false);
    const swapped = fallbackGallery();
    swapped[0].src = pendingGalleryAssets[0].file;
    expect(normalizeGallery(swapped).ok).toBe(false);
  });

  it("hides a draft from the public selection and blocks other roles", () => {
    const fallback = fallbackGallery();
    expect(selectPublishedGallery(null, fallback)).toBe(fallback);
    const hidden = fallbackGallery();
    hidden[2].visible = false;
    const parsed = normalizeGallery(hidden);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(toPublicPhotos(parsed.value).map((photo) => photo.id)).toEqual(["okopy", "teren"]);
    expect(authorize("employee", "business.publish")).toBe("forbidden");
  });

  it("accepts a real PNG header and rejects a text file", () => {
    expect(inspectImage(png)).toMatchObject({ kind: "png", width: 1, height: 1 });
    expect("error" in inspectImage(Uint8Array.from([0x3c, 0x73, 0x63, 0x72]))).toBe(true);
  });
});
