# Paintball Strefa 29 — lokalny projekt

Instrukcje uruchomienia projektu lokalnie i uruchomienia testów.

Wymagania:
- Node.js v20+ (zalecane 20.9+)

Skrypty:
- `npm run dev` — uruchamia Next.js w trybie deweloperskim
- `npm run build` — buduje aplikację
- `npm start` — uruchamia zbudowaną aplikację
- `npm run typecheck` — uruchamia `tsc --noEmit`
- `npm run lint` — uruchamia `eslint`
- `npm test` — uruchamia testy przez `vitest`

Uruchomienie (Windows PowerShell):
```powershell
npm ci
npm run dev
```

Uruchomienie testów:
```powershell
npm ci
npm test
```

Dodatkowe sprawdzenia:
- `npm run test:coverage` — próg pokrycia Vitest dla logiki formularza
- `npm run test:e2e` — Playwright, w tym kontrola axe dla poważnych naruszeń
- `npm run lhci` — Lighthouse CI na lokalnie zbudowanej stronie

Zmienne środowiskowe są opisane w `.env.example`. Indeksacja jest wyłączona, dopóki `NEXT_PUBLIC_ALLOW_INDEXING` nie ma wartości `true`, a `NEXT_PUBLIC_SITE_URL` nie jest publicznym adresem https. Brak kluczy Resend daje odpowiedź 503 z formularza. Bez `UPSTASH_REDIS_REST_URL` i `UPSTASH_REDIS_REST_TOKEN` limit zapytań działa w pamięci jednego procesu.

Wersja 1.0 przyjmuje zapytanie e-mail i nie tworzy rezerwacji ani płatności. Wersja 2.0, opisana w `strona2_0.md`, pozostaje niezaimplementowana. Lista danych wymagających zatwierdzenia jest w `docs/BRAKI_DANYCH_DO_ZATWIERDZENIA.md`.

Gdy formularz nie dochodzi:
1. Sprawdź odpowiedź `/api/inquiry`: 503 oznacza brak konfiguracji albo niedostępny współdzielony limit, 502 oznacza błąd dostawcy e-mail, 429 oznacza limit.
2. Potwierdź sekret poza repozytorium: `RESEND_API_KEY`, `INQUIRY_TO_EMAIL`, `INQUIRY_FROM_EMAIL`, `RATE_LIMIT_SALT`.
3. Nie umieszczaj danych karty w formularzu. Wiadomość do operatora nie jest rezerwacją.

CI:
`.github/workflows/ci.yml` uruchamia typecheck, lint, testy, pokrycie i build oraz osobno Playwright i Lighthouse. Ochrona gałęzi `main` wymaga ustawienia w GitHubie i nie jest wymuszona samym plikiem workflow.
