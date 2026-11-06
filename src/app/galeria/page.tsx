import type { Metadata } from "next";
import { InfoNotice } from "@/components/content";
import { Icon } from "@/components/icons";
import { ButtonLink, Container, CtaBand, PageHero, SectionHeading } from "@/components/ui";
import { galleryItems } from "@/data/site";

export const metadata: Metadata = {
  title: "Galeria pola",
  description: "Poznaj strefy i charakter terenowego pola Paintball Strefa 29 w Czaplach.",
  alternates: { canonical: "/galeria" },
};

export default function GalleryPage() {
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
            body="Poniższe plansze pokazują przygotowane kategorie galerii. Docelowe fotografie muszą pochodzić z obiektu i mieć potwierdzone prawa do publikacji."
          />
          <div className="gallery-grid">
            {galleryItems.map((item, index) => (
              <article className={`gallery-card gallery-card--${item.tone}`} key={item.title}>
                <div className="gallery-card__art" role="img" aria-label={`Symboliczna plansza kategorii ${item.title}`}>
                  <span className="gallery-card__cross" aria-hidden="true" />
                  <strong>{String(index + 1).padStart(2, "0")}</strong>
                </div>
                <div className="gallery-card__caption">
                  <div><h2>{item.title}</h2><p>{item.label}</p></div>
                  <Icon name="arrow" width={21} height={21} />
                </div>
              </article>
            ))}
          </div>
          <div className="gallery-notice">
            <InfoNotice title="Zdjęcia do uzupełnienia przed publikacją">
              Nie używamy fotografii innego operatora ani obrazów udających ten obiekt. Właściciel powinien przekazać oryginalne materiały: pole, okopy, bunkier, V2, zaplecze i drużynę.
            </InfoNotice>
          </div>
        </Container>
      </section>

      <section className="section section--sand">
        <Container>
          <SectionHeading eyebrow="Standard materiałów" title="Każde zdjęcie ma wykonać konkretną pracę." />
          <div className="standards-grid">
            <div><span>01</span><h3>Wyraźny kadr</h3><p>Najlepsze ujęcia pokazują skalę terenu i prawdziwą dynamikę gry.</p></div>
            <div><span>02</span><h3>Prawo do publikacji</h3><p>Każda rozpoznawalna osoba musi mieć potwierdzoną zgodę na wizerunek.</p></div>
            <div><span>03</span><h3>Lekki plik</h3><p>Wersje responsywne WebP/AVIF chronią szybkość strony na telefonie.</p></div>
            <div><span>04</span><h3>Dobry opis</h3><p>Tekst alternatywny opisuje informację, a zdjęcie dekoracyjne pozostaje neutralne.</p></div>
          </div>
        </Container>
      </section>
      <CtaBand />
    </>
  );
}
