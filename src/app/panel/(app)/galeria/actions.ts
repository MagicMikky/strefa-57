"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { fallbackGallery, normalizeGallery, type ManagedCategory, type ManagedPhoto } from "@/lib/gallery/model";
import { inspectImage } from "@/lib/gallery/files";
import { publishGalleryDraft, readGalleryDraft, saveGalleryDraft } from "@/lib/gallery/store";
import { managedSrc, saveGalleryUpload } from "@/lib/gallery/storage";
import { getPrisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/staff/session";

function text(form: FormData, name: string) {
  return String(form.get(name) ?? "");
}

function photosFromForm(form: FormData, current: ManagedPhoto[]) {
  const cover = text(form, "cover");
  return normalizeGallery(current.map((photo) => ({
    ...photo,
    alt: text(form, `alt_${photo.id}`),
    title: text(form, `title_${photo.id}`),
    label: text(form, `label_${photo.id}`),
    category: text(form, `category_${photo.id}`) as ManagedCategory,
    visible: form.get(`visible_${photo.id}`) === "on",
    cover: cover === photo.id,
  })));
}

export async function saveGalleryAction(form: FormData) {
  const actor = await requireStaff("business.publish");
  const current = (await readGalleryDraft(getPrisma())) ?? fallbackGallery();
  const parsed = photosFromForm(form, current);
  if (!parsed.ok) redirect(`/panel/galeria?error=${encodeURIComponent(parsed.error)}`);
  await saveGalleryDraft(getPrisma(), actor.id, parsed.value);
  redirect("/panel/galeria?saved=draft");
}

export async function publishGalleryAction() {
  const actor = await requireStaff("business.publish");
  const result = await publishGalleryDraft(getPrisma(), actor.id);
  if (!result.ok) redirect(`/panel/galeria?error=${encodeURIComponent(result.error)}`);
  revalidatePath("/", "layout");
  revalidatePath("/galeria");
  redirect("/panel/galeria?saved=published");
}

export async function uploadGalleryAction(form: FormData) {
  const actor = await requireStaff("business.publish");
  if (form.get("rights") !== "on") {
    redirect(`/panel/galeria?error=${encodeURIComponent("Potwierdź, że kadr nie wymaga zgody na wizerunek albo że zgoda jest.")}`);
  }
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    redirect(`/panel/galeria?error=${encodeURIComponent("Wybierz plik zdjęcia.")}`);
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const inspected = inspectImage(bytes);
  if ("error" in inspected) redirect(`/panel/galeria?error=${encodeURIComponent(inspected.error)}`);
  const storageName = await saveGalleryUpload(bytes, inspected.kind);
  const current = (await readGalleryDraft(getPrisma())) ?? fallbackGallery();
  const id = storageName.replace(/\.(jpg|png|webp)$/, "");
  const parsed = normalizeGallery([
    ...current,
    {
      id,
      src: managedSrc(storageName),
      storageName,
      alt: text(form, "alt"),
      title: text(form, "title"),
      label: text(form, "label"),
      category: text(form, "category") as ManagedCategory,
      width: inspected.width,
      height: inspected.height,
      visible: true,
      cover: false,
    },
  ]);
  if (!parsed.ok) redirect(`/panel/galeria?error=${encodeURIComponent(parsed.error)}`);
  await saveGalleryDraft(getPrisma(), actor.id, parsed.value);
  redirect("/panel/galeria?saved=upload");
}
