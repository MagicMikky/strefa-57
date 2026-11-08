> Historia. Bieżący plan: `docs/STREFA29_MASTER_PLAN.md`.

# Architektura panelu pracownika

Wersja 1.5 dodaje konta pracowników i trwały zapis zgłoszeń z publicznego formularza. Nie dodaje kont klientów, rezerwacji ani płatności.

## Gałąź

Praca jest na `feature/staff-panel`, odciętej od `release/v1-readiness` (`134a9d7`). Nie zmienia gałęzi galerii ani pull requestu #11.

## Uwierzytelnianie

Biblioteka: Better Auth 1.7.18. Zależności są zgodne z Next.js 16.4.5, React 19 i Prismą 6.19.3. Publiczna rejestracja jest wyłączona przez `emailAndPassword.disableSignUp`. Hasła hashuje wbudowany mechanizm biblioteki (`node:crypto` scrypt). Nie ma hasła domyślnego w kodzie.

Role `owner`, `manager` i `employee` oraz status `active` / `disabled` są dodatkowymi polami użytkownika Better Auth. Klient nie może ich ustawić (`input: false`). Kolumna `User.role` jest wyłącznie bramką panelu pracowniczego. Domyślna wartość nowego wiersza to `member` i nie daje dostępu do panelu. Konta tworzone w panelu ustawiają rolę jawnie. Przyszłe role klienta, zawodnika, kapitana, sędziego i organizatora nie będą zapisywane w tej kolumnie. Tożsamość zostaje w `User`, a role sportowe dojdą jako osobne członkostwa. Opisuje to `docs/STREFA29_LEAGUE_ROADMAP.md`. Konta klientów i liga pozostają poza tym etapem. Wersja 2.0 nadal nie obejmuje kont klientów, zgodnie ze `strona2_0.md`.

Sesje trwają 8 godzin, ciasteczko jest `HttpOnly` i `SameSite=Lax`, a w produkcji także `Secure`. Przed utworzeniem sesji sprawdzany jest status konta. Zablokowanie pracownika kasuje jego sesje. Pole `mfaEnrolled` jest przygotowaniem pod oficjalną wtyczkę MFA Better Auth. Samo MFA nie jest jeszcze włączone.

Pierwszego właściciela tworzy jednorazowy `POST /api/staff/bootstrap` z sekretem `STAFF_BOOTSTRAP_TOKEN`. Po istnieniu konta `owner` endpoint zwraca konflikt. Kolejne konta `manager` i `employee` zakłada właściciel w panelu.

## Dane

PostgreSQL i Prisma. Tabele Better Auth: `User`, `Session`, `Account`, `Verification`. Tabele aplikacji: `Inquiry`, `InquiryNote`, `InquiryHistory`, `NotificationOutbox`, `StaffAudit`.

Zgłoszenie dostaje klucz idempotencji. Ten sam klucz i ta sama treść zwracają istniejący rekord. Ten sam klucz i inna treść zwracają 409. Formularz odpowiada sukcesem dopiero po zapisie w PostgreSQL. Zgłoszenia są obsługiwane wyłącznie w `/panel/zgloszenia`; aplikacja nie wysyła ich do zewnętrznego dostawcy e-mail.

Statusy: `new`, `in_progress`, `waiting_for_customer`, `handled`, `closed`. Zmiana statusu zapisuje historię i nie tworzy rezerwacji.

## Uprawnienia

| Operacja | owner | manager | employee |
| --- | --- | --- | --- |
| Odczyt zgłoszeń | tak | tak | tak |
| Status | tak | tak | nie |
| Przypisanie | tak | tak | nie |
| Notatka | tak | tak | tak |
| Konta pracowników | tak | nie | nie |
| Ustawienia firmy | tak | nie | nie |

Każdy pracownik widzi wspólną skrzynkę firmy. Nie ma osobnych skrzynek klientów. Brak sesji albo zła rola kończy się przekierowaniem albo odmową, zanim handler odczyta rekord.

## Retencja

`DATA_RETENTION_DAYS` jest puste, dopóki właściciel nie zatwierdzi okresu. `purgeExpiredInquiries` wtedy nic nie usuwa. Nie przyjęto własnego okresu domyślnego.

## Ścieżki

- `/panel/logowanie`
- `/panel`
- `/panel/zgloszenia`
- `/panel/zgloszenia/[id]`
- `/panel/pracownicy`
- `/panel/ustawienia`

Panel jest poza sitemapą. Przy włączonym indeksowaniu `robots` blokuje `/api/` i `/panel`.

