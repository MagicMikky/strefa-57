# V2.0-1 — kalendarz dostępności

Data: 2026-11-06. Gałąź: `feature/availability-calendar`, baza: `main`.

## Zakres

Publiczna strona `/rezerwacja` liczy dni i sloty z opublikowanej pojemności oraz opublikowanego harmonogramu. Przy braku bazy używa startowych limitów 8 / 4 drużyny / 32 i startów 08:00, 11:00, 14:00. Nie ma jeszcze rezerwacji, więc zajętość wynosi zero, dopóki właściciel nie zablokuje dnia albo slotu.

Kolor dnia jest liczony od pojemności otwartych slotów, nie od wpisanej na stałe liczby 48. Puste dni tygodnia zostają „nieustalone”. Przycisk slotu prowadzi do istniejącego zapytania i nie tworzy blokady, rezerwacji ani płatności. Ceny, zadatek i operator płatności pozostają nieustalone.
