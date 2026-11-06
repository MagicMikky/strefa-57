import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FaqList, MissionPanel, NumberedSteps, PackageCard } from "@/components/content";
import { Icon } from "@/components/icons";
import { ButtonLink, Container, CtaBand, Eyebrow, FeatureCard, SectionHeading, TacticalMark } from "@/components/ui";
import { galleryPreviewPhotos } from "@/data/gallery";
import { attractions, audiences, eventTypeForAudience, faqItems, packages, visitSteps } from "@/data/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <section className="home-hero">
        <div className="home-hero__grid" aria-hidden="true" />
        <Container className="home-hero__inner">
          <div className="home-hero__copy">
            <Eyebrow light>Paintball terenowy · Czaple</Eyebrow>
            <h1>Wejdź do <em>strefy.</em><br />Zagraj o każdy metr.</h1>
            <p>
              Okopy, bunkry, ambony i scenariusz z rakietą V2. Zbierz ekipę i sprawdź, jak działa współpraca pod presją.
            </p>
            <div className="button-row">
              <ButtonLink href="/zapytaj-o-termin">Zapytaj o wolny termin</ButtonLink>
              <ButtonLink href="/oferta" variant="ghost">Zobacz pole</ButtonLink>
            </div>
            <p className="home-hero__disclaimer"><Icon name="shield" width={17} height={17} /> Zapytanie nie blokuje terminu. Dostępność potwierdzi obsługa.</p>
          </div>
          <div className="home-hero__visual">
            <TacticalMark />
          </div>
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
          <div className="feature-grid">
            {attractions.map((item, index) => (
              <FeatureCard key={item.title} icon={item.icon as Parameters<typeof Icon>[0]["name"]} title={item.title} index={`0${index + 1}`}>
                {item.description}
              </FeatureCard>
            ))}
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
          <div className="field-preview">
            {galleryPreviewPhotos.map((photo) => (
              <Link href="/galeria" key={photo.src}>
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  sizes="(max-width: 760px) 100vw, 50vw"
                />
                <span>{photo.title}</span>
              </Link>
            ))}
          </div>
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
        <Container className="split split--steps">
          <div>
            <SectionHeading
              eyebrow="Od przyjazdu do ostatniej rundy"
              title="Wiesz, co dzieje się dalej."
              body="Dobra organizacja zaczyna się przed pierwszym strzałem. Dokładne godziny i długość wydarzenia obsługa potwierdzi dla wybranego wariantu."
            />
            <ButtonLink href="/faq" variant="secondary">Przeczytaj FAQ</ButtonLink>
          </div>
          <NumberedSteps items={visitSteps} />
        </Container>
      </section>

      <section className="section section--paper">
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

      <CtaBand />
    </>
  );
}
