# Paintball Strefa 29 — todos Cursor

Data: 2026-11-06. To jest lista pracy po analizie repozytorium. Nie zastępuje planu nadrzędnego ani rejestru decyzji.

Źródła nadrzędne:

- `docs/STREFA29_NOWA_ROADMAPA_I_PLAN_WERSJI_2026-11-06.md` — kolejność wersji.
- `docs/STREFA29_REJESTR_DECYZJI_DO_USTALENIA.md` — pełny rejestr decyzji.
- `docs/open-decisions.md` — skrót decyzji technicznych.
- `strona1_0.md`, `strona2_0.md`, `AGENTS.md`.

Nieśledzony `plan_codex.md` ma nieaktualną część Git. Nie commitować go razem z tą listą. Nie commitować archiwów audytu, kopii roadmapy, `gallery/`, `layout/` ani `.cursor/`.

Zasady tej listy:

- Nie wymyślać telefonu, e-maila, NIP, wieku, regulaminu, praw do zdjęć, cen, zadatku, zwrotów, operatora płatności ani liczby zestawów.
- Nie włączać checkoutu, kont klientów, drużyn, rankingów ani ligi.
- Nie scalać Prismy 7, TypeScripta 7 ani ESLinta 10.
- Nie wdrażać i nie scalać pull requestów bez wyraźnej zgody.
- Nie cofać logowania pracowników ani skrzynki zgłoszeń.

## Stan sprawdzony 2026-11-06 wieczorem

- [x] `origin/main` zawiera kalendarz dostępności i linki do zapytania (PR #31, `67ae8c5`).
- [x] `origin/main` zawiera squash logowania pracownika (`89a89e6`, PR #34).
- [x] Na `main` weszły też Dependabot #8 i #10. Zostawić je. Nie dokładać majorów Prismy, TypeScripta i ESLinta.
- [x] Checkout w `src/lib/business/checkout-gate.ts` zwraca `enabled: false`.
- [x] Lokalny właściciel `kopik1230` istnieje tylko w lokalnym PostgreSQL 17. CI używa PostgreSQL 16.
- [x] Token bootstrapu został usunięty z lokalnego `.env`. Hasło nie jest w repozytorium.
- [x] Commity ochronne są w otwartym PR #36 (`feature/staff-guards`), nie na `main`. Scalenie czeka na zgodę.

## Błędy i niezgodności

- [x] **B-01.** Ochrona logowania i zgłoszeń jest w PR #36. Na `main` wejdzie dopiero po zgodzie na scalenie.
- [x] **B-02.** PR #35 zamknięty bez scalania.
- [x] **B-03.** Job `database` w PR #36 uruchamia test współbieżności holdów na PostgreSQL 16. Atrapa w `src/lib/holds/store.test.ts` zostaje jako test jednostkowy.
- [ ] **B-04.** Limit formularza (`src/lib/rate-limit.ts`) i limit logowania Better Auth są w pamięci procesu. Kilka instancji nie dzieli licznika.
- [x] **B-05.** Zapis zgłoszenia i oznaczenie powiadomienia są rozdzielone w PR #36. Błąd oznaczenia nie zwraca już 503 po udanym zapisie.
- [x] **B-06.** Wyłączone konto dostaje 401 przed utworzeniem sesji. Zmiana jest w PR #36.
- [x] **B-07.** Indeks jednego właściciela jest w PR #36, na lokalnej bazie i w jobie PostgreSQL 16. Na `main` wejdzie po scaleniu.
- [ ] **B-08.** Brak MFA (D-27). Panel nie może iść do publicznej sieci przed decyzją i wdrożeniem.
- [ ] **B-09.** Retencja (`DATA_RETENTION_DAYS`) nie jest ustalona. Zadanie retencji ma nadal nic nie usuwać.
- [ ] **B-10.** Dane publiczne są niezatwierdzone: nazwa prawna, NIP, telefon, e-mail, dojazd, prawa do zdjęć, wiek, regulamin, opinie (D-01, D-02, D-03, D-04, D-24, D-25, D-30, D-36).
- [ ] **B-11.** Hosting, storage zdjęć, backup i środowiska nie są wybrane (D-26). Lokalny `storage/gallery` nie jest magazynem produkcyjnym.
- [ ] **B-12.** Drzewo robocze ma śmieci: archiwa audytu, kopie roadmapy, `gallery/`, `layout/`, `.cursor/`, `plan_codex.md`. Zostają poza commitami.

Obserwacje z wcześniejszej kontroli. Nie były powtarzane tego wieczoru, więc nie oznaczać ich jako świeżo potwierdzone:

- [x] Trzy testy layoutu E2E przekroczyły timeout, a runner na Windows nie zamknął serwera. Powtórzone jako 64 przypadki na buildzie; proces zakończył się kodem 0.
- [x] `npm run lhci` dokończony 2026-11-06. Strona główna 72/100/100/69, oferta 74/100/100/69, zapytanie 71/100/100/69, kontakt 93/100/100/69 (wydajność, dostępność Lighthouse, praktyki, SEO). SEO 69 to ostrzeżenie lokalnego HTTP i wyłączonej indeksacji, nie błąd progów. To nie jest deklaracja WCAG.
- [x] `npm audit --omit=dev` na czystym `npm ci`: 3 high, nie 6. Łańcuch to `deepmerge-ts` w Prismie. Major 7.10.1 nie został włączony.
- [x] `public/logo.png` ma 262 KB po zmniejszeniu z 1,86 MB. Hero ma `priority`.
- [x] Hydratacja pulpitu przy `Stat` nie wraca w zwykłej przeglądarce po zalogowaniu. Różnica w nakładce Cursora to `data-cursor-ref`.

## Usprawnienia po zamknięciu blokerów

- [ ] Optimistic locking draftów firmy, treści, galerii i harmonogramu. Konflikt ma mówić, że wersja się zmieniła, a nie cicho nadpisywać.
- [ ] Podgląd publikowanej strony albo jasna nazwa obecnego ekranu jako porównania danych.
- [ ] Dodawanie, usuwanie i sortowanie FAQ. Bez pól cenowych do czasu D-05 i D-06.
- [ ] Wspólny storage galerii po D-26. Nie publikować zdjęć z osobami ani surowych MP4 bez D-04.
- [ ] E2E zalogowanego właściciela na bazie testowej oraz sprawdzenie 375, 768, 1280 i 1440 px.
- [ ] Indeksacja, canonical i Core Web Vitals dopiero po zatwierdzonym publicznym HTTPS i danych firmy.
- [ ] Mniejsze logo i warianty zaakceptowanych zdjęć WebP/AVIF po zatwierdzeniu plików.

## Kolejność pracy

### 1. Porządek gałęzi

- [x] Zamknąć PR #35 bez scalania. Historia i login są już na `main` przez #31 i #34.
- [x] Wystawić pull request #36 z gałęzi `feature/staff-guards` na `main`. Zawiera testy sesji, indeks jednego właściciela, blokadę pamięciowego magazynu oraz poprawki zgłoszenia i wyłączonego konta.
- [ ] Nie scalać #36 i nie wdrażać, dopóki nie ma wyraźnej zgody. Pull request jest otwarty.
- [x] Job `database` pull requestu #36 przeszedł na czystym PostgreSQL 16: migracje, w tym jeden właściciel, i test współbieżności holdów. Lokalnie ten sam test przeszedł na PostgreSQL 17.

### 2. Zgłoszenia i logowanie

- [x] Rozdzielić błąd zapisu zgłoszenia od błędu powiadomienia w `src/app/api/inquiry/route.ts`.
- [x] Dodać test: zapisany rekord zostaje, a klient dostaje 200, gdy oznaczenie powiadomienia rzuca błąd.
- [x] Odrzucać wyłączone konto już w `POST /api/staff/sign-in`, zanim powstanie sesja. Odpowiedź zostaje 401, bez ujawniania stanu konta.
- [x] Dodać w CI test współbieżności holdów na PostgreSQL 16. Lokalnie ten test przeszedł. `createCapacityHold` nadal odrzuca pusty czas trwania. Publicznego przycisku tworzenia holda nie dodano.

### 3. Zostawić zablokowane

Przejrzane 2026-11-06. Żadna z tych pozycji nie dostała wymyślonej wartości.

- [ ] MFA, odzyskiwanie dostępu i urządzenia zaufane — czeka na D-27.
- [ ] Macierz ról owner / manager / employee — czeka na D-28.
- [ ] Okres retencji i procedura usuwania — czeka na D-30. Do decyzji purge nic nie kasuje.
- [ ] Wspólny rate limit formularza i logowania — po decyzji o wielu instancjach i magazynie licznika.
- [ ] Hosting, storage, backup, RPO/RTO — D-26.
- [ ] Poczta produkcyjna, SPF, DKIM, DMARC — D-29. Nie wymyślać adresu nadawcy.
- [ ] Dane firmy, kontakt, dojazd, zdjęcia, wiek, regulamin i opinie — D-01, D-02, D-03, D-04, D-24, D-25, D-36.

### 4. Jakość po zgodzie, bez majorów

- [x] Powtórzyć `npm audit --omit=dev` na czystym `npm ci` w katalogu tymczasowym (141 pakietów produkcyjnych). Wynik: 3 high, wyłącznie `deepmerge-ts` < 8 przez `@prisma/config` i `prisma`. Nie użyto `npm audit fix --force`.
- [x] Najniższa poprawka wskazywana przez npm to Prisma 7.10.1, czyli major. Zostaje niezaaplikowana.
- [x] Powtórzyć E2E layoutu na buildzie produkcyjnym. 64 testy (375, 768, 1280, 1440 px, desktop i mobile) przeszły, a proces Playwright zakończył się kodem 0. Serwer startuje przez `npx next`, nie przez `npm`, i port 3010 został zwolniony.
- [x] Logo w nagłówku i w hero jest nad zgięciem. Plik `public/logo.png` zszedł z 1,86 MB (1254 px) do 262 KB (900 px). Hero dostaje `priority`, a `sizes` odpowiadają szerokości na stronie.
- [x] Hydratacja pulpitu sprawdzona na zalogowanym `/panel` zwykłą przeglądarką Playwright. Konsola nie zgłosiła błędu hydratacji. Nakładka w przeglądarce Cursora pokazuje różnicę `data-cursor-ref`, czyli atrybuty dopisane przez narzędzie, nie przez `Stat`. Kodu pulpitu nie zmieniano. Konto testowe zostało usunięte.

### 5. Nie zaczynać

Przejrzane 2026-11-06. Checkout, konta klientów, drużyny, rankingi, liga i publiczna rejestracja pozostają wyłączone.

- [ ] Checkout, zadatek, płatności i zwroty — D-05, D-07, D-09, D-10, D-11, D-12, D-17, D-18, D-25 oraz pozostałe D-05–D-23.
- [ ] Konta klientów 2.1, drużyny 2.2, rankingi 2.3, liga 3.0.
- [ ] Publiczna rejestracja pozostaje wyłączona.
