> Historia. Bieżący plan: `docs/STREFA29_MASTER_PLAN.md`.

# STREFA 29 — CURSOR ROADMAP & EXECUTABLE TODO BACKLOG

**Źródło nadrzędne:** `STREFA29_MASTER_PLAN_2026-11-06.md`  
**Bazowy commit:** `853fa8ee45d34f05014be843736bf13357193f0c` (PR #36, CI weryfikować)  
**Reguła:** przed każdą sesją zweryfikuj `main`, nowe PR i CI. Status zadania ustalaj z aktualnego kodu; nie oznaczaj jako DONE bez testu i linku do PR.  
**Dla Cursor Agent:** wykonuj jeden niewielki PR na raz. Każde zadanie ma ID, właściciela, zależności i mierzalny odbiór. Użytkownik zatwierdza merge, produkcyjne zmiany, publikowanie tekstów prawnych i dane cenowe.

**Znaczenie:** `P0` — blokuje bezpieczny start/produkcyjne dane; `P1` — jakość przed następną funkcją; `P2` — dalszy produkt. `BLOCKED` = brak decyzji właściciela, nie zgadywać. Checklisty są **planem**, nie stwierdzeniem, że brak kodu wskazanej funkcji — przed pracą sprawdź obecny stan.

## SPRINT 0 — dokumentacja, bezpieczna baza i ryzyka bieżące

- [ ] **S0-01 · P0 · Cursor** — `git fetch`, porównanie `main` z GitHub, `git status`, otwarte PR, CI; utwórz `docs/STATUS_YYYY-MM-DD.md` z SHA, źródłami i prawdziwym statusem implementacji. **Odbiór:** dokument linkuje commit i run CI; brak niezweryfikowanych deklaracji.
- [ ] **S0-02 · P0 · Cursor** — dodaj master plan, roadmapę i rejestr do `docs/`; uaktualnij `AGENTS.md`, `README.md` i `.cursor/rules/`, usuń sprzeczny zakaz CMS v1.5B, wprowadź priorytet nowego planu. **Odbiór:** żadna aktywna instrukcja nie nazywa 1.5B „zakazaną” ani nie twierdzi, że brak DB/galerii/CMS.
- [ ] **S0-03 · P1 · Cursor** — skategoryzuj wszystkie starsze plany i raporty jako `ACTIVE-REFERENCE`/`HISTORICAL`/`DONE`, dodaj link do master planu bez kasowania historii. **Odbiór:** wszystkie 31 plików docs mają status w indeksie i brak sprzecznych zaleceń wdrożeniowych.
- [ ] **S0-04 · P0 · Właściciel + Cursor** — popraw oczywistą nieprawdę w `/polityka-prywatnosci`: zgłoszenia są przechowywane w PostgreSQL; uzgodnij z właścicielem prawidłowe podstawy prawne, odbiorców, okres retencji i podpisz wersję finalną. **Odbiór:** tekst odzwierciedla działającą architekturę i jest zatwierdzony; bez samowolnego „zatwierdzenia prawnego”.
- [ ] **S0-05 · P0 · Właściciel (ustawienia GitHub)** — ustaw ochronę `main` z wymaganym PR, quality/browser/database/CodeQL, zakazem force-push i review. **Odbiór:** API branch zwraca `protected: true`; wymuszane kontrole nie pozwalają na czerwony CI. Cursor może przygotować instrukcję, ale nie wykonywać zmian bez zgody.
- [ ] **S0-06 · P1 · Cursor** — sprawdź zamknięty bez merge PR #35 względem `main` i udokumentuj unikalne zmiany vs już scalone; osobno triage #7 TypeScript (CI fail), #6 ESLint, #33 Prisma. **Odbiór:** decyzja dla każdego PR z kompatybilnością, bez zbiorowego/force merge.
- [ ] **S0-07 · P1 · Cursor** — uruchom `npm ci`, `npm audit --json`, `npm audit --omit=dev`; podziel prod/dev/transitive, przygotuj dokument ryzyk i bezpieczne aktualizacje. **Odbiór:** lista konkretnych advisory oraz wpływu na produkcję; nie wykonuj `npm audit fix --force`.
- [ ] **S0-08 · P1 · Cursor** — przeprowadź threat-model pod panel, uploads, inquiry, holdy i przyszły checkout; sprawdź CSP Report-Only, noindex i cache PII. **Odbiór:** tabela zagrożeń, testy i plan poprawek, brak wymuszania CSP bez testów staging.

### Gate S0

Dla prac nad kolejnymi modułami: dokumenty i reguły zaktualizowane, PR-y zidentyfikowane, brak niekontrolowanej publikacji; polityka prywatności prawdziwa **przed** przyjmowaniem danych klientów. Czynności prawne i GitHub wymagają udziału ownera.

---

## SPRINT 1 — bezpieczne konta, zgłoszenia, testy PostgreSQL

- [ ] **S1-01 · P0 · Cursor** — zaprojektuj i wdroż MFA pracowników (owner→manager/employee), onboarding TOTP, bezpieczne kody odzyskiwania, politykę resetu. **Odbiór:** bez potwierdzonego MFA nie da się wejść do chronionego panelu produkcyjnego; recovery i wylogowanie w testach.
- [ ] **S1-02 · P0 · Cursor** — podłącz współdzielony rate-limit logowania (nie `storage:memory` na wielu instancjach); dla inquiry wykorzystaj zatwierdzony store. **Odbiór:** wieloinstancyjny test brute force i blokowania.
- [ ] **S1-03 · P1 · Cursor** — po PR #36 **unikalny indeks ownera już istnieje**; przetestuj migrację na danych z duplikatami, równoległe bootstrapping i recovery przed produkcją. **Odbiór:** dwie równoległe próby nie tworzą dwóch kont owner; migracja nie niszczy danych.
- [ ] **S1-04 · P1 · Cursor** — realne integracyjne testy PostgreSQL: migracje, seed ownera, login, blokowanie sesji, `User.role`, CRUD inquiry i admin IDOR. **Odbiór:** workflow DB uruchamia **testy integracyjne**, nie tylko `prisma migrate deploy`.
- [ ] **S1-05 · P1 · Cursor** — pełne E2E owner/manager/employee na realnym DB, testy autoryzacji, notatek, statusu i przypisywania. **Odbiór:** E2E potwierdza odmowę dostępu i poprawny zapis do bazy.
- [ ] **S1-06 · P1 · Cursor** — poprawka semantyki `POST /api/inquiry` jest **już w PR #36**. Zweryfikuj nowe testy na DB i szczegóły retry outbox; nie implementuj ponownie guardu `try/catch`. **Odbiór:** zapisany inquiry → 200 mimo błędu dispatch/mark, brak zapisu → 503.
- [ ] **S1-07 · P1 · Cursor** — odporny outbox: atomowy claim/lease, retry/backoff, dedupe, scheduler/worker, monitoring i alerty; testy wielu workerów. **Odbiór:** zgłoszenie nie ginie ani nie jest bez kontroli wysyłane wielokrotnie.
- [ ] **S1-08 · P1 · Cursor** — przegląd `dedupeKey` i `Idempotency-Key`; oddziel retry tego samego requestu od nowego, identycznie brzmiącego zgłoszenia złożonego w inny dzień. **Odbiór:** reprodukowalny test nowego zapytania i powtórzonego wysłania.
- [ ] **S1-09 · BLOCKED(D-29) · Właściciel** — zweryfikuj Resend, nadawcę, odbiorcę, SPF/DKIM/DMARC; przetestuj realne dostarczenie, bounce i retry na staging. **Odbiór:** wiadomość dotarła do właściwej skrzynki, brak danych w logach.
- [ ] **S1-10 · BLOCKED(D-25,D-30) · Właściciel + Cursor** — ustal okres retencji, zasady backupów i usuń dane testowe; zaktualizuj proces usuwania i dokumenty prawne. **Odbiór:** retencja i jej brak mają testy, dokument opisuje faktyczne przechowywanie.
- [ ] **S1-11 · P1 · Cursor** — **już poprawione w PR #36**: `INQUIRY_STORE=memory` nie działa w `NODE_ENV=production`. Zostaw test regresyjny i sprawdź fail-closed na środowisku testowym. **Odbiór:** brak zapisu do RAM w produkcji.

### Gate S1

MFA i role sprawdzone, E2E na rzeczywistym PostgreSQL, inbox działa, retry jest bezpieczny, prawdziwa poczta i retencja zatwierdzone przed produkcyjnym uruchomieniem.

---

## SPRINT 2 — CMS dla właściciela, architektura edycji treści

- [ ] **S2-01 · P1 · Cursor** — wspólne optimistic locking/compare-and-swap dla draft i publish w `Business*`, `SiteContent`, `GalleryCatalog`, `ScheduleCatalog`. **Odbiór:** dwie sesje ownera nie nadpisują nowszych zmian po cichu; 409/conflict z UI.
- [ ] **S2-02 · P1 · Cursor** — historyczny diff i restore (bez cofania zapłaconych umów), z wersją i autorem. **Odbiór:** owner przywraca wskazany tekst, audit append-only.
- [ ] **S2-03 · P1 · Cursor** — zabezpiecz fallback na ostatnią opublikowaną wersję przy chwilowym błędzie DB; wyklucz publikację szkicu lub cofnięcie telefonu na starą stałą. **Odbiór:** E2E awaria DB po opublikowanej zmianie.
- [ ] **S2-04 · P1 · Cursor** — test end-to-end „owner: firma → draft → preview → publish → strona publiczna + SEO” oraz FAQ/galeria/schedule na PostgreSQL. **Odbiór:** publicznie wyłącznie published, revalidate bez rebuild.
- [ ] **S2-05 · P1 · Cursor** — katalog pakietów i dodatków w DB z CRUD, sortowaniem i archiwizacją; zachowaj stare ID przy historycznych zgłoszeniach. **Odbiór:** owner dodaje czwarty pakiet bez zmiany kodu, formularz rozpoznaje nowe opublikowane ID; brak fikcyjnych cen.
- [ ] **S2-06 · P2 · Cursor** — pełny CMS treści: atrakcji/sekcji, CTA, hero, opisów podstron, FAQ add/remove/reorder, SEO wszystkich istotnych tras. **Odbiór:** edycja i publikacja z panelu bez deployu, preview zgodny z publicznym UI.
- [ ] **S2-07 · P2 · Cursor** — spójność metadanych `layout`, JSON-LD, OG i nazwy firmy z published profile oraz polityka canonical/noindex. **Odbiór:** aktualizacja nazwy w CMS nie zostawia starej nazwy w metadata.
- [ ] **S2-08 · P2 · Cursor** — audyt UX panelu: etykiety pól, walidacja, focus, responsywność, różnica draft/published, informacja o niepublikowanych zmianach. **Odbiór:** ręczny przepływ 360–1920 px, klawiatura i czytnik ekranu.

### Gate S2

Właściciel może bez kodu zmienić, opublikować i przywrócić zatwierdzone dane biznesowe; podgląd odzwierciedla UI; dane istniejące już w zgłoszeniach zachowane.

---

## SPRINT 3 — galeria i harmonogram biznesowy

- [ ] **S3-01 · P1 · Cursor + Właściciel(D-26)** — zastąp filesystem-based gallery storage trwałym magazynem obiektowym; osobne staging/prod, signed URLs, prawa pliku, retry publikacji, backup. **Odbiór:** zdjęcie nie znika po restarcie/deployu/drugiej instancji, nieopublikowany asset nie jest publiczny.
- [ ] **S3-02 · P1 · Cursor** — proces uploadu/preview/publish/unpublish zgodny z DB, czyszczenie osieroconych assetów, obróbka EXIF, MIME, limit wymiarów i bezpieczne przetwarzanie. **Odbiór:** test awarii między uploadem i DB oraz blokada naruszeń.
- [ ] **S3-03 · P2 · Cursor** — dynamiczne kategorie galerii, kolejność drag/drop lub dostępne przyciski, >12 zdjęć po kontrolowanym paginowaniu, alt, okładka, wersje, prawa. **Odbiór:** owner dodaje kategorię „Najlepsi zawodnicy” i reorganizuje kolejność bez kodu.
- [ ] **S3-04 · BLOCKED(D-04) · Właściciel** — zatwierdź każdy kadr z osobami, rakieta2, filmy, licencje i zgody; opublikuj wyłącznie zaakceptowane. **Odbiór:** ślad zgody/praw na każdy obraz, bez użycia nieweryfikowanych plików.
- [ ] **S3-05 · P1 · Cursor** — harmonogram: wyjątki sezonowe, święta, godziny per data, długość, bufor, powody i wersje; walidacja konfliktów. **Odbiór:** owner blokuje datę i slot, zmiana nie niszczy istniejących zdarzeń.
- [ ] **S3-06 · BLOCKED(D-14,D-15,D-16) · Właściciel** — opublikuj faktyczne dni pracy, liczbę sprawnych kompletów i minimalną obsadę. **Odbiór:** kalendarz przestaje używać stanu „nieustalony” na zatwierdzonym zakresie.
- [ ] **S3-07 · P1 · Cursor** — model dostępności łączy **sloty + liczbę drużyn + equipment + staff**, rezerwacje/holdy i wyjątki; rozróżnia fizyczne od rezerwowalnych miejsc. **Odbiór:** 4 zespoły po 4 → 0 kolejnych drużyn mimo 16 wolnych fizycznych miejsc.
- [ ] **S3-08 · P2 · Cursor** — ręczny wizualny test dostępności: 3 sloty, czerwień/zieleń/niebieski/nieustalone, klik modal, 360/390/768/1024/1440, focus trap, Escape, aria, screen reader. **Odbiór:** brak h-scroll i regresji UI.

### Gate S3

Trwała galeria i zweryfikowane zasoby operacyjne; żaden widok nie obiecuje miejsc, gdy sprzęt/obsada są nieznane.

---

## SPRINT 4 — fundament wiążących rezerwacji bez płatności

> Uruchomienie zależy od decyzji D-14…D-23, szczególnie D-17, D-18, D-20, D-21. Do ich zatwierdzenia można wyłącznie projektować modele/testy, bez aktywnego produkcyjnego endpointu klienta.

- [ ] **S4-01 · BLOCKED(D-17,D-18,D-20,D-21)** — zatwierdź minimum/limit grup, minimalne wyprzedzenie, horyzont, długość hold i łączenie drużyn. **Odbiór:** tabela reguł i daty wejścia w życie.
- [ ] **S4-02 · P1 · Cursor** — model `SlotOccurrence`, `Booking`, `BookingGroup`, `TemporaryHold`, `BookingStatusHistory`, źródło `web/manual`, spójność danych, indeksy. **Odbiór:** migracja bez usunięcia istniejącego `CapacityHold`, plan kompatybilności i rollback.
- [ ] **S4-03 · P1 · Cursor** — PR #36 dodał **jeden** test 2 konkurujących holdów w PostgreSQL; rozbuduj o 2–4 grupy, tryb prywatny, wygasanie, zmianę konfiguracji i współzawodnictwo z bookings. **Odbiór:** 0 overbooking, 0 double-use przy wielu równoległych połączeniach.
- [ ] **S4-04 · P1 · Cursor** — ręczna rezerwacja ownera z tą samą domenową kontrolą pojemności co online. **Odbiór:** podgląd slotów uwzględnia rezerwacje ręczne i online, brak oddzielnych „shadow calendars”.
- [ ] **S4-05 · P1 · Cursor** — booking API i bezpieczny hold z limitem per klient, idempotency, expirations (w v2 staging tylko). **Odbiór:** koniec holda zwalnia miejsce niezależnie od harmonogramu workerów.
- [ ] **S4-06 · P1 · Cursor** — obsługa prywatnego slotu bez wywłaszczenia cudzej grupy; przy zajętości 8 prywatny hold blokuje całe 32. **Odbiór:** test slotu prywatnego i innych grup, również przy równoczesnej rezerwacji.
- [ ] **S4-07 · P2 · Cursor** — UI procesu rezerwacji, który pozostaje wyłączony feature flagą dopóki nie przejdzie S5. **Odbiór:** w produkcji nadal tylko „Zapytaj”; testy E2E na staging.

### Gate S4

Dane zarezerwowanego terminu i limitów są spójne bez operatora płatności. To jeszcze nie oznacza uruchomienia rezerwacji klienta.

---

## SPRINT 5 — checkout, zadatki i płatności (wyłącznie po decyzjach)

- [ ] **S5-01 · BLOCKED(D-05…D-13,D-23,D-25)** — zatwierdź cennik, zakres dodatków, zadatek, dopłatę prywatną, zasady anulowania/zwrotów i pogody, VAT/dokumenty, saldo, operatora i umowy. **Odbiór:** wersjonowane zasady, zaakceptowane przez ownera i doradcę prawnopodatkowego gdzie potrzebne.
- [ ] **S5-02 · P1 · Cursor** — ceny PLN w groszach, wersje, daty obowiązywania, migawki w zamówieniach i zgodność cen. **Odbiór:** update ceny nie zmienia historii klienta.
- [ ] **S5-03 · P1 · Cursor** — adapter wybranego operatora, klient nie przesyła autorytatywnej kwoty, sandbox + retry i rate limit. **Odbiór:** płatność tylko dla istniejącego, ważnego holda.
- [ ] **S5-04 · P0 · Cursor** — podpisany webhook na surowym body, idempotentny inbox, poprawność kwoty/waluty/środowiska, zdarzenia w złej kolejności. **Odbiór:** duplikat nie tworzy drugiej rezerwacji, late-payment nie powoduje nadrezerwacji.
- [ ] **S5-05 · P1 · Cursor** — statusy payment/refund/booking, `PAYMENT_REVIEW`, chargeback, częściowy/pełny zwrot i rekonsyliacja z operatorem. **Odbiór:** symulacja udanej/opóźnionej/odrzuconej płatności oraz zwrotu na sandbox.
- [ ] **S5-06 · P1 · Cursor** — potwierdzenia, przypomnienia, prośby o przeniesienie, bezpieczne guest-access tokeny w hash, wersja regulaminu na rezerwacji. **Odbiór:** obca osoba nie może otworzyć rezerwacji po numerze ID.
- [ ] **S5-07 · P1 · Cursor** — panel operacyjny rezerwacji: kalendarz, anulowanie, przeniesienie, ręczna rezerwacja, płatności, saldo, audyt, role, eksport CSV bez formula injection. **Odbiór:** pracownik może przeprowadzić pełny cykl bez SQL.
- [ ] **S5-08 · P1 · Cursor** — niezależna flaga wyłączenia checkoutu i holdów bez usuwania rezerwacji; fallback `/zapytaj-o-termin`. **Odbiór:** symulacja awarii operatora bez utraty umów.
- [ ] **S5-09 · P0 · Właściciel + Cursor** — kontrolna płatność i refund na staging i produkcji po zatwierdzeniu. **Odbiór:** zewnętrzny operator i baza zgodne, monitoring działa.

### Gate S5

Brak produkcyjnego checkoutu bez S5-01 oraz prawdziwej transakcji sandbox, ręcznego i automatycznego testu concurrency oraz zatwierdzonego regulaminu.

---

## SPRINT 6 — wydanie produkcyjne i operacje

- [ ] **S6-01 · BLOCKED(D-01,D-02,D-03,D-24,D-25,D-26,D-29,D-30)** — właściciel zatwierdza nazwę, kontakt, pin, wiek, prawo, domenę, hosting, bazę, retencję, pocztę, zdjęcia; sprawdza spójność CMS.
- [ ] **S6-02 · P0 · Cursor/DevOps** — staging i produkcja z izolowanymi secretami, SSL, DB, storage i migracjami. **Odbiór:** potwierdzony rollback aplikacji i bezpieczny stan danych.
- [ ] **S6-03 · P0 · Cursor/DevOps** — PostgreSQL backup/restore, RPO/RTO, alerty (błędy formularza, czas zaległych notify, dostępność DB, worker), logi bez PII. **Odbiór:** rzeczywisty test restore na odizolowanej bazie.
- [ ] **S6-04 · P1 · Cursor** — WCAG 2.2 AA manual z NVDA/VoiceOver, tablet, mobile, keyboard, reduced motion, Lighthouse, CSP i SEO. **Odbiór:** raport realnych urządzeń, nie tylko axe.
- [ ] **S6-05 · P1 · Cursor** — finalna dokumentacja (runbooki, procedury dla właściciela, SMS opcjonalnie), import ręcznych przyszłych terminów przed otwarciem rezerwacji. **Odbiór:** zaakceptowany bilans kalendarza.
- [ ] **S6-06 · BLOCKED(owner approval)** — osobne go/no-go; włączenie `NEXT_PUBLIC_ALLOW_INDEXING`, produkcji i checkoutu tylko na jawne polecenie. **Odbiór:** podpisane checklisty dla publicznej strony i niezależnie dla sprzedaży.

---

## SPRINTY 7–10 — przyszły produkt społecznościowy

### V2.1: konta klientów
- [ ] **S7-01 · BLOCKED(D-31)** — zatwierdź formę rejestracji, weryfikację, prywatność, retencję i opcjonalne MFA klientów.
- [ ] **S7-02 · Cursor** — rozbuduj istniejący Better Auth: publiczny customer sign-up w **odrębnym, ograniczonym przepływie**, bez rozszerzenia `User.role` o uprawnienia staff.
- [ ] **S7-03 · Cursor** — historia rezerwacji, bezpieczne powiązanie rezerwacji gościnnej po weryfikacji, IDOR tests.
### V2.2: drużyny
- [ ] **S8-01 · BLOCKED(D-32)** — nazwy, loga, widoczność, moderacja, kapitan, zmiany składu, max 8 członków startowo.
- [ ] **S8-02 · Cursor** — PlayerProfile/Team/TeamMembership/TeamInvitation; kapitan jako członkostwo, wygasające zaproszenia, prywatność profili.
- [ ] **S8-03 · Cursor** — opcjonalne powiązanie drużyny z rezerwacją i kalendarzem meczów, bez wpływu na starsze zgłoszenia.
### V2.3: mecze i rankingi
- [ ] **S9-01 · BLOCKED(D-33)** — zatwierdź sposób punktacji, format 2–4 drużyn, walkowery, spory, remisy, rankingi indywidualne.
- [ ] **S9-02 · Cursor** — Match/Result + sędzia, potwierdzenie, dispute, audit, powtarzalne przeliczanie rankingu tylko z `confirmed`.
### V3.0: STREFA 29 LEAGUE
- [ ] **S10-01 · BLOCKED(D-34)** — zatwierdź sezony, finały, kryteria nagród i regulamin wydarzeń.
- [ ] **S10-02 · Cursor** — `/liga`, Season/Tournament/Bracket, zgłoszenia drużyn, finały, nagrody i archiwum; bezpieczeństwo ról turniejowych.

---

## Plan Pull Requestów i praca równoległa

| PR (proponowana nazwa) | Zadania | Baza | Bloker |
|---|---|---|---|
| `docs/master-roadmap-sync` | S0-01/02/03 | najnowszy `main` | brak, tylko dokumenty |
| `fix/privacy-notice-db` | S0-04 | `main` | właściciel musi zatwierdzić finalny tekst przed publikacją |
| `security/staff-mfa` | S1-01/02/03 | `main` | D-27 (metoda odzyskiwania) |
| `test/postgres-staff-cms` | S1-04/05 | `main` | testowy PG |
| `fix/inquiry-outbox` | S1-06/07/08/11 | `main` | worker/hosting do produkcji |
| `feat/cms-locking-history` | S2-01/02/03/04 | `main` | DB + testy |
| `feat/dynamic-offer-pages` | S2-05/06/07/08 | `main` | brak cen, dopuszczalna tylko struktura |
| `feat/gallery-object-storage` | S3-01…04 | `main` | D-26, D-04 |
| `feat/schedule-resources` | S3-05…08 | `main` | D-14…16 |
| `feat/booking-domain` | S4-* | `main` | decyzje D-17/18/20/21 itd. |
| `feat/checkout-provider` | S5-* | `main` | D-05…D-13/D-23/D-25 |

**Reguła pracy:** nie rozpoczynać następnego PR na starym branchu z poprzedniego zadania. Niezależne PR mogą powstać równolegle wyłącznie z oddzielnymi worktree i po weryfikacji braków konfliktów. Bez zgody właściciela nie robić merge ani deploy.

## Checklista jakości każdego zadania (nie odhaczać z góry)

- [ ] Zidentyfikowano SHA `main`, zależności i aktualny kod; zadanie nie dubluje już działającego modułu.
- [ ] Każda decyzja biznesowa ma ID i status, a puste wartości pozostają nieustalone.
- [ ] Zmiana kodu ma test jednostkowy oraz integracyjny/E2E adekwatny do ryzyka, także negatywny.
- [ ] `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:coverage`, `npm run build` zakończyły się sukcesem.
- [ ] Zmiany UI: Playwright desktop/mobile, overflow, keyboard, accessibility; `npm run lhci`.
- [ ] Zmiana DB: migracje `prisma migrate deploy` na PostgreSQL i test zgodności danych/rollback.
- [ ] Zmiana auth/PII/płatności: threat-model, odmowa dostępu, brak wycieków do logów.
- [ ] Nie dodano sekretów ani fikcyjnych cen, opinii, zdjęć, zasad zwrotów i danych firmy.
- [ ] Uzupełniono dokumentację i realny wynik CI; PR gotowy do review, nie do automatycznego merge.

