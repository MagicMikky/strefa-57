import { galleryPhotos, type GalleryPhoto } from "@/data/gallery";
import { plainText } from "@/lib/business/model";

const CATEGORIES = ["atrakcje", "teren", "okopy-i-bunkry"] as const;
export type ManagedCategory = (typeof CATEGORIES)[number];

export interface ManagedPhoto {
  id: string;
  src: string;
  storageName: string;
  alt: string;
  title: string;
  label: string;
  category: ManagedCategory;
  width: number;
  height: number;
  visible: boolean;
  cover: boolean;
}

const BUILT_IN = new Map(galleryPhotos.map((photo) => [photo.id, photo.src]));
const MANAGED_SRC = /^\/gallery\/managed\/[a-z0-9-]+\.(jpg|png|webp)$/;

export function fallbackGallery(): ManagedPhoto[] {
  return galleryPhotos.map((photo, index) => ({
    id: photo.id,
    src: photo.src,
    storageName: "",
    alt: photo.alt,
    title: photo.title,
    label: photo.label,
    category: photo.category,
    width: photo.width,
    height: photo.height,
    visible: true,
    cover: index === 0,
  }));
}

function text(value: unknown, max: number, label: string): string | { error: string } {
  if (typeof value !== "string") return { error: `${label} ma nieprawidłowy format.` };
  const cleaned = plainText(value, max, label);
  if (typeof cleaned !== "string") return cleaned;
  if (!cleaned) return { error: `${label} jest wymagany.` };
  return cleaned;
}

export function normalizeGallery(input: unknown): { ok: true; value: ManagedPhoto[] } | { ok: false; error: string } {
  if (!Array.isArray(input) || input.length < 1 || input.length > 12) {
    return { ok: false, error: "Galeria może mieć od 1 do 12 zdjęć." };
  }
  const photos: ManagedPhoto[] = [];
  const ids = new Set<string>();
  for (const item of input) {
    if (!item || typeof item !== "object") return { ok: false, error: "Nieprawidłowe zdjęcie." };
    const source = item as ManagedPhoto;
    if (typeof source.id !== "string" || !/^[a-z0-9-]{2,80}$/.test(source.id) || ids.has(source.id)) {
      return { ok: false, error: "Identyfikator zdjęcia jest nieprawidłowy." };
    }
    ids.add(source.id);
    const builtIn = BUILT_IN.get(source.id);
    const src = typeof source.src === "string" ? source.src : "";
    const storageName = typeof source.storageName === "string" ? source.storageName : "";
    if (builtIn && src !== builtIn) return { ok: false, error: "Nie można podmienić adresu opublikowanego zdjęcia pola." };
    if (!builtIn && !MANAGED_SRC.test(src)) return { ok: false, error: "Nowe zdjęcie musi pochodzić z zatwierdzonego przesłania." };
    if (storageName && !/^[a-z0-9-]+\.(jpg|png|webp)$/.test(storageName)) {
      return { ok: false, error: "Nazwa pliku zdjęcia jest nieprawidłowa." };
    }
    if (!(CATEGORIES as readonly string[]).includes(source.category)) {
      return { ok: false, error: "Kategoria zdjęcia jest niedozwolona." };
    }
    const alt = text(source.alt, 180, "Opis alternatywny");
    const title = text(source.title, 80, "Tytuł zdjęcia");
    const label = text(source.label, 80, "Podpis zdjęcia");
    if (typeof alt !== "string") return { ok: false, error: alt.error };
    if (typeof title !== "string") return { ok: false, error: title.error };
    if (typeof label !== "string") return { ok: false, error: label.error };
    const width = Number(source.width);
    const height = Number(source.height);
    if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width > 8000 || height > 8000) {
      return { ok: false, error: "Wymiary zdjęcia są nieprawidłowe." };
    }
    photos.push({
      id: source.id,
      src,
      storageName,
      alt,
      title,
      label,
      category: source.category,
      width,
      height,
      visible: source.visible === true,
      cover: source.cover === true,
    });
  }
  const visible = photos.filter((photo) => photo.visible);
  if (visible.length === 0) return { ok: false, error: "Przynajmniej jedno zdjęcie musi zostać widoczne." };
  let coverSeen = false;
  for (const photo of photos) {
    if (!photo.visible || !photo.cover || coverSeen) photo.cover = false;
    else coverSeen = true;
  }
  if (!coverSeen) {
    const first = photos.find((photo) => photo.visible);
    if (first) first.cover = true;
  }
  return { ok: true, value: photos };
}

export function selectPublishedGallery(published: ManagedPhoto[] | null, fallback: ManagedPhoto[]) {
  return published ?? fallback;
}

export function toPublicPhotos(photos: ManagedPhoto[]): GalleryPhoto[] {
  return photos
    .filter((photo) => photo.visible)
    .sort((left, right) => Number(right.cover) - Number(left.cover))
    .map((photo, index) => ({
      id: photo.id,
      src: photo.src,
      sourceFile: photo.storageName || photo.src,
      width: photo.width,
      height: photo.height,
      orientation: photo.width >= photo.height ? "landscape" : "portrait",
      alt: photo.alt,
      title: photo.title,
      label: photo.label,
      category: photo.category,
      order: index + 1,
      published: true,
    }));
}
