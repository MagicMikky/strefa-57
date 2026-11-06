# Paintball Strefa 29 — plan rozbudowy strony do wersji 2.0

> **Zakres historyczny tego pliku.** Opisuje pierwotny silnik rezerwacji gościnnej. Od 6 listopada 2026 plan nadrzędny jest w `docs/STREFA29_NOWA_ROADMAPA_I_PLAN_WERSJI_2026-11-06.md`, a rejestr w `docs/STREFA29_REJESTR_DECYZJI_DO_USTALENIA.md`.
>
> Bez zmian zostaje samo v2.0: rezerwacja gościnna, kalendarz i płatność, bez konta klienta. Konta klientów, wcześniej opisane jako funkcja poza produktem, są teraz wersją 2.1. Rozbudowany CMS, wcześniej poza v2.0, jest wersją 1.5B i powstaje przed rezerwacjami. Drużyny, rankingi i liga są wersjami 2.2, 2.3 i 3.0.
>
> Wartości startowe U-01–U-10 zastępują brak liczb dla pojemności i harmonogramu. Są seedem edytowalnym w przyszłym panelu, nie stałą w kodzie. Ceny, zadatek, dopłata prywatna, anulowanie, zwroty, operator płatności i liczba zestawów zostają OTWARTE.

## 1. Status i przeznaczenie dokumentu

| Pole | Wartość |
|---|---|
| Wersja produktu | 2.0 |
| Charakter zmiany | przyrost funkcjonalny do działającej strony 1.0 |
| Główna konwersja | potwierdzona rezerwacja gościnna ze stałym zadatkiem |
| Konto klienta | poza zakresem |
| Dokument bazowy | `strona1_0.md` |
| Dokument źródłowy | `PLAN_BUDOWY_STRONY_STREFA_29.md` |

Wersja 2.0 dodaje do działającej strony 1.0 bezpieczną rezerwację online. Nie zastępuje części informacyjnej i nie przebudowuje bez potrzeby stron oferty, cennika, galerii, FAQ, kontaktu ani dojazdu.

Nowy proces działa pod adresem `/rezerwacja`. Formularz `/zapytaj-o-termin` pozostaje dostępny jako kanał dla klientów preferujących kontakt z obsługą, nietypowych wydarzeń oraz jako bezpieczny fallback podczas wyłączenia sprzedaży online.

## 2. Cel i granice wersji 2.0

### 2.1. Cele

- prezentowanie wiarygodnej dostępności zależnej od liczby graczy i wybranego pakietu;
- umożliwienie gościowi wyboru terminu bez zakładania konta;
- bezpieczne pobranie stałego zadatku online;
- wyeliminowanie podwójnych rezerwacji w kanałach internetowych i telefonicznych;
- automatyczne potwierdzenie oraz bezpieczny dostęp do szczegółów wizyty;
- udostępnienie obsłudze minimalnego panelu do prowadzenia wspólnego kalendarza;
- zachowanie możliwości szybkiego wyłączenia rezerwacji bez wyłączania strony informacyjnej.

### 2.2. Definicja sukcesu

Wersja 2.0 spełnia swój cel, gdy:

1. klient może przejść od wyboru pakietu do potwierdzonego zadatku bez konta;
2. system nie przekracza pojemności nawet przy równoczesnych próbach;
3. rezerwacje internetowe i ręczne korzystają z jednego źródła prawdy;
4. każdą płatność można uzgodnić z danymi operatora;
5. obsługa może zmienić lub anulować termin bez bezpośredniej edycji bazy;
6. awaria modułu rezerwacji nie wyłącza publicznej strony 1.0.

### 2.3. Mierniki

| Miernik | Definicja |
|---|---|
| Rozpoczęcie procesu | użytkownik otworzył pierwszy krok `/rezerwacja` |
| Znalezienie terminu | system zwrócił przynajmniej jeden termin spełniający kryteria |
| Utworzenie blokady | serwer atomowo zarezerwował czasową pojemność |
| Przejście do płatności | utworzono wewnętrzną próbę płatności i sesję operatora |
| Potwierdzona rezerwacja | wiarygodny webhook potwierdził zadatek i system zużył blokadę |
| Porzucenie | proces nie przeszedł do kolejnego etapu w zdefiniowanym oknie |
| Błąd płatności | płatność zakończyła się niepowodzeniem albo wymaga interwencji |
| Brak dostępności | żadna konfiguracja slotu nie mieści wybranej grupy |
| Rezerwacja ręczna | pracownik utworzył rezerwację z panelu |

Zdarzenia analityczne nie mogą zawierać danych osobowych, treści uwag ani pełnego tokenu dostępu do rezerwacji.

## 3. Warunki rozpoczęcia realizacji

Implementacja modelu danych i dostępności może rozpocząć się dopiero po zatwierdzeniu poniższych reguł.

### 3.1. Pojemność i organizacja gry

- minimalna i maksymalna liczba graczy w pojedynczej rezerwacji;
- maksymalna liczba graczy i grup w jednym slocie;
- liczba kompletów sprzętu i wpływ braków sprzętowych na pojemność;
- minimalna obsada pracowników lub instruktorów;
- możliwość łączenia obcych grup oraz zasady wyłączności pola;
- długość gry, odprawy i buforu między slotami;
- wpływ pakietu lub dodatków na długość i zasoby;
- godziny rozpoczęcia, sezonowość, święta i wyjątki;
- minimalne wyprzedzenie oraz maksymalny horyzont rezerwacji;
- zasady zmiany liczby uczestników po wpłacie zadatku.

### 3.2. Ceny i płatności

- kwota stałego zadatku w PLN;
- zasada dla rezerwacji o wartości niższej od zadatku;
- sposób i termin zapłaty pozostałego salda;
- ceny pakietów, dodatków, stawki podatkowe i dokument sprzedaży;
- zasady zmiany ceny po zmianie liczby graczy lub pakietu;
- operator obsługujący wymagane metody płatności;
- zasady pełnego i częściowego zwrotu;
- sposób obsługi chargebacku oraz rozbieżności księgowych.

### 3.3. Anulowanie i zdarzenia wyjątkowe

- termin bezpłatnej zmiany i anulowania;
- zasady no-show;
- odwołanie przez obiekt, w tym z powodu pogody;
- awaria sprzętu, brak obsady lub zamknięcie pola;
- przeniesienie na inny termin oraz różnica ceny;
- procedura dla płatności zaksięgowanej po wygaśnięciu blokady.

### 3.4. Operacje i odpowiedzialność

- osoby uprawnione do panelu i ich role;
- źródło istniejących rezerwacji telefonicznych;
- proces przyjmowania rezerwacji podczas awarii;
- właściciel uzgodnienia płatności i zwrotów;
- osoba zatwierdzająca treści e-maili i dokumenty prawne;
- wymagany czas reakcji na alarmy operacyjne.

## 4. Zakres funkcjonalny klienta

### 4.1. Wejście do procesu

- główne CTA wersji 2.0: „Sprawdź terminy”;
- CTA na karcie pakietu przekazuje identyfikator pakietu do procesu;
- publiczne strony i kontakt pozostają dostępne bez rozpoczynania rezerwacji;
- `/zapytaj-o-termin` nadal obsługuje indywidualne wyceny, szkoły, firmy i przypadki niestandardowe.

### 4.2. Przepływ podstawowy

1. Klient wybiera liczbę graczy.
2. Wybiera pakiet oraz opcjonalne dodatki wpływające na cenę lub zasoby.
3. System pokazuje dni i godziny, które mogą pomieścić wybraną konfigurację.
4. Klient wybiera termin.
5. Serwer ponownie sprawdza pojemność i tworzy czasową blokadę.
6. Interfejs pokazuje czas pozostały do wygaśnięcia blokady.
7. Klient podaje dane organizatora oraz opcjonalne uwagi organizacyjne.
8. System przedstawia końcową cenę, wysokość zadatku i saldo do zapłaty poza systemem.
9. Klient akceptuje właściwą wersję regulaminu i potwierdza zapoznanie się z polityką prywatności.
10. System tworzy oczekującą rezerwację i próbę płatności przed przekierowaniem do operatora.
11. Operator przetwarza stały zadatek.
12. Podpisany webhook potwierdza wynik niezależnie od powrotu klienta do strony.
13. System atomowo potwierdza rezerwację, zapisuje zdarzenie i zleca e-mail.
14. Klient otrzymuje stronę wyniku, wiadomość oraz bezpieczny link do szczegółów.

### 4.3. Widok dostępności

- na telefonie podstawowym widokiem jest lista najbliższych dostępnych terminów;
- kalendarz miesięczny jest widokiem dodatkowym, a nie jedynym sposobem wyboru;
- tydzień rozpoczyna się w poniedziałek;
- oznaczenia używają tekstu lub ikony oprócz koloru;
- dostępność może być prezentowana jako „dostępny”, „mało miejsc”, „niedostępny” albo „zamknięty”;
- liczba pozostałych miejsc jest pokazywana tylko wtedy, gdy właściciel zatwierdzi taką komunikację;
- brak terminów prowadzi do alternatywnych dat oraz `/zapytaj-o-termin`;
- odpowiedź widoku jest informacyjna, a utworzenie blokady zawsze ponownie sprawdza pojemność na serwerze.

### 4.4. Blokada terminu

- czas blokady jest liczony według czasu bazy danych;
- interfejs wyświetla licznik, ostrzeżenie przed wygaśnięciem i dokładny skutek wygaśnięcia;
- odświeżenie strony może odzyskać ważną blokadę na podstawie bezpiecznego identyfikatora procesu;
- po wygaśnięciu klient nie może zapłacić na podstawie starej ceny i pojemności bez ponownego sprawdzenia;
- opóźnione zadanie sprzątające nie wpływa na poprawność — wygasłe blokady są ignorowane natychmiast;
- liczba aktywnych blokad jednej osoby lub adresu jest ograniczona, aby utrudnić blokowanie miejsc przez boty.

### 4.5. Podsumowanie i płatność

Przed uruchomieniem operatora klient widzi:

- wybrany termin i godzinę przyjazdu;
- liczbę graczy, pakiet i dodatki;
- końcową wartość zamówienia w PLN;
- kwotę stałego zadatku;
- saldo i sposób jego późniejszej zapłaty;
- zasady zmiany, anulowania oraz zwrotu;
- dane organizatora;
- czas pozostały do wygaśnięcia blokady.

Finalne CTA brzmi „Zarezerwuj i zapłać zadatek”. Kliknięcie jest idempotentne i nie może tworzyć wielu równoległych prób dla tego samego działania użytkownika.

### 4.6. Wynik płatności

Oddzielne stany interfejsu:

- **potwierdzona:** webhook został zweryfikowany, zadatek zapisany, a rezerwacja potwierdzona;
- **oczekująca:** operator nie podał jeszcze ostatecznego wyniku; strona nie obiecuje potwierdzenia;
- **odrzucona:** płatność nie powiodła się, a klient może spróbować ponownie w granicach reguł blokady;
- **przerwana:** klient wrócił bez zakończenia procesu;
- **wygasła:** blokada lub sesja płatnicza straciła ważność;
- **wymaga kontaktu:** płatność istnieje, ale termin nie może być automatycznie potwierdzony.

Sam powrót klienta z bramki płatniczej nigdy nie jest dowodem zapłaty.

### 4.7. Dostęp gościnny

- klient nie tworzy konta i nie ustawia hasła;
- e-mail zawiera link z losowym, wysokoentropijnym tokenem;
- w bazie przechowywany jest wyłącznie hash tokenu;
- token wygasa, może zostać unieważniony i daje dostęp tylko do jednej rezerwacji;
- wykorzystanie linku ustanawia ograniczoną sesję zamiast stale ujawniać token w kolejnych adresach;
- klient może zamówić nowy link po przejściu bezpiecznej procedury;
- publiczny numer rezerwacji nie jest mechanizmem autoryzacji.

Widok gościa pokazuje termin, pakiet, cenę, zadatek, saldo, dane organizacyjne, status oraz dozwolone działania. Nie ujawnia wewnętrznych uwag pracowników.

### 4.8. Zmiana i anulowanie

- interfejs pokazuje działania dostępne według regulaminu;
- klient może wysłać prośbę o zmianę albo anulowanie;
- automatyczna zmiana terminu nie wchodzi do pierwszego wydania 2.0;
- obsługa wykonuje zmianę w panelu i system wysyła potwierdzenie;
- zwrot nie jest uznany za zakończony przed potwierdzeniem operatora;
- każda zmiana zapisuje aktora, czas, powód i wartości przed/po.

## 5. Minimalny panel administratora

### 5.1. Dostęp

- panel nie ma publicznej rejestracji pracowników;
- konta są tworzone przez bezpieczne zaproszenia;
- role początkowe: `pracownik` i `administrator`;
- MFA jest obowiązkowe dla obu ról;
- każde działanie jest autoryzowane po stronie serwera;
- zmiana ról, zwrot i krytyczna zmiana pojemności mogą wymagać ponownego uwierzytelnienia.

### 5.2. Kalendarz operacyjny

- widok dzienny, tygodniowy i miesięczny;
- liczba graczy, grup, aktywnych blokad i pozostała pojemność;
- rozróżnienie rezerwacji online, telefonicznej i wprowadzonej ręcznie;
- filtrowanie według statusu, pakietu i źródła;
- ostrzeżenia o rozbieżnej płatności lub przekroczonym limicie operacyjnym;
- bezpośrednie przejście do szczegółów bez ujawniania nadmiarowych danych na wspólnym ekranie.

### 5.3. Rezerwacje ręczne i edycja

- ręczne utworzenie rezerwacji telefonicznej korzysta z tej samej kontroli pojemności;
- pracownik może zmienić liczbę graczy, pakiet, dane kontaktowe i uwagi;
- przeniesienie najpierw atomowo zajmuje cel, a dopiero później zwalnia poprzedni termin;
- zmniejszenie pojemności poniżej już zajętej wartości jest blokowane albo wymaga jawnego trybu wyjątku administratora;
- anulowanie wymaga powodu i zapisuje historię;
- pracownik może ponowić e-mail oraz wygenerować nowy link gościnny;
- dane historyczne ceny pozostają migawką mimo zmiany aktualnego cennika.

### 5.4. Terminy, ceny i płatności

- definiowanie godzin startu i pojemności domyślnej;
- zamknięcie wybranej daty lub konkretnego slotu;
- wyjątki świąteczne i sezonowe;
- edycja pakietów, dodatków i cen obowiązujących od wskazanej daty;
- ustawienie zatwierdzonej kwoty stałego zadatku;
- podgląd prób płatności i zdarzeń operatora;
- pełny lub częściowy zwrot zgodnie z uprawnieniami;
- ręczne oznaczenie rozliczenia pozostałego salda, jeżeli firma tego potrzebuje;
- eksport podstawowej listy operacyjnej do bezpiecznego CSV.

### 5.5. Audyt

Dziennik zmian jest append-only i zapisuje:

- aktora i jego rolę;
- czas oraz identyfikator żądania;
- wykonane działanie;
- obiekt i wartości przed/po;
- powód operacji, jeżeli jest wymagany;
- powiązanie z rezerwacją, płatnością lub zwrotem.

Eksport CSV musi neutralizować komórki rozpoczynające się znakami formuł arkusza.

## 6. Reguły domenowe i niezmienniki

### 6.1. Pojemność

- suma potwierdzonych rezerwacji oraz niewygasłych blokad nie może przekroczyć limitu graczy ani grup;
- limit musi być chroniony przez bazę lub transakcję, a nie przez stan przeglądarki;
- sprawdzanie obejmuje wszystkie źródła: stronę, panel, przenoszenie i import;
- wygasła blokada nie zużywa pojemności nawet przed fizycznym usunięciem rekordu;
- ręczne zamknięcie slotu uniemożliwia nowe blokady;
- anulowanie rezerwacji zwalnia pojemność dopiero po prawidłowym przejściu stanu;
- dostępność jest liczona dla konkretnego pakietu i liczby uczestników.

### 6.2. Cena

- pieniądze są przechowywane jako liczby całkowite w najmniejszej jednostce oraz kod waluty `PLN`;
- rezerwacja zachowuje migawkę nazw, ilości, cen jednostkowych, podatku i wartości pozycji;
- późniejsza zmiana cennika nie zmienia istniejącej rezerwacji;
- suma pozycji, wartość zamówienia, zadatek i saldo muszą być matematycznie zgodne;
- kwota potwierdzona przez operatora musi odpowiadać zapisanej próbie płatności;
- klient nigdy nie przesyła autorytatywnej ceny z przeglądarki.

### 6.3. Czas

- znaczniki techniczne są przechowywane jako UTC/`timestamptz`;
- reguły biznesowe i prezentacja używają `Europe/Warsaw`;
- data biznesowa slotu jest jednoznaczna także podczas zmiany czasu;
- przypomnienia i wygasanie wykorzystują czas serwera lub bazy, nie zegar urządzenia klienta.

## 7. Maszyny stanów

Status blokady, rezerwacji, płatności i zwrotu jest przechowywany oddzielnie.

### 7.1. Blokada (`TemporaryHold`)

`ACTIVE → CONSUMED | EXPIRED | RELEASED`

- `CONSUMED` oznacza wykorzystanie przez potwierdzoną rezerwację;
- `EXPIRED` wynika z upływu `expiresAt`;
- `RELEASED` oznacza świadome zwolnienie przed terminem.

### 7.2. Rezerwacja (`Booking`)

`PENDING_PAYMENT → CONFIRMED → COMPLETED | CANCELLED | NO_SHOW`

Dodatkowy stan `PAYMENT_REVIEW` może zostać użyty, gdy pieniądze istnieją, ale system nie może bezpiecznie potwierdzić terminu.

### 7.3. Płatność (`PaymentAttempt`)

`CREATED → PENDING → SUCCEEDED | FAILED | EXPIRED`

Po sukcesie płatność może przejść do `PARTIALLY_REFUNDED`, `REFUNDED` albo `CHARGEBACK`.

### 7.4. Zwrot (`Refund`)

`REQUESTED → PROCESSING → SUCCEEDED | FAILED`

Każde przejście ma dozwolone stany źródłowe, aktora, czas, powód i wpis audytowy. Powtórzenie tego samego zdarzenia nie może wykonać operacji drugi raz.

### 7.5. Płatność po wygaśnięciu blokady

Domyślna polityka bezpieczeństwa:

1. ważność sesji operatora jest możliwie zgodna z czasem blokady;
2. webhook sukcesu ponownie, atomowo sprawdza lub zużywa blokadę;
3. jeżeli blokada wygasła, ale pojemność nadal istnieje, system może atomowo potwierdzić rezerwację;
4. jeżeli miejsca już nie ma, system nie przekracza pojemności;
5. rezerwacja przechodzi do `PAYMENT_REVIEW`, klient otrzymuje neutralny komunikat, a obsługa dostaje alarm;
6. system inicjuje pełny zwrot zgodnie z możliwościami wybranego operatora i rejestruje jego wynik.

Priorytetem jest brak nadrezerwacji, nawet jeżeli wymaga to zwrotu późnej płatności.

## 8. Model danych

Minimalny model obejmuje:

- `AdminUser`, `AdminInvitation`, `Role`, `Session`;
- `Package`, `AddOn`, `PriceVersion`;
- `SlotTemplate`, `SlotOccurrence`, `DateException`, `CapacityRule`;
- `TemporaryHold`;
- `Booking`, `BookingItem`, `BookingStatusHistory`;
- `OrganizerSnapshot`, `TermsAcceptance`;
- `PaymentAttempt`, `PaymentEvent`, `Refund`;
- `GuestAccessToken`;
- `Notification`, `OutboxEvent`, `InboxEvent`;
- `AuditLog`, `IdempotencyKey`.

### 8.1. Wymagane właściwości

- `SlotOccurrence` zawiera konkretny początek, koniec, status i obowiązujące limity;
- `TemporaryHold` ma liczbę graczy, liczbę grup, `expiresAt` i powiązanie z procesem;
- `Booking` przechowuje publiczny nieprzewidywalny numer oraz wewnętrzny identyfikator;
- `BookingItem` przechowuje pełną migawkę pozycji;
- dane organizatora są migawką i nie zależą od późniejszych zmian innych rekordów;
- akceptacja regulaminu zapisuje wersję dokumentu, czas i zakres;
- `InboxEvent` ma unikalny identyfikator zdarzenia operatora;
- `OutboxEvent` pozwala wysłać wiadomość co najmniej raz bez jej utraty;
- token gościnny jest przechowywany jako hash i ma termin ważności;
- rekordy edytowalne mają wersję do ochrony przed przypadkowym nadpisaniem.

Nie powstaje model konta klienta, hasła klienta ani historii wielu rezerwacji jednego użytkownika.

## 9. Architektura techniczna

### 9.1. Podejście

Rekomendowany jest modułowy monolit:

- istniejąca aplikacja Next.js jako warstwa publiczna, panel i API;
- PostgreSQL jako jedno źródło prawdy;
- Prisma lub równoważny ORM do schematu i migracji;
- osobny worker oraz trwała kolejka lub scheduler;
- adapter operatora płatności;
- adapter dostawcy e-mail;
- monitoring błędów, logów, metryk i dostępności;
- istniejący magazyn obrazów z wersji 1.0.

Mikroserwisy nie są potrzebne w tym zakresie.

### 9.2. Moduły

- katalog pakietów i dodatków;
- reguły kalendarza i wystąpienia slotów;
- silnik dostępności;
- blokady oraz ochrona pojemności;
- koszyk i migawki cen;
- rezerwacje;
- płatności, webhooki i rekonsyliacja;
- powiadomienia;
- dostęp gościnny;
- panel i autoryzacja pracowników;
- audyt oraz operacyjność.

### 9.3. Współbieżność

Każda próba blokady:

1. rozpoczyna krótką transakcję;
2. blokuje właściwy `SlotOccurrence` albo wykonuje atomową aktualizację warunkową;
3. liczy potwierdzone rezerwacje i aktywne blokady według czasu bazy;
4. sprawdza limit graczy, grup i wymaganych zasobów;
5. tworzy `TemporaryHold` albo zwraca konflikt z alternatywami;
6. kończy transakcję przed wywołaniem usług zewnętrznych.

Przy izolacji `SERIALIZABLE` aplikacja obsługuje kontrolowane retry. Testy współbieżności używają prawdziwego PostgreSQL i wielu niezależnych połączeń.

### 9.4. Płatności i webhooki

- wewnętrzny `PaymentAttempt` powstaje przed przekierowaniem klienta;
- żądanie utworzenia płatności ma unikalny klucz idempotencji;
- webhook weryfikuje podpis na surowym body, czas podpisu i ochronę przed replay;
- system sprawdza identyfikator zamówienia, środowisko, kwotę oraz walutę;
- każde zdarzenie jest trwale zapisywane w inbox przed odpowiedzią `2xx`;
- przetwarzanie jest odporne na duplikaty i zdarzenia dostarczone w złej kolejności;
- cykliczna rekonsyliacja porównuje stan operatora ze stanem bazy;
- zdarzenia niemożliwe do obsługi trafiają do kolejki błędów i wywołują alarm;
- status rezerwacji nigdy nie wynika wyłącznie z adresu powrotnego klienta.

### 9.5. Powiadomienia

Rezerwacja i `OutboxEvent` powstają w tej samej transakcji. Worker wysyła wiadomości idempotentnie i zapisuje wynik dostarczenia.

Minimalne szablony:

- potwierdzenie rezerwacji i zadatku;
- płatność oczekująca lub wymagająca kontaktu;
- nieudana płatność;
- zmiana terminu;
- anulowanie;
- zlecenie i potwierdzenie zwrotu;
- przypomnienie przed wizytą;
- nowy bezpieczny link gościnny.

Potwierdzenie zawiera termin, godzinę przyjazdu, pakiet, cenę, zadatek, saldo, zasady zmian, adres, dojazd i listę rzeczy do zabrania.

### 9.6. Topologia wdrożenia

Przed implementacją trzeba wybrać hosting, który zapewnia:

- bezpieczne połączenia i pooling PostgreSQL;
- trwały worker lub kolejkę niezależną od pamięci procesu aplikacji;
- niezawodny scheduler;
- region oraz warunki przetwarzania zgodne z wymaganiami firmy;
- oddzielne środowiska i klucze testowe/produkcyjne;
- migracje kompatybilne wstecz oraz kontrolowany rollback.

Dostępność prezentowana w UI może być krótko buforowana, ale utworzenie blokady zawsze korzysta z autorytatywnego stanu bazy.

## 10. Bezpieczeństwo i prywatność

### 10.1. Dostęp pracowników

- MFA, bezpieczne zaproszenia i możliwość unieważnienia sesji;
- macierz uprawnień dla każdej operacji panelu;
- domyślna odmowa i kontrola zasobu na serwerze;
- ciasteczka sesyjne `Secure`, `HttpOnly` i odpowiednie `SameSite`;
- rotacja sesji po logowaniu i zmianie roli;
- limity prób logowania, resetów oraz operacji wrażliwych.

### 10.2. Ochrona aplikacji

- walidacja serwerowa i ochrona przed CSRF, XSS oraz wstrzyknięciami;
- CSP, HSTS, `frame-ancestors`, Referrer Policy i Permissions Policy;
- rate limiting blokad, checkoutu, tokenów gościnnych i panelu;
- skanowanie sekretów i zależności w CI;
- brak danych kart w aplikacji;
- redakcja PII, tokenów i payloadów płatniczych w logach;
- szyfrowanie transmisji i ograniczenie dostępu do kopii;
- model zagrożeń wykonany przed implementacją checkoutu.

### 10.3. Dane i RODO

- zbieranie wyłącznie danych potrzebnych do obsługi rezerwacji;
- macierz dostawców, celów, kategorii danych, podstaw, retencji i transferów;
- oddzielenie opcjonalnej zgody marketingowej od rezerwacji;
- wersjonowanie regulaminu i treści obowiązku informacyjnego;
- okresy retencji dla rezerwacji, płatności, audytu, logów i kopii;
- anonimizacja danych po upływie retencji z zachowaniem obowiązkowych dokumentów;
- procedura dostępu, sprostowania i pozostałych wniosków dotyczących danych;
- aktualizacja polityki prywatności oraz cookies przed włączeniem 2.0.

## 11. Migracja z wersji 1.0

### 11.1. Zachowanie części publicznej

- wszystkie publiczne URL-e wersji 1.0 pozostają dostępne;
- oferta, cennik, FAQ i dane kontaktowe mają jedno źródło prawdy;
- wygląd głównego CTA pozostaje znajomy, ale tekst zmienia się na „Sprawdź terminy”;
- `/rezerwacja` jest nowym procesem;
- `/zapytaj-o-termin` pozostaje oddzielnym typem kontaktu;
- usunięcie lub zmiana adresu wymaga przekierowania 301 i aktualizacji mapy strony.

### 11.2. Rozdzielenie zapytań i rezerwacji

- wiadomości z wersji 1.0 pozostają w skrzynce pocztowej;
- zapytanie nie jest automatycznie importowane ani oznaczane jako rezerwacja;
- ręczna konwersja wymaga sprawdzenia terminu, ceny, danych i potwierdzenia klienta;
- otwarte zapytania są obsługiwane do zamknięcia według dotychczasowej procedury;
- analityka rozróżnia `flow_type=inquiry` i `flow_type=online_booking`.

### 11.3. Import potwierdzonych terminów

Przed uruchomieniem sprzedaży online należy:

1. zebrać wszystkie przyszłe, potwierdzone terminy z telefonu, e-maila, arkuszy i papieru;
2. ujednolicić pakiety, liczby graczy, kwoty oraz statusy;
3. wykryć duplikaty i konflikty;
4. wprowadzić dane do panelu jako rezerwacje ręczne;
5. porównać zajętą pojemność z dokumentacją źródłową;
6. podpisać raport zgodności przez właściciela operacyjnego.

### 11.4. Feature flag i uruchomienie

- cały moduł online jest kontrolowany przełącznikiem funkcji;
- przed premierą flaga jest aktywna tylko na środowisku testowym i dla testerów;
- uruchomienie następuje po imporcie, teście prawdziwej płatności i uzgodnieniu operatora;
- początkowo należy aktywnie monitorować każdy checkout, webhook i potwierdzenie;
- niezależne przełączniki pozwalają wyłączyć nowe blokady, płatności lub powiadomienia.

### 11.5. Rollback

W razie krytycznego problemu:

1. wyłączyć tworzenie nowych blokad i checkoutów;
2. pozostawić działającą stronę 1.0 oraz `/zapytaj-o-termin`;
3. zachować już potwierdzone i opłacone rezerwacje w bazie;
4. uzgodnić rozpoczęte płatności z operatorem;
5. poinformować obsługę o przejściu na procedurę ręczną;
6. naprawić system bez kasowania zdarzeń i dziennika audytowego.

Rollback aplikacji nie może cofać niekompatybilnie schematu ani usuwać danych transakcyjnych.

## 12. Operacyjność i niezawodność

### 12.1. Monitoring

Monitorowane są co najmniej:

- dostępność strony, API, bazy i workera;
- odsetek błędów blokady, checkoutu i płatności;
- czas odpowiedzi endpointu dostępności i tworzenia blokady;
- wiek najstarszego nieprzetworzonego webhooka;
- backlog kolejki i kolejki błędów;
- aktywne blokady po czasie wygaśnięcia;
- rozbieżności płatności podczas rekonsyliacji;
- skuteczność dostarczania e-maili;
- próby przekroczenia pojemności;
- błędy logowania i operacje administracyjne wysokiego ryzyka.

Logi mają correlation ID łączący blokadę, rezerwację, płatność, webhook i wiadomość bez ujawniania danych osobowych.

### 12.2. Kopie i odtwarzanie

- automatyczne kopie PostgreSQL oraz, jeśli dostępne, point-in-time recovery;
- ustalone RPO, RTO i okres retencji;
- regularny, udokumentowany test odtworzenia na odizolowanym środowisku;
- kopie szyfrowane i dostępne wyłącznie dla uprawnionych osób;
- procedura postępowania z danymi objętymi żądaniem usunięcia, które nadal występują w kopiach.

### 12.3. Runbooki

Powstają instrukcje dla:

- niedostępności operatora płatności;
- opóźnionych lub brakujących webhooków;
- awarii kolejki, workera, bazy i poczty;
- błędnego zwrotu lub chargebacku;
- wykrycia nadrezerwacji;
- rozbieżności między panelem i operatorem;
- czasowego wyłączenia rezerwacji;
- odtworzenia kopii oraz cofnięcia wdrożenia.

## 13. Etapy realizacji

### Etap 0 — audyt wersji 1.0 i zamknięcie reguł

**Zakres:** audyt aplikacji, formularza, hostingu i analityki oraz rozstrzygnięcie decyzji z sekcji 3.

**Rezultat:** podpisane reguły pojemności, cen, zadatku, anulowania i operacji.

**Warunek przejścia:** żadna reguła wpływająca na cenę lub dostępność nie ma statusu `OTWARTE`.

### Etap 1 — projekt domeny i fundament platformy

**Zakres:** maszyny stanów, schemat bazy, migracje, środowiska, panel auth, worker, kolejka, monitoring i feature flagi.

**Rezultat:** działający fundament na środowisku testowym.

**Warunek przejścia:** migracje można zastosować i cofnąć operacyjnie bez utraty danych, a uprawnienia mają testy.

### Etap 2 — dostępność i blokady

**Zakres:** generowanie slotów, wyjątki, pojemność, endpoint dostępności, blokady i interfejs wyboru terminu.

**Rezultat:** wiarygodna dostępność oraz odporność na równoczesne próby.

**Warunek przejścia:** test wielowątkowy nie przekracza żadnego limitu.

### Etap 3 — koszyk, checkout i płatność

**Zakres:** migawki cen, oczekująca rezerwacja, adapter operatora, webhook inbox, rekonsyliacja i zwroty.

**Rezultat:** pełna ścieżka od blokady do potwierdzonego zadatku w sandboxie.

**Warunek przejścia:** duplikaty, opóźnienia i zła kolejność webhooków nie zmieniają wyniku niepoprawnie.

### Etap 4 — panel i powiadomienia

**Zakres:** kalendarz, rezerwacje ręczne, zmiany, anulowanie, zwroty, audyt, outbox, e-maile i dostęp gościnny.

**Rezultat:** obsługa może przeprowadzić pełny cykl bez edycji bazy.

**Warunek przejścia:** role nie przekraczają uprawnień, a każda krytyczna operacja pozostawia ślad.

### Etap 5 — migracja i audyt przedpremierowy

**Zakres:** import przyszłych terminów, testy E2E, bezpieczeństwo, prywatność, wydajność, restore i szkolenie.

**Rezultat:** kandydat produkcyjny oraz podpisana checklista cutover.

**Warunek przejścia:** zgodność kalendarza z ewidencją ręczną i brak błędów krytycznych lub wysokich.

### Etap 6 — kontrolowana premiera i stabilizacja

**Zakres:** prawdziwa płatność kontrolna, włączenie flagi, aktywny monitoring i obsługa pierwszych wizyt.

**Rezultat:** stabilna wersja 2.0.

**Warunek zakończenia:** pełny cykl od rezerwacji do rozegranej wizyty przebiega bez obejścia systemu.

## 14. Strategia testów

### 14.1. Jednostkowe i właściwości domeny

- ceny, zadatek, saldo, podatki i migawki;
- dozwolone oraz zabronione przejścia stanów;
- reguły pojemności, wyjątków i minimalnego wyprzedzenia;
- brak wartości ujemnych i zgodność sum pozycji;
- daty, święta, granice miesiąca, rok przestępny i zmiana czasu.

### 14.2. Integracyjne

- transakcje i blokady na prawdziwym PostgreSQL;
- utworzenie rezerwacji ręcznej i internetowej;
- idempotencja checkoutu, webhooka i zadań;
- podpis poprawny, błędny, przeterminowany i odtworzony;
- błędna kwota, waluta, środowisko lub identyfikator zamówienia;
- duplikaty i zdarzenia w złej kolejności;
- wysyłka z outbox i retry po restarcie workera;
- pełny i częściowy zwrot oraz nieudany zwrot;
- wygasający token gościnny i jego unieważnienie.

### 14.3. Współbieżność

- wiele równoczesnych prób zajęcia ostatnich miejsc;
- kilka mniejszych grup konkurujących z jedną większą;
- wygaśnięcie blokady równocześnie z webhookiem;
- ręczna rezerwacja podczas checkoutu;
- zamknięcie slotu lub zmiana pojemności podczas aktywnych blokad;
- przeniesienie rezerwacji podczas innej operacji;
- retry transakcji po konflikcie izolacji.

Oczekiwany wynik wszystkich testów: zero przekroczeń pojemności.

### 14.4. End-to-end

- rezerwacja gościnna zakończona sukcesem;
- płatność oczekująca, odrzucona, przerwana i wygasła;
- brak wolnego terminu i wybór alternatywy;
- odzyskanie procesu po odświeżeniu lub utracie sieci;
- bezpieczny link, prośba o zmianę i anulowanie;
- rezerwacja telefoniczna w panelu;
- zwrot, ponowienie e-maila i pełny ślad audytu;
- wyłączenie rezerwacji i przejście do formularza zapytania.

### 14.5. Bezpieczeństwo i prywatność

- macierz uprawnień oraz próby IDOR;
- MFA, zaproszenie, wygasanie i unieważnienie sesji;
- brute force tokenu gościnnego i rate limiting;
- CSRF, XSS, nieprawidłowe dane i przekroczenie rozmiaru żądania;
- brak PII w analityce i logach;
- eksport CSV odporny na formula injection;
- zgodność retencji, anonimizacji i wersjonowania regulaminu.

### 14.6. Operacyjne i migracyjne

- import na kopii danych próbnych, wykrywanie duplikatów i raport bilansu;
- migracje kompatybilne z wersją aplikacji przed i po wdrożeniu;
- rollback z zachowaniem potwierdzonych rezerwacji;
- test odtworzenia bazy;
- awaria operatora, poczty, kolejki i workera;
- działanie publicznej strony 1.0 podczas wyłączenia modułu 2.0.

## 15. Kryteria gotowości do wydania

Wersja 2.0 jest gotowa, gdy:

- wszystkie decyzje wpływające na pojemność, cenę i zadatek są zatwierdzone;
- rezerwacje ręczne i online są widoczne w jednym kalendarzu;
- nie można przekroczyć pojemności w testach równoległych;
- każda próba płatności ma wewnętrzny rekord i może zostać uzgodniona z operatorem;
- duplikat webhooka nie tworzy drugiej płatności ani rezerwacji;
- późna płatność nie powoduje nadrezerwacji;
- klient widzi końcową cenę, zadatek i saldo przed płatnością;
- rezerwacja jest potwierdzana wyłącznie po wiarygodnym zdarzeniu operatora;
- dostęp gościnny wygasa, może zostać unieważniony i nie ujawnia cudzych danych;
- panel wymaga MFA i respektuje macierz uprawnień;
- zwrot, anulowanie, zmiana i ręczne dodanie rezerwacji zostały przetestowane;
- przyszłe ręczne terminy zostały zaimportowane i uzgodnione;
- e-maile są wysyłane z outbox, a nieudane wiadomości można ponowić;
- monitoring, alarmy, runbooki, kopie i próbne odtworzenie działają;
- dokumenty prawne i mechanizm zgód uwzględniają nowych dostawców;
- wyłączenie flagi przywraca ścieżkę zapytania bez wyłączania strony publicznej;
- właściciel operacyjny i administrator panelu ukończyli szkolenie.

## 16. Funkcje poza zakresem wersji 2.0

- konta klientów, hasła, historia wielu rezerwacji i logowanie społecznościowe;
- aplikacja mobilna;
- powiadomienia SMS;
- lista oczekujących;
- vouchery, kupony i program lojalnościowy;
- samodzielna automatyczna zmiana terminu przez klienta;
- elektroniczne zgody wszystkich uczestników;
- kody QR i meldowanie grup;
- wielojęzyczność;
- integracja z zewnętrznymi kalendarzami;
- rozbudowany CMS;
- zaawansowane raporty finansowe i Business Intelligence;
- cykliczne wydarzenia i konta firmowe;
- marketplace dodatkowych usług.

Konta klientów i rozbudowany CMS są w tym akapicie zakresem historycznym. Plan nadrzędny przenosi CMS do 1.5B, a konta klientów do 2.1. Pozostałe punkty listy nadal nie należą do v2.0 i wymagają osobnej decyzji po danych z produkcji.

## 17. Rejestr decyzji

Statusy: `ZATWIERDZONE`, `OTWARTE`, `ZABLOKOWANE`.

| ID | Decyzja | Właściciel | Termin graniczny | Status | Ustalony wariant lub wymagany rezultat |
|---|---|---|---|---|---|
| V2-01 | Model klienta | właściciel produktu | zakończone | ZATWIERDZONE | rezerwacja gościnna bez konta klienta |
| V2-02 | Model płatności | właściciel produktu | zakończone | ZATWIERDZONE | stały zadatek; kwota pozostaje do zatwierdzenia |
| V2-03 | Kanał potwierdzeń | właściciel produktu | zakończone | ZATWIERDZONE | e-mail; SMS poza zakresem |
| V2-04 | Harmonogram projektu | właściciel produktu | zakończone | ZATWIERDZONE | etapy i bramki bez sztywnych dat przed estymacją |
| V2-05 | Minimalna i maksymalna grupa | właściciel firmy | przed Etapem 1 | HISTORYCZNE / PATRZ U-01 | start: 8 graczy w drużynie; jedna rezerwacja online to jedna drużyna, dopóki D-20 jest OTWARTE |
| V2-06 | Pojemność graczy, grup, sprzętu i obsługi | właściciel operacyjny | przed Etapem 1 | CZĘŚCIOWO USTALONE | start: 32 graczy i 2–4 drużyny na slot (U-02, U-03); sprzęt i obsada nadal OTWARTE (D-14, D-15) |
| V2-07 | Czas gry, odprawa i bufory | właściciel operacyjny | przed Etapem 1 | CZĘŚCIOWO USTALONE | start: 120 minut gry i 60 minut przerwy (U-05); czas zależny od pakietu nadal OTWARTY |
| V2-08 | Łączenie grup i wyłączność pola | właściciel firmy | przed Etapem 1 | CZĘŚCIOWO USTALONE | slot współdzielony i prywatny (U-06, U-07); dopłata, minimum drużyn i zakres wyłączności nadal OTWARTE (D-09, D-21, D-22) |
| V2-09 | Godziny, wyjątki, wyprzedzenie i horyzont | właściciel operacyjny | przed Etapem 1 | CZĘŚCIOWO USTALONE | start: 08:00, 11:00, 14:00 (U-04); sezon, wyprzedzenie i horyzont nadal OTWARTE (D-16, D-17) |
| V2-10 | Kwota stałego zadatku i saldo | właściciel firmy i księgowość | przed Etapem 1 | OTWARTE | kwota PLN, wyjątki i sposób dopłaty |
| V2-11 | Anulowanie, zmiana, no-show i pogoda | właściciel firmy i doradca prawny | przed Etapem 1 | OTWARTE | reguły wraz z terminami i zwrotami |
| V2-12 | Operator płatności | właściciel firmy i wykonawca | przed Etapem 1 | OTWARTE | umowa, sandbox, webhooki, zwroty i rekonsyliacja |
| V2-13 | Dostawca kolejki i topologia hostingu | wykonawca | przed Etapem 1 | OTWARTE | trwały worker, scheduler, pooling i region |
| V2-14 | Dostawca uwierzytelniania panelu | wykonawca i właściciel bezpieczeństwa | przed Etapem 1 | HISTORYCZNE | 1.5A w PR #13 używa Better Auth; MFA, zaproszenia i pełna macierz ról nadal OTWARTE (D-27, D-28) |
| V2-15 | Role i macierz uprawnień | właściciel operacyjny | przed Etapem 4 | OTWARTE | uprawnienia pracownika i administratora |
| V2-16 | Źródło istniejących terminów i właściciel importu | właściciel operacyjny | przed Etapem 5 | OTWARTE | komplet źródeł i podpisany bilans |
| V2-17 | RPO, RTO i retencja kopii | właściciel firmy i wykonawca | przed Etapem 5 | OTWARTE | wartości, odpowiedzialność i harmonogram testów |
| V2-18 | Retencja danych i dokumenty prawne | właściciel firmy i doradca prawny | przed Etapem 5 | OTWARTE | macierz danych, podstaw i okresów |
| V2-19 | Osoba podejmująca decyzję go/no-go | właściciel firmy | przed Etapem 5 | OTWARTE | imienna odpowiedzialność za uruchomienie |

## 18. Lista cutover

Przed włączeniem `/rezerwacja` dla wszystkich użytkowników należy potwierdzić:

- [ ] decyzje P0 mają status `ZATWIERDZONE`;
- [ ] produkcyjne ceny, zadatek i regulamin są zgodne;
- [ ] przyszłe ręczne rezerwacje zostały wprowadzone i uzgodnione;
- [ ] wykonano prawdziwą płatność, anulowanie i zwrot kontrolny;
- [ ] webhook produkcyjny ma prawidłowy sekret i alarmy;
- [ ] e-maile przechodzą test dostarczenia;
- [ ] kopia została wykonana i próbnie odtworzona;
- [ ] panel, MFA i role zostały sprawdzone;
- [ ] runbooki oraz numery kontaktowe są dostępne dla obsługi;
- [ ] analityka rozróżnia zapytanie i rezerwację;
- [ ] polityka prywatności, cookies i regulamin są opublikowane;
- [ ] formularz `/zapytaj-o-termin` pozostaje działającym fallbackiem;
- [ ] przełączniki awaryjne zostały przetestowane;
- [ ] właściciel operacyjny zatwierdził uruchomienie.
