# Paintball Strefa 29 — plan strony 1.0

## 1. Status i przeznaczenie dokumentu

| Pole | Wartość |
|---|---|
| Wersja produktu | 1.0 |
| Charakter strony | marketingowo-kontaktowy |
| Główna konwersja | wysłanie zapytania lub kontakt telefoniczny |
| Rezerwacja online | poza zakresem |
| Płatność online | poza zakresem |
| Dokument źródłowy | `PLAN_BUDOWY_STRONY_STREFA_29.md` |
| Dokument następnego etapu | `strona2_0.md` |
| Plan nadrzędny od 2026-11-06 | `docs/STREFA29_NOWA_ROADMAPA_I_PLAN_WERSJI_2026-11-06.md` |

Ten plik nadal opisuje tylko wersję 1.0. Nie zezwala na rezerwacje, płatności ani konta klientów. Ceny, telefon, e-mail i dane prawne pozostają niezatwierdzone w rejestrze decyzji; zdania o cenach orientacyjnych nie są zgodą na wpisanie stawek.

Wersja 1.0 ma profesjonalnie prezentować Paintball Strefa 29, odpowiadać na najważniejsze pytania klientów i ułatwiać kontakt z obsługą. Strona nie pokazuje dostępności na żywo, nie blokuje terminów i nie tworzy rezerwacji.

Formularz `/zapytaj-o-termin` służy wyłącznie do przesłania preferencji klienta. Termin staje się uzgodniony dopiero po osobnym potwierdzeniu przez obsługę.

## 2. Cele wersji 1.0

### 2.1. Cele biznesowe

- profesjonalna prezentacja pola, atrakcji, scenariuszy i infrastruktury;
- czytelne przedstawienie pakietów, cen i dodatków;
- zwiększenie liczby wartościowych zapytań telefonicznych i formularzowych;
- ograniczenie powtarzalnych pytań dzięki kompletnej ofercie i FAQ;
- poprawa widoczności w lokalnych wynikach wyszukiwania;
- stworzenie stabilnego fundamentu wizualnego i technicznego dla wersji 2.0.

### 2.2. Definicja sukcesu

Wersja 1.0 spełnia swój cel, gdy użytkownik może na telefonie:

1. zrozumieć, czym wyróżnia się pole;
2. sprawdzić ofertę oraz orientacyjne ceny;
3. znaleźć informacje organizacyjne i zasady bezpieczeństwa;
4. zadzwonić, wyznaczyć trasę albo wysłać zapytanie;
5. jednoznacznie rozpoznać, że wysłanie formularza nie oznacza potwierdzenia terminu.

### 2.3. Mierniki

| Miernik | Sposób pomiaru | Cel przed premierą |
|---|---|---|
| Wysłane zapytania | zdarzenie `inquiry_submit` po odpowiedzi serwera | skonfigurować pomiar i test QA |
| Kliknięcia telefonu | zdarzenie `contact_phone_click` | skonfigurować pomiar bez danych osobowych |
| Kliknięcia e-maila | zdarzenie `contact_email_click` | skonfigurować pomiar bez adresu klienta |
| Otwarcia trasy | zdarzenie `directions_click` | mierzyć źródłową podstronę |
| Wejścia na cennik | odsłona `/cennik` i `pricing_view` | mierzyć źródło ruchu |
| Skuteczność formularza | wysłania zakończone sukcesem i błędem | monitorować błędy techniczne |
| Czas odpowiedzi obsługi | procedura wewnętrzna poza analityką strony | ustalić przed publikacją komunikatu SLA |

Narzędzia analityczne nie mogą otrzymywać imienia, telefonu, e-maila, treści wiadomości ani wybranego terminu.

## 3. Zakres publiczny i mapa strony

| Adres | Cel | Główne CTA |
|---|---|---|
| `/` | przedstawienie obiektu i najważniejszych przewag | Zapytaj o wolny termin |
| `/oferta` | opis pola, atrakcji, scenariuszy i przebiegu wizyty | Zapytaj o termin |
| `/cennik` | pakiety, zawartość i orientacyjne koszty | Zapytaj o ten pakiet |
| `/galeria` | autentyczne zdjęcia pola i uczestników | Zobacz ofertę / Zapytaj o termin |
| `/dla-kogo` | znajomi, urodziny, imprezy, firmy, szkoły i grupy | Poproś o ofertę |
| `/faq` | odpowiedzi na pytania przed kontaktem | Nadal masz pytania? Napisz lub zadzwoń |
| `/kontakt` | telefon, e-mail, godziny kontaktu i dane firmy | Zadzwoń / Wyznacz trasę |
| `/dojazd` | mapa, opis trasy, parking i punkty orientacyjne | Wyznacz trasę |
| `/zapytaj-o-termin` | formularz niewiążącego zapytania | Wyślij zapytanie |
| `/regulamin` | regulamin pola i zasady ręcznego uzgadniania wizyty | Kontakt |
| `/polityka-prywatnosci` | obowiązki informacyjne i prawa użytkownika | — |
| `/cookies` | kategorie cookies i zmiana ustawień zgód | Zmień ustawienia |
| `404` | bezpieczny powrót do głównych treści | Wróć na stronę główną |

Adresy publiczne powinny pozostać stabilne w wersji 2.0. Rozbudowa rezerwacji nie może usuwać ani zastępować stron informacyjnych.

## 4. Zawartość kluczowych podstron

### 4.1. Strona główna

- autentyczne zdjęcie hero, nazwa obiektu i krótkie hasło wartości;
- CTA „Zapytaj o wolny termin” oraz „Zobacz ofertę”;
- najważniejsze informacje: lokalizacja, powierzchnia, typ atrakcji i godziny kontaktu;
- skrót oferty i wyróżniki pola, w tym scenariusz z rakietą V2;
- skrót pakietów z odnośnikiem do pełnego cennika;
- informacje „Dla kogo”;
- autentyczne opinie ze wskazanym źródłem;
- skrót dojazdu i kontaktu;
- końcowe wezwanie do wysłania zapytania.

Strona główna nie może używać komunikatów „wolne miejsca”, „termin dostępny”, „ostatnie miejsca” ani innych treści sugerujących bieżącą dostępność.

### 4.2. Oferta

- opis pola, infrastruktury, okopów, worków z piaskiem, ambon, bunkra i przeszkód;
- opis rakiety V2 jako bezpiecznego elementu scenariusza;
- przebieg typowej wizyty: przyjazd, odprawa, wyposażenie, gra i zakończenie;
- orientacyjny czas wizyty i wymagane wcześniejsze przybycie;
- zasady bezpieczeństwa, minimalny wiek i zgody opiekuna — po zatwierdzeniu;
- zalecany ubiór, zasady gry w różnych warunkach pogodowych i rzeczy do zabrania;
- informacje o parkingu, toaletach, zapleczu i dostępnych udogodnieniach;
- rozróżnienie oferty dla klientów indywidualnych, firm, szkół i grup zorganizowanych.

### 4.3. Cennik

- czytelne karty pakietów z nazwą, zakresem i liczbą kulek;
- lista dostępnych dodatków i ich ceny;
- jasna informacja, czy ceny są cenami brutto;
- informacja o minimalnej liczbie uczestników, jeśli zostanie ustalona;
- informacja, że cena i termin są potwierdzane przez obsługę;
- CTA „Zapytaj o ten pakiet”, które przekazuje identyfikator pakietu do formularza;
- data ostatniej aktualizacji cennika.

Jeżeli ostateczna cena zależy od liczby osób lub charakteru wydarzenia, strona przedstawia ją jako orientacyjną i wyjaśnia sposób uzyskania wiążącego potwierdzenia.

### 4.4. Galeria

- kategorie: hero, teren, okopy, bunkier, rakieta V2, zaplecze, drużyna i wydarzenia;
- fotografie zoptymalizowane do WebP/AVIF i różnych rozmiarów ekranu;
- opisowe teksty alternatywne dla zdjęć informacyjnych oraz pusty `alt` dla dekoracyjnych;
- brak metadanych lokalizacyjnych, jeżeli nie są potrzebne;
- publikacja wyłącznie materiałów z potwierdzonymi prawami i zgodami na wizerunek.

### 4.5. FAQ

FAQ powinno odpowiadać przynajmniej na pytania o:

- minimalny wiek i udział osób niepełnoletnich;
- minimalną i maksymalną liczbę graczy;
- czas gry i całej wizyty;
- zasady bezpieczeństwa oraz wymagany ubiór;
- pogodę i możliwość odwołania wydarzenia;
- zawartość pakietów i dodatkowe kulki;
- sposób uzgodnienia terminu i zapłaty zadatku poza stroną;
- zmianę lub anulowanie uzgodnionej wizyty;
- parking, dojazd, toalety, zaplecze oraz ofertę dla firm i szkół.

### 4.6. Kontakt i dojazd

- adres: Żurawia 29, 80-298 Czaple — do potwierdzenia przed publikacją;
- klikalny telefon i e-mail;
- rzeczywiste godziny obsługi kontaktu;
- opis dojazdu, w tym wskazówka dotycząca ul. Do Strzelnicy;
- przycisk „Wyznacz trasę” otwierający zewnętrzną nawigację;
- tekstowy opis trasy dostępny bez uruchamiania mapy;
- mapa ładowana dopiero po odpowiedniej zgodzie albo świadomej aktywacji.

## 5. Formularz „Zapytaj o termin”

### 5.1. Znaczenie formularza

Formularz tworzy wiadomość do obsługi. Nie wykonuje żadnej z poniższych czynności:

- nie sprawdza dostępności;
- nie blokuje terminu;
- nie wylicza wiążącej ceny;
- nie tworzy rezerwacji;
- nie pobiera zadatku ani pełnej płatności;
- nie tworzy konta klienta.

### 5.2. Pola

| Pole | Wymagane | Reguła |
|---|---|---|
| Liczba graczy | tak | dodatnia liczba całkowita w zatwierdzonym zakresie |
| Preferowana data | tak | data przyszła; nie oznacza dostępności |
| Preferowana pora | nie | wybór orientacyjny lub „dowolna” |
| Termin alternatywny | nie | data późniejsza lub równa bieżącej |
| Pakiet | tak | pakiet z cennika albo „nie wiem” |
| Rodzaj wydarzenia | tak | np. znajomi, urodziny, firma, szkoła, inne |
| Imię organizatora | tak | ograniczona długość, bez znaków sterujących |
| Preferowany kanał kontaktu | tak | telefon lub e-mail |
| Telefon | warunkowo | wymagany, gdy wybrano kontakt telefoniczny |
| E-mail | warunkowo | wymagany, gdy wybrano kontakt e-mailowy |
| Wiadomość | nie | limit długości; bez załączników w 1.0 |
| Zapoznanie z polityką prywatności | tak | odnotowanie wersji informacji w treści e-maila technicznego |

Zgoda marketingowa nie jest wymagana do wysłania zapytania. Jeżeli zostanie kiedyś dodana, musi być oddzielna, domyślnie odznaczona i niezależna od obsługi zapytania.

### 5.3. Przepływ

1. Użytkownik otwiera `/zapytaj-o-termin` albo przechodzi z wybranego pakietu.
2. Formularz może wstępnie uzupełnić pakiet lub rodzaj wydarzenia.
3. Walidacja w przeglądarce pomaga poprawić oczywiste błędy.
4. Serwer ponownie waliduje wszystkie dane, stosuje limit wysyłki i ochronę antyspamową.
5. Serwer wysyła ustrukturyzowany e-mail do zatwierdzonej skrzynki obsługi.
6. Jeżeli klient podał e-mail, może otrzymać automatyczne potwierdzenie otrzymania zapytania.
7. Strona pokazuje komunikat sukcesu bez obietnicy dostępności.
8. Obsługa sprawdza możliwość organizacji gry i kontaktuje się z klientem poza systemem strony.

### 5.4. Komunikaty

Komunikat sukcesu:

> Zapytanie zostało wysłane. Termin nie jest jeszcze zarezerwowany ani zablokowany. Obsługa skontaktuje się z Tobą, aby potwierdzić dostępność, cenę i dalsze kroki.

Jeżeli właściciel zatwierdzi czas odpowiedzi, komunikat może zawierać konkretne SLA. Do tego czasu nie należy obiecywać odpowiedzi „w ciągu godziny” ani podobnego terminu.

W przypadku błędu:

- wpisane dane pozostają w formularzu;
- komunikat wskazuje problem i możliwość ponowienia;
- użytkownik otrzymuje alternatywny numer telefonu i e-mail;
- strona nie wyświetla sukcesu, jeżeli serwer nie przyjął wiadomości.

### 5.5. Dostarczanie i retencja

- formularz korzysta z funkcji serwerowej lub trasy API i transakcyjnego dostawcy e-mail;
- zgłoszenie jest zapisywane w PostgreSQL; okres retencji nie jest zatwierdzony i automatyczne usuwanie pozostaje wyłączone;
- treść formularza nie trafia do analityki ani standardowych logów aplikacji;
- retencja wiadomości wynika z polityki firmowej skrzynki pocztowej;
- nieudane wysłanie jest rejestrowane bez danych osobowych i widoczne w monitoringu;
- po stronie serwera stosowany jest honeypot, limit żądań i opcjonalne dodatkowe zabezpieczenie przy wykryciu nadużyć.

## 6. UX, identyfikacja i dostępność

### 6.1. Kierunek wizualny

- taktyczny i terenowy charakter bez przeładowania militarnymi motywami;
- głęboka zieleń, grafit, piaskowy beż i wyrazisty kolor akcentu;
- duże autentyczne zdjęcia oraz czytelna typografia;
- spójne karty pakietów, przyciski, formularze, alerty i stany błędów;
- animacje krótkie, lekkie i respektujące `prefers-reduced-motion`;
- efekt paintballowy traktowany jako opcjonalne ulepszenie po wykonaniu funkcji podstawowych.

### 6.2. Hierarchia CTA

1. „Zapytaj o wolny termin” — główne CTA sprzedażowe.
2. „Zadzwoń” — stałe CTA mobilne wyświetlane w godzinach kontaktu lub z jasną informacją o godzinach.
3. „Zobacz cennik”, „Zobacz ofertę” i „Wyznacz trasę” — CTA pomocnicze.

Nie wolno stosować przycisku „Zarezerwuj”, dopóki strona nie tworzy prawdziwej rezerwacji.

### 6.3. Wymagania dostępności

- celem odbioru jest WCAG 2.2 na poziomie AA;
- pełna obsługa klawiaturą i wyraźny fokus;
- logiczna hierarchia nagłówków, landmarki oraz odnośnik pomijający nawigację;
- statusy i komunikaty nie mogą opierać się wyłącznie na kolorze;
- błędy formularza są powiązane z polami i ogłaszane technologiom asystującym;
- etykiety nie znikają po rozpoczęciu wpisywania;
- odpowiednie `autocomplete`, `inputmode` i typy pól;
- cele dotykowe oraz odstępy dostosowane do obsługi jedną ręką;
- poprawny reflow i powiększenie bez utraty funkcji;
- CAPTCHA, jeżeli będzie potrzebna, musi mieć dostępną alternatywę.

## 7. Treści i materiały wejściowe

Przed publikacją muszą zostać zatwierdzone:

- logo, nazwa prawna firmy i dane kontaktowe;
- domena, profile społecznościowe oraz docelowa skrzynka formularza;
- opis obiektu, infrastruktury i scenariuszy;
- aktualny cennik, zawartość pakietów i dodatki;
- minimalny wiek, wymagania wobec opiekunów i zasady bezpieczeństwa;
- długość wizyty, godzina przyjazdu, zasady pogodowe i anulowanie;
- informacje o parkingu, toaletach, przebieralni, ognisku i cateringu;
- FAQ oparte na rzeczywistych pytaniach klientów;
- regulamin, polityka prywatności i polityka cookies;
- zdjęcia z prawami do publikacji i zgodami osób widocznych;
- opinie wraz ze źródłem i zgodą na publikację.

Każdy materiał powinien mieć właściciela biznesowego oraz datę ostatniego zatwierdzenia.

## 8. SEO i analityka

### 8.1. SEO

- unikalne tytuły, opisy i nagłówki dla każdej podstrony;
- adresy URL zapisane małymi literami i bez zbędnych parametrów;
- canonicale, `sitemap.xml`, `robots.txt` i prawidłowa strona 404;
- metadane Open Graph;
- dane strukturalne lokalnej działalności z potwierdzonym adresem, telefonem i godzinami;
- spójne dane nazwy, adresu i telefonu na stronie oraz w profilach zewnętrznych;
- treści odpowiadające intencjom „paintball Gdańsk”, „paintball Trójmiasto” i „paintball Czaple” bez sztucznego powtarzania fraz;
- opis dojazdu z Gdańska i Trójmiasta;
- indeksowalne cenniki i treści w HTML, nie wyłącznie na obrazach;
- optymalizacja obrazów, nazw plików i tekstów alternatywnych.

Odległość, czas dojazdu, godziny otwarcia i dostępność usług muszą zostać zweryfikowane przed publikacją.

### 8.2. Analityka

Plan zdarzeń obejmuje:

- `inquiry_start`, `inquiry_submit`, `inquiry_error`;
- `contact_phone_click`, `contact_email_click`, `directions_click`;
- `pricing_view`, `package_inquiry_click`, `gallery_view`;
- źródło strony i kampanii bez przesyłania danych osobowych.

Analityka wymagająca zgody uruchamia się dopiero po jej uzyskaniu. Użytkownik może równie łatwo odrzucić zgodę, jak ją zaakceptować, oraz później zmienić wybór.

## 9. Fundament techniczny

### 9.1. Stos

- Next.js i TypeScript;
- Tailwind CSS oraz mały, własny system komponentów;
- treści i konfiguracja w typowanych, strukturalnych modułach lub plikach treści;
- optymalizacja obrazów zapewniana przez aplikację i magazyn plików;
- funkcja serwerowa do walidacji i wysyłki formularza;
- zarządzany hosting z oddzielnym środowiskiem testowym i produkcyjnym.

Konkretną wspieraną wersję zależności należy przypiąć przy inicjalizacji projektu i aktualizować kontrolowanie.

### 9.2. Granice architektury

- komponenty oferty, pakietów, FAQ i CTA nie zawierają danych wpisanych bezpośrednio w kod widoku;
- pakiety i dodatki mają stabilne identyfikatory, które będzie można wykorzystać w wersji 2.0;
- logika formularza kontaktowego jest oddzielona od warstwy prezentacji;
- design tokens i komponenty formularzy są gotowe do ponownego użycia;
- publiczne adresy marketingowe pozostają niezależne od przyszłego modułu `/rezerwacja`;
- wersja 1.0 nie tworzy pustych tabel ani pozornych abstrakcji rezerwacji i płatności.

### 9.3. Środowiska i wdrożenie

- automatyczne sprawdzanie typów, linting, testy i build dla każdej zmiany;
- podgląd zmian przed wdrożeniem produkcyjnym;
- oddzielne sekrety dla środowiska testowego i produkcyjnego;
- wdrożenie możliwe do cofnięcia do poprzedniej działającej wersji;
- monitoring dostępności, błędów formularza i błędów aplikacji;
- domena, HTTPS, firmowy e-mail oraz poprawna konfiguracja SPF, DKIM i DMARC.

## 10. Bezpieczeństwo, prywatność i niezawodność

- walidacja i normalizacja formularza po stronie serwera;
- ograniczenie rozmiaru żądania, liczby prób oraz długości wszystkich pól;
- ochrona CSRF odpowiednia do wybranego mechanizmu formularza;
- bezpieczne nagłówki, w tym CSP, HSTS i ograniczenie osadzania strony;
- sekrety dostawcy e-mail wyłącznie po stronie serwera;
- redakcja danych osobowych z logów i raportów błędów;
- zależności skanowane i regularnie aktualizowane;
- polityka retencji zapytań w skrzynce pocztowej;
- lista dostawców danych oraz wymagane umowy powierzenia;
- procedura na wypadek awarii formularza: widoczny telefon i e-mail;
- strona informacyjna działa nawet podczas awarii dostawcy e-mail lub analityki.

Dokumenty prawne zatwierdza właściciel z prawnikiem lub specjalistą ds. zgodności przed publikacją.

## 11. Etapy realizacji

### Etap 0 — decyzje i materiały

**Zakres:** zamknięcie danych firmy, cennika, treści, zasad bezpieczeństwa, dokumentów prawnych i praw do zdjęć.

**Rezultat:** podpisany komplet materiałów oraz rejestr decyzji bez blockerów publikacji.

**Warunek przejścia:** wszystkie dane wyświetlane klientowi mają wskazanego właściciela i status zatwierdzenia.

### Etap 1 — architektura informacji i treści

**Zakres:** mapa strony, szkielety podstron, mapa fraz lokalnych, ścieżki kontaktu i komplet FAQ.

**Rezultat:** zatwierdzona struktura i teksty robocze.

**Warunek przejścia:** użytkownik może dotrzeć do cennika, kontaktu i formularza w maksymalnie dwóch działaniach z kluczowych stron.

### Etap 2 — UX i UI

**Zakres:** makiety mobile-first, projekt wizualny, komponenty, formularz oraz wszystkie stany sukcesu i błędu.

**Rezultat:** klikalny prototyp i biblioteka komponentów.

**Warunek przejścia:** testowy użytkownik rozumie różnicę między zapytaniem a potwierdzonym terminem bez dodatkowej instrukcji.

### Etap 3 — fundament i implementacja

**Zakres:** konfiguracja aplikacji, routing, komponenty, podstrony, formularz e-mail, analityka, SEO i monitoring.

**Rezultat:** kompletna wersja na środowisku testowym.

**Warunek przejścia:** build, testy i kontrola typów przechodzą automatycznie.

### Etap 4 — treści i materiały

**Zakres:** finalne teksty, zdjęcia, cennik, FAQ, dane firmy i dokumenty prawne.

**Rezultat:** wersja kandydująca do publikacji.

**Warunek przejścia:** właściciel potwierdza prawdziwość cen, danych i zasad.

### Etap 5 — testy i odbiór

**Zakres:** testy funkcjonalne, mobilne, dostępności, prywatności, SEO, wydajności i dostarczania e-maili.

**Rezultat:** raport testów i podpisana lista odbiorowa.

**Warunek przejścia:** brak błędów krytycznych i wysokich oraz sprawna ścieżka awaryjnego kontaktu.

### Etap 6 — wdrożenie i stabilizacja

**Zakres:** domena, produkcja, finalny test formularza, monitoring i obserwacja pierwszych zapytań.

**Rezultat:** stabilna publiczna strona 1.0.

**Warunek zakończenia:** formularz, telefon, e-mail i trasa działają produkcyjnie, a obsługa zna procedurę odpowiedzi.

## 12. Strategia testów

### 12.1. Funkcjonalne

- wszystkie adresy i CTA prowadzą do właściwych miejsc;
- wybór pakietu przekazuje właściwy kontekst do formularza;
- co najmniej jeden kanał kontaktu jest wymagany;
- walidacja działa po stronie klienta i serwera;
- poprawna wiadomość dociera do skrzynki obsługi;
- potwierdzenie klienta jest wysyłane tylko po rzeczywistym przyjęciu formularza;
- błąd dostawcy e-mail nie jest prezentowany jako sukces;
- ponowienie nie powoduje niekontrolowanej serii wiadomości;
- dane pozostają w formularzu po błędzie możliwym do naprawienia.

### 12.2. UX i dostępność

- pełna obsługa klawiaturą i czytnikiem ekranu;
- widoczny fokus, poprawny kontrast, reflow i skalowanie tekstu;
- poprawne etykiety, autouzupełnianie i komunikaty błędów;
- sticky CTA nie zasłania treści ani klawiatury ekranowej;
- testy na reprezentatywnych telefonach, tabletach i desktopach;
- status zapytania nie jest komunikowany wyłącznie kolorem.

### 12.3. SEO, wydajność i prywatność

- poprawne metadane, canonicale, mapa strony i dane strukturalne;
- brak indeksowania stron technicznych i podglądów;
- obrazy mają właściwe rozmiary i nie pogarszają głównej treści;
- skrypty opcjonalne nie uruchamiają się przed wymaganą zgodą;
- analityka nie otrzymuje danych formularza;
- test limitów wysyłki i podstawowych prób automatycznego spamu;
- formularz pozostaje użyteczny przy wolnym połączeniu i błędzie sieci.

## 13. Kryteria gotowości do wydania

Strona 1.0 jest gotowa, gdy:

- zakres oferty, ceny, dane firmy i godziny kontaktu są zatwierdzone;
- wszystkie fotografie mają potwierdzone prawa i przygotowane warianty responsywne;
- formularz działa produkcyjnie, a odbiorca wiadomości został przeszkolony;
- komunikat sukcesu mówi, że termin nie jest jeszcze zarezerwowany ani zablokowany;
- nigdzie nie jest prezentowana bieżąca dostępność ani pozorna rezerwacja;
- telefon, e-mail, mapa i wyznaczanie trasy działają na urządzeniach mobilnych;
- opublikowano wymagane dokumenty prawne;
- mechanizm zgód działa prawidłowo;
- monitoring zgłasza błędy aplikacji i formularza;
- istnieje procedura kontaktu podczas awarii formularza;
- testy funkcjonalne, dostępności, prywatności, SEO i wydajności zostały odebrane;
- wdrożenie można cofnąć bez utraty treści.

## 14. Funkcje poza zakresem wersji 1.0

- kalendarz dostępności i informacje o wolnych miejscach;
- blokowanie terminu lub pojemności;
- tworzenie i zarządzanie rezerwacją na stronie;
- koszyk, kalkulator wiążącej ceny i płatności online;
- zadatki, zwroty i rozliczenia obsługiwane przez stronę;
- konta klientów, logowanie i historia wizyt;
- panel administracyjny rezerwacji;
- automatyczne przypomnienia o wizycie;
- powiadomienia SMS;
- synchronizacja z zewnętrznym kalendarzem;
- vouchery, kupony i program lojalnościowy;
- pełny CMS oraz rozbudowane role pracowników;
- raporty sprzedaży i obłożenia.

Funkcje te są opisane jako późniejsza rozbudowa w `strona2_0.md` albo pozostają poza zakresem obu pierwszych wydań.

## 15. Rejestr decyzji

Statusy: `ZATWIERDZONE`, `OTWARTE`, `ZABLOKOWANE`.

| ID | Decyzja | Właściciel | Termin graniczny | Status | Ustalony wariant lub wymagany rezultat |
|---|---|---|---|---|---|
| V1-01 | Charakter wersji 1.0 | właściciel produktu | zakończone | ZATWIERDZONE | strona marketingowo-kontaktowa bez rezerwacji online |
| V1-02 | Główna ścieżka kontaktu | właściciel produktu | zakończone | ZATWIERDZONE | formularz „Zapytaj o termin” oraz telefon |
| V1-03 | Sposób obsługi formularza | właściciel produktu i wykonawca | zakończone | ZATWIERDZONE | wysyłka e-mail bez bazy danych |
| V1-04 | Fundament techniczny | wykonawca | zakończone | ZATWIERDZONE | Next.js, TypeScript i Tailwind CSS, przygotowane pod rozbudowę |
| V1-05 | Dane firmy, domena i skrzynka odbiorcza | właściciel firmy | przed Etapem 1 | OTWARTE | komplet zweryfikowanych danych i dostępów |
| V1-06 | Ostateczny cennik i pakiety | właściciel firmy | przed Etapem 1 | OTWARTE | zatwierdzona tabela cen, zawartości i dodatków |
| V1-07 | Minimalny wiek i zasady dla niepełnoletnich | właściciel firmy | przed Etapem 1 | OTWARTE | zasady do oferty, FAQ i regulaminu |
| V1-08 | Pogoda, anulowanie i zmiana uzgodnionej wizyty | właściciel firmy | przed Etapem 1 | OTWARTE | jednoznaczne reguły komunikowane klientowi |
| V1-09 | Godziny kontaktu i oczekiwany czas odpowiedzi | właściciel firmy | przed projektem komunikatów | OTWARTE | realne godziny i zatwierdzone SLA albo brak obietnicy SLA |
| V1-10 | Materiały fotograficzne i zgody | właściciel treści | przed Etapem 4 | OTWARTE | wybrane zdjęcia, prawa i zgody na wizerunek |
| V1-11 | Dokumenty prawne i retencja e-maili | właściciel firmy i doradca prawny | przed Etapem 4 | OTWARTE | zatwierdzone dokumenty i okres retencji |
| V1-12 | Narzędzia analityczne, mapa i mechanizm zgód | właściciel produktu i wykonawca | przed Etapem 3 | OTWARTE | wybrani dostawcy i macierz zgód |
| V1-13 | Hosting, monitoring i dostawca e-mail | wykonawca i właściciel firmy | przed Etapem 3 | OTWARTE | konta firmowe, region, koszty i odpowiedzialność |
| V1-14 | Osoba odbierająca wydanie | właściciel firmy | przed Etapem 5 | OTWARTE | imienna osoba zatwierdzająca treść i działanie strony |

## 16. Następny etap

Po stabilizacji wersji 1.0 kolejność prac wyznacza plan nadrzędny: najpierw dokończenie 1.5A, potem 1.5B, a dopiero później rezerwacje z `strona2_0.md`. Wersja 2.0 wykorzysta publiczne podstrony, komponenty, design system, pakiety oraz identyfikatory treści z wersji 1.0, ale doda osobny, transakcyjny system rezerwacji.

Do czasu produkcyjnego uruchomienia wersji 2.0 `/zapytaj-o-termin` pozostaje jedyną internetową ścieżką zgłoszenia preferowanego terminu.
