# Prompt dla Cursor Agent — wdrożenie dokumentacji roadmapy

W projekcie `D:\Projects\paintball website` z repozytorium `MagicMikky/strefa-57` zaktualizuj **dokumentację produktu**, korzystając z przekazanych plików:

1. `STREFA29_NOWA_ROADMAPA_I_PLAN_WERSJI_2026-11-06.md`
2. `STREFA29_REJESTR_DECYZJI_DO_USTALENIA.md`

**Najpierw** sprawdź aktualną gałąź, niezapisane zmiany, PR #11 oraz PR #13 (panel pracowników). PR #13 jest zależny od PR #11. Nie nadpisuj lub nie cofaj jego implementacji uwierzytelniania, bazy danych ani skrzynki zgłoszeń.

Cel: umieść dokumenty w `docs/` jako plan nadrzędny i rejestr decyzji, skontroluj spójność z `strona1_0.md`, `strona2_0.md`, `docs/STREFA29_LEAGUE_ROADMAP.md`, `docs/open-decisions.md`, `AGENTS.md` i `.cursor/rules/`. Dodaj krótkie odnośniki do nowego planu tam, gdzie jest to konieczne. Nie usuwaj poprzednich planów; oznacz stare zakresy jako historyczne tam, gdzie są sprzeczne z zatwierdzoną, nową roadmapą.

Przyjmij wartości początkowe: max 8 zawodników w drużynie, 2–4 drużyny w meczu, max 32 graczy/slot, sloty 08:00, 11:00, 14:00, gra 120 min i 60 min przerwy; trzy sloty dają 96 miejsc dziennie, próg połowy wynosi 48. Właściciel musi mieć możliwość zmiany tych wartości w przyszłym panelu. Kalendarz: zielony poniżej połowy zajętości, niebieski od połowy, czerwony gdy brak dostępności; modal dnia z każdym slotem i wolnymi miejscami, rezerwacja współdzielona i prywatna oraz blokowanie dat/slotów przez ownera.

**Wszystkie ceny, zadatek, dopłata za prywatny slot, dokładne zasady anulowania/zwrotów, dostawca płatności, liczba zestawów sprzętu i inne sprawy oznaczone OTWARTE pozostaw bez wymyślonych wartości.** Polityka pogodowa „co do zasady brak zwrotu przy niepogodzie” wymaga doprecyzowania i weryfikacji prawnej oraz wyjątków bezpieczeństwa.

Plan wersji: 1.0 strona; 1.5A logowanie pracowników i inbox (już rozpoczęte); 1.5B panel ownera + CMS i wszystkie edytowalne dane biznesowe; 2.0 rezerwacje gościnne, kalendarz i płatności; 2.1 konta klientów; 2.2 drużyny; 2.3 rankingi; 3.0 liga/turnieje/nagrody.

W tej operacji **nie implementuj v2.0 ani nowych ekranów produkcyjnych**. To zadanie porządkujące wymagania i backlog. Na końcu wygeneruj plan PR-ów, zależności, listę niespójności i raport dokumentacyjny. Zrób commit na osobnej gałęzi i przygotuj PR do przeglądu, ale nie wykonuj merge ani wdrożenia produkcyjnego bez zgody właściciela.
