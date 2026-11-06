import type { Metadata } from "next";
import { InquiryForm } from "@/components/inquiry-form";
import { Icon } from "@/components/icons";
import { Container, PageHero } from "@/components/ui";
import { packages } from "@/data/site";

export const metadata: Metadata = {
  title: "Zapytaj o wolny termin",
  description: "Wyślij niezobowiązujące zapytanie o termin gry w Paintball Strefa 29. Formularz nie blokuje ani nie potwierdza terminu.",
  robots: { index: true, follow: true },
};

type InquiryPageProps = {
  searchParams: Promise<{ pakiet?: string; wydarzenie?: string }>;
};

export default async function InquiryPage({ searchParams }: InquiryPageProps) {
  const params = await searchParams;
  return (
    <>
      <PageHero
        eyebrow="Zapytanie o termin"
        title={<>Twoja ekipa. <em>Twój preferowany termin.</em></>}
        lead="Przekaż najważniejsze informacje. Obsługa sprawdzi możliwości, cenę i skontaktuje się z Tobą. Wysłanie formularza nie tworzy rezerwacji."
      />
      <section className="section section--cream inquiry-section">
        <Container className="inquiry-layout">
          <aside className="inquiry-sidebar">
            <p className="eyebrow">Zanim wyślesz</p>
            <h2>To zapytanie, nie rezerwacja.</h2>
            <p>Nie pokazujemy pozornej dostępności i nie blokujemy terminu bez potwierdzenia obsługi.</p>
            <ol>
              <li><span>01</span><div><strong>Wyślij preferencje</strong><small>Data, grupa i pakiet.</small></div></li>
              <li><span>02</span><div><strong>Poczekaj na kontakt</strong><small>Obsługa sprawdzi możliwości.</small></div></li>
              <li><span>03</span><div><strong>Potwierdź szczegóły</strong><small>Cena, termin i dalsze kroki.</small></div></li>
            </ol>
            <div className="inquiry-sidebar__secure"><Icon name="shield" width={20} height={20} /><span>Nie podawaj danych karty ani informacji o zdrowiu w polu wiadomości.</span></div>
          </aside>
          <div className="inquiry-form-shell">
            <InquiryForm
              packages={packages.map(({ id, name }) => ({ id, name }))}
              initialPackageId={params.pakiet}
              initialEventType={params.wydarzenie}
            />
          </div>
        </Container>
      </section>
    </>
  );
}
