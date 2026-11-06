> Historia. Bieżący plan: `docs/STREFA29_MASTER_PLAN.md`.

# Paintball Strefa 29 — nowa roadmapa produktu i szczegółowy plan wersji

**Wersja dokumentu:** 1.0 (plan produktowy, 6 listopada 2026)  
**Repozytorium:** `MagicMikky/strefa-57`  
**Projekt lokalny:** `D:\Projects\paintball website`  
**Status:** plan nadrzędny produktu od 6 listopada 2026. Kolejność wersji oraz wartości startowe U-01–U-10 są kierunkiem dalszych prac. Sprawy OTWARTE i polityka pogodowa U-11 nie są zatwierdzone. Dokument nie uruchamia implementacji żadnej wersji.  
**Punkt odniesienia:** `strona1_0.md`, `strona2_0.md`, `PLAN_BUDOWY_STRONY_STREFA_29.md`, `docs/STAFF_PANEL_ARCHITECTURE.md`, `docs/STREFA29_LEAGUE_ROADMAP.md`, `docs/STREFA29_REJESTR_DECYZJI_DO_USTALENIA.md`, `docs/open-decisions.md` oraz decyzje właściciela z 2026-11-06.  
**Stan gałęzi tego dnia:** PR #11 (`release/v1-readiness` → `main`) jest otwarty. PR #13 (`feature/staff-panel` → `release/v1-readiness`) zawiera rozpoczęte 1.5A i nie wolno go przepisywać. PR #14 (`feature/gallery-coverflow` → `feature/staff-panel`) jest osobną pracą galerii i nie wchodzi w ten dokument.

> **Ważne:** To NOWA roadmapa, która świadomie rozszerza dotychczasowy `strona2_0.md`. W pierwotnym dokumencie v2.0 konta klientów pozostają poza zakresem, a rezerwacje są gościnne. Poniżej zachowano tę kolejność: v2.0 = rezerwacje gościnne, v2.1 = konta klientów. Zmiany należy uzgodnić i zsynchronizować z dokumentacją repozytorium, bez bezrefleksyjnego nadpisywania wcześniejszych planów.

---

## 1. Decyzje potwierdzone przez właściciela i zasady nadrzędne

### 1.1. Wartości startowe — NIE wpisywać na stałe do logiki

| Ustawienie w panelu | Wartość startowa | Jednostka i znaczenie | Edytowalne przez właściciela |
|---|---:|---|---|
| `maxPlayersPerTeam` | **8** | Maksymalnie 8 zawodników w drużynie | TAK |
| `minTeamsPerMatch` | **2** | Docelowe minimum drużyn do rozegrania meczu | TAK |
| `maxTeamsPerMatch` | **4** | Maksymalnie 4 drużyny w meczu/slocie | TAK |
| `maxPlayersPerSlot` | **32** | Łączna liczba miejsc w pojedynczym slocie | TAK |
| `slotDurationMinutes` | **120** | 2 godziny czasu gry | TAK |
| `slotBufferMinutes` | **60** | Godzina pomiędzy zakończeniem gry a startem następnej | TAK |
| `slotStartTimes` | **08:00, 11:00, 14:00** | Domyślny lokalny harmonogram dzienny | TAK |
| `dailyNominalCapacity` | **96** | Pochodna: 3 sloty × 32; **nie** przechowywać jako sztywna stała | Wyliczane |
| `dailyHalfCapacity` | **48** | Pochodna: 96 / 2 | Wyliczane |
| `allowSharedSlot` | **true** | Kilka niezależnych drużyn może współdzielić termin | TAK |
| `allowPrivateSlot` | **true** | Rezerwacja na wyłączność zajmuje cały slot | TAK |
| `privateSlotSurcharge` | **nieustalone** | Cena/opłata dodatkowa | TAK, po zatwierdzeniu |
| `depositAmount` | **nieustalone** | Kwota zadatku | TAK, po zatwierdzeniu |
| `paymentProvider` | **nieustalone** | Dostawca płatności; tylko wspierane, skonfigurowane adaptery | Wybór spośród dostępnych |
| `weatherCancellationPolicy` | **do oceny prawnej** | Preferencja właściciela: co do zasady brak zwrotu przy złej pogodzie | TAK, po zatwierdzeniu |

**Harmonogram w domyślnym dniu:** 08:00–10:00 (przerwa 10:00–11:00); 11:00–13:00 (przerwa 13:00–14:00); 14:00–16:00 (koniec ostatniej gry). Doba ma 3 sloty po maksymalnie 32 miejsca, czyli nominalnie 96 miejsc.

**Reguła łączenia drużyn:** dopuszcza się od 2 do 4 drużyn do wspólnego meczu, nie przekraczając *jednocześnie* limitu 8 osób na drużynę, 4 drużyn i 32 osób na slot. Przykładowo dwie niezależne drużyny po 8 graczy mogą zarezerwować ten sam slot: zajęte 16/32; pozostają 2 miejsca na drużyny (maksymalnie 2 kolejne drużyny) i 16 miejsc dla graczy. Liczba miejsc sama w sobie nie gwarantuje dostępności: limit drużyn również ma zastosowanie.

**Rezerwacja prywatna:** zajmuje *całą* dostępność slotu dla innych klientów — nawet jeżeli grupa rezerwująca ma mniej niż 32 osoby. Dla rozliczeń pojemności zajęte jest 32/32 miejsc. Prywatną rezerwację można utworzyć wyłącznie, gdy dany slot nie jest już przydzielony innym klientom, chyba że administrator wykona jawny, audytowany proces przeniesienia/anulowania z zachowaniem zasad umownych. Nie wolno wypierać innych grup automatycznie.

### 1.2. Filozofia systemu — „owner-first, database-driven”

1. **Wszystkie dane firmy i reguły biznesowe** właściciel edytuje z panelu, bez modyfikowania plików `.tsx`, `.ts`, `.env` czy migracji.
2. Jedno źródło prawdy: **PostgreSQL**, z typowanym API, walidacją, historią zmian, podglądem i bezpiecznym publikowaniem treści.
3. Wartości startowe powyżej są **seedem inicjalizacyjnym tylko dla pustej bazy**; kolejne wdrożenia **nigdy nie nadpisują** ustawień właściciela.
4. Ustawienia zmieniające dostępność, cenę lub politykę mają **datę obowiązywania oraz historię wersji**; już utworzone rezerwacje zachowują migawkę właściwych zasad i cen.
5. Właściciel może zamykać dni i pojedyncze sloty, zmieniać harmonogram na konkretne daty i dodawać wyjątki bez edycji kodu.
6. Sekrety (hasła, `DATABASE_URL`, klucze Resend, klucze operatora płatności) **nie są zwykłymi polami CMS**. Panel pokazuje status integracji; bezpieczna konfiguracja sekretów należy do oddzielnego mechanizmu administracji/secret managera.
7. Brak publicznej rejestracji pracowników. Docelowa rejestracja klientów jest odrębnym etapem i nie daje dostępu do panelu personelu.
8. Strona marketingowa działa również w razie awarii modułu rezerwacji; włącznik awaryjny kieruje wtedy do formularza zapytania.
9. Bez realnych cen, zatwierdzonych zasad i operatora płatności **nie wolno włączać checkoutu na produkcji** ani udawać potwierdzenia rezerwacji.
10. Plan nie stanowi automatycznego zatwierdzenia tekstów prawnych ani polityki pogodowej. Wymagana jest weryfikacja prawa, regulaminu i wyjątków bezpieczeństwa.

---

## 2. Roadmapa wydań — mapa zależności

| Wersja | Nazwa | Podstawowa korzyść | Warunek wejścia | Kryterium zakończenia |
|---|---|---|---|---|
| **1.0** | Strona publiczna | Profesjonalna oferta, galeria, kontakt, zapytania | Finalizacja istniejących PR i materiałów | Publiczne dane zweryfikowane; formularz i monitoring działają; testy zielone |
| **1.5A** | Konta pracownicze i skrzynka zgłoszeń | Logowanie, baza zgłoszeń, przypisania, notatki | Uporządkowana gałąź 1.0 | Panel zabezpieczony, zgłoszenia nie giną po awarii poczty |
| **1.5B** | **Panel właściciela + CMS + konfiguracja operacyjna** | Właściciel edytuje dane, strony, galerię, harmonogram i limity | 1.5A + baza + role | Wszystkie wskazane dane biznesowe edytowalne, wersjonowane i publikowane bez deployu |
| **2.0** | Kalendarz, rezerwacje gościnne i zadatki | Rezerwacja online, współdzielone/prywatne sloty, płatności i panel kalendarza | 1.5B + zatwierdzone ceny/reguły/dostawcy | Brak overbookingu, prawdziwa płatność testowa, bezpieczne zwroty i obsługa ręczna |
| **2.1** | Konta klientów | Profil, historia rezerwacji, dane użytkownika | Stabilna 2.0 | Klient bezpiecznie widzi wyłącznie swoje dane, rezerwacje gościnne nadal działają |
| **2.2** | Drużyny i składy | Kapitanowie, członkostwa, zaproszenia | 2.1 | Nie można przekroczyć limitu drużyny ani zarządzać cudzą drużyną |
| **2.3** | Mecze i rankingi | Wyniki sędziowane, statystyki, klasyfikacje | 2.2 + zatwierdzony regulamin punktacji | Ranking da się odtworzyć wyłącznie z zatwierdzonych wyników |
| **3.0** | STREFA 29 LEAGUE | Sezony, turnieje, finały i nagrody roczne | 2.3 + zasady turniejów i nagród | Pełny turniej, wyniki i nagrody z udokumentowanym zatwierdzeniem |

**Uwaga wdrożeniowa na 6.11.2026:** PR #11 (`release/v1-readiness`) nadal jest otwarty. PR #13 (`feature/staff-panel`) jest otwarty **na bazie `release/v1-readiness`**, a nie `main`; już zawiera fundament v1.5A (Better Auth, Prisma, PostgreSQL, skrzynkę zgłoszeń). W panelu `/panel/ustawienia` z PR #13 widać obecnie zmianę hasła i informację o retencji; **nie ma pełnego CMS i edytorów biznesowych**. Nową v1.5B należy budować na aktualnym stanie tych prac, nie równolegle przepisywać autoryzację. Sprawdzić CI i zależności PR przed mergem; nie scalać automatycznie.

---

## 3. Kalendarz rezerwacji — szczegółowa specyfikacja UX i reguły

### 3.1. Wygląd: kalendarz jak po kliknięciu zegara w Windows

- Kompaktowy **widok miesiąca** (7 kolumn, poniedziałek–niedziela), nazwa miesiąca/roku, strzałki poprzedni/następny, przycisk „Dziś”, wyróżnienie bieżącego i wybranego dnia.
- Preferowany ekran: u góry liczba graczy / liczba drużyn / pakiet / zwykła czy prywatna, poniżej kalendarz. Dni liczone dla wybranej konfiguracji, nie dla abstrakcyjnego „jednego gracza”.
- Komórki dat mają wysokokontrastowe tło, czytelną liczbę dnia, legendę kolorów i **tekst/ikonę statusu**, nie sam kolor.
- Dni przeszłe, poza sezonem albo z całkowicie zamkniętymi slotami są nieaktywne albo oznaczone jako niedostępne; można je otworzyć tylko w panelu administracyjnym zgodnie z uprawnieniami.
- Po kliknięciu w dzień otwiera się dostępny dla klawiatury **dialog / panel szczegółów** ze slotami tego dnia, liczbą wolnych miejsc oraz przyciskami wyboru. Na mobile dialog zajmuje wygodną część ekranu i przewija się wewnętrznie.
- Użytkownik może zmieniać miesiące, wrócić do daty dzisiejszej, wybrać wcześniejszy filtr i dostać propozycję najbliższych alternatyw, gdy brak dostępności.
- Status każdego dnia i slotu ma `aria-label`, np. „15 maja, częściowo zajęty, 50 z 96 miejsc dostępnych”; `focus-visible`, Escape, logiczny fokus oraz obsługę czytnika ekranu.

### 3.2. Kolorystyka i progi

Dla **domyślnej konfiguracji 3 × 32 = 96** miejsc:

| Kolor | Warunek biznesowy | Wzór/wyświetlanie |
|---|---|---|
| **Ciemnozielony** (`#185338`, orientacyjnie) | Zajęte **0–47** miejsc; istnieje możliwość rezerwacji | Stan dostępny, mniej niż połowa pojemności zajęta |
| **Ciemnoniebieski** (`#163B6D`, orientacyjnie) | Zajęte **48–95** miejsc; istnieje przynajmniej jedna możliwość rezerwacji | Stan ograniczony; połowa lub więcej zajęta |
| **Ciemnoczerwony** (`#7A1E24`, orientacyjnie) | Dzień **całkowicie niedostępny**: zamknięty administracyjnie, poza harmonogramem, wszystkie sloty pełne/prywatne lub brak miejsca dla wybranej konfiguracji | Nie ma możliwej rezerwacji |

Zajętość uwzględnia potwierdzone rezerwacje i niewygasłe blokady pojemności; rezerwacja prywatna zużywa 100% pojemności swojego slotu. Zamknięcie administracyjne wyłącza slot niezależnie od liczby fizycznie obecnych graczy. W przypadku wyjątków kalendarza lub innej liczby slotów progi zielony/niebieski są wyliczane względem faktycznej dziennej pojemności, bez stałej „48” wpisanej w komponent.

**Wymagające doprecyzowania:** przy częściowym zamknięciu dnia (np. 1/3 slotów zablokowanych przez właściciela) czy procent wypełnienia ma odnosić się do nominalnego 96, czy do sumy czynnych slotów. Rekomendacja: **do pojemności czynnych slotów**, a pod kalendarzem osobno pokazać zablokowane sloty; nie nazywać miejsc zablokowanych administracyjnie „zarezerwowanymi”. Wartość ta pozostaje decyzją otwartą (D-19).

**Bardzo ważny przypadek:** limit drużyn może wyczerpać dostępność *przed* limitem 32 graczy. Przykład: 4 drużyny po 4 osoby = 16/32 graczy, ale 4/4 drużyn — nie można już dodać piątej drużyny. Taki slot ma 0 miejsc *rezerwacyjnie dostępnych dla następnej drużyny*, mimo wolnych fizycznie 16 miejsc. Algorytm i UI muszą oddzielać `freePhysicalSeats` od `bookableSeats`.

### 3.3. Modal po kliknięciu w datę

Przykładowy widok bez danych rezerwacji (liczby w drugim polu dynamiczne):

```text
+-----------------------------------------------------+
|  SOBOTA, 15 MAJA 2027                         [ X ]  |
|  Dostępność slotów                                 |
|                                                     |
|  08:00–10:00  [wolnych: 32 / 32] [Wybierz]           |
|  11:00–13:00  [wolnych: 16 / 32] [Wybierz]           |
|  14:00–16:00  [SLOT PRYWATNY]    [Niedostępny]       |
|                                                     |
|  Tryb: (•) Gra wspólna  ( ) Prywatny slot            |
|  [Wybierz inny dzień]                               |
+-----------------------------------------------------+
```

Dla każdego slotu aplikacja wyświetla: początek/koniec, status (wolny/częściowo zajęty/pełny/prywatny/zablokowany), pozostałe miejsca i możliwość dodania wybranej liczby drużyn. Nie ujawnia nazwisk ani danych kontaktowych innych rezerwujących. Właściciel widzi pełniejsze dane w swoim panelu.

### 3.4. Parametry i algorytm dostępności

**Stan slotu:** `maxPlayers`, `maxTeams`, `confirmedPlayers`, `activeHoldPlayers`, `confirmedTeams`, `activeHoldTeams`, `closed`, `privateReservationActive`, `resourceAvailability` (sprzęt, personel), wyjątki daty.

Dla gry wspólnej wolne miejsca są ograniczone przez **wszystkie** warunki: wolni gracze, limit liczby drużyn, każdy skład <= `maxPlayersPerTeam`, dostępne zestawy sprzętu i minimalna obsada. Pełne prywatne zajęcie slotu wyłącza inne rezerwacje. Suma liczby uczestników i drużyn z zatwierdzonych rezerwacji oraz aktywnych blokad nigdy nie przekracza limitów.

**Zespół vs mecz:** `maxPlayersPerTeam=8`, ale `maxPlayersPerSlot=32`. Jedna rezerwacja może odpowiadać jednej drużynie; obsługę jednej rezerwacji zawierającej wiele drużyn należy zatwierdzić (D-20). Dopóki to nie nastąpi, formularz online przyjmuje 1 drużynę (<=8), a większą zorganizowaną grupę kieruje do zapytania/obsługi.

**Minimum 2 drużyn do meczu** nie musi oznaczać zakazu złożenia pierwszej rezerwacji; proponowany stan „oczekiwanie na zebranie grup” i procedurę informowania/przenoszenia trzeba zatwierdzić przed sprzedażą. Klient nie może otrzymać fałszywej obietnicy gotowego meczu (D-21).

**Przed rezerwacją:** system może wyświetlać buforowaną dostępność; przy kliknięciu `Wybierz` serwer MUSI ponownie policzyć dostępność w transakcji PostgreSQL i atomowo utworzyć ograniczoną czasowo blokadę. To chroni przed dwoma klientami wybierającymi te same ostatnie miejsca.

**Zmiana ustawień przez właściciela:** nowe godziny, długość, bufory, limity i zamknięcia przechodzą walidację konfliktów. Nie wolno automatycznie skasować ani przepisać istniejących rezerwacji. Panel pokazuje dotknięte rezerwacje, pozwala zaplanować zmianę od daty, wymaga potwierdzenia dla ryzykownych działań oraz tworzy wpis audytu.

### 3.5. Rezerwacja prywatna — osobny typ produktu

- Widoczna w wyborze slotu opcja „Zarezerwuj na wyłączność” z ceną **dopiero po zatwierdzeniu dopłaty**.
- Slot prywatny można zarezerwować wyłącznie, jeśli jeszcze nie istnieją w nim cudze rezerwacje lub blokady.
- Pojemność dla innych klientów = 0, niezależnie od faktycznej liczby graczy prywatnej grupy.
- Możliwość zaproszenia własnych drużyn do prywatnego meczu jest przyszłą funkcją; nie stanowi publicznego konta ani ligi w v2.0.
- Zasady zadatku, rozliczenia przy mniejszej frekwencji i dopłaty do wyłączności pozostają otwarte (D-07, D-09).

---

## 4. Panel właściciela — zasada „wszystko biznesowe edytowalne”

### 4.1. Docelowa nawigacja

```text
/panel
  /dashboard
  /zgloszenia
  /rezerwacje
  /kalendarz
  /klienci               (po wdrożeniu 2.1; z kontrolą dostępu)
  /pracownicy            (owner)
  /tresci
    /strony               (teksty, sekcje, CTA, FAQ, SEO)
    /galeria              (zdjęcia, kategorie, okładki, zgody)
    /oferta               (pakiety i dodatki)
  /firma                  (nazwa, adres, NIP, telefon, e-mail, godziny, social)
  /rezerwacje/ustawienia
    /harmonogram          (sloty, długość, przerwy, dni tygodnia)
    /zasoby               (sprzęt, personel, dostępność)
    /pojemnosc            (limity drużyn, graczy, slotów)
    /zasady               (anulowanie, przeniesienia, pogoda)
    /ceny-i-zadatki
    /platnosci            (operator/status integracji; bez jawnych sekretów)
  /bezpieczenstwo
  /historia-zmian
  /ustawienia
```

Trasy są **propozycją**, a nie nakazem zastąpienia obecnych działających URL-i panelu. Zachować kompatybilność istniejących `/panel/zgloszenia`, `/panel/pracownicy`, `/panel/ustawienia` z PR #13.

### 4.2. Moduły edytora

| Moduł | Właściciel może zmienić | Kontrola bezpieczeństwa i odbiór |
|---|---|---|
| **Dane firmy** | Nazwa handlowa i prawna, NIP, telefon, e-mail, adres, opis dojazdu, linki społecznościowe, kontakt i godziny | Walidacja NIP/adresów/linków, podgląd, historia, aktualizacja stopki i JSON-LD |
| **Strony i opisy** | Hero, nagłówki, akapity, CTA, atrakcje, FAQ, opisy pakietów, regulaminy robocze i treści SEO | Typowane bloki CMS, bez dowolnego uruchamialnego HTML; wersje draft/published; podgląd |
| **Galeria i multimedia** | Przesyłanie, usuwanie, kolejność, kategorie, alt, kadrowanie, okładka, wykorzystanie na stronach | Kontrola typu/rozmiaru, optymalizacja, własność/licencja, zgody, kopia obiektu storage, publikacja po zatwierdzeniu |
| **Harmonogram** | Godziny startów, liczba slotów, długość, bufory, wyjątki, dni wolne i sezonowość | Wykrywanie konfliktów, walidacja braku nakładania, data wejścia w życie |
| **Pojemność** | 8 graczy/drużynę, 2–4 drużyny, 32 graczy/slot, limity na daty i zasoby | Limit techniczny nie może być niższy niż już potwierdzone zobowiązania bez procedury wyjątku |
| **Sprzęt i obsada** | Liczba sprawnych zestawów i pracowników na termin, czas wyłączenia sprzętu, serwis | Zmniejszenie liczby zestawów może zablokować nowe rezerwacje, bez nadpisywania starych |
| **Pakiety i ceny** | Nazwa, zawartość, cena PLN, dodatki, cena prywatności, podatki, daty obowiązywania | Wersjonowanie, migawka ceny na rezerwacji, kontrola kwot i uprawnień |
| **Zadatek i płatności** | Kwota zadatku i reguły pokazania ceny; wybór zatwierdzonego aktywnego adaptera | Rozdzielenie konfiguracji biznesowej od sekretów, audyt zmiany, blokada aktywacji bez sandbox/produkcji |
| **Regulamin i zasady** | Teksty, anulowania, zwrotów, pogody, wieku, opiekunów, polityki retencji | Numer wersji, obowiązuje od, akceptacja dla konkretnej rezerwacji; publikacja po zatwierdzeniu |
| **Dostępność** | Blokada dowolnego dnia/slotu, odblokowanie, wyłączność dla wydarzenia | Powód, historia, identyfikacja konfliktów, brak cichego anulowania opłaconych wizyt |
| **Personel** | Zaproszenia, role, blokowanie kont, zakres działań | MFA, audyt, możliwość awaryjnego odzyskania dostępu |
| **Historia zmian** | Podgląd kto/co/kiedy zmienił, przywrócenie zatwierdzonej wersji treści | Append-only audit; przywrócenie nie cofa płatności ani rezerwacji |

### 4.3. Bezpieczny model edycji i publikacji

- Pola biznesowe są w bazie (`BusinessProfile`, `SitePage`, `SiteBlock`, `GalleryAsset`, `BookingPolicy`, `ScheduleTemplate`, `AvailabilityOverride`, `PriceVersion`, itd.).
- Draft → Preview → Publish. Publikowanie kluczowych tekstów prawnych/prices wymaga jawnego potwierdzenia uprawnionego użytkownika, a czasem ponownego uwierzytelnienia.
- Wersjonowanie umożliwia odtworzenie wcześniejszych tekstów, ale *nie* cofanie skutków już zawartych umów.
- Cache Next.js (SSR/ISR lub odpowiednie invalidation) odświeża treści po publikacji — bez nowego deployu.
- Publiczne strony korzystają z zatwierdzonych rekordów bazy, nie z równoległej konfiguracji w `src/data/site.ts`; dotychczasowe dane mogą posłużyć jednorazowo do migracji, po zatwierdzeniu właściciela.
- W razie braku zatwierdzonych obowiązkowych informacji: widoczne ostrzeżenie tylko w panelu; publicznie brak fikcyjnych danych. Dla informacji prawnie i biznesowo wymaganych obowiązuje blokada startu produkcyjnego.
- Ustawienia harmonogramu i pojemności są edytowalne również po premierze, ale zmiany obowiązują od wskazanego terminu i są audytowane.

---

## 5. Wersja 1.0 — strona firmowa: odbiór i dokończenie

**Status:** implementacja już istnieje; to etap jakościowy, nie przepisywanie frontend-u.

**Funkcjonalności:** strona główna, oferta, cennik, galeria, grupy docelowe, FAQ, kontakt, dojazd, formularz zapytania, SEO, zgody cookies, dostępność.

**Zakres prac do zamknięcia:**
1. Uporządkowanie otwartego PR #11 i pozostałych zależnych gałęzi; potwierdzenie pełnego CI i testów Playwright na Linux.
2. Docelowa galeria według zatwierdzonego projektu poziomej karuzeli: 3 główne zdjęcia, po jednej skrajnej miniaturze, centralne zdjęcie powiększone, poziome filtry kategorii; responsywnie 1 centralne + fragmenty sąsiadów na mobile.
3. Publikowanie wyłącznie legalnie zatwierdzonych fotografii; przesyłanie nowych zdjęć będzie realizowane przez panel właściciela w 1.5B.
4. Zweryfikowanie danych firmy i adresu, telefonów, e-maili, cen, zasad bezpieczeństwa i dokumentów prawnych.
5. Potwierdzenie prawdziwej wysyłki wiadomości przez Resend lub alternatywny zweryfikowany kanał. Do startu 1.5A mogą być zapisywane w bazie, ale finalna procedura powiadomień musi być testowana.
6. Domain/HTTPS, staging, logi bez PII, monitoring, backup wdrożenia, test rollbacku i ostateczny audyt mobilny/WCAG.

**Testy:** build, lint, typecheck, Vitest, Playwright desktop/mobile, axe, Lighthouse, kliknięcia CTA, formularz, poprawność indeksowania i zgodność treści z danymi właściciela.

**Odbiór:** strona ma zatwierdzony content, prawdziwe kanały kontaktu, zielone CI, testy wysyłki i brak błędów krytycznych. Wersja 1.0 nie musi jeszcze posiadać prawdziwego kalendarza i systemu płatności.

---

## 6. Wersja 1.5A — konta pracowników i skrzynka zgłoszeń

**Status:** prace już rozpoczęte w PR #13; NIE tworzyć drugiego równoległego systemu auth.

**Funkcjonalności docelowe:**
1. Jedno konto tożsamości użytkownika (`User`) z sesją, bez publicznej rejestracji; role `owner`, `manager`, `employee` i status aktywności.
2. Logowanie, wylogowanie, reset/zmiana hasła i bezpieczne tworzenie pierwszego konta właściciela.
3. Obowiązkowe MFA dla dostępu produkcyjnego pracowników (szczególnie właściciela) przed publikacją panelu.
4. Wspólna, bezpieczna skrzynka `Inquiry`: lista, filtrowanie, wyszukiwanie, szczegóły, notatki, przypisania, statusy, historia działań.
5. Publiczne zgłoszenie zapisywane transakcyjnie w PostgreSQL; powiadomienie e-mail przez outbox/worker. Błąd dostawcy pocztowego nie usuwa zgłoszenia ani nie oznacza poprawnego zapisu błędem.
6. Role z kontrolą dostępu na serwerze i audit. Pracownik nie może zakładać konta ownera ani edytować ustawień poza swoim zakresem.
7. Migracje Prisma, sekrety poza kodem, rate limiting, ochrona CSRF/IDOR, retencja po zatwierdzeniu, zasady dostępu do danych.

**Dane:** `User`, `Session`, `Account`, `Verification`, `Inquiry`, `InquiryNote`, `InquiryHistory`, `NotificationOutbox`, `StaffAudit` — weryfikować i rozszerzać istniejący schemat z PR #13, nie kopiować modeli.

**Testy:** logowanie, autoryzacja każdej trasy/API, blokada konta, sesja wygasła, brak sign-up, operacje na zapytaniach, idempotencja, fallback poczty, migracje prawdziwego PostgreSQL, MFA, skan zależności.

**Odbiór:** pracownik loguje się i bezpiecznie obsługuje zgłoszenia, niewysłany e-mail nie oznacza utraty danych, brak nieuprawnionego dostępu i brak publicznej rejestracji. Nie wolno uznawać samego pola `mfaEnrolled` za działające MFA.

---

## 7. Wersja 1.5B — panel właściciela, CMS i konfigurator firmy

**GŁÓWNY PRIORYTET NOWEJ ROADMAPY.** Powinien powstać **przed** uruchomieniem rezerwacji i docelowo uniezależnić właściciela od programisty.

### 7.1. Minimalny zestaw ekranów (MVP CMS)

1. **Firma i kontakt** — nazwy, dane prawne, NIP, adres, map pin, telefon, e-mail, godziny kontaktu, social media, strona główna SEO.
2. **Treści witryny** — edycja głównych sekcji, ofert, opisów atrakcji, FAQ, hero, CTA, SEO, kolejności sekcji; bez dowolnego skryptowego HTML.
3. **Galeria** — upload/modyfikacja/usunięcie zdjęć, kategorie (np. Atrakcje, Teren, Najlepsi zawodnicy), kolejność, miniatury, kadrowanie, alt, okładki, informacja o prawach i zgodach. Galeria frontendowa automatycznie korzysta z opublikowanych assetów.
4. **Pakiety i dodatki** — nazwy, opisy, zawartość, widoczność, ceny (dopiero po zatwierdzeniu), wersjonowanie cen.
5. **Harmonogram i dni gry** — edycja domyślnych slotów i wyjątków, liczba slotów, dni tygodnia, start, czas trwania, bufor.
6. **Zasoby i pojemność** — liczba dostępnych zestawów, max 8 graczy/drużynę, 2–4 drużyny, max 32/slot; zależności i walidacja ustawień.
7. **Polityki i regulaminy** — wersjonowanie treści, anulowanie, zwroty, pogoda, udział dzieci, zasady kontaktu, data wejścia w życie.
8. **Historia i publikowanie** — draft/podgląd/publikuj, historia zmian, role, przywracanie wcześniejszej wersji tekstu.
9. **Kafle stanu** — niewypełnione obowiązkowe pola, brak zatwierdzonych zdjęć, integracje offline, raport ostatnich edycji.

### 7.2. Rozszerzenia administracyjne wymagane przed v2.0

- Zarządzanie dostępnością konkretnych terminów w formie kalendarza administratora: blokuj/odblokuj dowolny dzień i wybrany slot, wprowadź powód, rozlicz konflikty.
- Ustawienia rodzaju gry: współdzielona/prywatna; zasady łączenia do 4 drużyn.
- Data startu nowych cen/zasad; audyt i podgląd wpływu zmian na przyszłe rezerwacje.
- Wybór operatora płatności spośród sprawdzonych adapterów i widok stanu integracji; **w tej wersji bez aktywnego pobierania pieniędzy**.

### 7.3. Techniczna realizacja

- Dodać modele CMS (np. `BusinessProfile`, `BusinessContact`, `SitePage`, `ContentRevision`, `GalleryAsset`, `GalleryCategory`, `Package`, `ScheduleTemplate`, `ScheduleException`, `CapacityPolicy`, `EquipmentInventory`, `BusinessPolicy`, `ConfigChangeAudit`). Konkretne nazwy wybrać po audycie Prisma.
- Wszystkie publiczne dane renderowane z zatwierdzonego źródła danych; odpowiednia polityka cache, invalidation i ISR/SSR.
- Zbudować serwerowe walidatory i uprawnienia dla każdego mutującego endpointu; sanitizacja tekstu i kontrola plików.
- Upload do docelowego storage: bezpieczeństwo MIME, limity rozmiarów, optymalizacja, kopie, podpisane URL lub bezpieczny upload, blokada obrazów niezatwierdzonych.
- Skonfigurować backup zawartości CMS oraz bezpieczne przywracanie wersji; eksport danych firmy i ustawień.
- Właściciel może edytować wszystkie wymienione **dane biznesowe** bez deployu; zmiana kodu, modułów technicznych czy dostawcy bez istniejącego adaptera wymaga nadal pracy programisty.

**Testy:** zmiana telefonu w panelu aktualizuje nagłówek/stopkę, kontakt i schema.org; zmiana opisu aktualizuje właściwą stronę; publikacja zdjęcia aktualizuje karuzelę i filtrowanie; wycofanie publikacji usuwa je z galerii; zmiana szablonu slotów aktualizuje przyszłą dostępność bez konfliktów; historia zmian działa; employee nie edytuje firmy.

**Odbiór:** właściciel z poziomu UI tworzy, publikuje i cofa treści, zdjęcia, ceny i harmonogram; brak duplikacji danych pomiędzy plikami i bazą, brak niekontrolowanej modyfikacji potwierdzonych rezerwacji (gdy dojdą w v2). Właściciel nie jest uzależniony od programisty w codziennych zmianach oferty.

---

## 8. Wersja 2.0 — kalendarz, rezerwacja gościnna, płatności i kalendarz operacyjny

### 8.1. Frontend klienta

1. Nowy proces `/rezerwacja` z wyborem liczby drużyn/graczy (wg zatwierdzonych zasad), pakietu, dodatków i trybu: wspólny lub prywatny.
2. Miesięczny kalendarz Windows-style z trzema kolorami, aktualnymi statusami, filtrowaniem zależnym od wielkości grupy i szczegółowym modalem po wyborze dnia.
3. Podgląd slotów 08:00–10:00, 11:00–13:00, 14:00–16:00, z liczbą wolnych miejsc i dostępnych drużyn; panel właściciela może zmienić te dane.
4. Limit każdej drużyny 8; do 4 drużyn/mecz, 32 graczy/slot, możliwość mieszania niezależnych klientów. Obsługa większych rezerwacji zależy od decyzji D-20.
5. Tryb prywatny — dopłata i blokada całego slotu, jeżeli nie ma cudzych blokad/rezerwacji.
6. Czasowa blokada terminu z licznikiem, idempotentny checkout, potwierdzenie końcowej ceny i zadatku, regulamin/RODO.
7. Bramka płatności (po jej wyborze) i ekran: `oczekujące/potwierdzone/odrzucone/wygasłe/wymaga interwencji`.
8. Po opłaceniu: bezpieczny gościnny link do rezerwacji, e-mail potwierdzający, opcje złożenia prośby o zmianę/anulowanie.
9. Zachować `/zapytaj-o-termin` dla nietypowych wydarzeń, większych grup, pytań i awaryjnego wyłączenia checkoutu.

### 8.2. Silnik rezerwacji i logika biznesowa

- `SlotTemplate` + materializowane lub obliczane `SlotOccurrence` na datę, z wyjątkami i strefą `Europe/Warsaw`; przechowywanie technicznych czasów w UTC.
- Pojemność liczyć oddzielnie dla osób, drużyn, sprzętu oraz personelu. Wszystkie rezerwacje online, ręczne i blokady zużywają te same zasoby.
- Utworzenie blokady zawsze w transakcji z blokadą zasobów lub atomową aktualizacją; bez zaufania do ceny/pojemności od klienta.
- Oddzielne statusy blokady, rezerwacji, płatności, zwrotu. Poprawne transakcje, idempotencja, sekwencja webhooków i odporny outbox/inbox.
- Rezerwacje prywatne mają `exclusive=true` i rozliczeniową alokację pełnej pojemności 32, nawet przy 8 graczach; nie mieszają się z obcymi rezerwacjami.
- Jeśli slot osiąga 4 zespoły albo zostaje zamknięty, nie przyjmuje kolejnego zespołu mimo wolnych fizycznych miejsc.
- Każda rezerwacja zachowuje migawkę cen, polityk i zasad z chwili zawarcia; nowa konfiguracja nie zmienia wcześniejszych zobowiązań.
- Zamykanie zajętych terminów przez właściciela: wyłącznie przez workflow uwzględniający klientów, zwroty, zmianę terminu i powiadomienia.

### 8.3. Panel operacyjny

- **Kalendarz właściciela**: widok dzień/tydzień/miesiąc, kolory dostępności, listy wszystkich slotów, obsada, stan sprzętu i zajętość.
- Kliknięcie w dzień/slot pokazuje obsługiwane rezerwacje, drużyny, grupy, źródło (online/telefoniczne), zaległe płatności i ewentualne blokady. PII tylko dla uprawnionych.
- Właściciel może zablokować dzień lub slot, dodać termin specjalny, nadpisać limit zasobów na konkretną datę, zapisać powód.
- Tworzenie rezerwacji telefonicznych **z tym samym silnikiem pojemności**; przeniesienie, anulowanie, oznaczenie no-show i zakończonej gry.
- Płatności: lista prób, rozbieżności, zwroty, aktualizacja salda (wg ról) i dziennik audytu.
- Ustawienia: ceny, dopłata prywatna, zadatek, zasady w sposób dostępny właścicielowi z panelu, nie z plików.

### 8.4. Warunki uruchomienia v2.0

Nie udostępniać prawdziwego checkoutu przed zatwierdzeniem: cen wszystkich dostępnych pakietów, kwoty zadatku, dopłaty do prywatnego slotu, zasad anulowania/zwrotów, dostawcy płatności, zasad łączenia drużyn i gotowości meczu, czasów wyprzedzenia i horyzontu, retencji i polityk prawnych.

**Testy krytyczne:** równoczesne zajęcie ostatniego miejsca, mieszanie 2–4 drużyn bez przekroczenia 32, prywatny slot i próba dołączenia drugiej drużyny, zamykanie slotu podczas checkoutu, webhook duplikat/zła kolejność, płatność po wygaśnięciu blokady, zwrot po awarii, wahania stanu sprzętu, zmiana godziny przy aktywnej rezerwacji, końce miesięcy i DST.

**Odbiór:** rzeczywista rezerwacja i zadatek kontrolny, potwierdzenie przez webhook, zero nadrezerwacji, panel i e-mail aktualizowane spójnie, możliwość bezpiecznego wyłączenia rezerwacji bez wyłączenia strony.

---

## 9. Wersja 2.1 — konta klientów i historia wizyt

**Cel:** klienci mogą założyć konto lub zalogować się i wygodnie wracać do rezerwacji, bez utrudniania gościom dostępu.

**Funkcje:**
- oddzielna ścieżka publicznej rejestracji klientów (dopiero po zatwierdzeniu, z weryfikacją e-mail i ochroną przed nadużyciami), logowanie, reset hasła, obsługa sesji;
- profil klienta: nazwa wyświetlana, opcjonalne dane kontaktowe, ustawienia prywatności, zgody marketingowe niezależne od umowy;
- `/konto`, `/konto/rezerwacje`, `/konto/ustawienia`, możliwość powiązania wcześniejszej rezerwacji gościnnej z kontem **wyłącznie po bezpiecznej weryfikacji**, nie samym e-mailem;
- historia rezerwacji, pobranie potwierdzeń, prośba o zmianę/anulowanie wg zasad;
- osobne uprawnienia klienta i pracownika, bez automatycznego dostępu do `/panel`;
- proces rezerwacji bez konta działa nadal.

**Dane:** `CustomerProfile`, `BookingCustomerLink` lub równoważne, powiązania do istniejącego `User` z auth; nie tworzyć drugiego systemu loginów.

**Testy:** IDOR (klient A nie widzi B), przejęcie rezerwacji gościnnej tylko przez weryfikację, zgody, usuwanie/eksport danych, sesje, reset hasła, obsługa osób niepełnoletnich wg zatwierdzonej polityki.

**Odbiór:** jeden system tożsamości, bezpieczny dostęp klienta do swoich wizyt, nadal działająca rezerwacja bez konta.

---

## 10. Wersja 2.2 — drużyny, kapitanowie, zawodnicy

**Cel:** stali gracze mogą zakładać drużyny i organizować wspólne rozgrywki.

**Funkcje:**
- profil zawodnika (nick, avatar, dane publiczne tylko po zgodzie), bez publikowania e-maili/telefonów;
- tworzenie drużyny z nazwą, logo, opisem, kapitanem i opcjonalnymi zastępcami;
- zaproszenia do drużyny, akceptacja/odrzucenie, zarządzanie składem, odejście, przeniesienie kapitana;
- **domyślny limit składu 8 zawodników**, edytowalny przez ownera i wersjonowany; nie przekładać automatycznie limitów składu historycznych turniejów;
- możliwość wybrania istniejącej drużyny podczas składania rezerwacji, jeśli członkowie udostępnili niezbędne uprawnienia;
- drużyny publiczne/prywatne, ustawienia widoczności, moderacja nazw/avatarów, zgłoszenia nadużyć;
- odrębne role sportowe (`captain` jako `TeamMembership`) i pracownicze (`owner` jako rola dostępu do panelu).

**Dane:** `PlayerProfile`, `Team`, `TeamMembership`, `TeamInvitation`, opcjonalne `TeamBranding`. Nie zmieniać domyślnej roli panelu pracowników.

**Testy:** nie da się przyjąć 9. zawodnika przy limicie 8, dwóch kapitanów nie nadpisuje się niespójnie, zaproszenia wygasają, kapitan A nie edytuje drużyny B, bezpieczeństwo uploadu logo i danych zawodników.

**Odbiór:** tworzenie i prowadzenie drużyny z panelem kapitana, zgodne z limitami i prywatnością.

---

## 11. Wersja 2.3 — oficjalne mecze, statystyki, rankingi

**Cel:** wiarygodna rywalizacja sportowa, bez zmyślonych statystyk trafień.

**Funkcje:**
- harmonogram oficjalnych meczów od 2 do 4 drużyn oraz powiązanie z rezerwowanym slotem (2–4 × max 8, razem <=32), z osobnymi regułami dla wydarzeń specjalnych;
- przypisanie sędziego/organizatora, protokół meczu, statusy `draft`, `submitted`, `confirmed`, `disputed`, `void`;
- wpis i potwierdzenie wyniku przez uprawnione osoby; historia korekt, uzasadnienie sporu i możliwość rozstrzygnięcia;
- ranking drużynowy i indywidualny (indywidualny tylko w zakresie **danych rzeczywiście zbieranych** i zatwierdzonych reguł), archiwum sezonów;
- klasyfikacja generowana z potwierdzonych wyników, deterministyczny przelicznik i tie-break;
- wyraźne rozdzielenie gier rekreacyjnych (bez punktów) od oficjalnych meczów ligowych.

**Dane:** `Match`, `MatchTeam`, `MatchResult`, `MatchResultHistory`, `MatchOfficial`, `RankingRuleVersion`, `Standing`, `StandingHistory`.

**Otwarte:** sposób liczenia punktów i wyników, czy każdy mecz może mieć 3–4 drużyny i jak liczyć zwycięzcę, indywidualne statystyki, walkowery, remis i tie-break, sezon start/koniec. Bez tych ustaleń nie wolno publikować tabeli jako oficjalnej klasyfikacji.

**Testy:** ranking tylko z confirmed, korekta powoduje kontrolowany rebuild, potwierdzanie przez rolę związaną z meczem, brak duplikacji wyniku, odporność na manipulację.

**Odbiór:** powtarzalny ranking, transparentne reguły, możliwość audytu każdego punktu.

---

## 12. Wersja 3.0 — STREFA 29 LEAGUE: turnieje, finały i coroczne nagrody

**Cel:** pełny sezon rozgrywek, zawody i zaangażowanie społeczności.

**Funkcje:**
1. Sezony, ligi, klasyfikacje i regulaminy oraz kwalifikacje do turniejów.
2. Publiczna strona `/liga` z kalendarzem wydarzeń, tabelami, profilami drużyn i archiwum zwycięzców.
3. Zapisy drużyn na turnieje; limity i kwalifikacje, potwierdzenia i listy startowe, uprawnienia organizatora/sędziego.
4. Drabinki, grupy, mecze i terminarze, formaty zgodne z zatwierdzonym regulaminem rozgrywek.
5. Panel sędziowski do zatwierdzania wyników i rozstrzygania sporów; mechanizm walkowerów zgodnie z zasadami.
6. Finałowy turniej sezonu, historia mistrzów i osobny katalog trofeów.
7. Nagrody roczne: przykładowo Drużyna Roku, Zawodnik Roku, MVP Finału, Debiut Roku, Fair Play — **nazwy i kryteria do zatwierdzenia**.
8. Strony relacji fotograficznych, zgody na wizerunek, publikowanie tylko uprawnionych materiałów.
9. Opcjonalnie powiadomienia o wydarzeniach, zgłoszeniach, zmianach harmonogramu (bez marketingu bez podstawy prawnej).

**Dane:** `Season`, `League`, `Tournament`, `TournamentRegistration`, `TournamentAssignment`, `TournamentStage`, `Bracket`, `AwardCategory`, `SeasonAward`, archiwum i zgody.

**Testy:** przypisania sędziów, zapisy, drabinki, zamknięcie sezonu, korekta wyniku i aktualizacja rankingu, niezmienność przyznanych nagród bez audytowanej decyzji, prywatność uczestników.

**Odbiór:** rozegrany testowy turniej z prawidłowym wynikiem, klasyfikacją, zamknięciem sezonu i przyznaniem nagród; właściciel zmienia program wydarzeń z panelu.

---

## 13. Model danych — modułowa rozbudowa bez sztywnych ustawień

### 13.1. Istniejące elementy do ponownego użycia

- Auth i staff: `User`, `Session`, `Account`, `Verification`, `StaffAudit` w `feature/staff-panel`.
- Zapytania: `Inquiry`, `InquiryNote`, `InquiryHistory`, `NotificationOutbox`.
- Projekt strony: komponenty oferty, galerii, formularza oraz istniejący design system.

### 13.2. Modele proponowane, dodawane dopiero w odpowiedniej wersji

| Wersja | Modele / odpowiedzialność |
|---|---|
| 1.5B | `BusinessProfile`, `BusinessContact`, `SitePage`, `ContentRevision`, `GalleryAsset`, `GalleryCategory`, `Package`, `EquipmentInventory`, `ScheduleTemplate`, `ScheduleException`, `CapacityPolicy`, `BusinessPolicy`, `ConfigChangeAudit`, `ContentPublishEvent` |
| 2.0 | `SlotOccurrence`, `Booking`, `BookingGroup`, `BookingItem`, `BookingStatusHistory`, `TemporaryHold`, `PriceVersion`, `DepositPolicy`, `PaymentAttempt`, `PaymentEvent`, `Refund`, `GuestAccessToken`, `IdempotencyKey`, `InboxEvent`, `OutboxEvent`, `AvailabilityOverride`, `TermsAcceptance` |
| 2.1 | `CustomerProfile`, `BookingCustomerLink`, mechanizm bezpiecznego powiązania rezerwacji gościnnej |
| 2.2 | `PlayerProfile`, `Team`, `TeamMembership`, `TeamInvitation` |
| 2.3 | `Match`, `MatchTeam`, `MatchResult`, `MatchOfficial`, `RankingRuleVersion`, `Standing` |
| 3.0 | `Season`, `League`, `Tournament`, `TournamentStage`, `TournamentRegistration`, `TournamentAssignment`, `Bracket`, `AwardCategory`, `SeasonAward` |

**Nie tworzyć pustych tabel na zapas.** Schemat wersjonowany przez migracje, unikalne indeksy, ograniczenia SQL, klucze obce, indeksy dat i statusów. Właściwe dane zamówienia są snapshotem — zmiana nazwy pakietu w CMS nie zmienia wcześniejszych rezerwacji.

### 13.3. Jedno źródło konfiguracji

Zamiast `const MAX_PLAYERS = 32` rozrzuconego w UI/API: serwis `BookingSettings` czyta zatwierdzoną wersję konfiguracji z bazy i używa jej w kalendarzu, formularzu, transakcjach, testach i panelu. UI otrzymuje tylko bezpieczny publiczny podzbiór; zapisy i modyfikacje właściciela idą przez zwalidowane akcje serwerowe/API.

Stosować *effective dating* dla harmonogramu, cen i polityk. Historia zmiany: aktor, czas, poprzednia/nowa wartość, data wejścia w życie, uzasadnienie. Cache musi odświeżać się po zmianie (revalidation/event), bez restartu serwera.

---

## 14. Bezpieczeństwo, niezawodność i kontrola dostępu — wszystkie wersje

- Role firmy: owner, manager, employee. Uprawnienia zasobowe (nie tylko ukrywanie przycisków); owner może zarządzać treścią/pojemnością/politykami, manager wyłącznie w zatwierdzonym zakresie, employee zgłoszeniami i przydzielonymi czynnościami.
- Niezależne role sportowe: member/customer, captain, referee i organizer **nie** dostają dostępu do panelu personelu tylko przez status w drużynie.
- MFA wymagane dla panelu produkcyjnego, bezpieczne sesje, rotacja przy podwyższeniu uprawnień, log prób i wyłączeń, ograniczenie logowania.
- CSRF, XSS, IDOR, walidacja runtime, limit plików, skan typów MIME i treści, bezpieczny storage, brak PII w analityce/logach.
- PostgreSQL: kopie, test odtwarzania, kontrola migracji, oddzielne środowiska, dostęp minimalny; przechowywanie UTC i strefa `Europe/Warsaw` dla reguł biznesowych.
- Payments: autorytatywne podpisane webhooki, inbox, outbox, idempotency/replay safety, rekonsyliacja, retry i alerty; nigdy nie przyjmować ceny od przeglądarki.
- Wyłączenie modułu rezerwacji feature flagą pozostawia działającą wersję marketingową i kontaktową.
- Dokumenty prawne, dane dzieci, wizerunki i polityka pogodowa muszą być zatwierdzone przed użyciem produkcyjnym; proces bezpieczeństwa graczy ma pierwszeństwo nad automatyczną regułą finansową.

---

## 15. Strategia testów przekrojowych i kryteria wersji

| Warstwa | Testy / kryteria |
|---|---|
| Unit/domain | Limity 8/4/32, czas 120+60, harmonogram 08/11/14, liczenie 96/48, kolory, daty/DST, migawki, ceny, statusy |
| Integration/PostgreSQL | Migracje, CRUD CMS, audyt, skuteczność publikowania, blokady równoczesne, kontrola miejsc, weryfikacja ról |
| E2E | Owner edytuje dane/tekst/zdjęcie; natychmiastowy update publiczny; klient wybiera dzień i widzi wolne sloty; prywatna rezerwacja; fallback |
| Accessibility | WCAG 2.2 AA jako cel; focus trap dialogu, klawiatura, statusy kolor + tekst, reflow, mobile i zoom |
| Security | IDOR na kontach, upload, CSRF, XSS, reentrancy, rate limits, tokeny, MFA, autoryzacja owner/manager/employee |
| Concurrency | Wielu klientów zajmuje ostatnie 8 miejsc; 4 zespoły po 4 osoby; ostatni slot na wyłączność; właściciel zamyka datę podczas checkoutu |
| Payment | Sandbox + rzeczywista kontrolna transakcja: webhook sukces/błąd/duplikat/przeterminowany, refund, chargeback, zapłata po hold expiry |
| Operational | Monitoring, backup/restore, rollback, migracja kompatybilna, tryb awaryjny, brak wycieku danych i sekretów |
| Media/performance | Optymalizacja obrazów, karuzela i filtr, brak overflow, Lighthouse, responsywność, test cache po zmianie treści |

Testy E2E i API powinny działać na stabilnych, deterministycznych danych testowych; QA nie może polegać na prawdziwych danych klientów ani prawdziwych opłatach bez kontrolowanego środowiska.

---

## 16. Szczegółowy rejestr spraw do ustalenia później

Statusy: **USTALONE** = potwierdzone w rozmowie; **WSTĘPNE** = preferencja, wymaga doprecyzowania / weryfikacji; **OTWARTE** = właściciel musi podjąć decyzję. Pełny, łatwy do uzupełniania rejestr znajduje się również w osobnym pliku `docs/STREFA29_REJESTR_DECYZJI_DO_USTALENIA.md`. Dokumenty należy synchronizować przy każdej zmianie.

### 16.1. Ustalone lub wstępne

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

### 16.2. Decyzje otwarte — nie wymyślać wartości

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

## 17. Kolejność implementacji i plan Pull Requestów

1. **Stabilizacja:** rozwiązać zależności gałęzi PR #11 i #13, naprawić czerwone CI; osobno zatwierdzić zdjęcia galerii. Nie scalać nieprzejrzystej gałęzi do main bez audytu.
2. **PR v1.5B-1:** modele CMS, migracje, dane firmy, odczyt po stronie publicznej, draft/publish, audyt.
3. **PR v1.5B-2:** edytor treści, FAQ, oferty, SEO; wersjonowanie i testy.
4. **PR v1.5B-3:** media/gallery manager, kategorie karuzeli, optymalizacja i prawa do zdjęć.
5. **PR v1.5B-4:** edytor harmonogramu, limity 8/4/32, sprzęt, wyłączenia dat/slotów (na razie bez sprzedaży) oraz walidacja.
6. **PR v2.0-1:** kalendarz klienta, obliczenia dostępności, kolorystyka, modal slotów, filtry.
7. **PR v2.0-2:** blokady transakcyjne, rezerwacje gościnne, prywatne/współdzielone, testy concurrency.
8. **PR v2.0-3:** wersje cen, zadatek, checkout sandbox, webhook inbox, zwroty, rekonsyliacja.
9. **PR v2.0-4:** panel kalendarza, ręczne rezerwacje, powiadomienia, audyt, feature flags.
10. **PR v2.0-5:** testy operacyjne, bezpieczeństwo, restore, prawdziwa płatność kontrolna, uruchomienie etapowe.
11. **PR v2.1:** konta klienta i historia; rezerwacje gościnne zachowane.
12. **PR v2.2:** profile zawodników i drużyny.
13. **PR v2.3:** wyniki i rankingi.
14. **PR v3.0:** turnieje i nagrody.

Każdy PR zawiera: zakres, migracje, testy, screenshoty zmian UI, zagrożenia i plan wycofania. Ciężkie migracje danych wyłącznie kompatybilne wstecz, z kopią i możliwością powrotu do poprzedniej aplikacji bez uszkodzenia bazy.

---

## 18. Checklista odbioru przez właściciela

- [ ] Potwierdzono podstawowe dane firmy i komunikaty do publikacji.
- [ ] Panel właściciela pozwala edytować wszystkie wskazane informacje biznesowe bez zmian w kodzie.
- [ ] Zapisane domyślne parametry: 8/drużynę; 2–4 drużyn; 32/slot; 08/11/14; 120+60 minut.
- [ ] Na zwykły dzień kalendarz wylicza 3 × 32 = 96 oraz próg 48.
- [ ] Kalendarz ma ciemnozielony/niebieski/czerwony kolor zgodnie z zatwierdzonymi regułami, a status jest widoczny też tekstowo.
- [ ] Kliknięcie dnia otwiera dialog z 3 slotami i liczbą wolnych miejsc każdego.
- [ ] Jednoczesne rezerwacje dwóch drużyn mogą współdzielić slot, a 4 drużyny / 32 osoby nigdy nie są przekraczane.
- [ ] Rezerwacja prywatna blokuje pozostałe miejsca, nie nadpisując już istniejących klientów.
- [ ] Właściciel może zablokować dowolny slot lub dzień bez cichego usuwania rezerwacji.
- [ ] Zmiana limitów/harmonogramu/ceny ma historię, datę wejścia w życie i kontrolę konfliktów.
- [ ] Płatności uruchomione dopiero po zatwierdzeniu wartości, polityk i operatora.
- [ ] Wszystkie konta pracowników mają działające MFA i sprawdzane uprawnienia serwera.
- [ ] Bezpieczny formularz zapytania pozostaje czynny niezależnie od modułu rezerwacji.
- [ ] Każda wersja ma udokumentowany, przechodzący CI i wynik odbioru manualnego.
- [ ] Rejestr decyzji jest aktualizowany przy każdej decyzji właściciela i synchronizowany z dokumentacją projektu.

---

## 19. Zasady aktualizacji tego planu

1. Każda kolejna decyzja właściciela aktualizuje ten dokument ORAZ rejestr decyzji — z datą, statusem i informacją kto zatwierdził.
2. Parametr dotąd otwarty oznaczony jako `USTALONE` należy następnie zaimplementować jako edytowalne pole biznesowe, a nie stałą.
3. Jeżeli wymagania stoją w sprzeczności z aktualnym zachowaniem systemu, dodać migrację i testy regresyjne; nie nadpisywać automatycznie dawnych rezerwacji.
4. Dokumenty `strona1_0.md`, `strona2_0.md` i `docs/STREFA29_LEAGUE_ROADMAP.md` należy zaktualizować po zatwierdzeniu nowej roadmapy, tak aby Cursor nie realizował sprzecznych instrukcji.
5. Zakaz automatycznego mergowania lub deployowania bez wyraźnej zgody właściciela pozostaje w mocy.

