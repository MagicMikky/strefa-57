export type GalleryPhoto = {
  src: string;
  width: number;
  height: number;
  alt: string;
  title: string;
  label: string;
};

export type PendingGalleryAsset = {
  file: string;
  reason: string;
};

export const galleryPhotos: readonly GalleryPhoto[] = [
  {
    src: "/gallery/okopy.jpg",
    width: 1536,
    height: 2048,
    alt: "Świeżo wykopane okopy na leśnym polu paintballowym, bez osób w kadrze.",
    title: "Okopy",
    label: "Podejście przez teren",
  },
  {
    src: "/gallery/teren.jpg",
    width: 1536,
    height: 2048,
    alt: "Drewniana osłona z gałęziami między drzewami na polu w lesie.",
    title: "Teren",
    label: "Osłona w lesie",
  },
  {
    src: "/rakieta.jpg",
    width: 1024,
    height: 1536,
    alt: "Makieta rakiety V2 z napisem Strefa 29, stojąca na polanie między drzewami.",
    title: "Rakieta V2",
    label: "Punkt finału",
  },
];

export const galleryPreviewPhotos = galleryPhotos.filter((photo) => photo.src !== "/rakieta.jpg");

// Kept out of the public pages until the owner confirms likeness consent or that the file is a real field photo.
export const pendingGalleryAssets: readonly PendingGalleryAsset[] = [
  { file: "gallery/04e3c76d-9c0b-456b-a32b-ed26f38baed7.jpg", reason: "Widoczne osoby w strojach i maskach. Brak potwierdzonej zgody na wizerunek." },
  { file: "gallery/8de2df81-ae4a-4a6f-9280-04aba03aeb30.jpg", reason: "Widoczne osoby w strojach i maskach. Brak potwierdzonej zgody na wizerunek." },
  { file: "gallery/9900ec1c-caf4-409e-b77f-a9cb7b23b6f7.jpg", reason: "Widoczne osoby w strojach i maskach. Brak potwierdzonej zgody na wizerunek." },
  { file: "gallery/9cf62f04-4999-4562-b207-7d133a9adeb6.jpg", reason: "Widoczne osoby w strojach i maskach. Brak potwierdzonej zgody na wizerunek." },
  { file: "gallery/d6fd0af3-5ee6-4efa-baed-c31e1388c925.jpg", reason: "Widoczne osoby w strojach i maskach. Brak potwierdzonej zgody na wizerunek." },
  { file: "gallery/rakieta2.jpg", reason: "Kadr wygląda na grafikę koncepcyjną. Nie publikować jako zdjęcia obiektu bez potwierdzenia." },
  { file: "gallery/42886b6d-ae20-467a-9ae3-066e359eda81.mp4", reason: "Film nie wszedł do siatki zdjęć. Treść i zgody nie są potwierdzone." },
  { file: "gallery/aca1cbb3-2e30-4a1c-93e4-d58cd67decb8.mp4", reason: "Film nie wszedł do siatki zdjęć. Treść i zgody nie są potwierdzone." },
];
