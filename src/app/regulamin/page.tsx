import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Regulamin", description: "Robocze zasady korzystania z pola Paintball Strefa 29 i wysyłania zapytań przez stronę." };

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Dokumenty" title="Regulamin" lead="Zasady strony, kontaktu i bezpiecznego udziału w grze." updated="Wersja robocza 1.0 — do zatwierdzenia">
      <h2>1. Charakter strony</h2>
      <p>Strona przedstawia ofertę Paintball Strefa 29 i umożliwia przesłanie niewiążącego zapytania. Nie prezentuje dostępności na żywo, nie blokuje terminu i nie przyjmuje płatności online.</p>
      <h2>2. Zapytanie o termin</h2>
      <p>Wysłanie formularza nie oznacza zawarcia umowy ani potwierdzenia wizyty. Obsługa weryfikuje możliwość organizacji wydarzenia, jego cenę i zasady, a następnie kontaktuje się z organizatorem.</p>
      <h2>3. Dane podawane w formularzu</h2>
      <p>Użytkownik powinien podawać dane prawdziwe i potrzebne do odpowiedzi. W polu wiadomości nie należy umieszczać danych karty płatniczej, szczegółowych informacji o zdrowiu ani danych innych osób bez podstawy do ich przekazania.</p>
      <h2>4. Bezpieczeństwo na polu</h2>
      <p>Udział wymaga przestrzegania odprawy, poleceń prowadzącego oraz prawidłowego używania wyposażenia ochronnego. Ostateczne zasady wieku, opieki nad osobami niepełnoletnimi i odpowiedzialności muszą zostać uzupełnione przez właściciela.</p>
      <h2>5. Ceny, zadatek i anulowanie</h2>
      <p>Ceny widoczne przed ich formalnym zatwierdzeniem mają charakter informacyjny. Wiążąca cena, ewentualny zadatek, sposób płatności, zmiana terminu i anulowanie są przekazywane klientowi przed osobnym potwierdzeniem wizyty.</p>
      <h2>6. Pogoda i zdarzenia niezależne</h2>
      <p>Decyzja o przeprowadzeniu gry zależy od bezpieczeństwa i warunków terenowych. Szczegółowa procedura odwołania przez organizatora lub obiekt wymaga zatwierdzenia przed publikacją regulaminu.</p>
      <h2>7. Kontakt</h2>
      <p>Oficjalne dane podmiotu, telefon i e-mail należy uzupełnić przed publikacją. Do tego czasu dokument nie może zostać uznany za finalny regulamin konsumencki.</p>
    </LegalPage>
  );
}
