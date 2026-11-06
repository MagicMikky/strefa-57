# Paintball Strefa 29 — instrukcje dla agenta

To repozytorium jest stroną marketingową wersji 1.0. Nie dodawaj kont klientów, rezerwacji, płatności ani bazy danych, dopóki właściciel nie zatwierdzi etapu 2.0.

## Zanim zmienisz kod

- Przeczytaj `strona1_0.md`, `strona2_0.md` i `.cursor/rules/`.
- Nie wymyślaj nazwy firmy, telefonu, e-maila, cen, opinii, zdjęć, wieku uczestników ani regulaminów.
- Nie wdrażaj na produkcję i nie scalaj zmian bez wyraźnej zgody.
- Sekrety zostają poza repozytorium. W `.env.example` są tylko nazwy zmiennych.

## Sprawdzenia

Po zmianie logiki uruchom `npm run typecheck`, `npm run lint`, `npm test` i `npm run build`. Po zmianie UI uruchom też `npm run test:e2e`. Nie opisuj testu jako zaliczonego, jeśli się nie wykonał.

## Etap 2.0

Architektura rezerwacji i płatności jest opisana tylko w `strona2_0.md` oraz w skillu `booking-payments-reliability`. Nie implementuj jej w ramach prac nad 1.0.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
