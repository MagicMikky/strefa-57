import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FaqList, MissionPanel, PackageCard } from "@/components/content";
import { Icon } from "@/components/icons";
import { ButtonLink, Container, CtaBand, Eyebrow, SectionHeading, TacticalMark } from "@/components/ui";
import { audiences, eventTypeForAudience } from "@/data/site";
import type { GalleryPhoto } from "@/data/gallery";
import { getPublicBusiness } from "@/lib/business/public";
import { attractionsForDisplay, packagesForDisplay } from "@/lib/content/model";
import { getPublishedSiteCopy } from "@/lib/content/public";
import { getPublishedGallery } from "@/lib/gallery/public";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

function leadPhoto(photos: readonly GalleryPhoto[]) {
  return photos.find((photo) => photo.id === "okopy" || photo.src.includes("okopy")) ?? photos[0];
}

export default async function HomePage() {
  const [copy, galleryPhotos, business] = await Promise.all([
    getPublishedSiteCopy(),
    getPublishedGallery(),
    getPublicBusiness(),
  ]);
  const attractions = attractionsForDisplay(copy);
  const packages = packagesForDisplay(copy);
  const faqItems = copy.faq;
  const hero = leadPhoto(galleryPhotos);
  const frames = galleryPhotos.slice(0, 3);

  return (
    <>
      <section className="home-hero">
        <Container className="home-hero__inner">
          <div className="home-hero__copy">
            <div className="home-hero__kicker">
              <Image className="home-hero__mark" src="/logo.png" alt="" width={112} height={112} />
              <Eyebrow light>Paintball terenowy · Czaple</Eyebrow>
            </div>
            <h1>Wejdź do <em>strefy.</em><br />Zagraj o każdy metr.</h1>
            <p>
              Okopy, bunkry, ambony i scenariusz z rakietą V2. Zbierz ekipę i sprawdź, jak działa współpraca pod presją.
            </p>
            <div className="button-row">
              <ButtonLink href="/zapytaj-o-termin">Zapytaj o wolny termin</ButtonLink>
            </div>
            <p className="home-hero__disclaimer"><Icon name="shield" width={17} height={17} /> Zapytanie nie blokuje terminu. Dostępność potwierdzi obsługa.</p>
          </div>
          <div className="home-hero__visual">
            {hero ? (
              <figure className="home-hero__frame">
                <Image
                  src={hero.src}
                  alt={hero.alt}
                  width={hero.width}
                  height={hero.height}
                  sizes="(max-width: 760px) 92vw, 420px"
                  priority
                />
                <figcaption>{hero.label}</figcaption>
              </figure>
            ) : (
              <TacticalMark />
            )}
          </div>
        </Container>
      </section>

      <section className="section section--sand">
        <Container>
          <div className="heading-row">
            <SectionHeading
              eyebrow="Poznaj Strefę 29"
              title="Zobacz teren, zanim zapytasz o termin."
              body="Okopy, drewniana osłona i rakieta V2. W tych kadrach nie ma zawodników."
            />
            <Link className="text-link" href="/galeria">Zobacz całą galerię <Icon name="arrow" width={18} height={18} /></Link>
          </div>
          {frames.length > 0 ? (
            <div className="home-frames">
              {frames.map((photo) => (
                <figure key={photo.id}>
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    width={photo.width}
                    height={photo.height}
                    sizes="(max-width: 760px) 92vw, 360px"
                  />
                  <figcaption>{photo.title}</figcaption>
                </figure>
              ))}
            </div>
          ) : null}
        </Container>
      </section>

      <section className="section section--paper">
        <Container>
          <div className="heading-row">
            <SectionHeading
              eyebrow="To nie jest płaskie boisko"
              title="Teren, który wymusza taktykę."
              body="Każdy element pola daje inne możliwości. Znajdź osłonę, utrzymaj pozycję i komunikuj się, zanim zrobi to druga drużyna."
            />
            <Link className="text-link" href="/oferta">Poznaj pełną ofertę <Icon name="arrow" width={18} height={18} /></Link>
          </div>
          <ul className="terrain-list">
            {attractions.map((item) => (
              <li key={item.title}>
                <Icon name={item.icon as Parameters<typeof Icon>[0]["name"]} width={28} height={28} />
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="section section--dark mission-section">
        <Container className="split split--mission">
          <div>
            <SectionHeading
              eyebrow="Misja specjalna"
              title="Rakieta V2 zmienia finał gry."
              body="Jedna drużyna próbuje uruchomić sekwencję. Druga ma dziesięć minut, by przerwać odliczanie. Ostatnie chwile rozgrywki wymagają chłodnej głowy i dobrego podziału ról."
              light
            />
            <ul className="check-list check-list--light">
              <li><Icon name="check" width={18} height={18} /> aktywacja przez utrzymanie pozycji</li>
              <li><Icon name="check" width={18} height={18} /> wyraźne odliczanie do finału</li>
              <li><Icon name="check" width={18} height={18} /> scenariusz oparty na współpracy</li>
            </ul>
            <ButtonLink href="/oferta#rakieta-v2" variant="ghost">Jak działa scenariusz</ButtonLink>
          </div>
          <MissionPanel />
        </Container>
      </section>

      <section className="section section--cream">
        <Container>
          <SectionHeading
            eyebrow="Wybierz poziom wejścia"
            title="Pakiet dopasowany do tempa ekipy."
            body="Warianty opisują charakter gry. Zawartość, cenę i dodatki potwierdzi obsługa przed wizytą."
            align="center"
          />
          <div className="package-grid">
            {packages.map((item) => <PackageCard key={item.id} item={item} />)}
          </div>
          <p className="section-footnote">Cenę ustala obsługa po zapytaniu. Strona nie pobiera płatności online.</p>
        </Container>
      </section>

      <section className="section section--paper">
        <Container>
          <SectionHeading
            eyebrow="Jeden teren, różne okazje"
            title="Zbierz ludzi. Resztę dopasujemy."
            body="Inaczej wygląda pierwsza gra ze znajomymi, inaczej integracja firmy. W zapytaniu opisz grupę — pomożemy dobrać tempo i scenariusze."
          />
          <div className="audience-list">
            {audiences.map((item) => (
              <Link key={item.slug} href={`/zapytaj-o-termin?wydarzenie=${eventTypeForAudience(item.slug)}`}>
                <span>{item.number}</span>
                <div><h3>{item.title}</h3><p>{item.description}</p></div>
                <Icon name="arrow" width={23} height={23} />
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="section section--sand">
        <Container className="faq-preview">
          <div>
            <SectionHeading
              eyebrow="Przed kontaktem"
              title="Najczęstsze pytania"
              body="Nie znalazłeś odpowiedzi? Wyślij zapytanie — bez zobowiązań i bez zakładania konta."
            />
            <ButtonLink href="/faq" variant="secondary">Wszystkie odpowiedzi</ButtonLink>
          </div>
          <FaqList items={faqItems} limit={4} />
        </Container>
      </section>

      <CtaBand
        phoneHref={business.contact.phoneHref || undefined}
        phoneLabel={business.contact.phoneDisplay || undefined}
      />
    </>
  );
}
