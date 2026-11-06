# Architektura panelu pracownika

Wersja 1.5 dodaje konta pracowników i trwały zapis zgłoszeń z publicznego formularza. Nie dodaje kont klientów, rezerwacji ani płatności.

## Gałąź

Praca jest na `feature/staff-panel`, odciętej od `release/v1-readiness` (`134a9d7`). Nie zmienia gałęzi galerii ani pull requestu #11.

## Uwierzytelnianie

Biblioteka: Better Auth 1.7.18. Zależności są zgodne z Next.js 16.4.5, React 19 i Prismą 6.19.3. Publiczna rejestracja jest wyłączona przez `emailAndPassword.disableSignUp`. Hasła hashuje wbudowany mechanizm biblioteki (`node:crypto` scrypt). Nie ma hasła domyślnego w kodzie.

Role `owner`, `manager` i `employee` oraz status `active` / `disabled` są dodatkowymi polami użytkownika Better Auth. Klient nie może ich ustawić (`input: false`). To samo konto i ta sama sesja mogą w wersji 2.0 dostać rolę klienta bez wymiany biblioteki. Konta klientów pozostają poza tym etapem, zgodnie ze `strona2_0.md`.

Sesje trwają 8 godzin, ciasteczko jest `HttpOnly` i `SameSite=Lax`, a w produkcji także `Secure`. Przed utworzeniem sesji sprawdzany jest status konta. Zablokowanie pracownika kasuje jego sesje. Pole `mfaEnrolled` jest przygotowaniem pod oficjalną wtyczkę MFA Better Auth. Samo MFA nie jest jeszcze włączone.

Pierwszego właściciela tworzy jednorazowy `POST /api/staff/bootstrap` z sekretem `STAFF_BOOTSTRAP_TOKEN`. Po istnieniu konta `owner` endpoint zwraca konflikt. Kolejne konta `manager` i `employee` zakłada właściciel w panelu.

## Dane

PostgreSQL i Prisma. Tabele Better Auth: `User`, `Session`, `Account`, `Verification`. Tabele aplikacji: `Inquiry`, `InquiryNote`, `InquiryHistory`, `NotificationOutbox`, `StaffAudit`.

Zgłoszenie dostaje klucz idempotencji. Ten sam klucz i ta sama treść zwracają istniejący rekord. Ten sam klucz i inna treść zwracają 409. Formularz odpowiada sukcesem dopiero po zapisie. E-mail Resend jest zadaniem w skrzynce wychodzącej i może się nie udać bez cofania zapisu. Ponowienie robi `POST /api/internal/notifications`.

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
