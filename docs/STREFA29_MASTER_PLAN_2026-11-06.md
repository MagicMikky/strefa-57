> Historia. Bieżący plan: `docs/STREFA29_MASTER_PLAN.md`. Ten plik jest snapshotem sprzed synchronizacji z `14e082d`.

# PAINTBALL STREFA 29 — JEDYNY PLAN NADRZĘDNY PROJEKTU

**Wersja:** 2026-11-06 / Consolidation v1  
**Repozytorium:** https://github.com/MagicMikky/strefa-57  
**Rewizja bazowa analizy:** `main@853fa8ee45d34f05014be843736bf13357193f0c` (2026-11-06, 22:09 UTC); poprzedni stabilny SHA: `0b7402404368`  
**Stan źródeł:** sprawdzono 31 plików `docs/`, `strona1_0.md`, `strona2_0.md`, `PLAN_BUDOWY_STRONY_STREFA_29.md`, `README.md`, `AGENTS.md`, aktualny schemat Prisma, główne moduły i CI.  
**Charakter:** specyfikacja produktu, inwentaryzacja stanu faktycznego i plan dalszego rozwoju. **Nie jest dowodem produkcyjnego wdrożenia ani pentestem.**

> **WŁAŚCICIELU:** Zachowujemy Twój cel: komplet danych i ustawień biznesowych można zmienić w panelu, bez edycji kodu. Niczego biznesowego (cennik, zadatek, pogoda/zwroty, sprzęt, operator płatności, bezpieczeństwo dzieci) nie zgadujemy. Plan jest nadrzędnym roboczym dokumentem integrującym wcześniejsze plany, ale wdrożenie kolejnych funkcji wymaga jawnego zlecenia.

**Powiązane pliki tej paczki:** `STREFA29_CURSOR_ROADMAP_TODO.md` (wykonywalny backlog i bramki jakości), `STREFA29_DECYZJE_DO_USTALENIA.md` (rejestr decyzji), `STREFA29_PROMPT_START_DLA_CURSORA.md` (pierwsze polecenie dla Cursor Agent).

---

## 1. Szybka diagnoza

### 1.1. Stan produktu (weryfikacja aktualnego kodu)

| Komponent | Status | Dowód w kodzie / uwaga |
|---|---|---|
| Strona publiczna, kontakt, SEO, polityki, formularz | **Zaimplementowane** | `src/app/**`, `src/components/inquiry-form.tsx`, `src/app/api/inquiry/route.ts`; dane i dokumenty wymagają zatwierdzenia |
| Galeria pozioma Coverflow, kategorie, lightbox | **Zaimplementowane** | `src/components/gallery-coverflow.tsx`; publicznie bazowo 3 kadry |
| Pracownicy, logowanie e-mail lub login, role i skrzynka zgłoszeń | **Zaimplementowane technicznie** | `src/lib/auth-factory.ts`, `src/app/api/staff/sign-in/route.ts`, `/panel/**`; **MFA brak** |
| PostgreSQL + Prisma + zapis zgłoszeń | **Zaimplementowane technicznie** | `prisma/schema.prisma`; CI wykonuje migracje |
| Panel właściciela: firma, kontakt, limity 8/2–4/32 | **Zaimplementowane** | `/panel/firma`, `BusinessProfile`, `BusinessContact`, `BusinessSettings` |
| CMS opisów, istniejących pakietów, FAQ i SEO części stron | **Częściowo** | `/panel/tresci`, `SiteContent`; nie jest elastycznym page builderem |
| Panel galerii: pliki, ukrywanie, okładka, opisy, kategorie | **Częściowo** | `/panel/galeria`, `GalleryCatalog`; obecny storage **na dysku procesu** |
| Panel harmonogramu: dni tygodnia, blokady dnia i godziny | **Zaimplementowane podstawy** | `/panel/harmonogram`, `ScheduleCatalog`; nie ma pełnego grafiku personelu/zasobów |
| Publiczna dostępność: miesiąc/tydzień/dzień, szczegóły slotów | **Zaimplementowany podgląd** | `/rezerwacja`, `AvailabilityCalendar`; terminy **nie są sprzedawane** |
| Limit pojemności i anonimowe holdy | **Częściowy fundament** | `CapacityHold`, `src/lib/holds/**`; brak zatwierdzonego czasu hold i checkoutu |
| Podgląd dostępności i historii zmian w panelu | **Zaimplementowany podstawowy** | `/panel/dostepnosc`, `/panel/historia`; historia bez diff/restore |
| Prawdziwe rezerwacje, zamówienia i zadatki | **Brak** | Brak modeli `Booking`, `PaymentAttempt`, `Refund`, `TermsAcceptance` |
| Konta klientów / drużyny / ranking / liga | **Brak — roadmapa** | Wersje 2.1, 2.2, 2.3, 3.0 |
| Publiczny sklep, kody rabatowe, vouchery, SMS | **Nie zatwierdzono zakresu** | Nie domyślać się priorytetu |

### 1.2. Status CI/Git i ograniczenia

- Na **poprzednim** `main@0b7402404368` wynik CI (`quality`, `browser`, `database`) to **success**, podobnie CodeQL. **Najnowszy** `main@853fa8ee45d3` zawiera PR #36 i w chwili weryfikacji CI oraz CodeQL były **w toku**, a nie jeszcze zaliczone. [Ostatni zielony CI](https://github.com/MagicMikky/strefa-57/actions/runs/42297023825) · [Nowy CI](https://github.com/MagicMikky/strefa-57/actions/runs/42302555610).
- `main` według API GitHub ma **`protected=false`**: ryzyko bezpośredniego push/merge bez obowiązkowych status checks.
- PR #31 (stos kalendarza dostępności) i #34 (login personelu) są scalone; #8 (React DOM) oraz #10 (PostCSS) scalono. PR #35 `feature/audit-history` został **zamknięty bez bezpośredniego merge** (jego główne funkcje zostały dostarczone przez inne PR); #36 **scalono** do `main`: indeks unikalny jednego ownera, blokada zapisu inquiry do pamięci w produkcji, poprawna odpowiedź po zapisanym zgłoszeniu przy błędzie powiadomienia, sprawdzenie statusu pracownika, test hold na rzeczywistym PostgreSQL. Kontrola CI PR #36 była w toku w chwili audytu.
- Otwarte major-upgrade PR-y m.in. #7 TypeScript 7 (jego CI **failed**), #6 ESLint 10 (CI success, lecz nadal major), #33 Prisma Client 7 (wymaga pełnej migracji i zgodności Prisma CLI). Nie scalać automatycznie.
- Liczba błędów npm audit, coverage i czas testów zależy od konkretnej rewizji; przy następnym PR wygenerować **świeży** raport na najnowszym `main`. Nie kopiować liczb ze starych audytów.
- Nie było tu dostępu do realnych sekretów, działającej produkcji, DNS i konta Resend; poprawnie pisać **„nieweryfikowalne z repo”**, nie **„działa produkcyjnie”**.

### 1.3. Zasada jednego źródła prawdy

1. **Najważniejsze są potwierdzone decyzje właściciela** (U-01…U-11, nowe decyzje z datą).
2. **Stan rzeczywisty funkcji to kod aktualnego `main` i zielony test dotyczący tej funkcji**, nie historyczny raport z gałęzi.
3. Dla zakresu przyszłych wersji obowiązuje `docs/STREFA29_NOWA_ROADMAPA_I_PLAN_WERSJI_2026-11-06.md` + niniejszy master plan.
4. Decyzje otwarte mają źródło w `docs/STREFA29_REJESTR_DECYZJI_DO_USTALENIA.md`; nie wymyślać wartości.
5. `strona1_0.md`, `strona2_0.md`, `PLAN_BUDOWY_STRONY_STREFA_29.md` pozostają **specyfikacjami historycznymi / domenowymi**, nie bieżącą checklistą ukończenia.
6. Raporty `V15B_*`, `V20_*`, `V1_*` są **dowodem zakresu etapu, który już powstał**, a nie dowodem, że kolejny etap nadal nie istnieje.

---

## 2. Pełna mapa publicznej strony

| Trasa | Funkcje / docelowa zawartość | Obecne ograniczenia |
|---|---|---|
| `/` | Hero, marka, CTA, zalety pola, atrakcje, pakiety, grupy docelowe, podgląd galerii, kontakt/dojazd | Część sekcji i CTA na stałe, realne treści i zdjęcia do zatwierdzenia; brak zatwierdzonych opinii |
| `/oferta` | Opis terenu, przeszkód, okopów, rakiety V2, scenariuszy, bezpieczeństwa i przebiegu wizyty | Edytowalne głównie części tekstów; potrzebna weryfikacja prawdziwości opisów, dostępności udogodnień |
| `/cennik` | Istniejące pakiety, zakres, atrakcje, dodatki, CTA do zapytania | **Brak zatwierdzonych cen**; nie tworzyć nieprawdziwych kwot ani kalkulatora wiążącej ceny |
| `/galeria` | Pozioma Coverflow, środkowe powiększone zdjęcie, zdjęcia boczne i miniatury na szerokim ekranie, filtry, lightbox | Bazowo 3 publiczne fotografie; zdjęcia graczy i filmy bez zgód pozostają niedostępne; kategorie w CMS ograniczone |
| `/dla-kogo` | Znajomi, urodziny, firmowe, kawalerskie/panieńskie, szkoły, grupy | Treści do finalnego zatwierdzenia, brak wszystkich edytorów |
| `/faq` | Wiek, sprzęt, czas, pogoda, przebieg, ubiór, zmiany terminów | CMS obecny, ale liczba/struktura wpisów i kolejność nie są w pełni dynamiczne; treść prawna do zatwierdzenia |
| `/kontakt` | Telefon, e-mail, godziny, dane firmy i CTA | Dane mogą być placeholderami; właściciel musi zatwierdzić, a CMS opublikować |
| `/dojazd` | Mapa na żądanie, wskazówki, parking, wejście | Pin/adres wejścia/parking wymagają potwierdzenia |
| `/zapytaj-o-termin` | Formularz kontaktowy z liczbą graczy, pakietem, datą, opublikowaną godziną slotu, trybem prywatnym, danymi i wiadomością | To **zapytanie**, nie rezerwacja; wymaga działającego backendu/maili i zgodnej polityki prywatności |
| `/rezerwacja` | **Informacyjny kalendarz** dzień/tydzień/miesiąc; zielony, niebieski, czerwony, nieustalony; kliknięcie dnia → sloty; link → zapytanie | Nie tworzy rezerwacji/hold dla klienta, nie pobiera wpłaty; niezdefiniowane dni tygodnia powodują „nieustalony” |
| `/regulamin` | Zasady obiektu i organizacji wizyty | Tekst roboczy; wiek, pogoda, anulowania/zwroty wymagają decyzji i przeglądu prawnego |
| `/polityka-prywatnosci` | RODO, przechowywanie zapytań, dostawcy, prawa osób | **BŁĄD FAKTYCZNY**: sekcja „Brak bazy zapytań” mimo obecnego PostgreSQL — poprawić P0 |
| `/cookies` | Wybór i zmiana zgód; pomiar warunkowy | Brak faktycznie zatwierdzonego dostawcy analityki; nie uruchamiać go bez zgody |
| `404`, sitemap, robots, manifest | SEO, nawigacja, metadane i noindex do zatwierdzenia | Przed startem zweryfikować komplet metadanych i publiczną indeksację |

**Publiczna komunikacja:** nie używać „Twoja rezerwacja jest potwierdzona” dla zapytań. Dopiero v2.0 z autorytatywnym backendem i potwierdzeniem przez webhook może zapewnić taką obietnicę.

---

## 3. Panel pracowniczy i panel właściciela — obecne i docelowe funkcje

### 3.1. Autoryzacja

- `Better Auth` z `User`/`Session`/`Account`; logowanie e-mail lub nazwą użytkownika; publiczna rejestracja wyłączona.
- Role panelu: `owner`, `manager`, `employee`; zwykły `member` **nie** ma dostępu do `/panel`. Role klienta i kapitana będą członkostwami w przyszłych modelach.
- Sesje 8 h, cookies chronione, weryfikacja uprawnień po stronie serwera (`requireStaff`).
- **Brak wymuszonego MFA** pomimo pola `mfaEnrolled`; Better Auth rate-limit logowania w pamięci procesu. To blokery uruchomienia z danymi klientów na produkcji.
- Pierwszy właściciel: zabezpieczony bootstrap token. Po użyciu sekret usunąć; potwierdzić atomowość bootstrapu i politykę odzyskiwania konta.

### 3.2. Istniejące podstrony panelu

| Ekran | Co umożliwia | Następne uzupełnienie |
|---|---|---|
| `/panel` | Dashboard/szybka nawigacja | Realne metryki, alerty, kolejka zadań |
| `/panel/zgloszenia`, `/panel/zgloszenia/[id]` | Lista, filtrowanie, szczegóły, statusy, przydzielenie, notatki, historia | Weryfikacja realnej poczty, retencja, eksport zgodny z RODO i SLA |
| `/panel/pracownicy` | Owner: konta, role, login i blokowanie | Zaproszenia, reset hasła, MFA i recovery; dokładna macierz uprawnień |
| `/panel/ustawienia` | Podstawowe ustawienia i hasło | 2FA, preferencje konta, konfiguracja profilu |
| `/panel/firma`, `/panel/firma/podglad` | Dane firmy, kontakt, lokalizacja, parametry 8/2–4/32, draft/published, podgląd | Zatwierdzone wartości, historia zmian diff, konflikt edycji, spójny fallback |
| `/panel/tresci`, `/panel/tresci/podglad` | Treści FAQ, istniejących atrakcji/pakietów, SEO części stron | Dodawanie/usuwanie i kolejność pakietów, sekcji i dodatków, pełna strona/SEO |
| `/panel/galeria` | Upload JPG/PNG/WebP, podpis, alt, widoczność, okładka, 3 kategorie, publikacja | Storage obiektowy, swobodne kategorie, przenoszenie kolejności, kadrowanie, zgody, retencja |
| `/panel/harmonogram` | Publikacja dni tygodnia, blokada dnia/startu z powodem | Sezonowość, godziny i długość per data, zasoby, sprzęt/obsada, konflikty z rezerwacjami |
| `/panel/dostepnosc` | Ten sam kalendarz co publiczny, statusy i anonimowe holdy | Prawdziwe rezerwacje ręczne, operacyjne zarządzanie, kalendarz z rozliczeniami |
| `/panel/historia` | Ostatnie 40 zmian firmy/treści/galerii/harmonogramu z czasem i autorem | Diff, filtrowanie, paginacja, przywracanie wersji, niewymazywalny audyt |

### 3.3. Docelowy panel ownera — zasada „bez edycji kodu”

Właściciel ma edytować: dane prawne, telefon/e-mail/adres/dojazd, opisy każdej podstrony, hero, CTA, FAQ, SEO, galerie, kategorie, okładki, zdjęcia, atrakcje, pakiety/dodatki, ceny, zadatek, polityki, harmonogram, dni wolne, pojedyncze sloty, pojemność, liczbę zestawów sprzętu, wymagania obsady, warunki prywatności i aktywne integracje (bez ujawniania sekretów). Wszystkie ustawienia związane z umową mają datę obowiązywania i historię.

**Granica:** programista nadal zarządza kodem, strukturą nowych funkcji i sekretną konfiguracją dostawców. „Wszystko edytowalne” oznacza wszystkie **dane biznesowe**, a nie dowolne wykonywalne skrypty w CMS.

---

## 4. Domena paintball — reguły ustalone i mechanizm dostępności

### 4.1. Konfiguracja początkowa

| Parametr | Start | Status i sposób edycji |
|---|---|---|
| Drużyna | max **8 zawodników** | U-01, właściciel może zmienić |
| Mecz | **2–4 drużyny** | U-02, owner zmienia; minimum operacyjne do ustalenia |
| Slot | max **32 zawodników** | U-03 |
| Sloty dzienne | **08:00 / 11:00 / 14:00** | U-04, harmonogram może się zmienić |
| Czas gry | **120 min** | U-05 |
| Bufor między grami | **60 min** | U-05 |
| Pojemność nominalna dnia | **3×32=96** | Wartość wyliczana, nie stała |
| Próg połowy | **48** przy 3 slotach | Dla zmienionego harmonogramu wyliczać dynamicznie |
| Gra wspólna | Do **4 niezależnych drużyn** w slocie, w ramach limitów | U-06, fizyczne miejsca i limity drużyn to różne ograniczenia |
| Slot prywatny | **Cały slot wyłączny**, nawet przy 8 osobach | U-07; cena do ustalenia |
| Blokada ownera | Cały dzień lub start slotu | U-08; uzasadnienie i audyt |

Default: 08:00–10:00 / bufor 10:00–11:00; 11:00–13:00 / bufor 13:00–14:00; 14:00–16:00. W bazie harmonogram może na razie mieć pustą listę otwartych dni tygodnia — to **nie oznacza**, że firma jest otwarta codziennie. Właściciel powinien ją zatwierdzić i opublikować.

### 4.2. Wizualizacja kalendarza

- Inspirowany miesięcznym kalendarzem Windows: 7 kolumn, poniedziałek–niedziela, nawigacja, „Dziś”, zaznaczenie daty, dialog szczegółów.
- **Ciemnozielony**: mniej niż połowa czynnej dziennej pojemności zajęta.
- **Ciemnoniebieski**: połowa lub więcej zajęta, ale można przyjąć wybraną grupę.
- **Ciemnoczerwony**: brak możliwości rezerwacji dla wybranej grupy albo dzień niedostępny/zamknięty.
- **Nieustalony (czwarty stan)**: nieopublikowany harmonogram lub niepotwierdzona zdolność do oceny. Nie udawać dostępności zielonym kolorem.
- Po kliknięciu daty dialog pokazuje każdy slot, `freePhysicalSeats`, `bookableSeats`, informację o ograniczeniach i CTA; na mobile widok dzień/tydzień i klawiatura. Dostępność status + tekst, a nie sam kolor.
- Przy wyłączeniu jednego slotu pojemność czynna spada; kolor liczony do czynnych slotów (rekomendacja z D-19, do potwierdzenia).
- Jeśli są 4 drużyny po 4 graczy, 16 fizycznych miejsc pozostaje, lecz piąta drużyna **nie może** wejść: `bookableSeats=0`.
- Slot prywatny zajmuje pełne 32 miejsca rozliczeniowe i blokuje dalsze grupy; istniejącej rezerwacji cudzej drużyny nie można samowolnie zastąpić prywatną.
- Obecnie kalendarz operuje **anonimowymi holdami**, a nie potwierdzonymi rezerwacjami; kolory są **orientacyjne**. Niezatwierdzone sprzęt i obsada dodatkowo uniemożliwiają deklarowanie w pełni wiążącej dostępności.

### 4.3. Aktualny silnik holdów — co istnieje, a co nie

- `CapacityHold` zawiera date, slot, players, teams, privateSlot, expiresAt i idempotencyKey, **bez danych klienta, ceny i płatności**.
- `decideHold`: tylko **jedna drużyna**, 1–8 osób; zatwierdzony termin i dzień tygodnia; brak zgody na `holdMinutes` (`null`) oznacza brak nowego holda.
- `createCapacityHold`: transakcja z `pg_advisory_xact_lock` per `date|slot` i sprawdzanie limitów; **nie** włączono publicznej ścieżki tworzenia płatnej rezerwacji. Testy współbieżności in-memory nie zastąpią testów równoległych połączeń PostgreSQL.
- `checkoutReadiness` jawnie zwraca `enabled:false` niezależnie od samej flagi `commercialApproved`; to prawidłowa blokada wdrożeniowa do czasu zatwierdzonych decyzji.

### 4.4. Co trzeba ustalić przed realnym modułem rezerwacji

D-05/D-06 ceny i dodatki; D-07 zadatek; D-08 saldo; D-09 dopłata prywatna; D-10 operator; D-11/D-12 anulowanie/zwrot; D-13 pogoda; D-14 liczba i awaryjność sprzętu; D-15 personel; D-16 sezon i otwarte dni; D-17 horyzont/wyprzedzenie; D-18 czas holda; D-19 metodologia kolorów; D-20 rezerwacja 9–32 osób; D-21 procedura dla pierwszej drużyny bez przeciwnika; D-22 dokładny zakres wyłączności; D-23 zmiana po zapłacie; D-24 wiek; D-25 zasady prawne. **Nie uruchamiać checkoutu bez tych decyzji.**

---

## 5. Przyszła rezerwacja V2.0 — wymagania końcowe

### 5.1. Klient / frontend

1. Wybór trybu: gra wspólna lub prywatna; liczba zawodników/drużyn; pakiet i dodatki.
2. Kalendarz miesięczny z kolorami, modal dnia, liczba wolnych miejsc, blokady i wyjątki; opcjonalnie lista na telefonie.
3. Serwerowe ponowne obliczenie dostępności i **atomowe utworzenie holda** z zatwierdzonym czasem ważności (bez możliwości przekroczenia pojemności).
4. Formularz organizatora i wersja zaakceptowanego regulaminu, wyraźne ceny całkowita/zadatek/saldo.
5. Operator płatności: rekord próby płatności przed przekierowaniem; podpisany webhook (surowe body), inbox idempotentny, obsługa opóźnionych/zdublowanych webhooków.
6. Rezerwacja zostaje `CONFIRMED` **dopiero** po wiarygodnej informacji od operatora. Redirect klienta nie jest dowodem zapłaty.
7. Bezpieczny wygasający link gościnny (hash w bazie) do szczegółów. Konta klientów dopiero w V2.1.
8. Zmiana i anulowanie zgodnie z regulaminem; zlecenie zwrotu + potwierdzenie operatora.
9. E-mail z outbox i retry, przypomnienie wizyty, retry bez duplikatów. Formularz zapytania pozostaje fallbackiem.

### 5.2. Administracja operacyjna

- Kalendarz dzień/tydzień/miesiąc z potwierdzonymi rezerwacjami, holdami, ręcznymi terminami, prywatnymi slotami, dostępnością sprzętu i instruktora.
- Tworzenie rezerwacji telefonicznych z tą samą kontrolą pojemności, zmiany/przeniesienia/anulowania, no-show, zakończenia wizyty, audyt i e-mail.
- Zarządzanie cennikiem, datami obowiązywania, pakietami/dodatkami, dopłatami i zadatkiem z panelu ownera.
- Alerty: płatność bez wolnego slotu, brak webhooka, przekroczony czas queue, konflikt personelu/sprzętu. Uprawnienia owner/manager/employee w każdej akcji serwera.
- Tryb awaryjny: feature flag wyłącza nowe transakcje, zachowuje formularz, istniejące płatności i historię.

### 5.3. Niezmienniki krytyczne

- Limit **graczy, drużyn, sprzętu i obsady** jednocześnie, dla wszystkich kanałów online/telefon/panel.
- Zakaz podwójnej rezerwacji przez izolację transakcji/locking + weryfikację w bazie; testy wielu równoczesnych żądań.
- Rezerwacja prywatna może zostać utworzona tylko w nieprzydzielonym innym klientom slocie.
- Kwoty w integer groszach (`PLN`), migawka ceny i zasad umowy na rezerwacji; klient nigdy nie definiuje ceny.
- Czas UTC w bazie, `Europe/Warsaw` w regułach daty/godzin; poprawność przy zmianie czasu DST.
- Płatność po wygaśnięciu holda nie może powodować overbookingu. Stan `PAYMENT_REVIEW` + refund/obsługa operatora.
- Wersja treści regulaminu i akceptacja zapisywane do każdej rezerwacji.
- Usuwanie kont lub zmiana pakietu nie niszczą historii umów/audytu.

### 5.4. Wersja 2.0 nie obejmuje

Rejestracji klientów, lig, rankingu, drużyn użytkownika, płatnych voucherów, zewnętrznych kalendarzy i SMS. Tylko wyraźnie zatwierdzony scope może to zmienić. Ręczne rezerwacje i pojemność są v2.0, konta klientów v2.1.

---

## 6. Roadmapa dalszych wersji

| Wersja | Funkcje | Stan dziś | Warunek domknięcia |
|---|---|---|---|
| **V1.0** | Marketing, oferta, galeria, kontakt, zapytanie, SEO, cookies, dokumenty | Kod istnieje, biznes/hosting/prawo niezaakceptowane | Prawdziwe dane, legal, Resend, staging, QA i monitoring |
| **V1.5A** | Konta staff, zgłoszenia, panel | Kod istnieje | Wymuszane MFA, integracja DB, uprawnienia, retencja, testy i produkcyjny worker |
| **V1.5B-1** | Dane firmy, wersje, podgląd, publikacja | W kodzie | Test na żywej testowej DB, optimistic locking, fallback snapshot |
| **V1.5B-2** | Opisy, FAQ, istniejące pakiety, SEO części tras | Częściowo ukończone | Dowolne pakiety i dodatki, sekcje, pełne SEO, przywracanie |
| **V1.5B-3** | Galeria z panelu | Podstawy ukończone | Storage obiektowy, kolejność i kategorie dynamiczne, zgody/EXIF, publikacja atomowa |
| **V1.5B-4** | Harmonogram, blokady dnia i slotu | Podstawy ukończone | Equipment/obsada, wyjątki sezonowe i parametry per data, logika konfliktów |
| **V2.0-pre** | Publiczny kalendarz i hold core | **W kodzie, bez checkoutu** | Prawdziwe testy DB, jedno źródło dostępności, otwarte decyzje domenowe |
| **V2.0** | Gościnna rezerwacja, płatność zadatku, panel operacyjny | Nieukończone | Pełny checkout sandbox i produkcyjne potwierdzenie, 0 overbooking |
| **V2.1** | Konta klientów, historia wizyt, powiązanie gościnnych rezerwacji | Nie rozpoczęto | IDOR, prywatność, weryfikacja e-mail |
| **V2.2** | Profile zawodników, zakładanie drużyn, skład, zaproszenia, kapitan | Nie rozpoczęto | Spójność limitu składu i uprawnień |
| **V2.3** | Oficjalne mecze 2–4 drużyn, protokół, wyniki, rankingi | Nie rozpoczęto | Zatwierdzone reguły punktacji, spory i audyt wyniku |
| **V3.0** | Sezony, turnieje, mistrzostwa, finały, nagrody roczne | Nie rozpoczęto | Zatwierdzony regulamin ligi, test pełnego sezonu |

**Przyszłość ligi:** `/liga` publiczne rankingi i wydarzenia; w koncie gracza osobny moduł drużyn, zaproszenia z wygasaniem; sędzia/organizator jako rola w turnieju, nie `User.role`. Ranking tylko z potwierdzonych wyników; statystyki trafień tylko jeśli faktycznie są zbierane i weryfikowane.

---

## 7. Technologia i dane — bieżąca architektura oraz brakujące warstwy

**Obecne:** Next.js 16.4.5, React 19.3.1, TypeScript 5.9.3, Tailwind v4, Better Auth 1.7.18, Prisma 6.19.3, PostgreSQL, Resend, opcjonalny Redis/Upstash; Vitest, Playwright, Lighthouse, CodeQL, Dependabot; Node 24 w CI.

**Prisma obecnie:** `User`, `Session`, `Account`, `Verification`, `Inquiry`, `InquiryNote`, `InquiryHistory`, `NotificationOutbox`, `StaffAudit`, `BusinessProfile`, `BusinessContact`, `BusinessSettings`, `SiteContent`, `GalleryCatalog`, `ScheduleCatalog`, `ContentRevision`, `ConfigChangeAudit`, `CapacityHold`.

**Brakujące dopiero w V2.0:** `Booking`, `BookingGroup`, `BookingItem`, `BookingStatusHistory`, `PriceVersion`, `PaymentAttempt`, `PaymentEvent`, `Refund`, `TermsAcceptance`, `GuestAccessToken`, `IdempotencyKey`, inbox/outbox dla płatności, warianty planowanych zasobów. Dokładną strukturę dobrać po uzgodnieniu domeny, nie dodawać pustych modeli przed zatwierdzeniem.

**Brakujące później:** `CustomerProfile`, `BookingCustomerLink`, `PlayerProfile`, `Team`, `TeamMembership`, `TeamInvitation`, `Match`, `MatchResult`, `RankingRuleVersion`, `Season`, `Tournament`, `SeasonAward` itd.

**Wymagane technicznie uzupełnienia:**

- Trwały, współdzielony storage dla zdjęć w hostingu z wieloma instancjami/efemerycznym FS (obecnie `storage/gallery` oraz `public/gallery/managed` na lokalnym dysku serwera). Upload + DB publish w jednym procesie nie daje atomowości bazodanowej i plikowej.
- Jeden kontrolowany mechanizm optimistic locking dla draft/publish wszystkich modułów; przywracanie opublikowanych wersji i strategia last-known-good.
- Wspólny rate-limit dla logowania; Upstash lub równoważny dla zapytań i logowania po zatwierdzeniu dostawcy. W PR #36 zabezpieczono produkcję przed `INQUIRY_STORE=memory` oraz dodano unikalny indeks ownera. Nie traktować limitu w pamięci jednej instancji jako ochrony rozproszonej.
- Outbox: trwały worker/scheduler, retry, backoff, lease/claim i deduplikacja; alerty; `POST /api/inquiry` nie powinien zwracać błędu po trwałym przyjęciu zgłoszenia z powodu awarii późniejszej wysyłki.
- Cache invalidation stron i SEO po publikacji, bez konieczności deployu; dynamiczne dane firmy nie mogą cofać się do starych stałych po awarii DB.
- Monitoring, backup, test restore, procedury na awarię i bezpieczne środowiska staging/production.

---

## 8. Główne błędy, konflikty i blokery

| Priorytet | Obserwacja | Dowód / zakres naprawy |
|---|---|---|
| **P0** | Publiczna polityka prywatności błędnie twierdzi, że zapytania nie trafiają do bazy | `src/app/polityka-prywatnosci/page.tsx` sekcja „Brak bazy zapytań” vs `Inquiry` i `POST /api/inquiry`; tekst roboczy musi zostać prawnie zatwierdzony |
| **P0 (prod)** | MFA dla staff nie jest wymuszane | `User.mfaEnrolled` samo w sobie nie implementuje 2FA; Better Auth ma hasło/sesję |
| **P0 (prod)** | Brak udowodnionego prawdziwego Resend, produkcyjnej bazy, storage, backup/restore i monitoringu | W repo są adaptery i runbooki, nie dowody gotowej infrastruktury |
| **P1** | `main` niechroniony | API GitHub: `protected:false` — włączyć wymagane PR, checks, review, blokadę force-push |
| **P1** | `AGENTS.md`, `README.md`, `V1_DEPLOYMENT_RUNBOOK`, `strona1_0.md`, raporty etapu mają sprzeczne statusy | Instrukcja agenta zakazuje CMS, który już jest wdrożony; stare dokumenty opisują no-DB albo grid galerii. Oznaczyć jako historyczne, nie kasować |
| **P1** | Brak testu pełnego przepływu staff/CMS/inquiry na prawdziwym PostgreSQL | PR #36 **dodał pojedynczy test współbieżności holdów PostgreSQL** w jobie `database`; nadal brak pełnego E2E owner/CMS/inquiry na DB |
| **P1** | Brak odpornych na równoległość publish/undo | Draft/publish upserts czytają wersję przed zapisem, ale nie stosują atomowego compare-and-swap |
| **P1** | Dysk serwera jako storage galerii | Nie działa niezawodnie na serverless/multi-instance, bez trwałego object storage |
| **ROZWIĄZANE W PR #36** | Sukces formularza po błędzie notify | Zapis jest w osobnym `try`; błąd `dispatchInquiryNotification` nie zamienia zapisanego zgłoszenia w 503. Dalszy worker/outbox wciąż wymaga hardeningu |
| **P1** | `checkoutReadiness` zawsze OFF — prawidłowo, ale brak pełnej rezerwacji | Przypadkowo nie usuwać gate; wymagane ceny, zadatek, regulamin, operator i wiele innych otwartych decyzji |
| **P1** | Kalendarz oferuje tylko jedną drużynę maks. 8 graczy | Zatwierdzenie większych grup 9–32 i procesu łączenia w D-20/D-21; nie udawać obsługi pełnych 32 dla jednego klienta |
| **P1** | Dostępność liczy holdy, nie realne bookings | Odzwierciedla wyłącznie częściową informację. W v2 dodać oficjalny model i wspólną kalkulację źródeł |
| **P1** | Dzień może mieć `undecided` bez opublikowanych otwartych weekday | Wymaga decyzji D-16 i publikacji harmonogramu |
| **P1** | Powtarzalne/długotrwałe idempotency fingerprint zgłoszenia | Sprawdzić czy identyczne nowe zapytanie może być mylnie zduplikowane; rozdzielić biznesowe nowe zgłoszenie od retry requestu |
| **P2** | CMS i galeria nie w pełni elastyczne | 3 identyfikatory pakietów, ograniczenia liczby atrakcji/FAQ; max 12 zdjęć, 3 stałe kategorie |
| **P2** | Historia audytu bez diff i restore | `/panel/historia` ostatnie 40 zdarzeń, do rozbudowy w osobnym PR; PR #35 do weryfikacji |
| **P2** | CSP `Report-Only`, SEO flagą wyłączone, nieustalony provider analityki | Staging/raporty CSP, decyzja o indeksacji i dostawcy, WCAG manual |
| **P2** | Otwarte major dependency upgrades | TypeScript #7 CI fail; ESLint #6 / Prisma #33 bez automatycznego merge |

**Nie maskować błędów przez `overflow-x:hidden`, wyłączenie testów lub wprowadzenie fake danych.**

---

## 9. Warunki uruchomienia produkcyjnego

### 9.1. Staging / operacje

- Potwierdzona domena, hosting, wspierany Node, PostgreSQL, SSL, oddzielne staging/prod, sekrety poza repo, poprawne migracje.
- Resend: rzeczywista weryfikacja nadawcy, SPF/DKIM/DMARC, odbiorca, test inbox i retry.
- Trwały storage z optymalizacją zdjęć, kopią, polityką usunięć i ochroną plików nieopublikowanych.
- Backup PostgreSQL, próba restore, przyjęte RPO/RTO, monitoring, alerty, logi bez danych osobowych.
- MFA pracowników, wspólny limit, sesje, polityka resetu i przyznawania uprawnień.
- Włączone protected branch, wymagane statusy CI i przeglądy.
- Testy E2E na **staging i bazie testowej** obejmujące owner, CMS, galerię, harmonogram, inquiry, nie tylko anonimizowane makiety.

### 9.2. Materiały i compliance

- Potwierdzone dane firmy, telefon, e-mail, lokalizacja/pin, rodzaj działalności, właściciel przetwarzania danych.
- Zatwierdzone opisy i zdjęcia (w tym zgody osób), wiek minimalny, zasady bezpieczeństwa, zasady pogodowe, regulamin, polityka prywatności i cookies.
- Zatwierdzony retencyjny okres danych zgłoszeń, dostawcy i miejsca przetwarzania danych. Nie usuwać danych klientów bez formalnej procedury i podstawy.
- Wyłącznie prawdziwe opinie i dowody ich publikacji.
- Włączenie indeksacji i analityki **dopiero** po wydaniu zgody na start.

### 9.3. Premiera płatności (dodatkowa bramka V2.0)

- Ceny pakietów/dodatków, podatki, zadatek, dopłata prywatna, saldo, zasady zwrotów/pogody, operator, regulamin sprzedaży i usuwanie danych zatwierdzone.
- Działające, jednoznaczne reguły minimum drużyn, horyzontu rezerwacji, hold duration, sprzętu i instruktorów.
- Zero overbookingu w testach równoległości z prawdziwym PostgreSQL; ważność hold/checkout, wiarygodny podpisany webhook, idempotencja i rekonsyliacja.
- Wyłączanie checkoutu bez kasowania rezerwacji, test przelewu kontrolnego i zwrotu, obsługa awarii operatora i workera.

---

## 10. Rejestr decyzji — status na dzień audytu

**Zatwierdzone U-01…U-10:** drużyna 8; mecz 2–4; 32/slot; start 08/11/14; 120 min gry i 60 min bufora; współdzielenie/prywatny slot; blokada dnia/slotu; trzy kolory; edycja danych biznesowych przez ownera.  
**U-11 WSTĘPNE:** co do zasady brak zwrotu z powodu zwykłego pogorszenia pogody; **wymaga oceny prawnej, wyjątków dla zagrożeń i odwołania przez obiekt**.

**36 decyzji D-01…D-36** zachowano w osobnym pliku tej paczki `STREFA29_DECYZJE_DO_USTALENIA.md` z datą i priorytetem. **Żadna niewprowadzona wartość nie jest „ustalona” tylko dlatego, że istnieje kolumna w bazie.**

Priorytety decyzji: P0 przed publikacją (firma, telefon/e-mail, wiek, prawo, hosting, MFA, poczta i retencja), P0 przed checkoutem (cennik/zadatek/dopłata/zwroty/operator, sprzęt/obsada, hold/minimum i zasady), P2 dla ligi (punkty, nagrody, format turniejów).

---

## 11. Mapa wszystkich dokumentów źródłowych — co zachować, co oznaczyć jako historyczne

### 11.1. Dokumenty nadrzędne i rejestry

| Źródło | Rola po konsolidacji | Działanie |
|---|---|---|
| `docs/STREFA29_NOWA_ROADMAPA_I_PLAN_WERSJI_2026-11-06.md` | Opis wymagań docelowych i reguł właściciela | Zachować, wskazać nowy master plan i status implementacji |
| `docs/STREFA29_REJESTR_DECYZJI_DO_USTALENIA.md` | Kanoniczny rejestr decyzji U/D | Aktualizować wraz z nową kopią checklisty; nie utrzymywać sprzecznych wartości |
| `docs/open-decisions.md` | Skrót decyzji dla agentów | Link do pełnego rejestru; nie robić drugiego niezależnego źródła |
| `docs/ROADMAP_AKTUALIZACJA_2026-11-06.md` | Historyczny opis porządkowania PR #11–#15 | Oznaczyć jako archiwalny, bo PR-y już w `main` |
| `PLAN_BUDOWY_STRONY_STREFA_29.md` | Oryginalna wizja i plany strategiczne | Zachować jako historyczne źródło inspiracji, wersjonowanie z master planu |
| `strona1_0.md` | Dawna granica „tylko e-mail i brak bazy” | Zachować z adnotacją: architektura zmieniona przez 1.5A i 1.5B |
| `strona2_0.md` | Szczegółowa domena rezerwacji, płatności, security | Zachować; szczegółowa technika nadal przydatna, historyczne zapisy o braku CMS zastępuje master plan |

### 11.2. Dokumenty funkcji i wdrożeń

| Źródło | Wnioski i status |
|---|---|
| `docs/V15B_01_IMPLEMENTATION_REPORT.md` | Dane firmy CMS wdrożone; raport historycznej gałęzi, nie jest listą bieżących PR |
| `docs/V15B_02_IMPLEMENTATION_REPORT.md` | Edytor FAQ, 3 pakietów, atrakcji i SEO części tras; ograniczenia nadal realne |
| `docs/V15B_03_IMPLEMENTATION_REPORT.md` | Galeria z panelem, pliki na FS, ograniczenia publikacji; wymagane object storage |
| `docs/V15B_04_IMPLEMENTATION_REPORT.md` | Dni i zamknięcia; dalsze zasoby/sprzęt/obsada brak |
| `docs/V20_01_IMPLEMENTATION_REPORT.md` | Początkowy widok dostępności; **nowa wersja ma już holdy i 3 tryby widoku** |
| `docs/V20_02_IMPLEMENTATION_REPORT.md` | Core holdów i niezatwierdzone `holdMinutes`; brak pełnych testów na prawdziwym PG |
| `docs/V20_02B_PRIVATE_SLOT_CAPACITY.md` | Prywatny hold logicznie zużywa cały slot |
| `docs/V20_03_CHECKOUT_GATE.md` | Blokada checkoutu, nadal aktywna |
| `docs/V20_04_WEEK_VIEW.md`, `docs/V20_04B_DAY_VIEW.md` | Przełączniki tygodnia i dnia |
| `docs/V20_05_SAME_MONTH_ALTERNATIVES.md` | Propozycje do trzech późniejszych dni w bieżącym miesiącu |
| `docs/V20_06_OWNER_HOLD_NOTES.md` | Właściciel widzi anonimowe holdy i powody zamknięcia |
| `docs/V20_07_INQUIRY_SLOT.md` | Kalendarz przekazuje dane do formularza zapytania |
| `docs/V20_08_INQUIRY_TODAY.md` | Dzień bieżący akceptowany, przeszłe nie |
| `docs/V20_09_INQUIRY_SLOT_TIME.md` | Godzina opublikowanego slotu jako preferowany czas formularza |
| `docs/V20_10_AUDIT_HISTORY.md` | Historia 40 zmian, bez pełnego diff/restore; PR #35 do weryfikacji |
| `docs/STREFA29_LEAGUE_ROADMAP.md` | Model kont, drużyn, wyników i rankingu — przyszłe 2.1–3.0 |

### 11.3. Raporty operacyjne i jakościowe

| Źródło | Wnioski i aktualizacja |
|---|---|
| `docs/BRAKI_DANYCH_DO_ZATWIERDZENIA.md` | Potrzebne dane właściciela i zgody, połączyć z rejestrem D-01…D-36 |
| `docs/GALERIA_SELEKCJA.md` | Selekcja trzech zdjęć i pending bez zgód; tekst o „siatce” jest historyczny, dziś Coverflow |
| `docs/RAPORT_NAPRAW_2026-11-06.md` | Wczesne poprawki i pomiar CI; liczby testów historyczne |
| `docs/V1_GAP_ANALYSIS.md` | Historyczne P0/P1 i wcześniejszy stan galerii i bez DB; nie używać do wyznaczenia obecnych funkcji |
| `docs/V1_RELEASE_CHECKLIST.md` | Nadal przydatna lista niezatwierdzonych danych i QA; zaktualizować o realną bazę/MFA/storage |
| `docs/V1_DEPLOYMENT_RUNBOOK.md` | **Przestarzały w kwestii braku bazy i rezerwacji**; konieczna wersja obejmująca Prisma, publikację CMS i recovery |
| `docs/STAFF_PANEL_ARCHITECTURE.md` | Właściwy fundament auth/roles, ale nazwy gałęzi historyczne |
| `docs/STAFF_PANEL_SECURITY.md` | Ryzyka MFA i limit pamięci nadal ważne |
| `docs/STAFF_PANEL_SETUP.md` | Konfiguracja PG, Auth, bootstrap, Resend; aktualizować sekrety i runbook pod production |
| `docs/STAFF_PANEL_TEST_REPORT.md` | Historyczne wyniki unit i brak prawdziwego DB E2E; testy CI zmieniły się |

### 11.4. Instrukcje agentów i kodu

- `README.md` opisuje starą V1 jako „e-mail bez rezerwacji” i „v2 jeszcze niezaimplementowane” — przywrócić zgodność z obecną bazą, panelem i kalendarzem.
- `AGENTS.md` ma zakaz prac nad CMS V1.5B, choć CMS jest już częściowo wdrożony. Wprowadzić **snapshot aktualnych modułów i task-scoped restrictions**, nie ogólny zakaz.
- `.cursor/rules/` i `.cursor/skills/` sprawdzić pod kątem duplikatów z globalkami, historycznych nazw PR i ograniczeń.
- Stare plany i raporty pozostają w repo, z nagłówkiem `HISTORICAL — superseded by docs/STREFA29_MASTER_PLAN.md`, nie kasować dowodów projektowych.

---

## 12. Szczegółowy plan pracy dla Cursor Agent

Jedynym aktywnym backlogiem jest `STREFA29_CURSOR_ROADMAP_TODO.md` (ta paczka). W tym pliku znajdują się wszystkie zadania `[ ]`, identyfikatory, zależności, warunki odbioru, odpowiedzialny i plan PR. Poniżej krótka sekwencja, którą Cursor ma respektować.

**Sprint 0 — prawda o projekcie i bezpieczeństwo:** zsynchronizować dokumentację, poprawić nieprawdziwą politykę prywatności (bez arbitralnego wyboru treści prawnych), uzupełnić ochronę repo, triage podatności, zabezpieczyć procesy; raport konkretnego commita.

**Sprint 1 — staff i PostgreSQL:** MFA, wspólny rate-limit, test pełnego zalogowania i sesji na prawdziwej bazie, bezpieczna obsługa zgłoszeń, asynchroniczna poczta, retencja zatwierdzona.

**Sprint 2 — CMS hardening:** optimistic locking, diff/restore, last-known-good, pełne E2E draft/publish, aktualizacja metadata, elastyczne pakiety i treści.

**Sprint 3 — galeria i harmonogram:** object storage, upload/preview/publish, EXIF/zgody, kategorie i kolejność; zasoby, personel i terminy bez kolizji.

**Sprint 4 — realna dostępność/booking foundation:** dopiero po zatwierdzonych decyzjach zasobów i hold; prawdziwe PG concurrency; wspólny model slotów, booking/manual, powiązanie hold z organizatorem.

**Sprint 5 — checkout/payments:** dopiero po zatwierdzonych cennikach/zadatku/regulaminie/PSP; inkrementalnie payment adapter, webhook inbox, refund, reconciliation, e-mail i feature flags.

**Sprint 6 — launch and operate:** staging, dane/zdjęcia, prawdziwe płatności kontrolne, backup/restore, monitoring, noindex→index tylko na zgodę.

**Sprint 7+ — customer/league:** konta 2.1, drużyny 2.2, rankingi 2.3, zawody 3.0, bez wdrażania ich „na zapas”.

---

## 13. Definicja wykonania (Definition of Done)

Każdy PR powinien zawierać: cel i zakres, linki do wymagań/TODO, listę zmienionych plików, migracje backward-compatible, testy na prawdziwym PostgreSQL gdy dotyczy, testy jednostkowe, E2E, screenshots UI przy zmianach graficznych, zagrożenia, instrukcję konfiguracji, rollout/rollback, wpływ na użytkownika i decyzje ownera, wyniki GitHub Actions. Niewykonane testy oznaczać `NOT RUN`, nie `PASS`.

**Minimalna bramka CI:** `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:coverage`, `npm run build`, `npm run test:e2e`, `npm run lhci`, `npx prisma migrate deploy` na testowym PostgreSQL. Osobna kontrola zależności produkcyjnych `npm audit --omit=dev` i triage reszty.

**Zasady zmian:** zawsze gałąź z najnowszego stabilnego `main`; przed kodem `git status`, kontrola aktywnego PR i niezapisanych prac, żadnego `git reset --hard` / `push --force`, niedodawania niezatwierdzonych cen, nowych osób i adresów, żadnego `merge` ani deploy bez decyzji właściciela. Zmienione rzeczy na publicznej stronie muszą mieć zatwierdzoną, opublikowaną wersję.

**Kryterium gotowości komercyjnej:** zero znanych blockerów P0, prawdziwy staging/production i dane właściciela, prawidłowa pojemność i płatności przetestowane end-to-end, podpisana lista go/no-go.

---

## 14. Ścieżki i źródła w GitHub

- Kod: https://github.com/MagicMikky/strefa-57/tree/main
- Dokumentacja: https://github.com/MagicMikky/strefa-57/tree/main/docs
- Obecna roadmapa: https://github.com/MagicMikky/strefa-57/blob/main/docs/STREFA29_NOWA_ROADMAPA_I_PLAN_WERSJI_2026-11-06.md
- Rejestr decyzji: https://github.com/MagicMikky/strefa-57/blob/main/docs/STREFA29_REJESTR_DECYZJI_DO_USTALENIA.md
- Prisma: https://github.com/MagicMikky/strefa-57/blob/main/prisma/schema.prisma
- Kalendarz: https://github.com/MagicMikky/strefa-57/blob/main/src/components/availability-calendar.tsx
- Silnik holdów: https://github.com/MagicMikky/strefa-57/blob/main/src/lib/holds/store.ts
- Blokada checkout: https://github.com/MagicMikky/strefa-57/blob/main/src/lib/business/checkout-gate.ts
- Galeria CMS: https://github.com/MagicMikky/strefa-57/blob/main/src/app/panel/(app)/galeria/page.tsx
- Polityka prywatności: https://github.com/MagicMikky/strefa-57/blob/main/src/app/polityka-prywatnosci/page.tsx
- CI poprzedniego commita: https://github.com/MagicMikky/strefa-57/actions/runs/42297023825
- CI najnowszego `main` (stan w toku podczas audytu): https://github.com/MagicMikky/strefa-57/actions/runs/42302555610
- PR #36: https://github.com/MagicMikky/strefa-57/pull/36

*Ostatnia aktualizacja audytu: 6 listopada 2026. Zawsze sprawdzać nowszy `main` przed wdrażaniem TODO.*
