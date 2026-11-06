> Historia. Bieżący plan: `docs/STREFA29_MASTER_PLAN.md`.

# Uruchomienie panelu pracownika

## PostgreSQL

Aplikacja czyta `DATABASE_URL`. Przykład lokalny, bez prawdziwego hasła:

`postgresql://USER:PASSWORD@localhost:5432/strefa?schema=public`

Użytkownik bazy aplikacji nie powinien być superużytkownikiem. Migracje są w `prisma/migrations` i uruchamia się je przez `npx prisma migrate deploy`. Na środowisku deweloperskim schemat generuje `npm run db:generate`, a `postinstall` i `build` też wołają `prisma generate`.

## Sekrety

Uzupełnij lokalny `.env`, którego nie commitujemy:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET` — co najmniej 32 losowe znaki
- `BETTER_AUTH_URL` — publiczny adres aplikacji, na przykład `http://localhost:3000`
- `STAFF_BOOTSTRAP_TOKEN` — co najmniej 32 losowe znaki, tylko na czas utworzenia właściciela
- `NOTIFICATION_WORKER_TOKEN` — co najmniej 32 losowe znaki
- `RATE_LIMIT_SALT`, `RESEND_API_KEY`, `INQUIRY_TO_EMAIL`, `INQUIRY_FROM_EMAIL` — jak dotychczas
- `DATA_RETENTION_DAYS` — zostaw puste do zatwierdzenia okresu

`INQUIRY_STORE=memory` jest wyłącznie dla testów. Produkcja ma zostawić tę zmienną pustą.

## Pierwszy właściciel

Gdy baza i sekrety są ustawione:

```http
POST /api/staff/bootstrap
Authorization: Bearer <STAFF_BOOTSTRAP_TOKEN>
Content-Type: application/json

{"name":"Imię Nazwisko","email":"owner@example.com","password":"<hasło 12+ ze znakiem i cyfrą>"}
```

Odpowiedź nie zawiera hasła. Drugie wywołanie po istniejącym właścicielu zwraca 409. Potem usuń `STAFF_BOOTSTRAP_TOKEN` ze środowiska. Dalszych pracowników dodaje właściciel w `/panel/pracownicy`. Panel nie zakłada drugiego właściciela.

Logowanie: `/panel/logowanie`.

## Powiadomienia i retencja

Zapis zgłoszenia nie zależy od Resend. Ponowienie:

```http
POST /api/internal/notifications
Authorization: Bearer <NOTIFICATION_WORKER_TOKEN>
```

To samo wywołanie z `/api/internal/retention` usuwa zgłoszenia tylko wtedy, gdy `DATA_RETENTION_DAYS` jest dodatnią liczbą całkowitą od 1 do 3650. Bez tej zmiennej odpowiedź ma `configured: false` i `deleted: 0`.

## Kopie zapasowe

Kopia dotyczy bazy PostgreSQL, nie plików aplikacji. Przed pierwszym wdrożeniem ustal harmonogram `pg_dump`, miejsce przechowywania i osobę, która potrafi odtworzyć bazę. Tego repozytorium nie wdraża i nie uruchamia kopii na produkcji. Zrzut zawiera dane osobowe z formularza i ma te same ograniczenia dostępu co baza.

## Czego ten etap nie robi

Nie scala pull requestu, nie wdraża produkcji i nie włącza rezerwacji ani płatności.

