> Historia. Bieżący plan: `docs/STREFA29_MASTER_PLAN.md`.

# V2.0-3 — bramka checkoutu

Data: 2026-11-06. Gałąź: `feature/checkout-gate`, baza: `feature/owner-availability`.

`checkoutReadiness` zawsze zwraca sprzedaż jako wyłączoną. Uzupełnienie kolumn zadatku, dopłaty, operatora albo flagi `commercialApproved` nie otwiera płatności, bo ceny pakietów, zwroty, okno rezerwacji, czas blokady i regulamin sprzedaży pozostają niezatwierdzone.

Panel `/panel/dostepnosc` pokazuje tę listę właścicielowi. Publiczna strona nie dostaje przycisku płatności.

