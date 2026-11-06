> Historia. Bieżący plan: `docs/STREFA29_MASTER_PLAN.md`.

# Runbook wdrożenia wersji 1.0

Nie wdrażać produkcji i nie scalać do `main` bez zgody właściciela. Wersja 2.0 nie wchodzi w to wdrożenie.

## Środowiska

| Środowisko | Rola |
| --- | --- |
| Lokalne | `npm run dev`, bez sekretów produkcyjnych |
| Staging | osobny projekt hostingu, osobne klucze Resend i Upstash, indeksacja wyłączona |
| Produkcja | osobne sekrety, indeksacja dopiero po liście P0 |

Hosting docelowy nie jest jeszcze wybrany. Aplikacja jest zwykłym Next.js i może iść na Vercel albo inny host z Node 22.12 albo nowszym. CI używa Node 24.

## Domena, DNS, HTTPS

1. Podłączyć zatwierdzoną domenę do projektu staging, potem produkcji.
2. Poczekać na certyfikat HTTPS, zanim ktokolwiek ustawi kanoniczny adres.
3. `NEXT_PUBLIC_SITE_URL` to adres https bez końcowego ukośnika.
4. Rekordy poczty ustawić u dostawcy DNS domeny firmowej, nie w kodzie strony.

## Resend

1. Założyć konto firmowe i zweryfikować domenę nadawczą.
2. Dodać SPF, DKIM i DMARC według panelu Resend. DMARC zacząć od `p=none`, podnieść po tygodniu poprawnych raportów.
3. Ustawić sekrety tylko w hostingu: `RESEND_API_KEY`, adres nadawcy, adres odbiorcy obsługi. Nazwy są w `.env.example`.
4. Wysłać jedno prawdziwe zapytanie ze stagingu i sprawdzić skrzynkę oraz to, że treść nie trafiła do logów aplikacji.
5. Wyłączyć klucz na chwilę i potwierdzić, że strona pokazuje błąd, a nie sukces.

## Zmienne

Nie wpisywać wartości do repozytorium.

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_ALLOW_INDEXING` — `false`, dopóki lista P0 nie jest zamknięta
- `RESEND_API_KEY`, `INQUIRY_TO_EMAIL`, `INQUIRY_FROM_EMAIL`
- `RATE_LIMIT_SALT` — losowy sekret co najmniej 16 znaków, inny na stagingu i produkcji
- `UPSTASH_REDIS_REST_URL` musi być `https`
- `UPSTASH_REDIS_REST_TOKEN` co najmniej 16 znaków
- `RATE_LIMIT_TRUST_PROXY=true` tylko wtedy, gdy hosting dokleja prawdziwy adres klienta do `X-Forwarded-For`. Na Vercel albo Cloudflare zostawić `false`: kod ufa `x-vercel-forwarded-for` i `cf-connecting-ip`
- `INQUIRY_DELIVERY_TIMEOUT_MS`

## Limit i adres IP

Bez Upstash każdy proces serwera liczy osobno. Przed ruchem produkcyjnym utworzyć bazę Upstash i wpisać oba sekrety na stagingu i produkcji. Sprawdzić nagłówek `X-RateLimit-Store`: wartość inna niż pamięć lokalna.

## CSP

Polityka jest w `Content-Security-Policy-Report-Only` w `next.config.ts`.

1. Na stagingu zebrać naruszenia z konsoli przeglądarki na stronie głównej, formularzu i mapie.
2. Mapa Google jest dozwolona w `frame-src` i `img-src`. Innych firm nie dodawać bez decyzji.
3. `unsafe-inline` dla skryptów wynika z JSON-LD. Przed egzekwowaniem przenieść JSON-LD na nonce albo hash.
4. Po czystym tygodniu zmienić nagłówek na `Content-Security-Policy` osobnym pull requestem. Nie robić tego w ciemno na produkcji.

## Indeksacja

Zostawić wyłączoną. Po P0 ustawić flagę i adres, sprawdzić `/robots.txt` oraz kanoniczne URL w źródle strony, potem zgłosić mapę witryny. Podglądy i localhost nie mogą być indeksowane: pilnuje tego `src/lib/seo.ts`.

## Monitoring i awaria

- Podłączyć monitoring błędów serwera bez treści formularza, imienia, telefonu i e-maila.
- Sprawdzać odpowiedzi 502 i 503 trasy `/api/inquiry`.
- Gdy formularz nie działa, obsługa korzysta z telefonu i e-maila opublikowanych na `/kontakt`. Dopóki tych danych nie ma, nie ma sprawnej ścieżki awaryjnej i nie wolno ogłaszać startu.
- Rollback: w hostingu promować poprzednie udane wdrożenie. Treści są w repozytorium, nie w bazie, więc cofnięcie buildu nie kasuje zapytań. Wiadomości zostają w skrzynce.

## Ochrona `main`

Workflow nie potrafi włączyć ochrony gałęzi. Właściciel repozytorium `MagicMikky/strefa-57` włącza ją w GitHub: Settings → Branches → Branch protection dla `main`.

Wymagane:

- pull request przed scaleniem;
- statusy CI: quality, browser, CodeQL;
- brak pomijania hooków i brak bezpośredniego pusha;
- rozmowa z właścicielem przed pierwszym scaleniem, bo historia `main` jest za gałęzią prac.

## Zgody i prawo

Teksty w `/regulamin`, `/polityka-prywatnosci` i `/cookies` są robocze. Nie traktować ich jako zatwierdzonych. Analityka nie startuje przed zgodą, a bez wybranego dostawcy zgoda nie wysyła danych do żadnej firmy.

