# Plan budowy strony internetowej Paintball Strefa 29

> Historia pierwszego planu budowy. Bieżący plan jest w `docs/STREFA29_MASTER_PLAN.md`.

## 1. Cel projektu

Celem jest stworzenie szybkiej, atrakcyjnej i bezpiecznej strony internetowej dla pola **Paintball Strefa 29**, która:

- profesjonalnie prezentuje obiekt, atrakcje, scenariusze i cennik;
- ułatwia znalezienie pola i kontakt z obsługą;
- pozwala sprawdzić dostępność i zarezerwować termin z kontem lub bez konta;
- obsługuje płatności online, potwierdzenia i przypomnienia;
- zapewnia właścicielowi pełny panel do zarządzania terminami, cenami, rezerwacjami i treścią;
- dobrze działa na telefonach, ponieważ większość klientów prawdopodobnie trafi na stronę z social mediów lub wyszukiwarki.

## 2. Założenia biznesowe do zatwierdzenia

Przed rozpoczęciem kodowania trzeba potwierdzić poniższe reguły. Powinny być konfigurowalne w panelu administratora, a nie zapisane na stałe w kodzie.

| Obszar | Wstępne założenie |
|---|---|
| Lokalizacja | Żurawia 29, 80-298 Czaple, ok. 15 km / 20 min od centrum Gdańska |
| Dni otwarcia | 7 dni w tygodniu, także wybrane święta |
| Godziny rozpoczęcia | 09:00, 12:00, 15:00, 18:00 |
| Ceny | Takie same w tygodniu i w weekend |
| Model rezerwacji | Jedna lub więcej grup na slot — liczba zależna od pojemności sprzętu i obsługi |
| Minimalna grupa | Do ustalenia |
| Maksymalna liczba graczy | Do ustalenia dla pojedynczej rezerwacji i całego slotu |
| Czas blokady terminu | Propozycja: 15 minut podczas płatności |
| Zadatek | Propozycja: stała kwota lub procent wartości zamówienia |
| Anulowanie | Do ustalenia: termin bezpłatnego anulowania i zasady zwrotu |
| Rezerwacja bez konta | Tak, po podaniu danych kontaktowych i potwierdzeniu e-mail/SMS |
| Rezerwacja z kontem | Tak, z historią, ponowną rezerwacją i możliwością zmiany danych |

## 3. Zakres funkcjonalny

### 3.1. Część publiczna

1. **Strona główna**
   - mocny baner ze zdjęciem pola i głównym hasłem;
   - przyciski „Zarezerwuj termin” i „Zobacz ofertę”;
   - najważniejsze informacje: ponad 1 ha terenu, 4 godziny rozpoczęcia, lokalizacja koło Gdańska;
   - skrót atrakcji i scenariusza z rakietą V2;
   - opinie klientów;
   - skrót cennika;
   - wezwanie do rezerwacji.

2. **Oferta**
   - opis pola i infrastruktury;
   - rakieta V2: przytrzymanie przycisku przez 10 sekund, odliczanie 10 minut, dym w ostatnich 2 minutach;
   - system okopów i worków z piaskiem;
   - ambony strzeleckie;
   - bunkier, strefy scenariuszowe i przeszkody terenowe;
   - manekin spadochroniarza jako element scenografii;
   - galeria zdjęć;
   - sekcja „Dla kogo”: znajomi, kawalerskie/panieńskie, urodziny, firmy, szkoły i grupy zorganizowane — po potwierdzeniu przez właściciela.

3. **Cennik**
   - pakiety przedstawione w czytelnych kartach;
   - informacja, co zawiera każdy pakiet;
   - dodatki: dodatkowe kulki, granaty dymne, rękawice, kombinezon, catering/ognisko — tylko jeśli rzeczywiście dostępne;
   - wyliczenie orientacyjnej ceny dla liczby osób;
   - informacja o zadatku i zasadach anulowania;
   - treść cennika zarządzana z panelu administratora.

4. **Rezerwacja**
   - wybór liczby uczestników;
   - wybór pakietu i dodatków;
   - poziomy wybór miesiąca;
   - kalendarz Pon–Niedz z poprawnym układem dni;
   - oznaczenia: dostępny, mało miejsc, zajęty, niedostępny;
   - po wybraniu dnia: dostępne godziny 09:00, 12:00, 15:00, 18:00;
   - podsumowanie ceny;
   - dane organizatora;
   - rezerwacja gościnna albo logowanie/rejestracja;
   - zgody i akceptacja regulaminu;
   - płatność zadatku lub całości;
   - ekran i wiadomość potwierdzająca z numerem rezerwacji.

5. **Kontakt i dojazd**
   - adres, telefon, e-mail i godziny kontaktu;
   - interaktywna mapa Google lub mapa alternatywna zgodna z ustawieniami zgód;
   - przycisk otwierający trasę w Google Maps;
   - wyraźna informacja o dojeździe od strony ul. Do Strzelnicy;
   - formularz kontaktowy zabezpieczony przed spamem.

6. **Pozostałe strony**
   - FAQ;
   - regulamin pola i rezerwacji;
   - polityka prywatności;
   - polityka cookies;
   - zgody marketingowe;
   - strona 404 oraz strony wyniku płatności.

### 3.2. Konto klienta

- rejestracja przez e-mail i hasło;
- potwierdzenie adresu e-mail;
- logowanie, wylogowanie i reset hasła;
- opcjonalne logowanie Google na późniejszym etapie;
- profil i dane kontaktowe;
- historia oraz status rezerwacji;
- szczegóły płatności;
- możliwość pobrania potwierdzenia;
- anulowanie lub prośba o zmianę terminu zgodnie z regulaminem;
- ponowienie wcześniejszej rezerwacji;
- usunięcie konta i eksport danych.

Rezerwacja gościnna powinna dawać dostęp do szczegółów przez bezpieczny link i kod wysłany na e-mail lub telefon.

### 3.3. Panel administratora

- pulpit z dzisiejszymi rezerwacjami, liczbą graczy i płatnościami;
- widok dzienny, tygodniowy i miesięczny;
- dodawanie, edycja, przenoszenie i anulowanie rezerwacji;
- ręczne dodanie rezerwacji telefonicznej;
- definiowanie slotów, dni otwarcia, wyjątków i świąt;
- ustawianie maksymalnej liczby graczy i grup na slot;
- zamykanie wybranej daty lub godziny;
- zarządzanie pakietami, cenami, dodatkami i zadatkami;
- statusy: oczekuje na płatność, potwierdzona, opłacona, zakończona, anulowana, nieobecność;
- lista uczestników i uwag organizacyjnych;
- wysyłanie potwierdzeń oraz przypomnień;
- eksport rezerwacji i sprzedaży do CSV;
- zarządzanie treściami strony, galerią, FAQ i opiniami;
- konta pracowników z rolami i ograniczonymi uprawnieniami;
- rejestr zmian administracyjnych.

## 4. Przepływ rezerwacji

1. Klient wybiera liczbę graczy.
2. System pokazuje tylko dni, w których dostępna pojemność mieści wybraną grupę.
3. Klient wybiera pakiet, dzień, godzinę i dodatki.
4. Serwer ponownie sprawdza dostępność i zakłada tymczasową blokadę slotu.
5. Klient wybiera rezerwację bez konta lub logowanie/rejestrację.
6. Podaje dane, akceptuje regulamin i przechodzi do płatności.
7. Po poprawnym potwierdzeniu płatności system zapisuje rezerwację jako potwierdzoną.
8. Klient i administrator otrzymują potwierdzenie.
9. System wysyła przypomnienie, np. 48 i 4 godziny przed grą.
10. Brak płatności w określonym czasie zwalnia blokadę terminu.

Wolnych miejsc nie wolno liczyć wyłącznie w przeglądarce. Serwer musi wykonywać transakcję i blokować zasoby, aby dwie osoby nie zarezerwowały jednocześnie tego samego miejsca.

## 5. Proponowana architektura techniczna

### 5.1. Rekomendowany stos

- **Frontend i backend:** Next.js + TypeScript;
- **interfejs:** Tailwind CSS oraz własny system komponentów;
- **baza danych:** PostgreSQL;
- **ORM i migracje:** Prisma;
- **logowanie:** Auth.js lub zarządzana usługa uwierzytelniania;
- **płatności:** operator obsługujący BLIK, szybkie przelewy i karty, wybrany po sprawdzeniu warunków firmy;
- **e-mail:** transakcyjny dostawca e-mail z własną domeną;
- **SMS:** opcjonalna polska bramka SMS;
- **zdjęcia:** optymalizowane formaty WebP/AVIF i magazyn obiektowy;
- **monitoring:** rejestrowanie błędów, monitoring dostępności i kopie bazy;
- **wdrożenie:** zarządzany hosting aplikacji i zarządzana baza PostgreSQL albo własny serwer, jeśli właściciel akceptuje większy zakres administracji.

Zarządzane usługi są droższe miesięcznie, ale zmniejszają ryzyko awarii i czas potrzebny na aktualizacje, kopie zapasowe oraz bezpieczeństwo.

### 5.2. Główne moduły

- strona marketingowa i SEO;
- katalog pakietów i dodatków;
- silnik dostępności;
- koszyk i kalkulator ceny;
- rezerwacje i blokady terminów;
- płatności oraz webhooki;
- konta klientów;
- panel administracyjny;
- powiadomienia e-mail/SMS;
- CMS dla treści i zdjęć;
- raporty oraz eksporty;
- audyt, monitoring i kopie zapasowe.

### 5.3. Najważniejsze encje bazy danych

- `User`, `Account`, `Session`, `Role`;
- `CustomerProfile`;
- `Booking`, `BookingParticipantCount`, `BookingStatusHistory`;
- `TimeSlot`, `OpeningRule`, `DateException`, `CapacityRule`;
- `Package`, `AddOn`, `PriceRule`;
- `BookingItem`, `Payment`, `Refund`;
- `TemporaryHold`;
- `Notification`, `Consent`, `AuditLog`;
- `PageContent`, `GalleryImage`, `FAQ`, `Review`.

## 6. Projekt wizualny i UX

### 6.1. Kierunek graficzny

- klimat taktyczny i terenowy bez przeładowania militarną stylistyką;
- kolory: głęboka zieleń, grafit, piaskowy beż i mocny kolor akcentu przypominający świeżą farbę paintballową;
- duże, autentyczne fotografie pola i uczestników;
- czytelne, mocne nagłówki;
- przyciski rezerwacji widoczne stale na telefonie;
- animacje krótkie i lekkie, z możliwością wyłączenia przez ustawienia systemowe użytkownika.

### 6.2. Efekt strzału paintballowego

Po kliknięciu głównego przycisku można wyświetlić krótką plamę farby i subtelny efekt dźwiękowy. Zasady:

- animacja nie może opóźniać przejścia do rezerwacji;
- dźwięk domyślnie wyłączony lub uruchamiany dopiero po świadomej interakcji;
- efekt ma działać również bez dźwięku;
- musi respektować `prefers-reduced-motion`;
- nie może pogarszać czytelności ani wyniku Core Web Vitals.

### 6.3. Wykorzystanie materiałów

Dostarczone zdjęcia należy przypisać do kategorii: hero, teren, okopy, bunkier, rakieta V2, zaplecze/chatka, drużyna oraz cennik. Przed publikacją trzeba:

- wybrać najlepsze kadry i poprawić ekspozycję;
- usunąć metadane lokalizacyjne, jeśli nie są potrzebne;
- przygotować wersje responsywne;
- nadać opisowe nazwy i teksty alternatywne;
- potwierdzić zgodę osób widocznych na publikację wizerunku;
- przepisać cennik do HTML — obraz cennika może być dodatkiem, ale nie jedynym źródłem cen.

## 7. Plan realizacji krok po kroku

## Etap 0 — Start projektu i decyzje biznesowe

**Zadania:**

1. Ustalić osobę decyzyjną i zakres odpowiedzialności.
2. Zebrać logo, dane kontaktowe, domenę, social media, regulamin, aktualny cennik i zgodę na zdjęcia.
3. Potwierdzić zasady pojemności, pakietów, płatności, anulowania, świąt i zadatku.
4. Wybrać operatora płatności i kanały powiadomień.
5. Ustalić zakres MVP i funkcji po premierze.

**Rezultat:** podpisana lista wymagań i reguł rezerwacji.

**Kryterium odbioru:** żadna kluczowa reguła wpływająca na cenę lub dostępność nie pozostaje nieokreślona.

## Etap 1 — Analiza użytkowników i struktura informacji

**Zadania:**

1. Opisać ścieżki: szybka rezerwacja, poznanie oferty, organizacja imprezy firmowej, kontakt i dojazd.
2. Przygotować mapę strony.
3. Uporządkować teksty i wyeliminować powtórzenia.
4. Przygotować FAQ z realnych pytań klientów.
5. Zaplanować adresy URL i podstawy lokalnego SEO.

**Rezultat:** mapa strony, lista treści i komplet ścieżek użytkownika.

**Kryterium odbioru:** do rezerwacji można dojść z każdej kluczowej podstrony w maksymalnie dwóch kliknięciach.

## Etap 2 — Makiety UX

**Zadania:**

1. Wykonać makiety mobile-first dla wszystkich widoków.
2. Zaprojektować kalendarz, wybór slotu i podsumowanie ceny.
3. Zaprojektować rezerwację gościnną i z kontem bez dublowania formularzy.
4. Zaprojektować konto klienta i panel administratora.
5. Przetestować prototyp na kilku osobach niezwiązanych z projektem.

**Rezultat:** klikalny prototyp.

**Kryterium odbioru:** użytkownik potrafi znaleźć cenę i przejść do poprawnego terminu bez instrukcji.

## Etap 3 — Projekt UI i system komponentów

**Zadania:**

1. Zdefiniować paletę, typografię, siatkę, ikony, przyciski, formularze i stany błędów.
2. Przygotować wersje desktop, tablet i mobile.
3. Opracować stany kalendarza i płatności.
4. Zaprojektować animację trafienia kulką.
5. Sprawdzić kontrast, fokus klawiatury i czytelność formularzy.

**Rezultat:** zatwierdzony projekt graficzny i biblioteka komponentów.

**Kryterium odbioru:** wszystkie ekrany mają widoki błędów, ładowania, pustych danych i sukcesu.

## Etap 4 — Fundament techniczny

**Zadania:**

1. Utworzyć repozytorium, gałęzie i zasady code review.
2. Skonfigurować TypeScript, linting, formatowanie i testy.
3. Przygotować środowiska: lokalne, testowe i produkcyjne.
4. Skonfigurować bazę, migracje i bezpieczne zmienne środowiskowe.
5. Skonfigurować automatyczne budowanie i wdrażanie.
6. Dodać podstawowy monitoring, logi i politykę kopii zapasowych.

**Rezultat:** działający szkielet aplikacji na środowisku testowym.

**Kryterium odbioru:** każda zmiana przechodzi automatyczne sprawdzenia przed wdrożeniem.

## Etap 5 — Strona publiczna

**Zadania:**

1. Zbudować nagłówek, stopkę, stronę główną, ofertę, cennik, kontakt, FAQ i dokumenty prawne.
2. Wdrożyć galerię i optymalizację zdjęć.
3. Osadzić mapę z mechanizmem zgód cookies lub aktywacją po kliknięciu.
4. Dodać formularz kontaktowy z ochroną antyspamową.
5. Wdrożyć metadane SEO, dane strukturalne LocalBusiness, Open Graph i mapę strony.

**Rezultat:** kompletna część informacyjna.

**Kryterium odbioru:** strona działa poprawnie na aktualnych telefonach i przeglądarkach oraz nie ma krytycznych błędów dostępności.

## Etap 6 — Konta i bezpieczeństwo dostępu

**Zadania:**

1. Wdrożyć rejestrację, weryfikację e-mail, logowanie i reset hasła.
2. Dodać bezpieczne sesje oraz limity prób logowania.
3. Wdrożyć role klient, pracownik i administrator.
4. Zbudować profil, historię rezerwacji, eksport i usunięcie danych.
5. Przygotować dostęp do rezerwacji gościnnej przez jednorazowy link/kod.

**Rezultat:** kompletna obsługa kont i gości.

**Kryterium odbioru:** klient nie może zobaczyć cudzej rezerwacji, a pracownik nie ma dostępu do ustawień administratora.

## Etap 7 — Silnik dostępności i kalendarz

**Zadania:**

1. Zaimplementować reguły godzin, pojemności, wyjątków i świąt.
2. Zbudować API dostępności zależne od liczby graczy.
3. Dodać blokady tymczasowe i transakcyjną ochronę przed podwójną rezerwacją.
4. Wdrożyć kalendarz miesiąca Pon–Niedz i wybór slotu.
5. Zapewnić prawidłową obsługę strefy czasowej `Europe/Warsaw` oraz zmiany czasu.
6. Dodać testy współbieżności i przypadków granicznych.

**Rezultat:** wiarygodny kalendarz dostępności.

**Kryterium odbioru:** równoczesne próby nie mogą przekroczyć limitu slotu ani utworzyć dwóch rezerwacji na ostatnie miejsce.

## Etap 8 — Koszyk, ceny i płatności

**Zadania:**

1. Zaimplementować pakiety, dodatki, zadatek i kalkulator ceny.
2. Zapisywać cenę rezerwacji jako migawkę, aby późniejsza zmiana cennika nie zmieniała starej rezerwacji.
3. Zintegrować płatność i podpisane webhooki.
4. Zapewnić idempotencję: ponowne wysłanie webhooka nie może utworzyć drugiej płatności.
5. Obsłużyć sukces, odmowę, przerwanie, wygaśnięcie oraz zwrot.
6. Dodać potwierdzenia e-mail i opcjonalnie SMS.

**Rezultat:** pełna rezerwacja od wyboru terminu do potwierdzenia zapłaty.

**Kryterium odbioru:** status rezerwacji wynika z potwierdzenia operatora płatności, a nie tylko z powrotu klienta na stronę.

## Etap 9 — Panel administracyjny

**Zadania:**

1. Zbudować pulpit i kalendarz operacyjny.
2. Dodać ręczne rezerwacje oraz zarządzanie terminami i pojemnością.
3. Dodać zarządzanie cenami, pakietami, wyjątkami i dniami wolnymi.
4. Dodać zarządzanie treściami, galerią i FAQ.
5. Zaimplementować eksport CSV, role pracowników i dziennik zmian.
6. Dodać ręczne ponowienie wiadomości oraz procedurę zwrotu.

**Rezultat:** właściciel może samodzielnie prowadzić stronę i rezerwacje.

**Kryterium odbioru:** typowe działania nie wymagają dostępu programisty ani bezpośredniej edycji bazy.

## Etap 10 — Powiadomienia i automatyzacje

**Zadania:**

1. Przygotować szablony potwierdzeń, przypomnień, anulowania i zmiany terminu.
2. Dodać kolejkę zadań oraz ponawianie nieudanych wysyłek.
3. Zaplanować przypomnienia i automatyczne wygaszanie nieopłaconych blokad.
4. Powiadamiać administratora o nowych rezerwacjach i błędach płatności.
5. Rejestrować status dostarczenia wiadomości.

**Rezultat:** niezawodna komunikacja z klientem.

**Kryterium odbioru:** awaria bramki e-mail/SMS nie blokuje rezerwacji, a wiadomość może zostać ponowiona.

## Etap 11 — Testy i audyt przedpremierowy

**Testy:**

- jednostkowe: ceny, pojemność, statusy i zasady anulowania;
- integracyjne: baza, logowanie, płatności, e-mail i SMS;
- end-to-end: pełna rezerwacja gościa i użytkownika;
- współbieżność: ostatnie dostępne miejsca;
- bezpieczeństwo: uprawnienia, formularze, limity żądań i webhooki;
- responsywność: telefony, tablety i desktop;
- dostępność: klawiatura, czytnik ekranu, kontrast i komunikaty błędów;
- wydajność: obrazy, ładowanie kalendarza i Core Web Vitals;
- zgodność treści, cen i danych firmy;
- kopie zapasowe i próbne odtworzenie bazy.

**Rezultat:** raport błędów i podpisana lista odbiorowa.

**Kryterium odbioru:** brak błędów krytycznych i wysokich, a najważniejsze ścieżki mają automatyczne testy.

## Etap 12 — Przygotowanie produkcji

**Zadania:**

1. Skonfigurować domenę, DNS, HTTPS i firmowe skrzynki e-mail.
2. Utworzyć produkcyjną bazę i oddzielne klucze usług.
3. Ustawić automatyczne kopie oraz retencję.
4. Skonfigurować analitykę respektującą zgody użytkownika.
5. Dodać stronę do Google Search Console i wizytówki Google Business Profile.
6. Wykonać migrację treści i finalne testy płatności.
7. Przeszkolić Piotra z panelu i przygotować krótką instrukcję.
8. Przygotować plan cofnięcia wdrożenia.

**Rezultat:** gotowe środowisko produkcyjne.

**Kryterium odbioru:** można wykonać prawdziwą rezerwację, płatność, anulowanie i odtworzenie danych bez udziału klienta testowego.

## Etap 13 — Premiera i stabilizacja

**Zadania:**

1. Uruchomić stronę w spokojniejszym terminie, nie tuż przed najbardziej obciążonym weekendem.
2. Przez pierwsze dni aktywnie śledzić błędy, płatności i dostarczanie wiadomości.
3. Sprawdzać zgodność rezerwacji online z kalendarzem obsługi.
4. Zebrać opinie pierwszych klientów.
5. Poprawić problemy blokujące konwersję i obsługę.

**Rezultat:** stabilna wersja produkcyjna.

**Kryterium odbioru:** jeden pełny cykl działania — od rezerwacji do rozegranej wizyty — przebiegł bez ręcznych obejść.

## 8. Podział na wersje

### MVP — wersja potrzebna do bezpiecznej premiery

- responsywna strona główna, oferta, cennik, galeria, kontakt i mapa;
- regulamin, prywatność i cookies;
- kalendarz dostępności;
- rezerwacja bez konta i z kontem;
- pakiety, dodatki i kalkulator ceny;
- płatność zadatku lub całości;
- e-mailowe potwierdzenia i przypomnienia;
- konto klienta z historią;
- panel administratora z rezerwacjami, slotami, cenami i wyjątkami;
- podstawowe SEO, analityka, monitoring, kopie i testy;
- efekt paintballowy w lekkiej, dostępnej formie.

### Wersja 1.1

- powiadomienia SMS;
- logowanie Google;
- kupony i vouchery prezentowe;
- automatyczne zbieranie opinii po wizycie;
- integracja z kalendarzem zewnętrznym;
- lista rezerwowa na zajęte terminy;
- rozbudowane raporty.

### Wersja 2.0

- program lojalnościowy;
- konta firmowe i cykliczne wydarzenia;
- elektroniczne zgody uczestników;
- kody QR do szybkiego meldowania grup;
- wielojęzyczność PL/EN;
- sprzedaż dodatkowych usług i produktów;
- rozbudowany CMS scenariuszy i landing pages dla wydarzeń.

## 9. Bezpieczeństwo, RODO i niezawodność

- zbierać tylko dane potrzebne do realizacji rezerwacji;
- hasła hashować przez sprawdzoną bibliotekę lub zlecić uwierzytelnianie zarządzanej usłudze;
- nie przechowywać danych kart płatniczych;
- szyfrować transmisję i ograniczać dostęp administracyjny;
- stosować ochronę CSRF/XSS/SQL injection, limity żądań i walidację po stronie serwera;
- podpisywać i weryfikować webhooki;
- prowadzić dziennik zmian istotnych danych;
- wdrożyć politykę retencji i obsługę wniosków RODO;
- zabezpieczyć formularze przed botami;
- regularnie aktualizować zależności;
- wykonywać automatyczne kopie oraz okresowo testować ich odtworzenie;
- przygotować procedurę awarii płatności, e-maila i bazy.

Regulamin, politykę prywatności, cookies i zasady zwrotów powinien zatwierdzić prawnik lub specjalista ds. zgodności przed publikacją.

## 10. SEO i marketing lokalny

- frazy lokalne, np. „paintball Gdańsk”, „paintball Trójmiasto”, „paintball Czaple”, „integracja firmowa Gdańsk”;
- unikalne tytuły, opisy i nagłówki;
- dane strukturalne dla lokalnej firmy, FAQ, opinii i oferty;
- spójne dane adresowe na stronie i w profilach zewnętrznych;
- zoptymalizowane zdjęcia z opisami;
- linki do social mediów;
- strony tematyczne dla kawalerskich, integracji, urodzin i grup;
- pomiar zdarzeń: rozpoczęcie rezerwacji, wybór terminu, przejście do płatności i zakup;
- baner cookies blokujący narzędzia marketingowe do chwili uzyskania zgody.

## 11. Proponowany harmonogram

Realny termin zależy od szybkości zatwierdzania treści, zasad rezerwacji i integracji płatności.

| Okres | Zakres |
|---|---|
| Tydzień 1 | wymagania, zasady biznesowe, treści i architektura |
| Tydzień 2 | makiety UX i prototyp rezerwacji |
| Tydzień 3 | projekt wizualny i przygotowanie zdjęć |
| Tydzień 4 | fundament techniczny, baza i strona publiczna |
| Tydzień 5 | konta użytkowników i silnik dostępności |
| Tydzień 6 | rezerwacje, koszyk, ceny i płatności |
| Tydzień 7 | panel administratora i powiadomienia |
| Tydzień 8 | testy, bezpieczeństwo, SEO i poprawki |
| Tydzień 9 | szkolenie, wdrożenie i kontrolowana premiera |
| Tydzień 10 | stabilizacja i poprawki po realnych rezerwacjach |

Jest to harmonogram dla sprawnie podejmowanych decyzji i dostępnych materiałów. Rozbudowany CMS, SMS, vouchery lub integracje zewnętrzne mogą wydłużyć realizację.

## 12. Kryteria gotowości do wydania

Strona jest gotowa do premiery dopiero wtedy, gdy:

- wszystkie ceny i zasady zostały zatwierdzone;
- kalendarz nie pozwala przekroczyć pojemności;
- rezerwacje gościnne i konta użytkowników działają;
- płatności oraz zwroty przeszły testy;
- klient i administrator otrzymują poprawne potwierdzenia;
- panel umożliwia ręczne dodawanie i zmianę rezerwacji;
- polityki prawne są opublikowane;
- zgody cookies działają prawidłowo;
- kopia zapasowa została wykonana i próbnie odtworzona;
- monitoring zgłasza błędy;
- strona działa na telefonie, jest dostępna i szybka;
- administrator przeszedł szkolenie;
- istnieje procedura obsługi awarii i możliwość wyłączenia płatności/rezerwacji bez wyłączania całej strony.

## 13. Lista najważniejszych pytań przed rozpoczęciem

1. Jaka jest minimalna i maksymalna liczba graczy?
2. Ile grup może grać jednocześnie i czy grupy mogą być łączone?
3. Ile kompletów sprzętu jest dostępnych?
4. Czy wszystkie cztery godziny są dostępne codziennie przez cały rok?
5. Jak obsługiwane są święta i dni zamknięte?
6. Jakie są dokładne pakiety, ceny, liczby kulek i dodatki?
7. Czy klient płaci zadatek czy całość, i w jakiej wysokości?
8. Jaki jest termin bezpłatnego anulowania lub zmiany?
9. Czy cena zależy od wieku, liczby osób lub rodzaju wydarzenia?
10. Czy rezerwacja wymaga minimalnego wyprzedzenia?
11. Czy firma chce obsługiwać vouchery i kody rabatowe od premiery?
12. Jakie dane mają znaleźć się na fakturze lub paragonie?
13. Który telefon i e-mail będą używane do kontaktu?
14. Czy zdjęcia wszystkich widocznych osób mogą być publikowane?
15. Kto będzie administratorem, a kto pracownikiem panelu?
16. Czy strona ma być od razu po polsku i angielsku?
17. Czy firma ma już domenę, hosting, firmowy e-mail i konto operatora płatności?

## 14. Rekomendowany pierwszy sprint

Pierwszy sprint powinien zakończyć się nie kodem produkcyjnym, lecz zatwierdzonym fundamentem projektu:

1. odpowiedzi na 17 pytań z poprzedniej sekcji;
2. uporządkowany, obowiązujący cennik;
3. spis pakietów i dodatków;
4. dokładna tabela pojemności slotów;
5. regulamin anulowania i płatności;
6. mapa strony i komplet tekstów;
7. selekcja zdjęć z prawami do publikacji;
8. klikalny prototyp rezerwacji na telefonie;
9. zaakceptowany zakres MVP i harmonogram.

Po zatwierdzeniu tych elementów można rozpocząć implementację bez ryzyka kosztownego przebudowywania systemu w połowie prac.
