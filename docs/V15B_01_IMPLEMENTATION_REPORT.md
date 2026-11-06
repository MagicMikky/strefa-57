# V1.5B-1 — fundament panelu właściciela

Data: 2026-11-06. Gałąź: `feature/owner-cms`. Baza: `feature/gallery-coverflow` (PR #14, zielone CI) plus treść `docs/product-roadmap` (PR #15).

## Przeprowadzone zmiany

Właściciel może zapisać wersję roboczą danych firmy i opublikować ją z PostgreSQL. Publiczna witryna czyta wyłącznie wiersz `published`. Zmiana nie wymaga przebudowania aplikacji: publikacja wywołuje `revalidatePath` dla układu strony, kontaktu, dojazdu i formularza zapytań.

Nie dodano rezerwacji, płatności, kont klientów, edytora podstron, cen, zadatku ani liczby zestawów.

## Architektura

Istniejący Better Auth, Prisma i role `owner` / `manager` / `employee` zostają jedynym systemem kont. Nowe uprawnienie `business.publish` ma tylko `owner`. Zapis i publikacja przechodzą przez akcje serwerowe, które wołają `requireStaff("business.publish")`.

Każdy byt ma dwa sloty o stałych identyfikatorach `draft` i `published`. Publiczny odczyt `getPublicBusiness()` woła wyłącznie slot opublikowany. Gdy brak `DATABASE_URL`, brak wiersza albo błąd bazy, zwraca udokumentowaną kopię z `src/data/site.ts`. Ta kopia jest tym, co strona już pokazywała przed CMS. Nie jest losowa i nie jest wersją roboczą.

Pola tekstowe odrzucają `<`, `>` i `javascript:`. Linki społecznościowe muszą zaczynać się od `https://`. Telefon i e-mail zamieniają się na `tel:` i `mailto:` po stronie serwera. Puste placeholdery „do potwierdzenia” nie dostają klikalnego linku.

Pola handlowe (`equipmentSets`, `depositAmount`, `privateSlotSurcharge`, `paymentProvider`, `cancellationPolicy`, `commercialApproved`) istnieją w tabeli, ale zapis zawsze zostawia je puste i `commercialApproved = false`. Formularz ich nie przyjmuje.

## Modele i migracja

Migracja `prisma/migrations/20261106180000_business_config`:

- `BusinessProfile` — nazwa handlowa, nazwa prawna, NIP, adres, administrator danych, opis, współrzędne, wskazówka mapy.
- `BusinessContact` — telefon, e-mail, godziny, linki, dojazd.
- `BusinessSettings` — limity startowe: 8 zawodników w drużynie, 2–4 drużyny, 32 graczy w slocie, starty `08:00,11:00,14:00`, gra 120 minut, przerwa 60 minut, slot wspólny i prywatny dozwolone.
- `ContentRevision` — migawka, numer wersji, status `draft` albo `published`, aktor.
- `ConfigChangeAudit` — aktor, czas, akcja `save_draft` albo `publish`, wartość poprzednia i nowa.

Seed używa wyłącznie faktów już obecnych w `siteConfig`. NIP, nazwa prawna, telefon i e-mail pozostają nieustalone.

## Widoki panelu

- `/panel/firma` — dane firmy, kontakt, lokalizacja, ustawienia, porównanie z publikacją, historia. Widoczne tylko dla właściciela.
- `/panel/firma/podglad` — zestawienie wersji roboczej i opublikowanej. Osoba niezalogowana trafia na logowanie.
- Link „Firma” w nawigacji panelu jest ukryty dla managera i pracownika.

## Testy

`src/lib/business/model.test.ts` sprawdza, że publikować może tylko właściciel, że znaczniki HTML są odrzucane, że limit slotu nie może przekroczyć iloczynu drużyn i że publiczny wybór nie podstawia braku publikacji wersją roboczą. Uprawnienie jest egzekwowane w akcjach przez `requireStaff`, więc manager, pracownik i gość nie wykonają zapisu.

Jednostkowe: `npm test` — 12 plików, 62 testy, wynik 0. `npm run lint` — 0. `tsc --noEmit` — 0.

Lokalnie nie ma `DATABASE_URL` ani działającego Dockera, więc `prisma migrate deploy` nie został tu wykonany. Job `database` w GitHub Actions uruchamia `prisma migrate deploy` na PostgreSQL 16 i jest właściwym sprawdzeniem tej migracji.

## Zmienne środowiskowe

Brak nowych sekretów. Działanie panelu wymaga już obecnych `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` i jednorazowego `STAFF_BOOTSTRAP_TOKEN` do pierwszego właściciela. Po utworzeniu konta token bootstrapu należy usunąć.

## Znane ograniczenia

- MFA nie jest włączone. Kolumna `User.mfaEnrolled` istnieje, logowanie to hasło i sesja. To blocker produkcyjny.
- Metadane `<title>` zostają przy statycznej nazwie z `siteConfig`. JSON-LD, nagłówek, stopka, kontakt i dojazd biorą opublikowany rekord.
- Awaria bazy pokazuje ostatnią zatwierdzoną kopię marketingową z kodu, nie ostatni udany odczyt z pamięci. Po publikacji nowej treści i późniejszej awarii bazy odwiedzający zobaczą kopię startową, dopóki baza nie wróci.
- Podgląd jest stroną panelu, nie publicznym adresem z tokenem.

## Zależności od pozostałych PR

Kolejność o najmniejszym ryzyku, bez merge do `main`:

1. Zostawić #11 otwarty. Jego CI przeglądarki pada na overflow `/oferta`, naprawionym dopiero w `8eac9bc` na gałęzi galerii.
2. Przenieść `8eac9bc` na `feature/staff-panel`, żeby #13 i potem #15 mogły przejść test przeglądarki. Nie robić force push.
3. #14 zostaje zieloną bazą funkcjonalną.
4. #15 to same dokumenty. Ta gałąź już je zawiera, więc po zielonym #13 można je złożyć bez konfliktu z galerią.
5. Ten PR V1.5B-1 celuje w `feature/gallery-coverflow`.

## Ryzyka bezpieczeństwa

- Jedno konto, brak publicznej rejestracji, sesja pracowników kasowana tylko gdy konto zniknęło lub nie jest aktywne.
- Manager i pracownik nadal czytają zgłoszenia według dotychczasowej macierzy. Nie dostają `business.publish`.
- CMS nie wykonuje HTML. Audyt zapisuje aktora i obie wartości.
- Sekretów nie ma w repozytorium.

### Plan MFA

1. Zostawić logowanie hasłem do czasu zatwierdzenia.
2. Dodać TOTP jako drugi krok Better Auth tylko dla ról staff, z kodami odzyskiwania trzymanymi jako hash.
3. Wymusić MFA najpierw na `owner`, potem na `manager` i `employee`.
4. Nie oznaczać `mfaEnrolled`, dopóki kod nie został potwierdzony.
5. Nie wdrażać panelu na produkcję przed tym krokiem.

## Następny sprint — V1.5B-2

Poza tym etapem zostają: edytor wszystkich tekstów i podstron, oferta i pakiety, galeria oraz kategorie Coverflow, harmonogram i dostępność, liczba zestawów, blokowanie dni i slotów, zasady anulowania, ceny i zadatki, płatności. Te pola mają zostać nieaktywne, aż właściciel zatwierdzi wartości.
