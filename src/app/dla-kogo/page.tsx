import type { Metadata } from "next";
import { InfoNotice, NumberedSteps } from "@/components/content";
import {
  ButtonLink,
  Container,
  CtaBand,
  PageHero,
  SectionHeading,
} from "@/components/ui";
import { audiences, eventTypeForAudience } from "@/data/site";

const metadataDescription =
  "Paintball Strefa 29 dla znajomych, na urodziny, kawalerskie i panieńskie, integracje firmowe, szkoły oraz grupy zorganizowane.";

export const metadata: Metadata = {
  title: "Dla kogo",
  description: metadataDescription,
  keywords: [
    "paintball dla znajomych Gdańsk",
    "urodziny paintball Trójmiasto",
    "wieczór kawalerski paintball Gdańsk",
    "integracja firmowa paintball",
    "paintball dla szkół",
  ],
  alternates: {
    canonical: "/dla-kogo",
  },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: "/dla-kogo",
    title: "Dla kogo jest Strefa 29",
    description: metadataDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: "Dla kogo jest Strefa 29",
    description: metadataDescription,
  },
};

const audienceBenefits: Record<(typeof audiences)[number]["slug"], readonly string[]> = {
  znajomi: [
    "tempo dopasowane do doświadczenia ekipy",
    "kilka różnych zadań zamiast jednej długiej rundy",
    "czytelny plan dla osób grających pierwszy raz",
  ],
  urodziny: [
    "scenariusze budujące wspólny finał wydarzenia",
    "możliwość omówienia zaplecza po grze",
    "program dostosowany do wieku i charakteru okazji",
  ],
  kawalerskie: [
    "dynamiczna rywalizacja angażująca całą ekipę",
    "możliwość finału z rakietą V2",
    "ustalenie dodatków organizacyjnych przed wizytą",
  ],
  firmy: [
    "zadania wymagające komunikacji i podziału ról",
    "oferta dopasowana do liczebności zespołu",
    "możliwość ustalenia danych do dokumentu sprzedaży",
  ],
  szkoly: [
    "wcześniejsze potwierdzenie wieku i zasad opieki",
    "tempo oraz scenariusze dopasowane do grupy",
    "jasne informacje organizacyjne dla opiekunów",
  ],
};

const planningSteps = [
  {
    number: "01",
    title: "Opisz grupę",
    description:
      "Podaj liczbę uczestników, przybliżony wiek, doświadczenie i okazję, z której organizujecie spotkanie.",
  },
  {
    number: "02",
    title: "Ustalcie format",
    description:
      "Obsługa dopasuje tempo, wariant gry, scenariusze i możliwe dodatki do potrzeb oraz warunków na polu.",
  },
  {
    number: "03",
    title: "Potwierdź szczegóły",
    description:
      "Termin, cena, długość wizyty i zasady organizacyjne stają się ustalone dopiero po bezpośrednim potwierdzeniu.",
  },
] as const;

export default function AudiencesPage() {
  return (
    <div className="audiences-page">
      <PageHero
        eyebrow="Znajomi · okazje · firmy · szkoły"
        title={
          <>
            Jeden teren. <em>Różne powody, żeby wejść do gry.</em>
          </>
        }
        lead="Pierwsza rozgrywka ze znajomymi potrzebuje innego tempa niż wydarzenie firmowe lub wyjazd szkolny. W Strefie 29 punktem wyjścia jest grupa, jej cel i bezpieczeństwo uczestników."
      >
        <ButtonLink href="/zapytaj-o-termin">Opisz swoją grupę</ButtonLink>
        <ButtonLink href="/oferta" variant="ghost">
          Zobacz teren i scenariusze
        </ButtonLink>
      </PageHero>

      <section className="section section--paper audiences-overview">
        <Container>
          <SectionHeading
            eyebrow="Dla kogo"
            title="Format dopasowany do ludzi, nie odwrotnie."
            body="Każde zapytanie jest sprawdzane indywidualnie. Dzięki temu można ustalić właściwe tempo, przebieg spotkania i wymagania organizacyjne, zanim grupa przyjedzie na miejsce."
          />
          <nav className="audiences-overview__nav" aria-label="Rodzaje grup">
            {audiences.map((audience) => (
              <a href={"#" + audience.slug} key={audience.slug}>
                <span>{audience.number}</span>
                {audience.title}
              </a>
            ))}
          </nav>
        </Container>
      </section>

      <section className="section section--cream audience-profiles" aria-label="Oferta dla grup">
        <Container className="audience-profiles__list">
          {audiences.map((audience, index) => (
            <article
              className={
                "audience-profile" +
                (index % 2 === 1 ? " audience-profile--reverse" : "")
              }
              id={audience.slug}
              key={audience.slug}
            >
              <div className="audience-profile__marker" aria-hidden="true">
                <span>{audience.number}</span>
              </div>
              <div className="audience-profile__content">
                <p className="audience-profile__eyebrow">Wariant dla grupy</p>
                <h2>{audience.title}</h2>
                <p>{audience.description}</p>
                <ul>
                  {audienceBenefits[audience.slug].map((benefit) => (
                    <li key={benefit}>{benefit}</li>
                  ))}
                </ul>
                <ButtonLink
                  href={"/zapytaj-o-termin?wydarzenie=" + eventTypeForAudience(audience.slug)}
                  variant="secondary"
                >
                  {audience.prompt}
                </ButtonLink>
              </div>
            </article>
          ))}
        </Container>
      </section>

      <section className="section section--sand audiences-planning">
        <Container className="audiences-planning__layout">
          <div>
            <SectionHeading
              eyebrow="Jak dopasowujemy wydarzenie"
              title="Trzy kroki do konkretnego planu."
              body="Formularz zbiera punkt wyjścia do rozmowy. Nie pokazuje dostępności i nie potwierdza wizyty automatycznie."
            />
            <InfoNotice title="Bez automatycznej rezerwacji">
              Wysłanie preferowanej daty nie blokuje terminu. Obsługa musi potwierdzić
              możliwość organizacji, cenę i wszystkie wymagania dla grupy.
            </InfoNotice>
          </div>
          <NumberedSteps items={planningSteps} />
        </Container>
      </section>

      <section className="section section--paper audiences-organized">
        <Container>
          <SectionHeading
            eyebrow="Szkoły i osoby niepełnoletnie"
            title="Najpierw zasady opieki i bezpieczeństwa."
            body="Przed przedstawieniem oferty dla szkoły, kolonii lub grupy z osobami niepełnoletnimi obsługa potwierdza minimalny wiek, wymagane zgody, liczbę opiekunów i właściwy wariant rozgrywki."
            align="center"
          />
          <div className="audiences-organized__actions">
            <ButtonLink href="/faq" variant="secondary">
              Przeczytaj FAQ
            </ButtonLink>
            <ButtonLink href="/zapytaj-o-termin">
              Zapytaj o grupę zorganizowaną
            </ButtonLink>
          </div>
        </Container>
      </section>

      <CtaBand
        eyebrow="Jaki macie plan?"
        title="Napisz, kto gra i z jakiej okazji."
        body="Liczba osób, wiek uczestników i charakter wydarzenia wystarczą, aby rozpocząć rozmowę o właściwym wariancie. To nadal zapytanie, nie rezerwacja."
      />
    </div>
  );
}
