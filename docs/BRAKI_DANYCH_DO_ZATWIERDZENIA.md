# Braki danych do zatwierdzenia

Poniższe informacje nie zostały potwierdzone. Nie wolno ich uzupełniać przykładowymi wartościami.

| Obszar | Stan w repozytorium | Potrzebna decyzja właściciela |
| --- | --- | --- |
| Firma i administrator danych | Brak pełnej nazwy prawnej, NIP i osoby odpowiedzialnej | Dane do polityki prywatności i stopki |
| Telefon | Placeholder, pusty link | Numer, który można opublikować |
| E-mail publiczny i skrzynka formularza | Placeholder | Adres odbiorcy i nadawcy Resend |
| Ceny pakietów | „Cena do potwierdzenia” / wycena indywidualna | Kwoty, waluta i to, co wchodzi w cenę |
| Minimum i maksimum graczy | Techniczny limit 1–200, nie reguła biznesowa | Zatwierdzone progi grup |
| Zdjęcia pola | Folder `gallery/` jest pusty. `src/data/gallery.ts` ma pustą listę `galleryPhotos`; strona pokazuje symboliczne plansze, a po dodaniu zatwierdzonych plików do `public/gallery` i wpisu na liście renderuje je przez Next Image. Folder `layout/` nie jest publikowany | Oryginalne zdjęcia, prawa publikacji i zgody osób widocznych |
| Adres i pin dojazdu | Żurawia 29, 80-298 Czaple, z notą o potwierdzeniu wjazdu | Dokładny punkt na mapie |
| Wiek osób niepełnoletnich | FAQ mówi, że zasada wymaga potwierdzenia | Minimalny wiek i forma zgody opiekuna |
| Regulamin, prywatność, cookies | Wersje robocze | Tekst po przeglądzie prawnym i okres retencji zapytań |
| Dostawca e-mail | Kod obsługuje Resend, brak sekretów w repozytorium | Konto, domena, SPF, DKIM i DMARC |
| Analityka | Zdarzenia `inquiry_start`, `inquiry_submit`, `inquiry_error`, `pricing_view`, `gallery_view`, `package_inquiry_click`, `directions_click` oraz kliknięcia telefonu i e-maila mogą trafić do `dataLayer` dopiero po zgodzie. Nie ma podłączonego dostawcy, więc sama zgoda niczego nie mierzy | Czy i jaki dostawca ma być użyty |
| Współdzielony limit formularza | Adapter Upstash jest gotowy, konto nie jest skonfigurowane | Czy staging/produkcja dostaje Upstash albo inny wspólny store |
| Indeksacja | Domyślnie wyłączona, dopóki `NEXT_PUBLIC_ALLOW_INDEXING=true` i adres jest https | Moment publikacji w wyszukiwarkach |
| CSP | Polityka jest tylko w `Content-Security-Policy-Report-Only`. Wymuszenie czeka na przegląd raportów ze stagingu | Zgoda na przejście z Report-Only do egzekwowanego CSP |

Niepotwierdzone hasła marketingowe, takie jak wielkość terenu i odległość od centrum, pozostają na stronie z dotychczasowym opisem. Ich usunięcie albo zmiana wymaga decyzji właściciela, a nie zgadywania.
