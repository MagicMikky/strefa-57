# STREFA 29 — rejestr decyzji właściciela (spójny z planem głównym)

**Status:** kanoniczny rejestr od `main@14e082d`. Plan: `docs/STREFA29_MASTER_PLAN.md`. Starsze `docs/open-decisions.md` i `docs/STREFA29_REJESTR_DECYZJI_DO_USTALENIA.md` tylko tu odsyłają.

**Data konsolidacji:** 2026-11-06  
**Źródła:** `docs/STREFA29_REJESTR_DECYZJI_DO_USTALENIA.md`, `docs/open-decisions.md`, `strona1_0.md`, `strona2_0.md` oraz decyzje właściciela.  
**Zasada:** ten plik jest kopią roboczą do synchronizacji z repo. W repo **nie** utrzymuj dwóch niezależnych rejestrów — źródłem kanonicznym po zaakceptowaniu powinien zostać jeden plik `docs/STREFA29_DECYZJE_DO_USTALENIA.md`, a poprzedni ma do niego odsyłać.

## A. Parametry zatwierdzone

| ID | Parametr | Status | Wartość | Uwagi |
|---|---|---|---|---|
| U-01 | Maksimum zawodników w drużynie | USTALONE | 8 | Edytowalne przez ownera |
| U-02 | Liczba drużyn w meczu | USTALONE | 2–4 | Procedura przy mniejszej liczbie drużyn do ustalenia |
| U-03 | Maksimum zawodników na slot | USTALONE | 32 | Poza limitem sprzętu/personelu |
| U-04 | Standardowe starty | USTALONE | 08:00, 11:00, 14:00 | Lokalnie Europe/Warsaw; owner może zmieniać |
| U-05 | Gra i bufor | USTALONE | 120 + 60 minut | Bufor pomiędzy grami |
| U-06 | Współdzielenie slotu | USTALONE | Tak | Różne grupy łącznie ≤ 4 zespoły i 32 osoby |
| U-07 | Prywatny slot | USTALONE | Tak, cały slot na wyłączność | Dopłata D-09 otwarta |
| U-08 | Blokada przez właściciela | USTALONE | Cały dzień lub slot | Bez automatycznego wypierania opłaconych wizyt |
| U-09 | Kolory dostępności | USTALONE | Zielony: poniżej połowy; niebieski: od połowy; czerwony: niedostępny | Stan „nieustalony” przy braku danych; D-19 metodologia |
| U-10 | Edytowalność | USTALONE | Dane firmy i reguły biznesowe przez panel | Kod/sekrety pozostają poza CMS |
| U-11 | Niepogoda i zwroty | WSTĘPNE | Preferencja: co do zasady bez zwrotu przy złej pogodzie | **Prawnik:** wyjątki bezpieczeństwa, odwołanie przez obiekt, prawa klienta — D-13 |
| U-12 | Domyślny harmonogram | USTALONE | Poniedziałek–piątek, 3 sloty dziennie według U-04 | Święta, dni i godziny wyłącza ręcznie administrator w panelu; sezonowość pozostaje w D-16 |

## B. Wszystkie sprawy otwarte (D-01–D-36)

| ID | Priorytet | Temat | Co musi zdecydować/zatwierdzić właściciel | Bramka |
|---|---|---|---|---|
| D-01 | P0-PUBLIC | Dane prawne | Pełna nazwa, NIP, administrator danych, adres | Publikacja |
| D-02 | P0-PUBLIC | Kontakt | Telefon, e-mail, godziny, social | Publikacja |
| D-03 | P0-PUBLIC | Lokalizacja | Dokładny pin wejścia i parking | Publikacja |
| D-04 | P0-MEDIA | Prawa do zdjęć | Fotografie, zgody osób, kategorie, filmy, rakieta2 | Publikacja zasobów |
| D-05 | P0-PAY | Ceny pakietów | Kwoty brutto/netto, zawartość, kulki, stawki podatkowe | Checkout |
| D-06 | P0-PAY | Dodatki | Kulki, wyposażenie, ognisko, catering, ceny/dostępność | Checkout |
| D-07 | P0-PAY | Zadatek | Kwota PLN, czy stała i co przy zamówieniu o niższej wartości | Checkout |
| D-08 | P0-PAY | Saldo | Kiedy i jak klient dopłaca, rozliczenie na miejscu | Checkout |
| D-09 | P0-PAY | Slot prywatny | Kwota dopłaty i sposób naliczania | Checkout |
| D-10 | P0-PAY | Operator płatności | Wybrany PSP, metody, opłaty, podpis, refund, chargeback | Checkout |
| D-11 | P0-PAY | Anulowanie | Terminy, no-show, zmiany i komunikacja | Checkout |
| D-12 | P0-PAY | Zwroty | Pełne/częściowe, terminy, wyjątki, reklamacje | Checkout |
| D-13 | P0-LEGAL | Pogoda | Deszcz, burza, odwołanie obiektu, zagrożenie, zwroty i przełożenia | Regulamin + checkout |
| D-14 | P0-CAP | Sprzęt | Liczba sprawnych zestawów, serwis, dostępność per slot | Wiążąca dostępność |
| D-15 | P0-CAP | Obsada | Instruktorzy, minimum do 2–4 drużyn, ograniczenia | Wiążąca dostępność |
| D-16 | P0-CAP | Sezon | Domyślnie poniedziałek–piątek (U-12); do ustalenia sezonowość i ewentualne automatyczne wyjątki | Kalendarz sprzedaży |
| D-17 | P0-CAP | Okno rezerwacji | Min. wyprzedzenie, max. horyzont, ostatni termin online | Kalendarz sprzedaży |
| D-18 | P0-PAY | Hold | Ile minut; co gdy wygaśnie/klient zapłaci później | Checkout |
| D-19 | P1-CAP | Kolor przy blokadach | Czy próg zapełnienia do czynnej pojemności (zalecane), czy nominalnej | Docelowy UX kalendarza |
| D-20 | P0-CAP | Większe grupy | Czy klient rezerwuje 2–4 drużyny naraz (9–32), czy wysyła zapytanie | Rezerwacje online |
| D-21 | P0-CAP | Minimum drużyn | Co się dzieje z 1. drużyną czekającą na kolejną | Rezerwacje online |
| D-22 | P0-PAY | Wyłączność | Czy prywatny slot obejmuje sprzęt, personel i inne atrakcje | Checkout |
| D-23 | P0-PAY | Zmiany po wpłacie | Dopłaty/zwroty przy zmianie liczby, pakietu, terminu | Checkout |
| D-24 | P0-PUBLIC | Wiek i opiekunowie | Min. wiek, zgody rodziców i odpowiedzialność | Publikacja oferty |
| D-25 | P0-LEGAL | Dokumenty/RODO | Finalny regulamin, polityki, retencja, odbiorcy, podstawa | Publikacja i checkout |
| D-26 | P0-INFRA | Hosting/storage | Hosting Next, PostgreSQL, trwałe zdjęcia, backup, SLA i region | Staging / produkcja |
| D-27 | P0-SEC | MFA | Metoda (np. TOTP), recovery i polityka urządzeń | Publiczny panel |
| D-28 | P0-SEC | Role | Kto może blokować sloty, ustawiać ceny, robić zwroty, edytować | Panel, checkout |
| D-29 | P0-INFRA | E-mail | Domeny Resend, nadawca, odbiorca, DNS SPF/DKIM/DMARC | Formularz na produkcji |
| D-30 | P0-INFRA | Monitoring/retencja | Kopie, RPO/RTO, okres retencji, alerty, usuwanie | Produkcja |
| D-31 | P2 | Klienci | Rejestracja, weryfikacja, prywatność i retencja | V2.1 |
| D-32 | P2 | Drużyny | Nazwy, loga, skład, kapitan, moderacja, prywatność | V2.2 |
| D-33 | P2 | Liga | Punktacja, 2/3/4 drużyny, ranking, sędziowie, spory | V2.3 |
| D-34 | P2 | Turnieje i nagrody | Sezon, mistrzostwa, finały, budżet, kryteria | V3.0 |
| D-35 | P1 | Analityka | Dostawca, mierniki, zgody bez danych osobowych | Pomiar produkcyjny |
| D-36 | P2 | Opinie | Źródła autentycznych recenzji i zgody | Sekcja opinii |

## C. Operacyjne decyzje do podjęcia teraz — szybka lista

- [ ] **Firma i kontakt (D-01,D-02,D-03):** dane właściciela, nazwa, NIP, publiczny e-mail i telefon, rzeczywisty pin.
- [ ] **Polityka prywatności (D-25,D-30):** przyjmij fakt przechowywania zgłoszeń w bazie PostgreSQL; zatwierdź przechowywanie, dostawców i retencję.
- [ ] **MFA (D-27) i uprawnienia (D-28):** wybierz metodę recovery oraz kto ma prawa do edycji i zwrotów.
- [ ] **Hosting i media (D-26,D-04):** wybierz trwały storage i zweryfikuj prawa do zdjęć.
- [ ] **Poczta (D-29):** odbiorca i nadawca, domena, dostarczenie testowe.
- [ ] **Realne dni, sprzęt i personel (D-14,D-15,D-16):** bez tego zielony kalendarz nie jest wiążącą obietnicą.
- [ ] **Przed uruchomieniem płatności:** zamknij D-05–D-13, D-17–D-23.

## D. Dziennik zmian decyzji

| Data | ID | Status przed → po | Konkretna zaakceptowana wartość | Kto zatwierdził | Od kiedy obowiązuje |
|---|---|---|---|---|---|
| 2026-11-06 | U-01…U-10 | OTWARTE → USTALONE | Jak w tabeli A | Właściciel | Parametry startowe |
| 2026-11-06 | U-11 | OTWARTE → WSTĘPNE | Niepogoda bez automatycznie gwarantowanego zwrotu; wymagany przegląd prawny | Właściciel (preferencja) | Jeszcze nie obowiązuje jako regulamin |
| 2026-11-08 | U-12 | OTWARTE → USTALONE | Poniedziałek–piątek, trzy sloty dziennie; święta i inne wyłączenia ręcznie w panelu | Właściciel | Domyślny harmonogram |
| — | — | — | — | — | — |

## E. Procedura synchronizacji

1. Gdy właściciel poda wartość, Cursor aktualizuje odpowiednie D-ID i zapisuje datę.
2. Cursor aktualizuje `STREFA29_MASTER_PLAN_2026-11-06.md` (albo jego przyszłą wersję) i aktywny backlog w tym samym PR.
3. Wartość trafia do systemu jako walidowana konfiguracja **edytowalna przez ownera**, a nie stała TS/JS.
4. Historyczne migawki cen, umów i polityk pozostają niezmienione; zmiana ma `effectiveFrom` i audit.
5. Bez zatwierdzenia ownera Cursor nie wpisuje kwot ani nie ustawia `commercialApproved=true`.
