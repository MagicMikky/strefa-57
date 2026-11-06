> Historia. Bieżący plan: `docs/STREFA29_MASTER_PLAN.md`.

# Bezpieczeństwo panelu pracownika

Przegląd dotyczy kodu na gałęzi `feature/staff-panel`. To przegląd konstrukcji, nie zewnętrzny pentest.

## Granice

Publiczny formularz zostaje publiczny. Panel i operacje na zgłoszeniach wymagają sesji Better Auth sprawdzanej na serwerze. Proxy pod `/panel` tylko przekierowuje brak ciasteczka sesji i ustawia `X-Robots-Tag` oraz `Cache-Control: private, no-store`. Prawdziwa decyzja o dostępie jest w `requireStaff` oraz w każdej akcji serwera. Fałszywe ciasteczko nie przechodzi `getSession`.

Role są odrzucane po stronie serwera przy statusie, przypisaniu, notatce i zarządzaniu pracownikami. Identyfikator zgłoszenia bez sesji nie zwraca danych. Notatki nie mają osobnego publicznego API.

## Kontrola zagrożeń

| Zagrożenie | Środek |
| --- | --- |
| Publiczna rejestracja | `disableSignUp`; test odrzuca `signUpEmail` |
| Słabe hasło | minimum 12 znaków, litera i cyfra, limit 128 |
| Bruteforce logowania | limit Better Auth: 5 prób `/sign-in/email` na 10 minut, pamięć procesu |
| Kradzież sesji | `HttpOnly`, `SameSite=Lax`, `Secure` w produkcji, sesja 8 godzin, bez cache ciasteczka |
| Konto wyłączone | hook sesji i ponowny odczyt statusu; blokada kasuje sesje |
| Rola spoza panelu | `requireStaff` wpuszcza tylko `owner`, `manager` i `employee`; inna rola nie kasuje sesji, żeby późniejsze logowanie ligi zostało |
| CSRF | ciasteczko `Lax`, origin na formularzu publicznym, akcje serwera Next.js, `trustedOrigins` |
| XSS | React escapuje treść; e-mail do obsługi escapuje HTML |
| IDOR | wspólna skrzynka tylko dla ról z `inquiries.read`; pracownicy nie zarządzają kontami |
| Wstrzyknięcie nagłówka e-mail | odrzucenie CR/LF w adresie nadawcy i odbiorcy |
| Sekrety | tylko zmienne środowiskowe; w repozytorium są puste nazwy |
| Dane osobowe w logach | odpowiedzi błędów i `lastError` nie zawierają treści zgłoszenia; Prisma loguje wyłącznie błędy |
| Indeksacja panelu | `noindex` w metadanych, `X-Robots-Tag`, brak w sitemapie, `disallow: /panel` |
| Duplikat zgłoszenia | unikalny `dedupeKey` i obsługa wyścigu `P2002` |
| Awaria bazy lub Resend | brak bazy daje 503 bez echo adresu; błąd Resend zostawia zapis i status `failed` |
| Retencja | brak okresu oznacza brak usuwania |

Bootstrap i worker używają nagłówka `Bearer` porównywanego w czasie niezależnym od treści. Token krótszy niż 32 znaki jest traktowany jak brak konfiguracji. Endpoint bootstrap bez tokenu odpowiada 404.

## Ryzyka otwarte

Limit logowania jest w pamięci jednego procesu. Przy wielu instancjach trzeba podłączyć wspólny magazyn, tak jak przy Upstash dla formularza. MFA jest tylko kolumną `mfaEnrolled`. Pierwszy właściciel powstaje tylko wtedy, gdy sekret bootstrapu jest ustawiony w środowisku i usunięty po użyciu. Okres retencji nadal wymaga decyzji właściciela. Panel nie jest audytem produkcyjnym i nie był uruchamiany na danych prawdziwych klientów.

