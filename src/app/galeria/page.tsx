import type { Metadata } from "next";
import { AnalyticsView } from "@/components/analytics-view";
import { GalleryCoverflow } from "@/components/gallery-coverflow";
import { ButtonLink, Container, CtaBand, PageHero, SectionHeading } from "@/components/ui";
import { getPublishedGallery } from "@/lib/gallery/public";

export const metadata: Metadata = {
  title: "Galeria pola",
  description: "Poznaj strefy i charakter terenowego pola Paintball Strefa 29 w Czaplach.",
  alternates: { canonical: "/galeria" },
};

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ filtr?: string }>;
}) {
  const params = await searchParams;
  const galleryPhotos = await getPublishedGallery();

  return (
    <>
      <PageHero
        eyebrow="Galeria pola"
        title={<>Zobacz przestrzeń. <em>Zaplanuj ruch.</em></>}
        lead="Każda strefa ma inny rytm: otwarte podejście, ciasne okopy, wysoki punkt obserwacyjny i finał przy rakiecie V2."
      >
        <ButtonLink href="/zapytaj-o-termin">Zapytaj o termin</ButtonLink>
        <ButtonLink href="/oferta" variant="ghost">Poznaj atrakcje</ButtonLink>
      </PageHero>

      <section className="section section--paper">
        <Container>
          <SectionHeading
            eyebrow="Autentyczny obraz pola"
            title="Miejsca, które tworzą scenariusz."
            body="Okopy, osłona w lesie i punkt przy rakiecie V2. Tak wygląda teren, na którym rozgrywa się scenariusz."
          />
          <GalleryCoverflow photos={galleryPhotos} empty={params.filtr === "pusta"} />
          <AnalyticsView event="gallery_view" />
        </Container>
      </section>
      <CtaBand />
    </>
  );
}
