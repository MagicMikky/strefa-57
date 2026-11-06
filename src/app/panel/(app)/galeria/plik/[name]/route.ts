import { readGalleryUpload } from "@/lib/gallery/storage";
import { requireStaff } from "@/lib/staff/session";

const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(_request: Request, context: { params: Promise<{ name: string }> }) {
  await requireStaff("business.publish");
  const { name } = await context.params;
  const bytes = await readGalleryUpload(name);
  if (!bytes) return new Response("Nie znaleziono pliku.", { status: 404 });
  const extension = name.slice(name.lastIndexOf(".") + 1);
  return new Response(Buffer.from(bytes), {
    headers: {
      "content-type": TYPES[extension] ?? "application/octet-stream",
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
    },
  });
}
