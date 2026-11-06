# Analiza luk wersji 1.0

Data: 2026-11-06. Gałąź: `release/v1-readiness`, oparta na `fix/audit-2026-11-06`.
Źródło zakresu: `strona1_0.md`. Wcześniejszy raport: `docs/RAPORT_NAPRAW_2026-11-06.md`.
Strona nie jest gotowa do publikacji. Brakuje zatwierdzonych danych firmy, kontaktu, cen, zdjęć, treści prawnych i prawdziwego dostarczenia formularza.

## Kompletne

| Funkcja | Dowód | Odbiór |
| --- | --- | --- |
| Mapa stron 1.0 bez rezerwacji i płatności | `src/app/**/page.tsx`, brak tras konta, koszyka i płatności | Wejście na każdą publiczną trasę zwraca stronę z `h1` |
| Formularz nie obiecuje rezerwacji | `src/components/inquiry-form.tsx`, komunikat sukcesu z API | Sukces pojawia się tylko po `ok: true` |
| Walidacja klienta i serwera, honeypot, limit, timeout | `src/lib/inquiry.ts`, `src/app/api/inquiry/route.ts`, `src/lib/rate-limit.ts` | Testy jednostkowe kodów 200, 400, 403, 413, 415, 422, 429, 502, 503 |
| Mapowanie pakietu i typu wydarzenia | `eventTypeForAudience` w `src/data/site.ts` | E2E: slug wydarzenia i link „Zapytaj o ten pakiet” |
| Zgody cookies przed `dataLayer` | `src/lib/consent.ts`, `src/components/cookie-consent.tsx` | Zdarzenie nie jest zapisywane bez `analytics: true` |
| Indeksacja wyłączona do decyzji | `src/lib/seo.ts` | `robots` nie indeksuje bez publicznego https i flagi |
| Nagłówki bezpieczeństwa i CSP Report-Only | `next.config.ts` | Nagłówek `Content-Security-Policy-Report-Only` na odpowiedziach |
| CI typecheck, lint, test, coverage, build, e2e, lhci, CodeQL | `.github/workflows/ci.yml`, `.github/workflows/codeql.yml` | Ostatni zielony przebieg na `9049fb0`; ta gałąź wymaga nowego przebiegu |

## Niekompletne albo błędne względem zakresu

| Luka | Priorytet | Pliki | Odbiór |
| --- | --- | --- | --- |
| Brak zatwierdzonego telefonu, e-maila i godzin kontaktu. Spec wymaga klikalnego telefonu, e-maila i mobilnego „Zadzwoń” | P0 | `src/data/site.ts`, `src/app/kontakt/page.tsx` | Link `tel:` i `mailto:` prowadzi do zatwierdzonego adresu, a błąd formularza podaje ten sam kontakt |
| Formularz zwraca 503 bez sekretów Resend. Nie było prawdziwej wysyłki | P0 | `src/app/api/inquiry/route.ts`, `.env.example` | Wiadomość dociera do skrzynki obsługi i nie jest pokazywana jako sukces przy błędzie dostawcy |
| Galeria nie ma zatwierdzonych zdjęć. `gallery/` jest pusty. `layout/` nie jest publikowany, bo są tam też grafiki koncepcyjne | P0 | `src/data/gallery.ts`, `src/app/galeria/page.tsx` | Każde opublikowane zdjęcie ma `alt`, `sizes` i przechodzi przez Next Image |
| Ceny, wiek, regulamin, retencja i pin dojazdu są niezatwierdzone | P0 | `docs/BRAKI_DANYCH_DO_ZATWIERDZENIA.md` | Właściciel podpisuje listę przed włączeniem indeksacji |
| Analityka nie ma dostawcy. Zgoda nie uruchamia pomiaru | P1 | `src/lib/consent.ts` | Wybrany dostawca ładuje się dopiero po zgodzie i nie dostaje pól formularza |
| CSP nie jest egzekwowane | P1 | `next.config.ts` | Po tygodniu raportów ze stagingu polityka przechodzi na `Content-Security-Policy` bez `unsafe-inline`, jeśli raporty są czyste |
| JSON-LD ma adres widoczny na stronie, ale bez telefonu i godzin, bo nie są zatwierdzone | P1 | `src/app/layout.tsx` | Po zatwierdzeniu NAP dodać telefon i godziny albo usunąć adres, jeśli pin jest inny |
| Brak opinii ze źródłem. Spec je przewiduje, nie wolno ich wymyślać | P1 | brak komponentu opinii | Opinia ma autora, źródło i zgodę |
| Hero używa logo, nie zdjęcia pola | P1 | `src/components/ui.tsx` | Zdjęcie hero pochodzi z zatwierdzonego zestawu |
| Ochrona `main` nie jest włączona w GitHub | P1 | ustawienia repozytorium | PR do `main` wymaga zielonego CI i review |
| Czytnik ekranu nie był sprawdzany ręcznie. axe nie jest audytem WCAG 2.2 AA | P1 | `e2e/a11y.spec.ts` | Ręczny przebieg VoiceOver lub NVDA na stronie głównej, formularzu i dialogu cookies |
| Limit zapytań jest w pamięci procesu, dopóki nie ma Upstash | P1 | `src/lib/rate-limit.ts` | Dwa równoległe procesy dzielą jeden licznik |
| Otwarte pull requesty Dependabot to podbicia major: TypeScript 7, ESLint 10, React, akcje GitHub oraz łatka PostCSS 4.3.4. Nie zostały scalone w tym wydaniu | P2 | GitHub Dependabot | Każdy PR oceniany osobno, bez `--force` |
| Dane strukturalne i Open Graph nie mają obrazu społecznościowego | P2 | `src/app/layout.tsx` | Po zdjęciu hero dodać `openGraph.images` |

## UX, SEO, dostępność, wydajność

- Nawigacja, stopka i CTA prowadzą do istniejących tras. Nie ma przycisku „Zarezerwuj”.
- Dialog cookies ma fokus, pętlę Tab i nie zamyka się Escape przed wyborem.
- Formularz wiąże błędy z polami, ogłasza status przez `role="alert"` albo `role="status"` i zostawia dane po błędzie sieci, 422 i 503.
- E2E axe obejmuje wszystkie publiczne trasy oraz regulamin, prywatność i cookies. Nadal tylko poziomy serious i critical.
- Lighthouse na poprzedniej gałęzi kończył się kodem 0. SEO około 0,66 wynika z celowo wyłączonej indeksacji, nie z braku tytułu.
- `prefers-reduced-motion` jest obsłużone w `src/app/globals.css`.
- Mapa na `/dojazd` nie ładuje Google przed świadomym uruchomieniem.

## Bezpieczeństwo

- Walidacja serwerowa, limit rozmiaru, honeypot, allowlista pakietów i typów wydarzeń.
- `X-Forwarded-For` jest ufany tylko przy `RATE_LIMIT_TRUST_PROXY=true`. Nagłówki Vercel i Cloudflare są używane zawsze.
- Sekrety nie są w repozytorium. `.env.example` ma same nazwy.
- CSP: `default-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`, `form-action 'self'`. Skrypty i style mają `unsafe-inline`, bo Next wstrzykuje style i JSON-LD. Przejście do egzekwowania: zebrać raporty, dodać nonce albo hash dla własnego JSON-LD, usunąć `unsafe-inline` ze skryptów, zostawić mapy Google tylko na `/dojazd`, potem zmienić nagłówek na `Content-Security-Policy`.
- Nie włączono wymuszonego CSP w tym wydaniu, bo nie ma jeszcze raportów z prawdziwego hostingu.

## Blockery właściciela

Lista pozostaje w `docs/BRAKI_DANYCH_DO_ZATWIERDZENIA.md`. Nie dodano drugiej, sprzecznej listy wartości.
