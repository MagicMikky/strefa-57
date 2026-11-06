# STREFA 29 LEAGUE — plan rozbudowy

Ten dokument opisuje przyszły system ligowy. Nie włącza go. Nie ma tabel drużyn, turniejów, wyników ani rankingu i nie wolno ich dodawać, dopóki właściciel nie zleci konkretnej wersji.

Od 6 listopada 2026 kolejność wyznacza `docs/STREFA29_NOWA_ROADMAPA_I_PLAN_WERSJI_2026-11-06.md`. Liga nie jest częścią rezerwacji v2.0. Konta klientów są wersją 2.1, drużyny 2.2, rankingi 2.3, a turnieje i nagrody 3.0. Wcześniejsze etapy L1–L3 z dołu tego pliku oznaczają te same prace pod starymi nazwami. Wersja 1.5A zostaje przy kontach pracowników i skrzynce zgłoszeń.

Założenie „mecz to dwie drużyny” jest historyczne. Wartość startowa U-02 dopuszcza od 2 do 4 drużyn, z limitem 8 zawodników w drużynie i 32 graczy w slocie. Punktacja, sezon, tie-break, walkowery i ostatnie słowo w sporze pozostają OTWARTE (D-33, D-34).

## Co zostaje z kont pracowniczych

Jedna osoba ma jeden wiersz `User` Better Auth: identyfikator, e-mail, hasło w `Account`, sesje w `Session`. Tych tabel nie wymieniamy, gdy dojdą role sportowe.

`User.role` jest tylko bramką panelu:

| Wartość | Znaczenie |
| --- | --- |
| `owner`, `manager`, `employee` | pracownik; dostęp do `/panel` według macierzy uprawnień |
| `member` | zalogowana osoba bez uprawnień pracowniczych; wartość domyślna nowego wiersza |

`requireStaff` wpuszcza wyłącznie trzy role pracownicze. Rola `customer`, `player`, `captain`, `referee` albo `organizer` nie przechodzi tej bramki. Wejście takiej osoby na `/panel` nie kasuje jej sesji. Wyłączenie pracownika nadal kasuje sesje.

Przyszłe role sportowe nie trafiają do `User.role`. Ta sama osoba może być pracownikiem i kapitanem: panel czyta kolumnę pracowniczą, liga czyta członkostwo w drużynie albo obsadę turnieju. Kapitan nie dostaje `inquiries.read` ani `staff.manage`.

Lista osób do przypisania zgłoszenia bierze tylko role pracownicze. Konto ligowe nie pojawi się jako opiekun zgłoszenia.

Publiczna rejestracja zostaje wyłączona. Ligi nie wolno oprzeć na otwartym `signUp`, dopóki właściciel nie zatwierdzi osobnej ścieżki założenia konta.

## Moduły, których jeszcze nie ma

| Moduł | Odpowiedzialność |
| --- | --- |
| Profil klienta | konto osoby, która może się zalogować i nie jest pracownikiem |
| Profil zawodnika | dane potrzebne do gry ligowej, powiązane z tym samym `User` |
| Drużyny | nazwa drużyny, skład, zaproszenia |
| Kapitan | rola w konkretnej drużynie, nie rola globalna |
| Turnieje i sezony | terminarz zatwierdzony przez właściciela, nie wymyślony w kodzie |
| Sędzia i organizator | obsada konkretnego turnieju |
| Wyniki | propozycja, potwierdzenie, spór |
| Ranking drużynowy i indywidualny | liczony wyłącznie z zatwierdzonych wyników |
| Nagrody roczne | zapis po zamknięciu sezonu, według zasad zatwierdzonych przez właściciela |

Ścieżki ligi nie mogą wisieć pod `/panel`. Proxy `/panel` służy pracownikom. Publiczny podgląd rankingu i konto zawodnika dostaną własne trasy, gdy etap zostanie zatwierdzony.

## Model danych do dodania później

Poniższe nazwy są planem migracji, nie obecnym schematem.

- `PlayerProfile` — jeden rekord na `User`. Powstaje świadomie, nie z adresu e-mail ze zgłoszenia o termin.
- `Team` — drużyna sezonu. Sezon jest osobnym bytem, nie rokiem wpisanym na sztywno w kodzie.
- `TeamMembership` — `userId`, `teamId`, rola `player` albo `captain`, status zaproszenia. Kapitanem jest członkostwo, nie `User.role`.
- `TeamInvitation` — jednorazowy token przechowywany jako skrót, data wygaśnięcia, drużyna i adres albo konto zaproszonej osoby.
- `Tournament` — należy do sezonu. Organizator nie jest kolumną na `User`.
- `TournamentAssignment` — `userId`, `tournamentId`, rola `organizer` albo `referee`. Uprawnienie kończy się wraz z turniejem.
- `Match` — od 2 do 4 drużyn według U-02. Sposób wyłonienia zwycięzcy przy 3–4 drużynach jest OTWARTY (D-33). Wcześniejszy zapis „dwie drużyny” jest historyczny.
- `MatchResult` — propozycja wyniku, autor, status `proposed`, `confirmed` albo `disputed`, kto potwierdził.
- `Standing` — materializacja rankingu po zatwierdzonych wynikach. Można ją policzyć ponownie. Nie jest źródłem prawdy.
- `SeasonAward` — nagroda po zamknięciu sezonu. Nazwy nagród i progi nie są ustalone.

Usunięcie konta pracownika nie może skasować historii wyników, przy których ta osoba była sędzią. Relacje historyczne zostają `SetNull` albo zakazem usunięcia, tak jak przy notatkach zgłoszeń. O tym zdecyduje migracja etapu ligi, nie ten dokument.

## Zatwierdzanie wyników

Wynik nie zmienia rankingu w chwili wpisania. Proponowany przebieg, do zatwierdzenia przez właściciela:

1. Kapitan drużyny zapisuje propozycję wyniku swojego meczu.
2. Wynik staje się `confirmed` dopiero po zgodzie kapitana drugiej drużyny albo po decyzji sędziego albo organizatora tego turnieju.
3. Sprzeciw zostawia status `disputed`. Sporny mecz nie daje punktów.
4. Poprawka zatwierdzonego wyniku zapisuje, kto i kiedy ją zrobił. Poprzednia wartość zostaje w historii.
5. Pracownik panelu nie zatwierdza wyniku tylko dlatego, że ma rolę `owner`. Musi mieć obsadę sędziego albo organizatora, albo właściciel musi później przyznać osobne uprawnienie.

Kto ma ostatnie słowo przy sporze, nie jest jeszcze zatwierdzone. Do tego czasu kod ligi nie powstaje. Decyzja jest w `docs/open-decisions.md`.

## Założenia rankingu

Rankingu nie liczymy, dopóki właściciel nie zatwierdzi zasad. W dokumencie nie ma wzoru punktów, liczby drużyn, długości sezonu ani nazw nagród, bo tych danych nie ma w materiałach firmy.

Gdy zasady powstaną, ranking ma spełniać te warunki techniczne:

- liczy się tylko mecz `confirmed`;
- ranking drużynowy i indywidualny są osobnymi zestawieniami;
- remis i tie-break pochodzą z zatwierdzonej tabeli, nie z domysłu w kodzie;
- walkower wchodzi do rankingu tylko wtedy, gdy regulamin ligi to przewiduje;
- powtórne przeliczenie z tabeli wyników daje ten sam ranking;
- publicznie widać nazwę drużyny i nazwę wyświetlaną zawodnika, nie e-mail, telefon ani adres;
- nagroda roczna powstaje po zamknięciu sezonu i nie zmienia się przy późniejszej edycji, dopóki właściciel jej nie wznowi.

## Bezpieczeństwo

Dwa niezależne sprawdzenia: uprawnienie pracownicze i rola sportowa w konkretnym zasobie. Kapitan drużyny A nie edytuje składu drużyny B. Sędzia turnieju A nie zatwierdza meczu turnieju B.

Zaproszenie jest jednorazowe, ma termin ważności, a w bazie leży skrót tokenu. Przyjęcie zaproszenia wymaga zalogowanego konta tej osoby. Nie wolno dołączać do drużyny samym adresem e-mail ze zgłoszenia paintballowego.

Każda operacja na składzie, zaproszeniu i wyniku sprawdza właściciela rekordu po stronie serwera. Identyfikator w adresie nie wystarcza.

Log ligi nie zawiera haseł, tokenów zaproszeń ani pełnych danych kontaktowych. Publiczny ranking nie jest źródłem listy klientów.

Limit prób logowania zostaje wspólny z Better Auth. Osobno trzeba będzie ograniczyć wysyłkę zaproszeń, tak jak formularz publiczny ma własny limit.

## Podział prac

| Etap | Odpowiednik w planie nadrzędnym | Zakres | Poza zakresem |
| --- | --- | --- | --- |
| 1.5A, teraz | 1.5A | konta pracowników, skrzynka zgłoszeń, bramka `User.role`, ten dokument | CMS 1.5B, rezerwacje, drużyny, turnieje, ranking, nagrody, konta klientów |
| L1, historyczna nazwa | 2.2 | profil zawodnika, drużyna, zaproszenie, kapitan jako członkostwo; startowy limit składu 8 | mecze i punkty |
| L2, historyczna nazwa | 2.3 i część 3.0 | mecz 2–4 drużyn, propozycja wyniku, sędzia i organizator | publiczny ranking przed zatwierdzoną punktacją |
| L3, historyczna nazwa | 2.3 i 3.0 | ranking drużynowy i indywidualny, nagrody roczne po zatwierdzonym regulaminie | płatności i rezerwacje |

Każdy etap zaczyna się od zatwierdzonych zasad i własnej migracji. Istniejących wierszy `User` pracowników nie przepisujemy na nowy model tożsamości. Dochodzą tylko powiązane rekordy.

Nie scalać tego planu z produkcją i nie wdrażać go razem z panelem, dopóki właściciel nie poprosi o konkretny etap.
