# V1.5B-3 — galeria właściciela

Data: 2026-11-06. Gałąź: `feature/gallery-cms`, baza: `main`.

## Zakres

Właściciel w `/panel/galeria` zmienia kolejność przez okładkę, kategorię, podpisy, opis alternatywny i widoczność trzech zatwierdzonych zdjęć. Może dodać nowe JPEG, PNG albo WebP do 5 MB. Plik jest sprawdzany po nagłówku, nie po nazwie, i ląduje w `storage/gallery`, poza katalogiem publicznym. Publikacja kopiuje go do `public/gallery/managed` i dopiero wtedy rolka na stronie głównej oraz `/galeria` go widzi.

Wersja robocza nie jest publiczna. Brak bazy wraca do trzech zdjęć z `src/data/gallery.ts`.

Zdjęcia z osobami i oba filmy zostają na liście „nie publikować”. Nie da się ich wybrać w formularzu.

## Ograniczenia

Kadrowanie nie jest w tym etapie. Nowe pliki żyją na dysku serwera; efemeryczny hosting ich nie utrzyma, dopóki nie będzie magazynu obiektów (decyzja D-26). Zapis i publikacja wymagają `business.publish`, czyli roli właściciela.

Następny etap planu to V1.5B-4: harmonogram, limity i blokowanie dni, nadal bez sprzedaży.
