# Paintball Strefa 29 — instrukcje dla agenta

To repozytorium jest stroną marketingową 1.0 oraz rozpoczętym panelem 1.5A. Plan nadrzędny jest w `docs/STREFA29_NOWA_ROADMAPA_I_PLAN_WERSJI_2026-11-06.md`, a niezatwierdzone wartości w `docs/STREFA29_REJESTR_DECYZJI_DO_USTALENIA.md` i `docs/open-decisions.md`.

Nie implementuj CMS 1.5B, rezerwacji, płatności, kont klientów, drużyn, rankingów ani ligi, dopóki właściciel nie wskaże konkretnej wersji. Nie wymyślaj cen, zadatku, dopłaty, zasad zwrotu, operatora płatności ani liczby zestawów. Nie cofaj logowania pracowników ani skrzynki zgłoszeń z PR #13.

## Zanim zmienisz kod

- Przeczytaj `strona1_0.md`, `strona2_0.md`, plan nadrzędny i `.cursor/rules/`.
- Nie wymyślaj nazwy firmy, telefonu, e-maila, cen, opinii, zdjęć, wieku uczestników ani regulaminów.
- Nie wdrażaj na produkcję i nie scalaj zmian bez wyraźnej zgody.
- Sekrety zostają poza repozytorium. W `.env.example` są tylko nazwy zmiennych.

## Sprawdzenia

Po zmianie logiki uruchom `npm run typecheck`, `npm run lint`, `npm test` i `npm run build`. Po zmianie UI uruchom też `npm run test:e2e`. Nie opisuj testu jako zaliczonego, jeśli się nie wykonał.

## Etap 2.0

Architektura rezerwacji i płatności jest w `strona2_0.md` oraz w skillu `booking-payments-reliability`. Kolejność wersji i wartości startowe pojemności są w planie nadrzędnym. Nie implementuj rezerwacji w ramach prac nad 1.0 ani 1.5A.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
