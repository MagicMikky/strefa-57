> Historia. Bieżący plan: `docs/STREFA29_MASTER_PLAN.md`.

# Raport napraw — 2026-11-06

Gałąź: `fix/audit-2026-11-06`. Wdrożenie produkcyjne i scalenie nie zostały wykonane.

## Co zostało poprawione

- Scalono podwójne importy w `src/lib/inquiry.test.ts`, które przerywały typecheck w GitHub Actions.
- Next.js podniesiono z 16.3.6 do 16.4.5, a `eslint-config-next` do tej samej wersji. Vitest podniesiono do 5.1.0. `npm audit fix` bez `--force` zaktualizował poprawki, które nie wymagały zmiany major.
- Formularz mapuje slugi grup na typy wydarzeń: `kawalerskie` → `kawalerskie-panienskie`, `firmy` → `firma`, `szkoly` → `szkola`.
- Identyfikator pakietu musi być jednym z opublikowanych pakietów albo `nie-wiem`.
- Dodano testy handlera `POST /api/inquiry` dla kodów 200, 400, 403, 413, 415, 422, 429, 502 i 503, limitu, timeoutu, honeypotu, duplikatu i escapowania HTML.
- Limit zapytań ma adapter pamięci oraz adapter Upstash Redis. Bez konta Upstash działa pamięć jednego procesu.
- Adres klienta z `X-Forwarded-For` jest używany tylko przy `RATE_LIMIT_TRUST_PROXY=true` albo gdy nagłówek ustawia Vercel albo Cloudflare.
- Indeksacja jest wyłączona, dopóki `NEXT_PUBLIC_ALLOW_INDEXING=true` i kanoniczny adres jest publicznym https. Dodano brakujące canonicale.
- CSP jest w trybie `Content-Security-Policy-Report-Only`.
- Dialog cookies dostaje fokus, pętlę Tab i komunikat, gdy `localStorage` odrzuci zapis.
- Analityka nie przyjmuje pól `email`, `phone`, `name` i `message`. Doszły zdarzenia sukcesu i błędu formularza, nadal bez podłączonego dostawcy.
- Logo nie nadpisuje już widocznej nazwy innym `aria-label`. Przyciemniono `--muted`, żeby poważne naruszenia kontrastu z axe zniknęły na sprawdzanych stronach.
- Tokeny CSS wydzielono do `src/app/tokens.css`. Reszta `globals.css` została na miejscu.
- Dodano Playwright, axe, Lighthouse CI, Dependabot, CodeQL, reguły `.cursor/rules`, skille projektowe i `AGENTS.md`.

## Testy wykonane lokalnie

| Polecenie | Wynik |
| --- | --- |
| `npm run typecheck` | przeszedł |
| `npm run lint` | przeszedł |
| `npm test` | przeszedł, 5 plików, 31 testów |
| `npm run test:coverage` | przeszedł: instrukcje 80,71%, gałęzie 75,19%, funkcje 88,88%, linie 81,51% |
| `npm run build` | przeszedł, Next.js 16.4.5 |
| `npm audit --omit=dev` | 0 podatności produkcyjnych |
| `npm run test:e2e` | przeszedł, 34 testy, desktop i mobile |
| axe w E2E | przeszedł: brak naruszeń serious/critical na `/`, `/oferta`, `/cennik`, `/zapytaj-o-termin`, `/kontakt` |
| `npm run lhci` | zakończony kodem 0. Asercja dostępności nie zgłosiła błędu. SEO 0,66 to ostrzeżenie, bo indeksacja jest celowo wyłączona |

`npm audit` bez `--omit=dev` nadal pokazuje 17 zgłoszeń w narzędziach deweloperskich: łańcuch `minimatch` przez ESLint oraz `basic-ftp` przez Lighthouse CLI. Jedyna automatyczna poprawka wymaga `--force` i obniżyłaby Next albo Lighthouse. Nie użyto `--force`.

Pierwszy przebieg CI po tym commicie padł na `npm ci` przy Node 20: lockfile nie zgadzał się z npm 10, a Vitest 5 oraz Lighthouse CLI wymagają nowszego Node. CI zostało przestawione na Node 24.

## Czego nie ogłaszam

Nie ogłaszam zgodności z WCAG 2.2 AA. Test axe objął pięć tras i tylko poziomy serious oraz critical. Nie wykonano audytu z czytnikiem ekranu.

Nie ogłaszam, że limit działa między wieloma instancjami. Konto Upstash nie jest dostępne i nie zostało wymyślone.

## Blockery

- Brak zatwierdzonych danych firmy, cen, zdjęć, pinu, wieku, regulaminów, retencji i dostawcy analityki. Lista: `docs/BRAKI_DANYCH_DO_ZATWIERDZENIA.md`.
- Formularz zwróci 503 bez sekretów Resend. Nie wysłano prawdziwej wiadomości.
- Ochrona gałęzi `main` nie została włączona w ustawieniach GitHub. Workflow nie potrafi jej wymusić.
- Wersja 2.0 nie została zaimplementowana.

