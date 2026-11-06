import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Polityka prywatności", description: "Informacje o przetwarzaniu danych na stronie Paintball Strefa 29.", alternates: { canonical: "/polityka-prywatnosci" } };

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Prywatność" title="Polityka prywatności" lead="Jakie dane wykorzystuje strona i w jakim celu." updated="Wersja robocza 1.0 — dane administratora do uzupełnienia">
      <h2>1. Administrator danych</h2>
      <p>Pełna nazwa prawna, adres, e-mail oraz pozostałe dane administratora wymagają bezpośredniego potwierdzenia przez właściciela przed uruchomieniem strony produkcyjnej.</p>
      <h2>2. Formularz zapytania</h2>
      <p>Formularz może przetwarzać imię, telefon lub e-mail, liczbę graczy, preferowany termin, rodzaj wydarzenia, wybrany pakiet i dobrowolną wiadomość. Celem jest odpowiedź na zapytanie i przygotowanie propozycji organizacji gry.</p>
      <h2>3. Brak bazy zapytań</h2>
      <p>W wersji 1.0 dane formularza nie są zapisywane w bazie strony. Są przekazywane do firmowej skrzynki e-mail przez dostawcę wiadomości transakcyjnych. Treść nie powinna trafiać do analityki ani logów aplikacji.</p>
      <h2>4. Odbiorcy i dostawcy</h2>
      <p>Przed publikacją należy wskazać dostawcę hostingu, poczty transakcyjnej, mapy, ochrony antyspamowej oraz opcjonalnej analityki, a także opisać miejsce przetwarzania i wymagane umowy.</p>
      <h2>5. Retencja</h2>
      <p>Okres przechowywania wiadomości w skrzynce firmowej musi zostać zatwierdzony. Dane powinny zostać usunięte lub zanonimizowane, gdy nie są już potrzebne do kontaktu, realizacji uzgodnionej usługi albo obowiązków prawnych.</p>
      <h2>6. Prawa osoby</h2>
      <p>Finalna polityka powinna opisywać prawo dostępu, sprostowania, usunięcia, ograniczenia, sprzeciwu, przenoszenia danych oraz wniesienia skargi — wraz z prawidłową podstawą i kanałem realizacji wniosku.</p>
      <h2>7. Analityka i mapa</h2>
      <p>Opcjonalne zdarzenia analityczne są uruchamiane dopiero po zgodzie i nie zawierają danych formularza. Mapa zewnętrzna ładuje się dopiero po świadomym kliknięciu użytkownika.</p>
      <h2>8. Bezpieczeństwo</h2>
      <p>Strona stosuje walidację serwerową, szyfrowaną transmisję, ograniczenia wysyłki, ochronę antyspamową oraz redakcję danych osobowych z logów. Żaden formularz nie prosi o dane karty.</p>
    </LegalPage>
  );
}
