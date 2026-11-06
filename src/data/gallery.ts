export const galleryCategories = [
  { id: "wszystkie", label: "Wszystkie" },
  { id: "atrakcje", label: "Atrakcje" },
  { id: "teren", label: "Teren" },
  { id: "okopy-i-bunkry", label: "Okopy i bunkry" },
] as const;

export type GalleryCategoryId = (typeof galleryCategories)[number]["id"];

export type GalleryPhoto = {
  id: string;
  src: string;
  sourceFile: string;
  width: number;
  height: number;
  orientation: "portrait" | "landscape";
  alt: string;
  title: string;
  label: string;
  category: Exclude<GalleryCategoryId, "wszystkie">;
  order: number;
  published: true;
};

export type PendingGalleryAsset = {
  file: string;
  width: number;
  height: number;
  orientation: "portrait" | "landscape";
  suggestedCategory: Exclude<GalleryCategoryId, "wszystkie">;
  reason: string;
  published: false;
};

export const galleryPhotos: readonly GalleryPhoto[] = [
  {
    id: "okopy",
    src: "/gallery/okopy.jpg",
    sourceFile: "gallery/a48e4343-1eeb-4d7e-9c6f-caaf111b6ce3.jpg",
    width: 1536,
    height: 2048,
    orientation: "portrait",
    alt: "Świeżo wykopane okopy na leśnym polu paintballowym, bez osób w kadrze.",
    title: "Okopy",
    label: "Podejście przez teren",
    category: "okopy-i-bunkry",
    order: 1,
    published: true,
  },
  {
    id: "teren",
    src: "/gallery/teren.jpg",
    sourceFile: "gallery/6f77a4ce-5145-4c2e-895e-2fb10afde57e.jpg",
    width: 1536,
    height: 2048,
    orientation: "portrait",
    alt: "Drewniana osłona z gałęziami między drzewami na polu w lesie.",
    title: "Teren",
    label: "Osłona w lesie",
    category: "teren",
    order: 2,
    published: true,
  },
  {
    id: "rakieta",
    src: "/rakieta.jpg",
    sourceFile: "gallery/rakieta.jpg",
    width: 1024,
    height: 1536,
    orientation: "portrait",
    alt: "Makieta rakiety V2 z napisem Strefa 29, stojąca na polanie między drzewami.",
    title: "Rakieta V2",
    label: "Punkt finału",
    category: "atrakcje",
    order: 3,
    published: true,
  },
];

export function categoriesWithPhotos(photos: readonly GalleryPhoto[]) {
  return galleryCategories.filter((category) =>
    category.id === "wszystkie"
      ? photos.length > 0
      : photos.some((photo) => photo.category === category.id),
  );
}

// Kept out of the public pages until the owner confirms likeness consent or that the file is a real field photo.
export const pendingGalleryAssets: readonly PendingGalleryAsset[] = [
  {
    file: "gallery/04e3c76d-9c0b-456b-a32b-ed26f38baed7.jpg",
    width: 2048,
    height: 1358,
    orientation: "landscape",
    suggestedCategory: "okopy-i-bunkry",
    reason: "Dwie osoby w maskach i strojach przed bunkrem. Brak zgody na wizerunek.",
    published: false,
  },
  {
    file: "gallery/8de2df81-ae4a-4a6f-9280-04aba03aeb30.jpg",
    width: 2048,
    height: 1751,
    orientation: "landscape",
    suggestedCategory: "okopy-i-bunkry",
    reason: "Dwie osoby widoczne w oknie bunkra. Brak zgody na wizerunek.",
    published: false,
  },
  {
    file: "gallery/9900ec1c-caf4-409e-b77f-a9cb7b23b6f7.jpg",
    width: 2048,
    height: 1536,
    orientation: "landscape",
    suggestedCategory: "okopy-i-bunkry",
    reason: "Dwie osoby w oknie drewnianej osłony. Brak zgody na wizerunek.",
    published: false,
  },
  {
    file: "gallery/9cf62f04-4999-4562-b207-7d133a9adeb6.jpg",
    width: 1234,
    height: 2047,
    orientation: "portrait",
    suggestedCategory: "okopy-i-bunkry",
    reason: "Dwie osoby na balustradzie z bali. Brak zgody na wizerunek.",
    published: false,
  },
  {
    file: "gallery/d6fd0af3-5ee6-4efa-baed-c31e1388c925.jpg",
    width: 2048,
    height: 1489,
    orientation: "landscape",
    suggestedCategory: "okopy-i-bunkry",
    reason: "Dwie osoby przed bunkrem. Brak zgody na wizerunek.",
    published: false,
  },
  {
    file: "gallery/rakieta2.jpg",
    width: 1024,
    height: 1536,
    orientation: "portrait",
    suggestedCategory: "atrakcje",
    reason: "Kadr z konsolą i odliczaniem wygląda na złożoną grafikę. Nie publikować jako zdjęcia obiektu bez potwierdzenia.",
    published: false,
  },
  {
    file: "gallery/42886b6d-ae20-467a-9ae3-066e359eda81.mp4",
    width: 0,
    height: 0,
    orientation: "landscape",
    suggestedCategory: "atrakcje",
    reason: "Film nie wchodzi do rolki zdjęć. Treść i zgody nie są potwierdzone.",
    published: false,
  },
  {
    file: "gallery/aca1cbb3-2e30-4a1c-93e4-d58cd67decb8.mp4",
    width: 0,
    height: 0,
    orientation: "landscape",
    suggestedCategory: "atrakcje",
    reason: "Film nie wchodzi do rolki zdjęć. Treść i zgody nie są potwierdzone.",
    published: false,
  },
];
