> Historia. Bieżący plan: `docs/STREFA29_MASTER_PLAN.md`.

# V2.0-2 — blokada pojemności bez sprzedaży

Data: 2026-11-06. Gałąź: `feature/capacity-holds`, baza: `main`.

## Zakres

Silnik przyjmuje jedną drużynę, maksymalnie 8 osób, na opublikowany dzień i start. Dwie równoległe próby na ostatnie miejsce drużynowe kończą się jedną blokadą. Wygasła blokada nie zajmuje miejsca. Ten sam klucz idempotencji nie zajmuje drugiego miejsca.

Czas blokady nie ma wartości produkcyjnej. `holdMinutes: null` jest odrzucane, a strona `/rezerwacja` nie tworzy blokad. Nie ma ceny, zadatku, danych gościa ani płatności.

Kalendarz dolicza istniejące, niewygasłe blokady. Gdy baza jest skonfigurowana, ale odczyt się nie uda, widok mówi, że kolor nie potwierdza wolnych miejsc.

## Czego nie uruchomiono

Lokalnie nie ma `DATABASE_URL`, a Docker nie działa. Migracja i równoległy test na prawdziwym PostgreSQL nie zostały wykonane. Test kolejki w pamięci nie zastępuje blokady `pg_advisory_xact_lock`.

