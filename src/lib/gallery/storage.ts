import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { ImageKind } from "@/lib/gallery/files";

const SAFE_NAME = /^[a-z0-9-]+\.(jpg|png|webp)$/;

export function galleryStorageDir() {
  return path.join(process.cwd(), "storage", "gallery");
}

export function galleryManagedDir() {
  return path.join(process.cwd(), "public", "gallery", "managed");
}

function inside(root: string, name: string) {
  if (!SAFE_NAME.test(name)) return null;
  const base = path.resolve(root);
  const target = path.resolve(base, name);
  if (!target.startsWith(base + path.sep)) return null;
  return target;
}

export async function saveGalleryUpload(bytes: Uint8Array, kind: ImageKind) {
  const ext = kind === "jpg" ? "jpg" : kind;
  const name = `${randomUUID()}.${ext}`;
  const directory = galleryStorageDir();
  await mkdir(directory, { recursive: true });
  const target = inside(directory, name);
  if (!target) throw new Error("Nie udało się zapisać pliku.");
  await writeFile(target, bytes);
  return name;
}

export async function readGalleryUpload(name: string) {
  const target = inside(galleryStorageDir(), name);
  if (!target) return null;
  try {
    return await readFile(target);
  } catch {
    return null;
  }
}

export async function publishGalleryFile(name: string) {
  const source = inside(galleryStorageDir(), name);
  const target = inside(galleryManagedDir(), name);
  if (!source || !target) return false;
  try {
    const bytes = await readFile(source);
    await mkdir(galleryManagedDir(), { recursive: true });
    await writeFile(target, bytes);
    return true;
  } catch {
    return false;
  }
}

export function managedSrc(name: string) {
  return `/gallery/managed/${name}`;
}
