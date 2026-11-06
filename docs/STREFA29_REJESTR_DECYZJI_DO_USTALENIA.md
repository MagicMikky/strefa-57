# Strefa 29 — rejestr decyzji właściciela do ustalenia

> Historyczny rejestr. Kanoniczne wartości są w `docs/STREFA29_DECYZJE_DO_USTALENIA.md`, a plan w `docs/STREFA29_MASTER_PLAN.md`.

**Data utworzenia:** 6 listopada 2026  
**Plik nadrzędny:** `docs/STREFA29_NOWA_ROADMAPA_I_PLAN_WERSJI_2026-11-06.md`  
**Uwaga:** Wartości oznaczone jako OTWARTE nie mogą stać się domyślnymi danymi produkcyjnymi bez decyzji właściciela.

> Stawki cen, opłaty prywatne, kwoty zadatków, szczegółowe zwroty i operator płatności pozostają nieustalone. Zasada „brak zwrotu ze względu na pogodę” jest preferencją wymagającą doprecyzowania i weryfikacji prawnej.

---

## Decyzje potwierdzone i pytania pozostawione na później

Statusy: **USTALONE** = potwierdzone w rozmowie; **WSTĘPNE** = preferencja, wymaga doprecyzowania / weryfikacji; **OTWARTE** = właściciel musi podjąć decyzję. Rejestr jest odrębny od kodu i służy do pilnowania zaległych decyzji. Każdą zmianę synchronizuj z główną roadmapą.

### 1. Ustalone lub wstępne

| ID | Decyzja | Status | Ustalona wartość / uwaga |
|---|---|---|---|
| U-01 | Maksimum graczy w drużynie | USTALONE | 8 na start, edytowalne |
| U-02 | Zespoły w meczu | USTALONE | od 2 do 4 |
| U-03 | Pojemność slotu | USTALONE | 32 graczy |
| U-04 | Harmonogram | USTALONE | 08:00 / 11:00 / 14:00 |
| U-05 | Czas gry i przerwa | USTALONE | 120 minut + 60 minut pomiędzy slotami |
| U-06 | Rezerwacje współdzielone | USTALONE | Niezależne drużyny mogą korzystać z jednego slotu przy zachowaniu wszystkich limitów |
| U-07 | Rezerwacja prywatna | USTALONE | Cały slot na wyłączność za dopłatą, kwota do ustalenia |
| U-08 | Zamknięcie terminu przez właściciela | USTALONE | Blokada dnia i dowolnego slotu |
| U-09 | Kolory dni | USTALONE | Czerwony — niedostępny, niebieski — >= połowy zajętości, zielony — < połowy |
| U-10 | Edytowalność biznesowa | USTALONE | Wszystkie kluczowe dane firmy, opisy, galerie i reguły z panelu właściciela |
| U-11 | Pogoda a zwrot | WSTĘPNE | Preferencja: brak zwrotu za samo pogorszenie pogody; do zatwierdzenia prawnego i określenia zasad przy zagrożeniu bezpieczeństwa / odwołaniu przez organizatora |

### 2. Decyzje otwarte — nie wymyślać wartości

| ID | Temat | Co trzeba ustalić | Najpóźniej przed |
|---|---|---|---|
| D-01 | Dane prawne | Pełna nazwa, NIP, adres, administrator danych | Publikacją 1.0 / CMS 1.5B |
| D-02 | Kontakt | Telefon, firmowy e-mail, godziny, profil social | Publikacją 1.0 |
| D-03 | Lokalizacja | Potwierdzony pin dojazdu, wejście i parking | Publikacją 1.0 |
| D-04 | Zdjęcia i prawa | Materiały, zgody osób, kategorie galerii, publikacja zdjęć graczy | Publikacją zdjęć |
| D-05 | Ceny pakietów | Każdy pakiet: cena brutto/netto, zakres, kulki, dodatki, zmiany sezonowe | Rezerwacjami 2.0 |
| D-06 | Dodatkowe usługi | Cennik kulek, wyposażenia, ogniska/cateringu i zasad dostępności | Sprzedażą 2.0 |
| D-07 | Kwota zadatku | Stała kwota PLN i sposób traktowania małych zamówień | Checkoutem 2.0 |
| D-08 | Pozostałe saldo | Termin i metoda płatności na miejscu / poza systemem | Checkoutem 2.0 |
| D-09 | Cena prywatnego slotu | Dopłata, pełna cena, zadatek i dopuszczalna liczba prywatnych drużyn | Checkoutem 2.0 |
| D-10 | Operator płatności | Operator, metody płatności, opłaty, webhooki, zwroty, chargebacki | Implementacją płatności |
| D-11 | Anulowanie | Ile wcześniej, przez kogo, zasady odstąpienia/anulowania i no-show | Rezerwacjami 2.0 |
| D-12 | Zwroty | Pełne/częściowe, terminy, sposób obsługi i wyjątki | Rezerwacjami 2.0 |
| D-13 | Pogoda | Dokładna reguła zwykłego deszczu, zagrożeń bezpieczeństwa, odwołania przez obiekt, alternatywy i zwroty | Publikacją regulaminu |
| D-14 | Sprzęt | Liczba sprawnych kompletów, zapasy i limity na dni/sloty | Testem dostępności 2.0 |
| D-15 | Obsada | Minimalna liczba prowadzących na 2–4 drużyny i 32 osoby | Dostępnością 2.0 |
| D-16 | Sezon / wyjątki | Dni tygodnia, święta, sezonowość, dni całkowicie zamknięte | Kalendarzem 2.0 |
| D-17 | Okno rezerwacji | Minimalne wyprzedzenie, max liczba dni naprzód, termin zakończenia przyjmowania | Kalendarzem 2.0 |
| D-18 | Czas hold | Ile minut blokada jest ważna i jak postępować przy timeout | Checkoutem 2.0 |
| D-19 | Kolor przy blokadach | Czy procent zapełnienia liczyć do pojemności nominalnej czy wyłącznie czynnych slotów (rekomendacja: czynne) | Kalendarzem 2.0 |
| D-20 | Duże grupy | Czy klient może online zarezerwować 2–4 drużyny jednocześnie (9–32 graczy), czy wymaga obsługi | Kalendarzem 2.0 |
| D-21 | Minimum drużyn | Czy pierwsza drużyna czeka na przeciwnika, termin graniczny i zasady, jeśli nie zbiorą się >=2 | Kalendarzem 2.0 |
| D-22 | Wyłączność pola | Czy prywatny slot obejmuje sprzęt/personel, maks liczbę drużyn i specjalne zasady | Rezerwacjami prywatnymi |
| D-23 | Zmiany po wpłacie | Dopłata/zwrot przy zmianie liczby graczy, pakietu, terminu, opłaty prywatnej | Rezerwacjami 2.0 |
| D-24 | Wiek i zgody | Minimalny wiek, opiekunowie, odpowiedzialność i zasady nieletnich | Publikacją oferty |
| D-25 | Regulaminy / RODO | Finalne teksty, administrator danych, retencja, odbiorcy | Publikacją i bazą danych |
| D-26 | Hosting / storage | Hosting Next.js, PostgreSQL, magazyn zdjęć, region, SLA, kopie, koszty | Staging v1.5B |
| D-27 | MFA | Metoda MFA, odzyskiwanie dostępu, polityka urządzeń pracowników | Produkcyjnym panelem 1.5A |
| D-28 | Uprawnienia | Dokładna macierz owner/manager/employee; kto może zamykać sloty/robić zwroty | Panelem 1.5B i 2.0 |
| D-29 | Poczta | Domeny Resend, odbiorca, nadawca, SPF/DKIM/DMARC, szablony i SLA | Produkcją 1.0/1.5A |
| D-30 | Monitoring/retencja | Alerty, RPO/RTO, data retention, polityka backupów, usuwanie danych | Produkcją 1.5A/2.0 |
| D-31 | Konta klientów | Forma rejestracji, weryfikacja, opcjonalne MFA, retencja i prywatność | 2.1 |
| D-32 | Drużyny | Nazwy/logotypy, moderacja, zmiana kapitana, limity, skład na mecz vs stały | 2.2 |
| D-33 | Liga | Typy meczów 2/3/4 drużyny, punktacja, ranking, remisy, walkowery, sędziowie, protesty | 2.3 |
| D-34 | Turnieje/nagrody | Czas trwania sezonu, finały, nagrody, regulamin, budżet i kryteria | 3.0 |
| D-35 | Analityka | Dostawca, cele, macierz zgód, bez danych osobowych | Publicznym pomiarem |
| D-36 | Opinie | Źródła prawdziwych recenzji, zgody i moderacja | Publikacją sekcji opinii |

**Zasada:** decyzja OPEN nie może zostać zastąpiona zmyśloną wartością domyślną w produkcji. Można przygotować techniczny przykład/test fixture, wyraźnie oznaczony jako nieprodukcyjny.

---

## Instrukcja aktualizacji i historia decyzji

Po ustaleniu wartości:

1. Zmień status `OTWARTE` → `USTALONE` (lub `WSTĘPNE`), wpisz konkretny wariant.
2. Dodaj datę i informację, kto zatwierdził decyzję.
3. Zmień adekwatną sekcję głównej roadmapy i — jeśli dotyczy — pierwotny `strona2_0.md`.
4. W panelu właściciela przechowuj ustawienie jako edytowalne oraz wersjonowane (z datą obowiązywania), zamiast stałej w kodzie.
5. Nie kasuj historii ważnych zmian cen, zasad, harmonogramu i pojemności.

| Data | ID decyzji | Zatwierdzony wariant | Zatwierdził | Od kiedy obowiązuje |
|---|---|---|---|---|
| 2026-11-06 | U-01…U-10 | Parametry wejściowe wpisane na podstawie dyspozycji właściciela | Właściciel | Konfiguracja początkowa |
| — | — | — | — | — |
