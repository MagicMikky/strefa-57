> Historia. Bieżący plan: `docs/STREFA29_MASTER_PLAN.md`.

# Aktualizacja dokumentacji roadmapy — 6 listopada 2026

Ten plik zapisuje porządkowanie wymagań. Nie dodaje ekranów, tabel ani płatności.

## Co zostało dokumentem nadrzędnym

- `docs/STREFA29_NOWA_ROADMAPA_I_PLAN_WERSJI_2026-11-06.md` — kolejność wersji i reguły startowe.
- `docs/STREFA29_REJESTR_DECYZJI_DO_USTALENIA.md` — U-01–U-11 oraz D-01–D-36.
- `docs/open-decisions.md` — skrót dla agenta, ze wskazaniem pełnego rejestru.

Wartości startowe: 8 zawodników w drużynie, 2–4 drużyny, 32 graczy na slot, starty 08:00, 11:00 i 14:00, 120 minut gry, 60 minut przerwy. Trzy sloty dają 96 miejsc, próg połowy to 48. Kolory kalendarza: zielony poniżej połowy, niebieski od połowy, czerwony przy braku dostępności. Modal dnia pokazuje każdy slot i wolne miejsca. Rezerwacja może być współdzielona albo prywatna. Właściciel blokuje dzień albo slot. Te liczby mają być później edytowalne w panelu i nie są jeszcze zaimplementowane.

Ceny, zadatek, dopłata za slot prywatny, anulowanie, zwroty, operator płatności i liczba zestawów pozostają bez wartości. Polityka pogodowa U-11 jest preferencją i wymaga oceny prawnej oraz wyjątków bezpieczeństwa.

## Niespójności i jak zostały oznaczone

| Miejsce | Sprzeczność z nowym planem | Oznaczenie |
|---|---|---|
| `strona2_0.md` §16 | konta klientów i CMS „poza produktem” | historyczne; konta to 2.1, CMS to 1.5B |
| `strona2_0.md` V2-05–V2-09 | pojemność i godziny całkiem OTWARTE | częściowo zastąpione przez U-01–U-08; sprzęt, obsada, sezon, wyprzedzenie, dopłata i minimum drużyn zostają OTWARTE |
| `strona2_0.md` V2-14 | dostawca logowania panelu OTWARTY | historyczne jako brak wyboru; 1.5A już używa Better Auth w PR #13, MFA nadal OTWARTE (D-27) |
| `docs/STREFA29_LEAGUE_ROADMAP.md` | etapy L1–L3 i mecz dwóch drużyn | L1=2.2, L2/L3=2.3 i 3.0; mecz startowo ma 2–4 drużyny |
| `AGENTS.md` i reguła zakresu | baza i konta zablokowane do v2.0 | 1.5A już ma bazę pracowników; kolejne wersje nadal wymagają osobnego zlecenia |
| `strona1_0.md` | „orientacyjne ceny” jako cel treści | nie jest zgodą na wpisanie stawek; D-05 zostaje OTWARTE |

`strona1_0.md` i `strona2_0.md` zostały zachowane. Pierwszy nadal opisuje stronę 1.0. Drugi nadal opisuje silnik rezerwacji gościnnej.

## Zależności pull requestów

1. `main`
2. PR #11 `release/v1-readiness` → `main` — odbiór 1.0, otwarty
3. PR #13 `feature/staff-panel` → `release/v1-readiness` — 1.5A, otwarty, zależny od #11
4. Ten PR dokumentacji → `feature/staff-panel` — tylko dokumenty, bez zmian auth i skrzynki
5. PR #14 `feature/gallery-coverflow` → `feature/staff-panel` — galeria, osobna gałąź, nieobjęta tym PR

Nie scalać #11, #13, #14 ani tego PR bez zgody właściciela. Nie wdrażać produkcji.

## Kolejne PR-y implementacyjne, jeszcze nieotwarte

1. v1.5B-1 modele CMS i dane firmy
2. v1.5B-2 edytor treści
3. v1.5B-3 galeria w panelu
4. v1.5B-4 harmonogram, limity i blokady bez sprzedaży
5. v2.0-1…v2.0-5 kalendarz, rezerwacja, płatność, panel operacyjny i odbiór
6. v2.1 konta klientów
7. v2.2 drużyny
8. v2.3 rankingi
9. v3.0 liga, turnieje i nagrody

Każdy z nich startuje dopiero po osobnym zleceniu i po zamknięciu decyzji oznaczonych jako warunek wejścia.

