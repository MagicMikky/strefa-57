import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Polityka cookies", description: "Ustawienia cookies i podobnych technologii na stronie Paintball Strefa 29.", alternates: { canonical: "/cookies" } };

export default function CookiesPage() {
  return (
    <LegalPage eyebrow="Ustawienia" title="Cookies" lead="Niezbędne mechanizmy działają zawsze. Analityczne wybierasz samodzielnie." updated="Wersja robocza 1.0">
      <h2>1. Kategorie</h2>
      <h3>Niezbędne</h3>
      <p>Zapamiętują wybór dotyczący cookies i wspierają bezpieczne działanie strony. Nie można ich wyłączyć w panelu, ponieważ bez nich wybór użytkownika nie mógłby zostać zachowany.</p>
      <h3>Analityczne</h3>
      <p>Po dobrowolnej zgodzie pozwalają mierzyć anonimowe zdarzenia, takie jak rozpoczęcie formularza, kliknięcie trasy lub przejście do cennika. Nie obejmują danych wpisywanych w formularzu.</p>
      <h2>2. Mapa</h2>
      <p>Osadzona mapa Google nie ładuje się automatycznie. Dopiero kliknięcie „Pokaż mapę” nawiązuje połączenie z usługą zewnętrzną.</p>
      <h2>3. Zmiana wyboru</h2>
      <p>Przycisk „Ustawienia cookies” pozostaje dostępny w dolnej części ekranu po zapisaniu decyzji. Pozwala w dowolnym momencie włączyć lub wyłączyć kategorię analityczną.</p>
      <h2>4. Lista dostawców</h2>
      <p>Finalna wersja dokumentu musi wskazywać rzeczywiście uruchomione narzędzia, okresy ważności, cele i dostawców. Aplikacja nie powinna deklarować narzędzi, których produkcyjnie nie używa.</p>
    </LegalPage>
  );
}
