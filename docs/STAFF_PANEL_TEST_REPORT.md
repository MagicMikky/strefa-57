> Historia. Bieżący plan: `docs/STREFA29_MASTER_PLAN.md`.

# Raport testów panelu pracownika

Data lokalna: 2026-11-06. Gałąź `feature/staff-panel`. Polecenia uruchomiono w katalogu projektu.

## Wyniki

| Polecenie | Wynik |
| --- | --- |
| `npm run typecheck` | zaliczony, po poprawce testu adaptera |
| `npm run lint` | zaliczony, brak ostrzeżeń |
| `npm test` | 56 testów, 11 plików, zaliczone |
| `npm run test:coverage` | linie 73.23%, funkcje 78.57%, instrukcje 72.91%, gałęzie 66.31%. Progi 70/65/70/55 są spełnione |
| `npm run build` | zaliczony. Next.js 16.4.5. Trasy panelu są dynamiczne, proxy jest aktywne |
| `npm run test:e2e` | 72 zaliczone, w tym desktop i mobile dla panelu. `PLAYWRIGHT_BROWSERS_PATH` wskazywał lokalny katalog przeglądarek |

Pierwszy `npm run build` zatrzymał się na `delete` w teście adaptera. Po usunięciu tej konstrukcji build przeszedł.

## Co pokrywają testy

- wyłączona publiczna rejestracja, błędne hasło, poprawne logowanie, sesja unieważniona i wygasła, blokada konta;
- role owner, manager i employee oraz odmowa dostępu bez sesji;
- zapis zgłoszenia, duplikat, konflikt nie jest potrzebny do sukcesu formularza, status, przypisanie, notatka i historia;
- brak Resend po zapisie daje sukces i status `skipped`; odrzucenie i timeout dostawcy zostawiają zapis;
- niedostępna baza daje 503 bez adresu e-mail w odpowiedzi;
- bootstrap bez tokenu jest ukryty, zły token dostaje 401, brak bazy przy dobrym tokenie daje 503;
- retencja bez `DATA_RETENTION_DAYS` nic nie usuwa;
- panel nie wchodzi do sitemapy i jest wyłączony z indeksowania;
- E2E: brak sesji przekierowuje z `/panel/zgloszenia` na logowanie, strona ma `noindex`, publiczny sign-up nie zwraca sukcesu.

## Czego nie uruchomiono

Nie ma lokalnego PostgreSQL, więc `prisma migrate deploy` nie został wykonany na prawdziwej bazie. Została wygenerowana migracja SQL i job CI `database`, który ma ją zastosować na Postgres 16. Adapter Prismy jest pokryty atrapą w teście jednostkowym, nie pełnym silnikiem.

Nie uruchamiano Lighthouse w tej turze. Nie było wdrożenia ani testu na prawdziwym Resend.

