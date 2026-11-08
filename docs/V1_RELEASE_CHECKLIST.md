> Historia. Bieżący plan: `docs/STREFA29_MASTER_PLAN.md`.

# Lista odbioru wersji 1.0

Strona nie jest gotowa do publikacji, dopóki punkty P0 nie są odhaczone przez właściciela i ponownie przetestowane.

## P0 — bez tego nie publikować

- [ ] Nazwa prawna, NIP i administrator danych wpisane w politykę i stopkę.
- [ ] Publiczny telefon i e-mail działają na telefonie. Błąd formularza pokazuje te same dane.
- [ ] Godziny kontaktu są prawdziwe albo strona wprost mówi, że nie są jeszcze podane.
- [ ] Cennik ma zatwierdzone kwoty albo nadal mówi, że cena wymaga potwierdzenia. Nie ma wymyślonych kwot.
- [ ] Wiek, zgoda opiekuna, pogoda i anulowanie są zatwierdzone albo oznaczone jako nieustalone.
- [ ] Regulamin, polityka prywatności i cookies przeszły przegląd. Ustalono retencję wiadomości w skrzynce.
- [ ] Zdjęcia w `public/gallery` mają prawa i zgody. Wpisy są w `src/data/gallery.ts`. Folder `layout/` nie trafia na stronę hurtowo.
- [ ] Testowe zgłoszenie zapisuje się w PostgreSQL i jest widoczne w `/panel/zgloszenia`; aplikacja nie wykonuje wysyłki e-mail.
- [ ] Indeksacja pozostaje wyłączona do osobnej zgody. Potem `NEXT_PUBLIC_ALLOW_INDEXING=true` i publiczny `NEXT_PUBLIC_SITE_URL`.
- [ ] Na stagingu i produkcji jest wspólny limit: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` i `RATE_LIMIT_TRUST_PROXY` zgodny z hostingiem.
- [ ] Ochrona `main` wymaga zielonego CI. Instrukcja jest w runbooku.
- [ ] Jest osoba odbierająca wydanie i procedura, gdy formularz nie działa.

## P1 — przed albo tuż po cichym starcie

- [ ] Ręczny test czytnika ekranu: strona główna, formularz, dialog cookies, menu mobilne.
- [ ] Przegląd raportów CSP i decyzja o egzekwowaniu polityki.
- [ ] Dostawca analityki albo świadoma decyzja, że pomiaru nie będzie. Samo kliknięcie „Akceptuj analityczne” niczego nie mierzy.
- [ ] JSON-LD uzupełnione o zatwierdzony telefon i godziny albo ograniczone, jeśli pin dojazdu jest inny.
- [ ] Monitoring błędów aplikacji i niedostarczonych zapytań, bez treści formularza w logach.
- [ ] Opinie tylko ze źródłem i zgodą.

## Kontrola techniczna wykonana w repozytorium

- [ ] `npm ci`
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm test`
- [ ] `npm run test:coverage`
- [ ] `npm run build`
- [ ] `npm run test:e2e`
- [ ] `npm run lhci`
- [ ] `npm audit --omit=dev`
- [ ] `npm audit` bez `--force`

Wyniki konkretnego przebiegu wpisuje się w opisie pull requesta, nie w tej liście z góry.

