import type { Metadata } from "next";
import { InfoNotice, NumberedSteps, PackageCard } from "@/components/content";
import {
  ButtonLink,
  Container,
  CtaBand,
  PageHero,
  SectionHeading,
} from "@/components/ui";
import { addOns, packages } from "@/data/site";

const metadataDescription =
  "Planowane pakiety Paintball Strefa 29, wyposażenie i dodatki. Ceny nie są jeszcze zatwierdzone, a strona nie przyjmuje płatności ani nie tworzy rezerwacji.";

export const metadata: Metadata = {
  title: "Cennik i pakiety",
  description: metadataDescription,
  keywords: [
    "cennik paintball Gdańsk",
    "pakiety paintball Czaple",
    "ile kosztuje paintball Trójmiasto",
    "paintball dla grup cennik",
  ],
  alternates: {
    canonical: "/cennik",
  },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: "/cennik",
    title: "Cennik i pakiety — Paintball Strefa 29",
    description: metadataDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: "Cennik i pakiety — Paintball Strefa 29",
    description: metadataDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const priceConfirmationSteps = [
  {
    number: "01",
    title: "Wybierz punkt startu",
    description:
      "Wskaż pakiet, który najlepiej odpowiada planowi grupy. Jeśli nie masz pewności, wybierz najbliższy wariant i opisz potrzeby.",
  },
  {
    number: "02",
    title: "Podaj szczegóły grupy",
    description:
      "Prześlij preferowaną datę, liczbę graczy, rodzaj wydarzenia i informacje o osobach niepełnoletnich.",
  },
  {
    number: "03",
    title: "Odbierz potwierdzenie",
    description:
      "Obsługa sprawdzi możliwość organizacji gry i przekaże wiążącą zawartość pakietu, cenę oraz zasady płatności poza stroną.",
  },
] as const;

export default function PricingPage() {
  return (
    <div className="pricing-page">
      <PageHero
        eyebrow="Pakiety · wyposażenie · dodatki"
        title={
          <>
            Jasny punkt startu. <em>Końcowa cena po potwierdzeniu.</em>
          </>
        }
        lead="Poniższe warianty pokazują planowaną strukturę oferty. Cennik oczekuje na zatwierdzenie właściciela, dlatego żadna widoczna tu propozycja nie jest jeszcze wiążącą ofertą."
      >
        <ButtonLink href="/zapytaj-o-termin">Poproś o wycenę</ButtonLink>
        <ButtonLink href="/oferta" variant="ghost">
          Poznaj pole
        </ButtonLink>
      </PageHero>

      <section className="section section--cream pricing-packages">
        <Container>
          <InfoNotice title="Ceny nie są jeszcze zatwierdzone" tone="sand">
            Przed publikacją kwot właściciel musi potwierdzić ceny, liczbę kulek,
            wyposażenie, minimalną wielkość grupy i dostępność dodatków. Do tego czasu
            obowiązuje indywidualne potwierdzenie przez obsługę.
          </InfoNotice>
          <SectionHeading
            eyebrow="Planowane warianty"
            title="Wybierz charakter gry, nie obietnicę bez pokrycia."
            body="Każdy wariant obejmuje organizację rozgrywki, ale jego ostateczna zawartość zależy od zatwierdzonego cennika i ustaleń dla konkretnej grupy."
            align="center"
          />
          <div className="package-grid">
            {packages.map((item) => (
              <PackageCard item={item} key={item.id} />
            ))}
          </div>
          <p className="section-footnote">
            Wysłanie zapytania o pakiet nie rezerwuje terminu i nie zobowiązuje do zakupu.
          </p>
        </Container>
      </section>

      <section className="section section--paper pricing-addons">
        <Container className="pricing-addons__layout">
          <div>
            <SectionHeading
              eyebrow="Dodatki"
              title="Rozszerzenia ustalane przed wizytą."
              body="Dostępność, cenę i warunki każdego dodatku potwierdza obsługa. Niektóre opcje mogą wymagać wcześniejszego zgłoszenia albo zależeć od warunków na polu."
            />
            <ButtonLink href="/zapytaj-o-termin" variant="secondary">
              Zapytaj o dodatki
            </ButtonLink>
          </div>
          <ul className="pricing-addons__list">
            {addOns.map((item, index) => (
              <li key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item}</strong>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="section section--sand pricing-process">
        <Container className="pricing-process__layout">
          <div>
            <SectionHeading
              eyebrow="Od wariantu do potwierdzonej ceny"
              title="Najpierw szczegóły, potem konkretna oferta."
              body="Liczebność, wiek uczestników i charakter wydarzenia mogą wpływać na właściwy wariant. Obsługa sprawdza je przed przedstawieniem końcowych warunków."
            />
          </div>
          <NumberedSteps items={priceConfirmationSteps} />
        </Container>
      </section>

      <section className="section section--dark pricing-payment">
        <Container className="pricing-payment__inner">
          <SectionHeading
            eyebrow="Płatność"
            title="Ta strona nie pobiera pieniędzy."
            body="Wersja 1.0 nie ma koszyka, płatności online ani automatycznych zadatków. Sposób płatności i ewentualny zadatek obsługa przekazuje dopiero po sprawdzeniu zapytania."
            light
          />
          <InfoNotice title="Nie przesyłaj danych karty" tone="dark">
            Formularz i e-mail nie służą do przekazywania numerów kart, kodów płatniczych
            ani innych poufnych danych finansowych.
          </InfoNotice>
        </Container>
      </section>

      <CtaBand
        eyebrow="Potrzebujesz konkretnej wyceny?"
        title="Podaj liczbę osób i charakter wydarzenia."
        body="Obsługa sprawdzi warunki, dostępność dodatków i przedstawi aktualną cenę. Zapytanie nie tworzy rezerwacji i nie uruchamia płatności."
      />
    </div>
  );
}
