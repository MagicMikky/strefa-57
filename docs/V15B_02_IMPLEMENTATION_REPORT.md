> Historia. Bieżący plan: `docs/STREFA29_MASTER_PLAN.md`.

# V1.5B-2 — edytor treści

Data: 2026-11-06. Gałąź: `feature/content-cms`, baza: `main`.

## Zakres

Właściciel edytuje i publikuje FAQ, opisy atrakcji, teksty pakietów oraz tytuły i opisy SEO strony głównej, FAQ, oferty i cennika. Zapis jest wersją roboczą. Strona publiczna czyta tylko wiersz `published` z tabeli `SiteContent`. Brak bazy albo błąd odczytu wraca do dotychczasowej kopii z `src/data/site.ts`.

Publikacja wywołuje `revalidatePath` i nie wymaga przebudowania aplikacji.

## Czego ten etap nie robi

- Nie ustawia cen, zadatku ani dopłat. Tekst z kwotą jest odrzucany. Cena na karcie pakietu zostaje „Wycena po zapytaniu” albo „Wycena indywidualna”.
- Nie zmienia identyfikatorów pakietów, więc formularz zapytań dalej je rozpoznaje.
- Nie dodaje edytora galerii, harmonogramu, regulaminów ani płatności. To kolejne PR: 1.5B-3 i 1.5B-4.

## Uprawnienia

Zapis i publikacja używają istniejącego `business.publish`. Ma je tylko `owner`.

## Migracja

`prisma/migrations/20261106193000_site_content` tworzy `SiteContent`. Treść startowa nie jest kopiowana do bazy, dopóki właściciel jej nie zapisze. Do tego czasu strony używają kopii z kodu.

