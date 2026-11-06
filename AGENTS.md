# Paintball Strefa 29 — instrukcje dla agenta

To repozytorium zawiera stronę marketingową 1.0, panel 1.5A (logowanie pracowników i skrzynka zgłoszeń) oraz działający CMS właściciela 1.5B: firma, treści, galeria, harmonogram i historia publikacji. Kalendarz dostępności pokazuje opublikowane sloty i prowadzi do zapytania. Checkout jest wyłączony. Plan nadrzędny jest w `docs/STREFA29_MASTER_PLAN.md`, backlog w `docs/STREFA29_CURSOR_ROADMAP_TODO.md`, a niezatwierdzone wartości tylko w `docs/STREFA29_DECYZJE_DO_USTALENIA.md`.

Nie cofaj logowania, skrzynki, CMS-a, galerii, harmonogramu ani kalendarza. Nie implementuj płatności, kont klientów, drużyn, rankingów ani ligi, dopóki właściciel nie wskaże konkretnej wersji i nie zatwierdzi decyzji handlowych. Nie wymyślaj cen, zadatku, dopłaty, zasad zwrotu, operatora płatności ani liczby zestawów.

## Zanim zmienisz kod

- Przeczytaj `docs/STREFA29_MASTER_PLAN.md`, `docs/STREFA29_DECYZJE_DO_USTALENIA.md` i `.cursor/rules/`. `strona1_0.md`, `strona2_0.md` i starsze roadmapy są historią wymagań.
- Nie wymyślaj nazwy firmy, telefonu, e-maila, cen, opinii, zdjęć, wieku uczestników ani regulaminów.
- Nie wdrażaj na produkcję i nie scalaj zmian bez wyraźnej zgody.
- Sekrety zostają poza repozytorium. W `.env.example` są tylko nazwy zmiennych.
- Nie publikuj projektu polityki prywatności. Publiczna strona czeka na zatwierdzenie właściciela.

## Sprawdzenia

Po zmianie logiki uruchom `npm run typecheck`, `npm run lint`, `npm test` i `npm run build`. Po zmianie UI uruchom też `npm run test:e2e`. Nie opisuj testu jako zaliczonego, jeśli się nie wykonał.

## Etap 2.0

Architektura rezerwacji i płatności jest w `strona2_0.md` oraz w skillu `booking-payments-reliability`. Nie implementuj pobierania pieniędzy, dopóki checkout w `src/lib/business/checkout-gate.ts` ma `enabled: false` i decyzje D-05–D-23 pozostają otwarte. `/rezerwacja` prowadzi do zapytania.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
