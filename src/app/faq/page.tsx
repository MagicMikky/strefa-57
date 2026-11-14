import type { Metadata } from "next";
import { FaqList, InfoNotice } from "@/components/content";
import {
  ButtonLink,
  Container,
  CtaBand,
  PageHero,
  SectionHeading,
} from "@/components/ui";
import { getPublishedSiteCopy } from "@/lib/content/public";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPublishedSiteCopy();
  return {
  title: copy.seo.faq.title,
  description: copy.seo.faq.description,
  keywords: [
    "paintball FAQ",
    "jak przygotować się na paintball",
    "ile osób na paintball",
    "paintball dla niepełnoletnich",
    "paintball Gdańsk pytania",
  ],
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: "/faq",
    title: copy.seo.faq.title,
    description: copy.seo.faq.description,
  },
  twitter: {
    card: "summary_large_image",
    title: copy.seo.faq.title,
    description: copy.seo.faq.description,
  },
  };
}

const inquiryChecklist = [
  "preferowana data oraz ewentualny termin alternatywny",
  "liczba graczy i przybliżony wiek uczestników",
  "rodzaj wydarzenia, na przykład spotkanie znajomych, urodziny lub integracja",
  "wybrany pakiet albo informacja, że potrzebujesz pomocy w wyborze",
  "pytania o zaplecze, dodatki lub szczególne potrzeby grupy",
] as const;

export default async function FaqPage() {
  const copy = await getPublishedSiteCopy();
  const faqItems = copy.faq;
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
  return (
    <div className="faq-page">
      <PageHero
        eyebrow="FAQ · organizacja · przygotowanie"
        title={
          <>
            Najpierw odpowiedzi. <em>Potem wejście do gry.</em>
          </>
        }
        lead="Zebraliśmy najważniejsze informacje o zapytaniu, przebiegu wizyty, przygotowaniu i zasadach. Szczegóły zależne od grupy potwierdza obsługa."
      >
        <ButtonLink href="/zapytaj-o-termin">Wyślij zapytanie</ButtonLink>
        <ButtonLink href="/kontakt" variant="ghost">
          Przejdź do kontaktu
        </ButtonLink>
      </PageHero>

      <section className="section section--paper faq-content">
        <Container className="faq-content__layout">
          <div className="faq-content__intro">
            <SectionHeading
              eyebrow="Najczęstsze pytania"
              title="To warto wiedzieć przed kontaktem."
              body="Lista obejmuje wszystkie obecnie przygotowane odpowiedzi. Szczegóły konkretnej wizyty obsługa potwierdza indywidualnie."
            />
            <InfoNotice title="Zapytanie to nie rezerwacja">
              Formularz przekazuje preferencje grupy. Nie pokazuje wolnych miejsc, nie
              blokuje terminu i nie pobiera płatności.
            </InfoNotice>
            <InfoNotice title="Aktualne zasady wizyty">
              Przyjmujemy grupy 8–50 osób przez cały rok, także w weekendy i święta. Terminy standardowo są na wyłączność; możesz bez dopłaty zgodzić się na wspólną grę. Osoby poniżej 18 lat potrzebują oświadczenia zgody opiekuna prawnego. W sprawie pogorszenia pogody i ewentualnego zwrotu zadatku skontaktuj się telefonicznie.
            </InfoNotice>
          </div>
          <FaqList items={faqItems} />
        </Container>
      </section>

      <section className="section section--sand faq-checklist">
        <Container className="faq-checklist__layout">
          <div>
            <SectionHeading
              eyebrow="Sprawniejsza odpowiedź"
              title="Co podać w zapytaniu?"
              body="Im pełniejszy opis grupy, tym łatwiej obsłudze sprawdzić możliwość organizacji gry i przygotować właściwy wariant."
            />
            <ButtonLink href="/zapytaj-o-termin" variant="secondary">
              Otwórz formularz
            </ButtonLink>
          </div>
          <ul className="faq-checklist__items">
            {inquiryChecklist.map((item, index) => (
              <li key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{item}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="section section--cream faq-more-help">
        <Container>
          <SectionHeading
            eyebrow="Nie ma tu Twojego pytania?"
            title="Napisz bez zobowiązań."
            body="Nie wysyłaj przez formularz danych kart, kodów płatniczych ani informacji medycznych. Wystarczy opis potrzeb grupy i preferowany sposób kontaktu."
            align="center"
          />
          <div className="faq-more-help__actions">
            <ButtonLink href="/zapytaj-o-termin">Zapytaj o termin</ButtonLink>
            <ButtonLink href="/kontakt" variant="secondary">
              Inne dane kontaktowe
            </ButtonLink>
          </div>
        </Container>
      </section>

      <CtaBand
        eyebrow="Gotowi na kolejny krok?"
        title="Prześlij preferencje swojej grupy."
        body="Obsługa sprawdzi możliwość organizacji gry, aktualny wariant i cenę. Dopiero osobne potwierdzenie oznacza uzgodnienie wizyty."
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqStructuredData).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  );
}
