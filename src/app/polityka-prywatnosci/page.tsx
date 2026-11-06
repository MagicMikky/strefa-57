import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Polityka prywatności", description: "Informacje o przetwarzaniu danych na stronie Paintball Strefa 29.", alternates: { canonical: "/polityka-prywatnosci" } };

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Prywatność" title="Polityka prywatności" lead="Jakie dane wykorzystuje strona i w jakim celu." updated="Wersja robocza 1.1 — administrator, podstawa prawna i okres retencji do uzupełnienia">
      <h2>1. Administrator danych</h2>
      <p>Pełna nazwa prawna, adres, e-mail oraz pozostałe dane administratora wymagają bezpośredniego potwierdzenia przez właściciela przed uruchomieniem strony produkcyjnej.</p>
      <h2>2. Formularz zapytania</h2>
      <p>Formularz może przetwarzać imię, telefon lub e-mail, liczbę graczy, preferowany termin, termin zastępczy, rodzaj wydarzenia, wybrany pakiet i dobrowolną wiadomość. Celem jest odpowiedź na zapytanie i przygotowanie propozycji organizacji gry.</p>
      <h2>3. Zapis zapytań</h2>
      <p>Formularz zapisuje zgłoszenie w bazie PostgreSQL strony. Zapis obejmuje pola z sekcji 2 oraz informację, że osoba przyjęła tę wersję polityki. Podstawa prawna pozostaje do zatwierdzenia przez właściciela.</p>
      <p>To samo zgłoszenie może dodatkowo trafić na skrzynkę operatora, gdy skonfigurowano dostawcę poczty transakcyjnej. Zapis w bazie pozostaje także wtedy, gdy ta wysyłka się nie uda. Treść formularza nie trafia do analityki.</p>
      <h2>4. Odbiorcy i dostawcy</h2>
      <p>Zapisane zgłoszenia odczytują zalogowani pracownicy panelu. Przed publikacją produkcyjną należy wskazać dostawcę hostingu, poczty transakcyjnej, mapy, ochrony antyspamowej oraz opcjonalnej analityki, a także opisać miejsce przetwarzania i wymagane umowy.</p>
      <h2>5. Retencja</h2>
      <p>Okres przechowywania zgłoszenia w bazie i wiadomości w skrzynce nie został zatwierdzony. Do tej decyzji automatyczne usuwanie zapisanych zgłoszeń jest wyłączone. Po ustaleniu okresu dane powinny zostać usunięte lub zanonimizowane, gdy nie są już potrzebne do kontaktu, realizacji uzgodnionej usługi albo obowiązków prawnych.</p>
      <h2>6. Prawa osoby</h2>
      <p>Finalna polityka powinna opisywać prawo dostępu, sprostowania, usunięcia, ograniczenia, sprzeciwu, przenoszenia danych oraz wniesienia skargi — wraz z prawidłową podstawą i kanałem realizacji wniosku.</p>
      <h2>7. Analityka i mapa</h2>
      <p>Opcjonalne zdarzenia analityczne są uruchamiane dopiero po zgodzie i nie zawierają danych formularza. Mapa zewnętrzna ładuje się dopiero po świadomym kliknięciu użytkownika.</p>
      <h2>8. Bezpieczeństwo</h2>
      <p>Strona stosuje walidację serwerową, szyfrowaną transmisję, ograniczenia wysyłki, ochronę antyspamową oraz redakcję danych osobowych z logów. Żaden formularz nie prosi o dane karty.</p>
    </LegalPage>
  );
}
