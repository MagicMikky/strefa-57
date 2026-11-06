export type GalleryPhoto = {
  src: string;
  width: number;
  height: number;
  alt: string;
  title: string;
  label: string;
};

// Approved field photos belong in public/gallery and are listed here.
// layout/ holds source files and concept art; it is not published automatically.
export const galleryPhotos: readonly GalleryPhoto[] = [];
