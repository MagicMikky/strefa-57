# Sprint 0 — raport synchronizacji dokumentacji

**Data:** 2026-11-06  
**Zakres:** tylko dokumenty, reguły agenta i opis stanu. Bez zmian produktu, bez merge i bez wdrożenia.  
**Gałąź robocza:** `docs/sprint-0-sync`, oparta o `origin/main`.

## Stan repozytorium

| Pole | Wartość |
|---|---|
| `main` | `14e082d6b09e34daa186526b204be903406e82dd` |
| Poprzedni SHA audytu | `853fa8ee45d34f05014be843736bf13357193f0c` (merge PR #36) |
| Commit po audycie | `14e082d` — notatka audytowa i PNG w `docs/gallery-review/`. Brak nowej funkcji |
| Ochrona `main` | `protected: false` |
| Checkout | `enabled: false` w kodzie tej rewizji |
| PostgreSQL | CI: 16. Lokalny Docker używany wcześniej: 17. Ten sprint nie uruchamiał migracji |

CI `14e082d` zakończone sukcesem: [run 42304528437](https://github.com/MagicMikky/strefa-57/actions/runs/42304528437).  
CI merge #36 też jest sukcesem: [run 42302555610](https://github.com/MagicMikky/strefa-57/actions/runs/42302555610). W chwili pierwszego audytu ten drugi przebieg był jeszcze w toku.

## Pull requesty

| PR | Stan | Unikalna zmiana | CI | Rekomendacja |
|---|---|---|---|---|
| #36 | scalony, `853fa8e` | Jeden właściciel, brak pamięciowego store zgłoszeń na produkcji, zapis zostaje gdy e-mail padnie, nieaktywny pracownik odrzucony przed sesją, test hold na PostgreSQL | quality, browser, database, analyze, CodeQL: success | Zostaje. Nie otwierać ponownie |
| #35 | zamknięty bez merge, 2026-11-06 22:03 UTC | Dwa commity: historia publikacji i login. Oba weszły innymi PR (#32/#31 i #34) | Nie dotyczy po zamknięciu | Zostawić zamknięty. Brak kodu do odzyskania |
| #7 | otwarty | TypeScript 5.9.3 → 7.0.2 | quality **failure**; reszta success | Nie scalać. Major, CI czerwone |
| #6 | otwarty | ESLint 9.39.5 → 10.14.0 | wszystkie wymienione joby success | Nie scalać w tym sprincie. Major, wymaga osobnej zgody i przeglądu reguł |
| #33 | otwarty | Prisma Client 6.19.3 → 7.10.1 | quality, browser, database **failure** | Nie scalać. Major i czerwone CI. `deepmerge-ts` nie ma poprawki w linii 6 |

Żaden z tych PR nie został scalony ani zamknięty przez Sprint 0.

## Co jest na `main`

Strona marketingowa, formularz zapytania zapisujący `Inquiry`, panel pracowników, CMS firmy, treści, galerii i harmonogramu, historia publikacji, kalendarz tygodnia i dnia, propozycje innego dnia, hold pojemności bez publicznej rezerwacji, bramka checkout zawsze wyłączona.

## Co blokuje produkcję

- P0: publiczna polityka mówi „brak bazy zapytań”. Szkic jest w `docs/STREFA29_POLITYKA_PRYWATNOSCI_PROJEKT.md`. Strona nie została zmieniona.
- P0: `main` bez ochrony gałęzi. Ustawienie zostaje przy właścicielu: wymagany PR, statusy quality, browser, database i CodeQL, zakaz force-push.
- P0: brak zatwierdzonych danych administratora, cen, zadatku, zwrotów, operatora płatności i liczby zestawów. Rejestr: `docs/STREFA29_DECYZJE_DO_USTALENIA.md`.
- P0: MFA (D-27) nie jest wdrożone. Logowanie panelu to hasło i sesja.
- P1: wspólny limit zapytań wymaga Redisa. Bez niego limit jest pamięcią jednego procesu.
- P1: hosting, magazyn plików galerii i dowód dostarczenia Resend są nieweryfikowalne z samego repozytorium.
- P1: `npm audit --omit=dev` na `14e082d`: 3 high, wszystkie `deepmerge-ts` przez Prisma 6. Poprawka bez major nie istnieje. PR #33 zostaje otwarty.
- P2: historia panelu nie ma diffu ani przywracania.
- P2: duże PNG w `docs/gallery-review/` zwiększają repozytorium. Sprint ich nie usuwa.

## Niezatwierdzone decyzje

U-11 oraz D-01–D-36 pozostają otwarte tam, gdzie rejestr nie oznacza ich jako zatwierdzony seed. Seed pojemności U-01–U-10 jest wartością startową panelu, nie stałą rezerwacji. Żadna otwarta kwota, retencja ani podstawa prawna nie została wpisana jako fakt.

## Model zagrożeń — pierwszy przebieg, nie pentest

| Obszar | Zagrożenie widoczne w kodzie | Następny krok |
|---|---|---|
| Panel | Hasło i sesja, bez MFA; bootstrap właściciela jest wyłączony po pierwszym koncie | D-27, potem osobny PR |
| Zgłoszenia | Prawdziwe dane w PostgreSQL; polityka na `14e082d` temu zaprzecza | PR #39 publikuje opis techniczny. Podstawa, odbiorcy i retencja zostają puste |
| Limit | Pamięć procesu nie jest wspólna dla wielu instancji | Dodać Redis dopiero z sekretami właściciela |
| Galeria | Pliki z osobami i `rakieta2.jpg` bez potwierdzonych praw | Nie publikować; decyzja właściciela |
| Hold | Jeden test dwóch połączeń na CI | Szersze scenariusze dopiero przy starcie 2.0 |
| Checkout | Bramka zwraca `enabled: false` nawet przy `commercialApproved: true` | Zostawić do D-05–D-23 |
| CSP | Brak wymuszonego CSP | Report-Only dopiero na stagingu, nie w tym sprincie |

## Testy tej sesji

Uruchomione w `D:\Projects\strefa-sprint0-docs` na kodzie `14e082d` plus ta dokumentacja:

| Polecenie | Wynik |
|---|---|
| `npm ci` | exit 0. Audyt instalatora: 20 podatności (8 moderate, 12 high), w tym zależności deweloperskie |
| `npm run typecheck` | exit 0 |
| `npm run lint` | exit 0 |
| `npm test` | exit 0. 28 plików, 122 testy |
| `npm run test:coverage` | exit 0. Statements 77.72% (1225/1576), próg 70% zaliczony |
| `npm run build` | exit 0. Next.js 16.4.5, 19 stron statycznych |
| `npm audit --omit=dev` | exit 1, zgodnie z obecnością advisory. 3 high: `deepmerge-ts` < 8 przez `@prisma/config` i `prisma`, GHSA-ggr8-5vv4-36mx. Poprawka wskazywana przez npm to Prisma 7.10.1, czyli major z PR #33. Nie uruchomiono `npm audit fix --force` |
| `npm run test:e2e` | **NOT RUN**. Zmiana nie dotyka UI |
| `npm run lhci` | **NOT RUN**. Zmiana nie dotyka UI |
| Test hold z `HOLD_PG_TEST=1` | **NOT RUN** lokalnie. Job `database` na `14e082d` w CI jest success |

## Następny mały PR

PR #39, `fix/privacy-notice-db`, publikuje opis techniczny. Podstawa prawna, odbiorcy i retencja nadal wymagają decyzji. Nie zaczynać Sprintu 1.
