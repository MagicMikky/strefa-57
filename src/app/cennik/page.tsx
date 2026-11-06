import type { Metadata } from "next";
import { InfoNotice, NumberedSteps, PackageCard } from "@/components/content";
import {
  ButtonLink,
  Container,
  CtaBand,
  PageHero,
  SectionHeading,
} from "@/components/ui";
import { addOns } from "@/data/site";
import { packagesForDisplay } from "@/lib/content/model";
import { getPublishedSiteCopy } from "@/lib/content/public";
import { AnalyticsView } from "@/components/analytics-view";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPublishedSiteCopy();
  return {
  title: copy.seo.cennik.title,
  description: copy.seo.cennik.description,
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
    title: copy.seo.cennik.title,
    description: copy.seo.cennik.description,
  },
  twitter: {
    card: "summary_large_image",
    title: copy.seo.cennik.title,
    description: copy.seo.cennik.description,
  },
  };
}

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

export default async function PricingPage() {
  const packages = packagesForDisplay(await getPublishedSiteCopy());
  return (
    <div className="pricing-page">
      <AnalyticsView event="pricing_view" />
      <PageHero
        eyebrow="Pakiety · wyposażenie · dodatki"
        title={
          <>
            Jasny punkt startu. <em>Końcowa cena po potwierdzeniu.</em>
          </>
        }
        lead="Warianty opisują charakter gry. Kwotę, wyposażenie i warunki dla grupy potwierdza obsługa. Nic na tej stronie nie jest wiążącą ofertą."
      >
        <ButtonLink href="/zapytaj-o-termin">Poproś o wycenę</ButtonLink>
        <ButtonLink href="/oferta" variant="ghost">
          Poznaj pole
        </ButtonLink>
      </PageHero>

      <section className="section section--cream pricing-packages">
        <Container>
          <SectionHeading
            eyebrow="Warianty gry"
            title="Wybierz charakter gry."
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
            body="Nie ma tu koszyka, płatności online ani automatycznych zadatków. Sposób płatności i ewentualny zadatek obsługa przekazuje dopiero po sprawdzeniu zapytania."
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
