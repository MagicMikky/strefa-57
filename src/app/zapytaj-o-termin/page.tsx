import type { Metadata } from "next";
import Link from "next/link";
import { InquiryForm } from "@/components/inquiry-form";
import { Icon } from "@/components/icons";
import { Container, PageHero } from "@/components/ui";
import { addMinutes } from "@/lib/availability/model";
import { getPublicBusiness } from "@/lib/business/public";
import { packagesForDisplay } from "@/lib/content/model";
import { getPublishedSiteCopy } from "@/lib/content/public";

export const metadata: Metadata = {
  title: "Zapytaj o wolny termin",
  description: "Wyślij niezobowiązujące zapytanie o termin gry w Paintball Strefa 29. Formularz nie blokuje ani nie potwierdza terminu.",
  alternates: { canonical: "/zapytaj-o-termin" },
};

type InquiryPageProps = {
  searchParams: Promise<{ pakiet?: string; wydarzenie?: string; data?: string; slot?: string; gracze?: string; tryb?: string }>;
};

export default async function InquiryPage({ searchParams }: InquiryPageProps) {
  const params = await searchParams;
  const [copy, business] = await Promise.all([getPublishedSiteCopy(), getPublicBusiness()]);
  const packages = packagesForDisplay(copy);
  const slot = business.settings.slotStartTimes.includes(params.slot ?? "") ? params.slot : undefined;
  const players = Number(params.gracze);
  const initialPlayers = Number.isInteger(players) && players >= 1 && players <= business.settings.maxPlayersPerTeam ? players : undefined;
  const initialMessage = [
    slot ? `Interesuje mnie slot ${slot}–${addMinutes(slot, business.settings.slotDurationMinutes)}.` : "",
    params.tryb === "prywatny" ? "Chcę grę na wyłączność." : "",
  ].filter(Boolean).join(" ");
  return (
    <>
      <PageHero
        eyebrow="Zapytanie o termin"
        title={<>Twoja ekipa. <em>Twój preferowany termin.</em></>}
        lead="Przekaż najważniejsze informacje. Obsługa sprawdzi możliwości, cenę i skontaktuje się z Tobą. Wysłanie formularza nie tworzy rezerwacji."
      />
      <section className="section section--cream inquiry-section">
        <Container className="inquiry-layout">
          <div className="inquiry-form-shell">
            <InquiryForm
              packages={packages.map(({ id, name }) => ({ id, name }))}
              initialPackageId={params.pakiet}
              initialEventType={params.wydarzenie}
              initialDate={/^\d{4}-\d{2}-\d{2}$/.test(params.data ?? "") ? params.data : undefined}
              initialPlayers={initialPlayers}
              initialMessage={initialMessage || undefined}
              initialPreferredTime={slot}
              slotStarts={business.settings.slotStartTimes}
            />
          </div>
          <aside className="inquiry-sidebar">
            <p className="eyebrow">Zanim wyślesz</p>
            <h2>To zapytanie, nie rezerwacja.</h2>
            <p>Nie pokazujemy pozornej dostępności i nie blokujemy terminu bez potwierdzenia obsługi.</p>
            <ol>
              <li><span>01</span><div><strong>Wyślij preferencje</strong><small>Data, grupa i pakiet.</small></div></li>
              <li><span>02</span><div><strong>Poczekaj na kontakt</strong><small>Obsługa sprawdzi możliwości.</small></div></li>
              <li><span>03</span><div><strong>Potwierdź szczegóły</strong><small>Cena, termin i dalsze kroki.</small></div></li>
            </ol>
            <p><Link className="text-link" href="/rezerwacja">Zobacz orientacyjną dostępność <Icon name="arrow" width={18} height={18} /></Link></p>
            <div className="inquiry-sidebar__secure"><Icon name="shield" width={20} height={20} /><span>Nie podawaj danych karty ani informacji o zdrowiu w polu wiadomości.</span></div>
          </aside>
        </Container>
      </section>
    </>
  );
}
