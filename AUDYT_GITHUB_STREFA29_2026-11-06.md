# Paintball Strefa 29 — audyt repozytorium i lista działań dla Cursor AI

Data audytu: 2026-11-06. Repozytorium: https://github.com/MagicMikky/strefa-57, branch `main`, commit `52b4788b1fba024f0a657142619eadc46e0e9862`.

## Zakres i ograniczenia
Analiza plików źródłowych przez GitHub oraz rzeczywistych logów GitHub Actions. Nie uruchomiono aplikacji w przeglądarce ani testów na lokalnym komputerze właściciela. Nie zweryfikowano sekretów produkcyjnych, konfiguracji hostingu, wyników Lighthouse, dostępności wizualnej i praw do zdjęć. Zawartość globalnego Cursora na komputerze użytkownika nie jest widoczna w repozytorium.

## Wynik
- **Status CI: FAILED**. https://github.com/MagicMikky/strefa-57/actions/runs/42186655999
- **Przyczyna:** `src/lib/inquiry.test.ts` zawiera powtórne importy `describe`, `it`, `expect`, `validateInquiry`, `getWarsawDate` (TS2300). Typecheck zakończył się błędem, lint/test/build nie wykonały się w CI.
- **npm audit w logu CI:** 15 zgłoszeń (10 moderate, 4 high, 1 critical). Raport nie identyfikuje tutaj konkretnych pakietów; trzeba uruchomić i przeanalizować `npm audit --json` i `npm audit --omit=dev`.
- **Branch `main` nie jest protected** według API GitHub.

## Potwierdzone zakresy repo
- Next.js 16.3.6, React 19.3.0, TS 5.9.3, Tailwind 4.3.3, Vitest.
- Strony `/`, `/oferta`, `/cennik`, `/galeria`, `/dla-kogo`, `/faq`, `/kontakt`, `/dojazd`, `/zapytaj-o-termin`, `/regulamin`, `/polityka-prywatnosci`, `/cookies`, 404.
- API POST `/api/inquiry` z ograniczeniem body, walidacją, honeypot, sprawdzaniem źródła, wysyłką przez Resend.
- `robots.ts`, `sitemap.ts`, `manifest.ts`, metadane SEO, JSON-LD, cookie preferences.
- CI GitHub Actions, testy Vitest, `.env.example`.
- Brak kodu wersji 2.0 (zgodnie z zakresem wersji 1.0).

## Działania obowiązkowe
### P0 — naprawy blokujące
1. Scal importy w `src/lib/inquiry.test.ts`, usuwając drugą deklarację importów. Nie kasuj żadnych testów. Następnie `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.
2. Sprawdź wszystkie zależności: `npm audit --json` i `npm audit --omit=dev`. Zapisz advisories, pakiety bezpośrednie i pośrednie, rzeczywisty impact. Aktualizuj selektywnie, nie stosuj automatycznie `npm audit fix --force`, ponów pełne testy.
3. Zablokuj publikację produkcyjną, dopóki dane firmy, telefon, e-mail, zasady i cennik nie zostaną zatwierdzone. Zabezpiecz staging przed indeksacją.
4. Zweryfikuj działanie e-mail w staging: poprawny `RESEND_API_KEY`, `INQUIRY_TO_EMAIL`, `INQUIRY_FROM_EMAIL`, `RATE_LIMIT_SALT`, SPF/DKIM/DMARC i test rzeczywistego doręczenia. Sekrety wyłącznie poza repozytorium. Przy braku konfiguracji API zwraca 503.

### P1 — przed wydaniem 1.0
5. Zamień `Map` w `src/app/api/inquiry/route.ts` na współdzielony, odporny na wiele instancji rate limit (np. hostowany Redis lub platformowy rate limit), zabezpiecz identyfikowanie IP przez zaufany reverse proxy.
6. Ujednolić słowniki `audiences[].slug` z `eventTypeOptions`: trzy niedopasowania (`kawalerskie` vs `kawalerskie-panienskie`, `firmy` vs `firma`, `szkoly` vs `szkola`) psują wstępne wypełnienie formularza.
7. Powiąż walidację identyfikatora pakietu z faktycznymi pakietami (`packages` + `nie-wiem`), a nie tylko regex; liczby graczy powinny wynikać z zatwierdzonych reguł.
8. Rozbuduj testy API o rzeczywiste handler tests z mockiem dostawcy e-mail (200, 400, 403, 413, 415, 422, 429, 502, 503), limity, timeout, honypot, duplikaty, poprawność nieprzekazywania PII do analityki.
9. Dodaj `@playwright/test`, testy E2E z własną konfiguracją i Chromium (mobile i desktop), `@axe-core/playwright`, `@lhci/cli`; wykonuj je w CI po uruchomieniu strony testowej.
10. Utwórz rzeczywistą galerię i hero na podstawie zatwierdzonych zdjęć pola. Repo nie ma katalogu `public/` ze zdjęciami; galeria i hero są obecnie ilustracjami CSS.
11. Zweryfikuj prawdziwość informacji „1+ ha”, „15 km”, adresu, wejścia i dojazdu. Usuń lub ukryj niepotwierdzone dane z produkcji.
12. Uzupełnij i zatwierdź politykę prywatności, regulamin, cookies, okres retencji, dane administratora; poddaj finalne dokumenty przeglądowi prawnemu.
13. Dostosuj tryb cookies do dostępności: dialog ma `aria-modal=true`, ale brak zarządzania fokusem; testuj klawiaturą/screen readerem. Sprawdź zachowanie przy odmowie dostępu do localStorage.
14. Dokończ pomiar konwersji: `trackEvent` tylko zapisuje zdarzenia do `dataLayer`, brak podłączonego provider-a i brakuje zgłoszenia sukcesu/błędu formularza w enumie zdarzeń.
15. W `next.config.ts` dodaj testowaną politykę CSP, początkowo Report-Only; pozostałe nagłówki już istnieją.
16. Weryfikuj `NEXT_PUBLIC_SITE_URL`: produkcja nie może używać wartości `http://localhost:3000`. Sprawdź robots/sitemap, preview noindex, OG preview.
17. Ustaw ochronę main przez PR oraz wymagane przejście CI; dodaj Dependabot / CodeQL lub podobny skan sekretów i zależności.

### P2 — jakość / utrzymanie
18. Rozbij `src/app/globals.css` (~2643 linie) na logiczne style modułów lub uporządkuj design tokens i komponenty bez zmiany wyglądu; przeprowadź visual regression.
19. Dodaj progi pokrycia Vitest i `@vitest/coverage-v8`, raporty z testów, monitoring formularza i testy dostępności WCAG 2.2 AA.
20. Rozbuduj README: środowiska, `.env.example`, diagram danych v1/v2, komendy, runbook wdrożenia, obsługa awarii formularza, checklista przed wydaniem.
21. Dodaj makiety wizualne zatwierdzone przez właściciela oraz co najmniej jeden pełny test procesu na telefonie.

## Cursor — czego brak w repozytorium
- Repo nie zawiera `.cursor/rules/`, `.cursor/skills/`, `.cursor/agents/` ani `AGENTS.md` (na audytowanym commicie). Nie znaczy to, że użytkownik nie ma globalnych Skills na komputerze, ale konfiguracja projektowa nie jest odtwarzalna przez repo/Cloud Agents.
- Należy włączyć do repo projektowe reguły: zakres 1.0 vs 2.0, zakaz wymyślania treści/cen, zakaz wdrażania na produkcję bez zgody, obowiązek `typecheck/lint/test/build`, E2E na zmianach UI, zasady danych osobowych i bezpieczeństwa.
- Dodać Skills `strefa29-domain`, `visual-qa`, `inquiry-api-tests`, `booking-payments-reliability` (ostatni aktywować podczas etapu 2.0); albo odwołać się do sprawdzonych globalnych Skills.
- MCP Playwright i Context7 znane z wcześniejszej lokalnej konfiguracji; nie można potwierdzić ich stanu wyłącznie na podstawie GitHub. Nie kopiować sekretów produkcyjnych do MCP.
- Prisma/PostgreSQL, operator płatności, worker/kolejka i administracja nie są teraz wymagane do uruchomienia 1.0, ale muszą być zaplanowane przed startem 2.0.

## Raportowanie i acceptance
Na koniec prac Cursor ma podać: zmienione pliki; powód i ryzyko; wyniki `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm audit --omit=dev`; status E2E i a11y; listę blockerów biznesowych; link do PR i zielonego GitHub Actions. Nie twierdzić, że coś przetestowano, jeśli test się nie wykonał.

## Źródła
- https://github.com/MagicMikky/strefa-57/tree/main
- https://github.com/MagicMikky/strefa-57/blob/main/src/lib/inquiry.test.ts
- https://github.com/MagicMikky/strefa-57/blob/main/src/app/api/inquiry/route.ts
- https://github.com/MagicMikky/strefa-57/blob/main/src/data/site.ts
- https://github.com/MagicMikky/strefa-57/actions/runs/42186655999
