import type { Metadata } from "next";
import { InfoNotice, MissionPanel, NumberedSteps } from "@/components/content";
import {
  ButtonLink,
  Container,
  CtaBand,
  PageHero,
  SectionHeading,
} from "@/components/ui";
import { visitSteps } from "@/data/site";
import { attractionsForDisplay } from "@/lib/content/model";
import { getPublishedSiteCopy } from "@/lib/content/public";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPublishedSiteCopy();
  return {
  title: copy.seo.oferta.title,
  description: copy.seo.oferta.description,
  keywords: [
    "oferta paintball Gdańsk",
    "pole paintballowe Czaple",
    "paintball Trójmiasto",
    "scenariusze paintball",
    "rakieta V2 paintball",
  ],
  alternates: {
    canonical: "/oferta",
  },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: "/oferta",
    title: copy.seo.oferta.title,
    description: copy.seo.oferta.description,
  },
  twitter: {
    card: "summary_large_image",
    title: copy.seo.oferta.title,
    description: copy.seo.oferta.description,
  },
  };
}

const v2Sequence = [
  {
    number: "01",
    title: "Aktywacja",
    description:
      "Drużyna utrzymuje pozycję i przytrzymuje przycisk przez 10 sekund, aby uruchomić sekwencję.",
  },
  {
    number: "02",
    title: "Dziesięć minut presji",
    description:
      "Po aktywacji rozpoczyna się odliczanie. Atakujący bronią urządzenia, a przeciwnicy próbują przerwać misję.",
  },
  {
    number: "03",
    title: "Finał scenariusza",
    description:
      "W ostatnich dwóch minutach dym podkreśla finał rozgrywki. Całość odbywa się według poleceń prowadzącego.",
  },
] as const;

const safetyRules = [
  {
    title: "Maska pozostaje na twarzy",
    body: "W strefie gry maski nie wolno zdejmować. Bezpieczne strefy i moment zakończenia rundy wskazuje prowadzący.",
  },
  {
    title: "Najpierw odprawa",
    body: "Przed wejściem na pole każdy poznaje zasady, sygnały, granice terenu i sposób bezpiecznego korzystania ze sprzętu.",
  },
  {
    title: "Sprzęt sprawdza obsługa",
    body: "Marker, maska i pozostałe wyposażenie są dopasowywane oraz sprawdzane przed rozpoczęciem rozgrywki.",
  },
  {
    title: "Prowadzący kontroluje tempo",
    body: "Instruktor może zatrzymać scenariusz, zmienić jego przebieg albo wyłączyć element pola, jeżeli wymagają tego warunki.",
  },
] as const;

const preparationTips = [
  {
    title: "Ubierz się terenowo",
    body: "Wybierz wygodne ubranie z długimi rękawami i nogawkami, którego nie szkoda ubrudzić.",
  },
  {
    title: "Załóż stabilne obuwie",
    body: "Najlepiej sprawdzą się zakryte buty z dobrą przyczepnością, odpowiednie na nierówny i naturalny teren.",
  },
  {
    title: "Przyjedź wcześniej",
    body: "Zostaw czas na zebranie grupy, odprawę, dobranie wyposażenia i próbę sprzętu przed pierwszą rundą.",
  },
  {
    title: "Opisz grupę w zapytaniu",
    body: "Podaj liczbę uczestników, ich przybliżony wiek, charakter wydarzenia i szczególne potrzeby organizacyjne.",
  },
] as const;

export default async function OfferPage() {
  const attractions = attractionsForDisplay(await getPublishedSiteCopy());
  return (
    <div className="offer-page">
      <PageHero
        eyebrow="Oferta · teren · scenariusze"
        title={
          <>
            Pole, na którym <em>teren gra razem z Wami.</em>
          </>
        }
        lead="Ponad hektar naturalnej przestrzeni, system okopów, bunkry, ambony i misja z rakietą V2. Każdy element ma znaczenie dla ruchu, komunikacji i planu drużyny."
      >
        <ButtonLink href="/zapytaj-o-termin">Zapytaj o termin</ButtonLink>
        <ButtonLink href="/cennik" variant="ghost">
          Zobacz warianty gry
        </ButtonLink>
      </PageHero>

      <section className="section section--paper offer-terrain" aria-labelledby="offer-terrain-heading">
        <Container>
          <SectionHeading
            eyebrow="Poznaj Strefę 29"
            title="Więcej niż rząd przypadkowych przeszkód."
            body="Pole łączy naturalne ukształtowanie terenu z przygotowanymi punktami obrony. Dzięki temu scenariusze wymagają ruchu, obserwacji i współpracy zamiast stania w jednym miejscu."
          />
          <h2 id="offer-terrain-heading" className="visually-hidden">
            Elementy pola
          </h2>
          <div className="offer-terrain__grid">
            {attractions.map((item, index) => (
              <article className="offer-terrain-card" key={item.title}>
                <span className="offer-terrain-card__number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section
        className="section section--dark offer-mission"
        id="rakieta-v2"
        aria-labelledby="offer-mission-heading"
      >
        <Container className="offer-mission__layout">
          <div className="offer-mission__copy">
            <SectionHeading
              eyebrow="Scenariusz specjalny"
              title="Rakieta V2. Dziesięć minut do finału."
              body="Jedna drużyna uruchamia sekwencję i broni pozycji. Druga próbuje odzyskać punkt, zanim odliczanie dobiegnie końca. Role, zasady zwycięstwa i poziom trudności prowadzący dopasowuje do grupy."
              light
            />
            <div id="offer-mission-heading" className="offer-mission__sequence">
              {v2Sequence.map((step) => (
                <article key={step.number}>
                  <span>{step.number}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </article>
              ))}
            </div>
            <InfoNotice title="Scenariusz prowadzi obsługa" tone="dark">
              Elementy specjalne są uruchamiane wyłącznie zgodnie z instrukcją prowadzącego
              i wtedy, gdy pozwalają na to warunki na polu.
            </InfoNotice>
          </div>
          <MissionPanel />
        </Container>
      </section>

      <section className="section section--sand offer-visit">
        <Container className="offer-visit__layout">
          <div>
            <SectionHeading
              eyebrow="Przebieg wizyty"
              title="Od odprawy do ostatniej misji."
              body="Dokładna długość spotkania zależy od liczby graczy, wybranego wariantu i ustalonego programu. Obsługa potwierdzi plan przed wizytą."
            />
            <ButtonLink href="/faq" variant="secondary">
              Sprawdź najczęstsze pytania
            </ButtonLink>
          </div>
          <NumberedSteps items={visitSteps} />
        </Container>
      </section>

      <section className="section section--paper offer-safety">
        <Container>
          <SectionHeading
            eyebrow="Bezpieczeństwo"
            title="Jasne zasady przed pierwszym strzałem."
            body="Paintball jest dynamiczną grą terenową. Dlatego każda wizyta zaczyna się od odprawy, sprawdzenia wyposażenia i wskazania reguł obowiązujących na konkretnym terenie."
          />
          <div className="offer-safety__grid">
            {safetyRules.map((rule) => (
              <article className="offer-safety-card" key={rule.title}>
                <h3>{rule.title}</h3>
                <p>{rule.body}</p>
              </article>
            ))}
          </div>
          <InfoNotice title="Grupy z osobami niepełnoletnimi">
            Minimalny wiek, wymaganą zgodę opiekuna i dobór wariantu gry trzeba potwierdzić
            z obsługą przed uzgodnieniem wizyty.
          </InfoNotice>
        </Container>
      </section>

      <section className="section section--cream offer-preparation">
        <Container>
          <SectionHeading
            eyebrow="Jak się przygotować"
            title="Kilka prostych rzeczy robi dużą różnicę."
            body="Po potwierdzeniu wizyty organizator otrzyma dokładne informacje dla swojej grupy. Poniższe wskazówki pomagają przygotować się do rozmowy i gry."
            align="center"
          />
          <div className="offer-preparation__grid">
            {preparationTips.map((tip) => (
              <article className="offer-preparation-card" key={tip.title}>
                <h3>{tip.title}</h3>
                <p>{tip.body}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <CtaBand
        eyebrow="Masz ekipę?"
        title="Opisz grupę, a obsługa dopasuje przebieg spotkania."
        body="Wyślij preferowany termin, liczbę uczestników i rodzaj wydarzenia. Formularz jest zapytaniem — nie blokuje ani nie rezerwuje terminu."
      />
    </div>
  );
}
