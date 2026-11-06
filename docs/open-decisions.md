# Decyzje właściciela

Kanoniczny rejestr jest w `docs/STREFA29_DECYZJE_DO_USTALENIA.md`. Plan bieżący jest w `docs/STREFA29_MASTER_PLAN.md`. Ten plik zostaje jako skrót historyczny i nie wprowadza innych wartości.

Wartości startowe z 2026-11-06 są seedem przyszłego panelu, nie stałą w kodzie: 8 zawodników w drużynie, 2–4 drużyny w meczu, 32 graczy na slot, starty 08:00, 11:00 i 14:00, 120 minut gry i 60 minut przerwy. Trzy sloty dają 96 miejsc, a próg połowy wynosi 48. Kolor dnia: zielony poniżej połowy, niebieski od połowy, czerwony gdy brak dostępności. Rezerwacja może być współdzielona albo prywatna. Właściciel blokuje dzień albo slot. Dopłata za slot prywatny nie ma kwoty.

Ceny, zadatek, anulowanie, zwroty, operator płatności, liczba zestawów i pozostałe pozycje OTWARTE nie mają wartości produkcyjnej. Pogoda (U-11) jest tylko preferencją i wymaga oceny prawnej oraz wyjątków bezpieczeństwa.

Poniższe sprawy techniczne też nie są zatwierdzone. Kod nie przyjmuje dla nich własnego domysłu.

| Temat | Stan | Skutek w kodzie |
| --- | --- | --- |
| Okres retencji zgłoszeń (`DATA_RETENTION_DAYS`) | brak decyzji | zadanie retencji nic nie usuwa |
| Włączenie MFA dla pracowników | przygotowana kolumna, brak wdrożenia | logowanie jest hasłem i sesją |
| Wspólny magazyn limitu logowania przy wielu instancjach | niepodłączony | limit Better Auth jest w pamięci procesu |
| Regulamin ligi: punkty, sezon, tie-break, walkowery, nagrody, kto zatwierdza wynik | brak decyzji | brak tabel turniejów i rankingu; opis w `docs/STREFA29_LEAGUE_ROADMAP.md` |
