# Polecenie do wklejenia w Cursor Agent — audyt + poprawki Strefa 29

Pracujesz w repozytorium MagicMikky/strefa-57. Zacznij od aktualizacji gałęzi i utworzenia osobnej gałęzi naprawczej. **Nie wykonuj zmian produkcyjnych, wdrożenia, merge ani płatności.**

Przeczytaj `strona1_0.md`, `strona2_0.md` oraz załączony `AUDYT_GITHUB_STREFA29_2026-11-06.md`. Wersja 1.0 to wyłącznie strona marketingowo-kontaktowa, bez kont klientów, bez rezerwacji i płatności. Nie wprowadzaj jeszcze 2.0.

Wykonaj następującą kolejność:

1. Zdiagnozuj nieudany workflow GitHub Actions i popraw zduplikowane importy w `src/lib/inquiry.test.ts`, zachowując testy. Przeprowadź npm ci, typecheck, lint, Vitest, build. Nie przechodź dalej, dopóki te kroki nie przejdą.
2. Wykonaj npm audit --json oraz npm audit --omit=dev. Zidentyfikuj rzeczywiście podatne zależności i uaktualnij je bezpiecznie; nie używaj automatycznie `--force`. Powtórz CI.
3. Napraw mapowanie `wydarzenie` dla kawalerskie/firmy/szkoly oraz walidację identyfikatorów pakietów. Dodaj testy regresyjne.
4. Dodaj realne testy handlera `/api/inquiry` (HTTP, timeout Resend, błędy, limitowanie, dane osobowe, nagłówki). Zaprojektuj współdzielony rate limiting na hosting wybrany dla 1.0, a jeśli wymagane konto usługi nie jest dostępne, utwórz adapter + udokumentuj blocker bez wymyślania kluczy.
5. Dodaj Playwright Test + @axe-core/playwright + Lighthouse CI, przygotuj testy kluczowych ścieżek w przeglądarce i uruchom w CI. Możesz korzystać z Playwright MCP do ręcznej weryfikacji wizualnej, ale nie zastępuj nim zapisanych testów.
6. Przygotuj projektowe `.cursor/rules` i `.cursor/skills` oraz AGENTS.md dla zasad etapu 1.0 i architektury 2.0; nie duplikuj istniejących globalnych MCP.
7. Dodaj raport brakujących danych do zatwierdzenia (firma, ceny, zdjęcia, adres/pin, wiek, regulaminy, dostawca e-mail, retencja, analityka). Nie wstawiaj wymyślonych cen, opinii, zdjęć ani danych kontaktowych.
8. Zweryfikuj meta, canonicale, sitemap, cookies, CSP i dostępność. Nie ogłaszaj zgodności WCAG bez testu.
9. Zaproponuj rozsądne uporządkowanie 2643-liniowego pliku CSS bez niepotrzebnego przepisywania działającego UI.

Zakończ raportem: lista zmian, testy wraz z rzeczywistym wynikiem, otwarte blockery, priorytety, bezpieczeństwo i PR do recenzji. Nie deklaruj ukończenia punktów, których nie zrealizowałeś. W przypadku braku dostępu do usługi zgłoś blocker, a nie imituj sukces.
