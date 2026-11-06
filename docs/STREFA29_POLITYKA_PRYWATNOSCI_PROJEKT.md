# Projekt polityki prywatności — niezatwierdzony

**Status:** projekt techniczny. Nie jest poradą prawną i nie zastępuje strony `/polityka-prywatnosci`.  
**Nie publikować**, dopóki właściciel nie zatwierdzi brzmienia, podstawy prawnej, odbiorców i okresu retencji.  
**Powód:** publiczna sekcja „3. Brak bazy zapytań” jest nieprawdziwa wobec kodu `main@14e082d`.

## Co kod robi dzisiaj

- Zgłoszenie z `/api/inquiry` jest zapisywane w PostgreSQL jako `Inquiry`, gdy ustawiono `DATABASE_URL`.
- Na produkcji `INQUIRY_STORE=memory` nie włącza zapisu w pamięci procesu. Brak bazy daje brak repozytorium i odpowiedź 503.
- Zapis i powiadomienie są rozdzielone. Gdy wiersz powstanie, a wysyłka e-mail później się nie uda, odpowiedź API to 200. Wiersz zostaje.
- Pola formularza: imię, telefon lub e-mail, liczba graczy, preferowana data i godzina, rodzaj wydarzenia, pakiet, wiadomość, akceptacja informacji o prywatności.
- Powiadomienie e-mail idzie przez Resend tylko wtedy, gdy skonfigurowano klucz i adresy. Bez konfiguracji wysyłka jest pomijana, a zapis w bazie nadal obowiązuje.
- `DATA_RETENTION_DAYS` nie jest ustawione. Zadanie czyszczące nie usuwa wtedy żadnego wiersza. Okresu nie wolno dopisać w tym projekcie.
- Panel pracowników odczytuje zgłoszenia. Role i uprawnienia są w kodzie panelu. Logowanie jest hasłem i sesją. MFA nie jest włączone.
- Formularz nie prosi o dane karty. Checkout ma `enabled: false`.

## Szkic do zatwierdzenia

Poniższe zdania opisują zachowanie programu. Miejsca w nawiasach kwadratowych zostają puste do decyzji właściciela.

1. Administratorem jest [pełna nazwa, adres, e-mail]. Tych danych nie ma w repozytorium.
2. Formularz zapisuje w bazie PostgreSQL pola wymienione wyżej, żeby [podstawa i cel — nieustalone].
3. Ten sam zestaw może zostać wysłany na skrzynkę operatora przez dostawcę poczty transakcyjnej, jeżeli operator go skonfiguruje. Nazwa dostawcy, region i umowa nie są tu potwierdzone.
4. Okres przechowywania wiersza `Inquiry` wynosi [liczba dni albo opis]. Do zatwierdzenia kod niczego nie usuwa.
5. Dostęp do zapisanych zgłoszeń mają zalogowani pracownicy panelu. Lista osób i sposób odbierania wniosków o dostęp, sprostowanie i usunięcie wymagają danych administratora.
6. Analityka nie dostaje treści formularza. Mapa zewnętrzna ładuje się po kliknięciu. Hosting, antyspam i miejsce przetwarzania pozostają [do wskazania].

## Czego ten plik nie rozstrzyga

Podstawa z RODO, obowiązek informacyjny, umowy powierzenia, okres przedawnienia, kopia zapasowa i prawo do usunięcia po wysłaniu e-maila. To decyzje właściciela, nie wartości do wpisania z kodu.
