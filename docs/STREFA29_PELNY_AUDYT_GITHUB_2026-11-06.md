# PAINTBALL STREFA 29 — pełny audyt repozytorium GitHub

**Data analizy:** 6 listopada 2026, około 18:44 CET  
**Repozytorium:** https://github.com/MagicMikky/strefa-57  
**Gałąź i commit bazowy:** `main`, `b73b490a818c17f66c2aece8c6aad22b08468853`  
**Rodzaj audytu:** przegląd statyczny kodu w GitHub, dokumentacji, struktury plików i rzeczywistych logów GitHub Actions.  
**Ograniczenia:** nie korzystano z działającej produkcji ani prawdziwej bazy, nie wykonywano pentestu, nie weryfikowano sekretów, hostingu, dostarczenia Resend, zgód na zdjęcia i autentycznych kont. Oceny bezpieczeństwa są wskazaniami do weryfikacji, nie potwierdzeniem podatności exploitowalnej.

## 1. Podsumowanie kierownicze

**Wniosek:** projekt jest dobrą podstawą funkcjonalną, a `main` przechodzi CI. Nadal nie jest gotowy do publicznego uruchomienia: wymagane są zmiany w dokumentacji prywatności i procesach RODO, MFA, konfiguracja usług, bardziej reprezentatywne testy integracyjne na prawdziwej bazie oraz bezpieczny proces wydania. Pełny CMS, media manager, kalendarz, rezerwacje i płatności pozostają niezakończone.

**Najpilniejsze:** (1) zaktualizować publiczną politykę prywatności dotyczącą przechowywania zgłoszeń w PostgreSQL; (2) zabezpieczyć `main` i administrację przed produkcją; (3) dodać testy właściciela/workerów na PostgreSQL; (4) dopiero potem rozbudowywać CMS galerią i harmonogramem.

## 2. Git, PR i historia

- Najnowszy PR produktowy: **#18**, `feature/content-cms` → `main`, scalony 2026-11-06 17:40:53 UTC: https://github.com/MagicMikky/strefa-57/pull/18.
- #17 `feature/owner-cms` — scalony; obejmuje dane firmy, role, historycznie także bazę galerii, pracowników, plan produktu.
- #11 release v1 — scalony; #14 coverflow — scalony do gałęzi pośredniej; #15 roadmapa i #16 CMS — także scalone do gałęzi pośrednich; ich kod znajduje się w `main` przez inne scalenia.
- **#13** staff panel — zamknięty **bez bezpośredniego merge** (`merged_at=null`), ale kod pracowniczy znajduje się w `main` przez historię innych gałęzi.
- Nadal otwarte: PR Dependabot #3, #4, #5, #6, #7, #8, #10. Nie scalać zbiorowo, szczególnie TypeScript 7.
- `main` według GitHub API: **`protected: false`**. Zabezpieczyć PR checks, approvals i bezpośrednie push.
- Pozostałe stare gałęzie można uprzątnąć po kontroli historii i potwierdzeniu, że nie zawierają niezintegrowanych zmian.

## 3. Architektura i zależności

**Stos:** Next.js 16.4.5, React 19.3.1, react-dom 19.3.0, TypeScript 5.9.3, Tailwind 4.3.3, Better Auth 1.7.18, Prisma 6.19.3, PostgreSQL 16 w CI, Vitest 5.1, Playwright 1.65, Lighthouse CI 0.16, Resend REST API, opcjonalny Upstash Redis.

**Warstwy:**
1. Publiczna witryna w `src/app/` i komponenty `src/components/`.
2. Formularz `/zapytaj-o-termin` → `POST /api/inquiry` → walidacja, rate-limit, PostgreSQL, zadanie powiadomienia, próba wysyłki przez Resend.
3. Better Auth + role `owner` / `manager` / `employee` → `/panel`, zgłoszenia i zarządzanie pracownikami.
4. CMS danych firmy: `src/lib/business`, `BusinessProfile`, `BusinessContact`, `BusinessSettings`, `ContentRevision`, `ConfigChangeAudit`.
5. CMS tekstów: `src/lib/content`, jeden dokument JSON w `SiteContent` na `draft` i `published`; FAQ, atrakcje, teksty trzech pakietów, metadane czterech stron.
6. Statyczne nadal: galeria w `src/data/gallery.ts`, pewne sekcje, dodatki, etapy wizyty i inne treści w `src/data/site.ts` / JSX.

**Ocena podejścia:** rozsądny modułowy monolit i przemyślana separacja panelu od witryny. Ryzyko rośnie przez dwa niezależne systemy draft/publish oraz fallback do stałej kopii treści po awarii DB. W miarę rozbudowy trzeba zdefiniować wspólny model wersjonowania, kontrolę współbieżności, migrację struktur i strategię zachowania ostatnio opublikowanej wersji.

## 4. Witryna i UX

Publiczne ścieżki: `/`, `/oferta`, `/cennik`, `/galeria`, `/dla-kogo`, `/faq`, `/kontakt`, `/dojazd`, `/zapytaj-o-termin`, `/regulamin`, `/polityka-prywatnosci`, `/cookies` oraz 404.

Plusy: jasny podział marketingu i inquiry, wiele CTA, Next Image, meta/canonical, dane strukturalne, sitemap/robots, polski język, formularz z walidacją i komunikatami, testy mobilnego overflow. Brak fałszywych funkcji rezerwacji w v1.

Luki:
- Nie wszystkie nagłówki, Hero, atrakcyjne teksty, sekcje „dla kogo”, dodatki, proces wizyty i treści dokumentów prawnych mają edytor CMS.
- Kontrolowany SEO CMS obejmuje tylko stronę główną, FAQ, ofertę i cennik; metadane pozostałych stron pozostają statyczne.
- Część wymagań „wszystko edytowalne” wciąż wymaga pracy programisty; obecny edytor nie jest ogólnym page builderem.
- Weryfikacja wizualna manualna i pełna WCAG 2.2 AA nie została udokumentowana na produkcyjnym wdrożeniu.
- `src/app/globals.css` ma około 57 KB; dalsza rozbudowa zwiększa koszt utrzymania globalnego arkusza i ryzyko regresji.

## 5. Galeria

- Jest karuzela Coverflow w `src/components/gallery-coverflow.tsx`, poziome kategorie, bez autoplay, centralna fotografia, boczne kadry, nawigacja, lightbox, wsparcie klawiatury i gestów.
- Publicznie dopuszczone są **trzy zdjęcia**: okopy, teren, rakieta V2; wszystkie opisane w `src/data/gallery.ts`.
- Zestaw pięciu różnych pozycji (3 większe + 2 skrajne miniatury) jest elementem **docelowego UX**, a przy trzech materiałach nie może być dosłownie pokazany bez duplikowania.
- Zdjęcia z graczami, plik `rakieta2.jpg` i materiały MP4 opisane są jako niezatwierdzone/nieopublikowane.
- Brak `GalleryAsset`, `GalleryCategory` w Prisma oraz `/panel/galeria`; właściciel nie może dodawać, edytować, kategoryzować i publikować zdjęć z panelu. To **V1.5B-3**.
- Plik logo `public/logo.png` ma ok. 1,86 MB; można ocenić jego optymalizację przy pracy nad assetami. Potwierdzić prawa/zgody i EXIF przed publikacją większej kolekcji.

## 6. Formularz i obsługa zgłoszeń

**Zaimplementowane:** walidacja serwerowa, ograniczenie 16 KB body, kontrola Content-Type i Origin, honeypot, prywatności, identyfikatora pakietu, limitowanie (in-memory lub Upstash), deduplikacja, zapis PostgreSQL z historią i NotificationOutbox, panel listy, szczegółów, statusów, przypisań, notatek oraz audytu.

**Problemy/ryzyka do sprawdzenia:**
- `src/lib/inquiry.ts`: proponowane pory **09:00, 12:00, 15:00, 18:00** nie są zgodne z zatwierdzonym wzorcem slotów **08:00, 11:00, 14:00**. Formularz jest niewiążącym zapytaniem, ale może sugerować nieaktualny harmonogram; należy rozdzielić prośbę o orientacyjną porę od rzeczywistych slotów albo powiązać z opublikowaną konfiguracją.
- Backend waliduje `allowedPackageIds` na podstawie **statycznej** tablicy `packages` mimo edytowalnej nazwy w CMS. Obecnie działa dzięki stałym identyfikatorom trzech pakietów, ale blokuje przyszłe dodawanie pakietów bez zmian kodu.
- Gdy klient nie dostarczy `Idempotency-Key`, `dedupeKey` jest trwałym hashem treści. Identyczne ponowne zapytanie zostanie uznane za ten sam rekord bez określonego okna ważności. Rozważyć rozdzielenie idempotencji ponowionego żądania i biznesowo nowego zgłoszenia.
- W `POST /api/inquiry` po zapisie wykonywane jest `await dispatchInquiryNotification`; wysyłka Resend z timeoutem wydłuża odpowiedź zamiast być w pełni asynchroniczną kolejką.
- Po udanym zapisie zgłoszenia, ale błędzie w `markNotification`, route może zwrócić HTTP 503. To mylące dla klienta i może prowokować ponowienia. Rozdzielić błędy zapisu od błędów transportu powiadomienia.
- Retry via `POST /api/internal/notifications` istnieje, ale w repo nie ma potwierdzonego scheduler-a/worker-a działającego w produkcji. `notificationFor` i `markNotification` nie używają wyraźnego atomowego przejęcia zadania (claim/lease): równoległe workery mogą wysłać dublet. Potrzebne retry z backoff, leasingiem i kontrolą idempotencji lub deduplikacji dostarczenia.
- `INQUIRY_STORE=memory` pozostaje możliwe przez ENV; dokumentacja zabrania stosowania w produkcji, ale warto dodać runtime guard, aby konfiguracja produkcyjna nie mogła przypadkowo używać nietrwałego magazynu.
- Rate limit formularza może działać na jednym procesie; na wielu instancjach należy podłączyć i przetestować współdzielony limit.
- Nie potwierdzono rzeczywistego dostarczenia Resend, DNS, skrzynki odbiorczej ani obsługi bounce/spam.

## 7. Konta, panel, autoryzacja

**Zaimplementowane:** Better Auth, sesje 8 godzin, hasła min. 12 znaków, wyłączona publiczna rejestracja, sesyjne cookies HttpOnly/Lax/Secure produkcyjnie, role serwerowe, blokowanie pracownika, anulowanie jego sesji, jednorazowy mechanizm zakładania ownera przez Bearer, osobny panel zapytań i edycji treści.

**Poważne ograniczenia:**
- **Brak wymuszanego MFA**. `mfaEnrolled` istnieje w bazie, ale logowanie jest jednoetapowe; wymagany osobny etap przed publicznym panelem.
- Rate-limit Better Auth używa `storage: "memory"` — brak wspólnego limitu pomiędzy instancjami.
- Konta pracowników tworzy owner z hasłem podanym w panelu, z `emailVerified=true`; brak udokumentowanego bezpiecznego zaproszenia, resetu hasła i odzyskiwania MFA.
- `createInitialOwner` najpierw sprawdza liczbę ownerów, a następnie tworzy rekord: w kodzie nie widać twardego unikalnego ograniczenia DB gwarantującego dokładnie jednego ownera przy dwóch równoczesnych bootstrapach. Wymaga testu współbieżności, migracji/ograniczenia i wyłączenia bootstrapu po pierwszym użyciu.
- Role admina i dostęp do wszystkich danych klientów należy ostatecznie zatwierdzić; pracownicy widzą wspólną skrzynkę, mogą dopisywać notatki, ale status zmienia tylko manager/owner.
- `proxy.ts` sprawdza jedynie obecność cookie, zaś prawdziwe uprawnienia weryfikuje `requireStaff`: to właściwe podejście, nie należy uważać proxy za źródło autoryzacji.

## 8. CMS firmy i treści

**V1.5B-1:** `/panel/firma` — edycja firmy, telefonu, adresu, lokalizacji, godzin, podstawowych parametrów 8/2–4/32, trzech godzin, czasu gry/buforu, slotu wspólnego/prywatnego. Draft, podgląd, publikacja i historia. Publiczne dane firmy w nagłówku, stopce, kontakcie, dojeździe, JSON-LD. Wartości handlowe są celowo nieustalone.

**V1.5B-2 / PR #18:** `/panel/tresci` — FAQ, nazwy/opisy atrakcji, teksty trzech pakietów, ich lista features i wyróżnienie; SEO homepage/FAQ/oferta/cennik. `SiteContent` JSON w dwóch wierszach `draft` i `published`. Publikacja powoduje `revalidatePath`.

**Ograniczenia:**
- `PACKAGE_IDS` = trzy identyfikatory na sztywno, `attractions.length` na sztywno. Nie można dodawać/usunąć/reorganizować pakietów i atrakcji z UI. Teksty dodatków, CTA, wiele sekcji stron i SEO pozostałych tras nadal statyczne.
- FAQ można edytować, ale UI zapełnia puste sloty do 8, choć model dopuszcza 12; dynamicznego dodawania/usuwania/reorder brak.
- „Podgląd” to przede wszystkim porównanie tekstów, nie wierny wizualny podgląd strony. Brak edytora układu sekcji.
- Nie ma łatwej operacji „przywróć tę konkretną opublikowaną rewizję” mimo archiwalnych rekordów audytu.
- W `saveSiteDraft` i `saveCompanyDraft` nie widać walidacji wersji formularza w transakcji (optimistic locking). Dwie karty lub dwóch administratorów mogą nadpisywać szkic; `findUnique` version przed `upsert` nie wystarcza bez warunkowego update.
- Publiczny fallback po awarii PostgreSQL wraca do **wersji w kodzie**, nie do ostatnio opublikowanego stanu. Po publikacji zmiany adresu/telefonu awaria DB może publicznie przywrócić nieaktualne dane. Trzeba ustalić bezpieczną strategię ostatniego opublikowanego snapshotu i odzyskiwania.
- Metadane `siteConfig.name` w layout nadal statyczne i mogą różnić się od zmienionej nazwy biznesowej; ujednolicić generowane metadata, JSON-LD i widoczną nazwę.
- W bazie `BusinessSettings` są pola przyszłych cen i sprzętu, ale zapis firmy świadomie pozostawia `equipmentSets`, `depositAmount`, `privateSlotSurcharge`, `paymentProvider`, `cancellationPolicy` puste. To nie jest gotowa sprzedaż ani pełny konfigurator.

## 9. Baza danych

- Modele: `User`, `Session`, `Account`, `Verification`, `Inquiry`, `InquiryNote`, `InquiryHistory`, `NotificationOutbox`, `StaffAudit`, `BusinessProfile`, `BusinessContact`, `BusinessSettings`, `ContentRevision`, `ConfigChangeAudit`, `SiteContent`.
- Cztery migracje: staff, user role default member, business config, site content. GitHub job `database` uruchamia PostgreSQL 16 i `prisma migrate deploy`, z wynikiem sukces.
- Brak pełnych testów integracyjnych transakcji CMS, logowania, zgłoszeń i outbox na rzeczywistym DB w obecnym CI. `src/lib/content/store.test.ts` i `src/lib/business/store.test.ts` korzystają z in-memory mocka transakcji. W przeglądarkowym jobie CI nie widać podłączenia PostgreSQL/seeda ownera.
- Wskazane: izolowane DB testowe, migracja + seed, scenariusz zapisu/odczytu z dwiema sesjami, konflikt aktualizacji, backup/restore, test unikalności i spójności danych.
- Wsteczną zgodność migracji trzeba zachować przed rozszerzeniem tabel o media, harmonogram i rezerwacje.

## 10. Jakość CI, testów, dostępność

**GitHub Actions na `b73b490`:** sukces w jobach `quality`, `browser`, `database`; CodeQL: sukces.

- 69/69 testów Vitest, 15 plików.
- 86/86 testów Playwright.
- Pokrycie: statements 74,73%; branches 68,24%; functions 81,19%; lines 76,17%.
- Lighthouse kończy się sukcesem technicznym na `/`, `/oferta`, `/zapytaj-o-termin`, `/kontakt`; SEO daje ostrzeżenia przy wyłączonej indeksacji. Próg performance to zaledwie 0,6 i wynik jednej próby nie jest pełną oceną użytkowników.
- `e2e/panel.spec.ts` sprawdza niedostępność panelu dla gościa oraz brak rejestracji. Brak odrębnego pełnego E2E „zaloguj ownera → zapisz szkic → opublikuj → sprawdź publiczne HTML/SEO → odtwórz wersję”.
- `vitest.config.ts` ma progi statements 70, branches 55, functions 65, lines 70 — zapewnia podstawowy gate, ale nie jest dowodem na kompletne pokrycie krytycznych tras.
- `next.config.ts`: CSP jest tylko `Content-Security-Policy-Report-Only`, a polityka dopuszcza `unsafe-inline`. Potrzebny plan wzmocnienia i weryfikacji z realnym Next.js.
- Testy axe są automatyczne, nie zastępują ręcznej weryfikacji WCAG 2.2 AA (klawiatura, screenreader, reduced motion, focus trap, mobile).

### Podatności zależności

W logu `npm ci` najnowszego CI pokazano **20 zgłoszeń npm audit: 8 moderate i 12 high**. Ten komunikat nie identyfikuje produkcyjnego zasięgu i nie jest automatycznym dowodem podatności exploitable. W repo nie ma w obecnym workflow wyraźnej bramki `npm audit --omit=dev` i zapisanej triage. Wykonać pełen audyt po `npm ci`, podzielić na prod/dev i ocenić direct/transitive; ostrożnie przeglądać otwarte PR Dependabot, bez zbiorowego merge i `npm audit fix --force`.

## 11. Prawo i prywatność — P0

**Krytyczna sprzeczność dokumentacyjna:** `/polityka-prywatnosci` zawiera sekcję „Brak bazy zapytań” i twierdzi, że zgłoszenia są wyłącznie w e-mailu. Obecny backend `POST /api/inquiry` zapisuje zgłoszenia z imieniem, kontaktem i wiadomością w PostgreSQL, a potem kieruje powiadomienia. Tę treść należy skorygować **przed przyjmowaniem prawdziwych zgłoszeń**.

Dodatkowo:
- Regulamin, prywatność i cookies są jawnie oznaczone jako robocze. Wymagają aktualizacji dostawców, retencji, podstaw przetwarzania, praw klientów, kontaktu do administratora danych oraz zatwierdzenia przed publikacją.
- Obecny retencyjny `DATA_RETENTION_DAYS` bez wartości nie kasuje danych — decyzja D-30 jest otwarta.
- Niepotwierdzone: wiek uczestnika, zgody opiekuna, odwołania, standard bezpieczeństwa i skutki pogody; preferencja właściciela o braku zwrotu przy złej pogodzie wymaga doprecyzowania i oceny prawnej.
- `robots` blokuje indeksowanie bez zgody, więc problem nie jest zamaskowany przez brak indeksacji: publicznie dostępny link z błędną polityką nadal będzie wprowadzać w błąd.
- Nie publikować wizerunków rozpoznawalnych osób bez stosownych zgód/podstaw.

## 12. Produkcja, operacyjność i proces

Nieweryfikowalne z repo: faktyczny hosting, opłacona domena, prawdziwe `.env`, działająca baza, backup/restore, monitoring, potwierdzenie dostarczenia Resend i własność zdjęć. Nie wolno traktować tych elementów jako ukończonych na podstawie zielonych testów.

- `README.md` nadal opisuje wersję 1.0 w sposób sprzeczny z nowym `DATABASE_URL` i zachowaniem formularza po braku Resend. Odświeżyć zgodnie z kodem.
- `AGENTS.md` zakazuje implementacji CMS 1.5B bez wyraźnego zlecenia, ale CMS już jest w `main`; dopisać aktualny stan wersji 1.5B-1/2, zakres kolejnych zadań i prawidłową politykę zmian.
- Historyczny `docs/V1_GAP_ANALYSIS.md` zachowuje stare założenia i może być mylący bez adnotacji historycznej.
- Ochrona `main` w API GitHub: `false`. Ustawić wymagany PR, status checks (quality/browser/database/CodeQL), blokadę force-push i najlepiej review.
- Obowiązkowe oddzielne środowiska testowe i produkcyjne, backupy PostgreSQL, weryfikacja odtworzenia i ewidencja zmian.

## 13. Zgodność z roadmapą i otwarte decyzje

| Wersja | Stan kodu | Uwaga |
|---|---|---|
| V1.0 | Techniczna baza strony istnieje | P0 biznes/prawo/e-mail jeszcze do zamknięcia |
| V1.5A | Auth i skrzynka zgłoszeń istnieją | MFA, testy DB i produkcyjny worker nieukończone |
| V1.5B-1 | Dane firmy i parametry bazowe | Zaimplementowane; edycja i publikacja PostgreSQL wymagają E2E z prawdziwym DB |
| V1.5B-2 | Edycja FAQ, atrakcji, 3 pakietów, SEO 4 stron | Częściowe względem pełnego wymogu elastycznego CMS |
| V1.5B-3 | Media/gallery manager | Nie istnieje |
| V1.5B-4 | Harmonogram, sprzęt, wyjątki i blokady | Nie istnieje |
| V2.0 | Kalendarz, hold, rezerwacje gościnne, płatności | Nie istnieje |
| V2.1 | Konta klientów | Nie istnieją |
| V2.2 | Drużyny | Nie istnieją |
| V2.3 | Mecze i rankingi | Nie istnieją |
| V3.0 | Liga, turnieje i nagrody | Nie istnieją |

**Zatwierdzone reguły bazowe, zapisane edytowalnie w `BusinessSettings`:** 8 graczy/drużynę, 2–4 drużyny/mecz, 32 graczy/slot, starty 08:00/11:00/14:00, 120 min gry + 60 min przerwy, współdzielenie i prywatna wyłączność. Dzienna pojemność nominalna 96, próg połowy 48. Niezatwierdzone: ceny, dopłaty, zadatek, liczba zestawów, obsada, minima zamówienia, zwroty, dostawca płatności, warunki pogodowe (wstępnie) i inne D-01…D-36.

## 14. Zalecana kolejność prac

### P0 — przed produkcją i prawdziwymi danymi

1. Aktualizacja polityki prywatności, regulaminu i opisów danych (prawdziwe przechowywanie w DB). Potwierdzić treść z doradcą prawnym/RODO.
2. MFA pracowników i procedura odzyskiwania; wspólny rate-limit logowania; test sesji, resetu, blokowania i uprawnień.
3. Prawdziwy integracyjny staging z PostgreSQL/Resend, bez sekretów w GitHub; test maili, uprawnień, kopii i odtwarzania.
4. Ochrona `main` i reguły merge/deploy.
5. Potwierdzenie danych firmy, kontaktu, warunków i wizerunków. Indeksacja nadal wyłączona.

### P1 — najbliższy sprint techniczny

6. Testy E2E „owner → draft → preview → publish → public data/SEO” i „klient → inquiry → panel → status/assign/note” na prawdziwej PostgreSQL.
7. Harden outbox: atomowe przejęcie i retry, prawidłowa semantyka API po zapisie, worker/scheduler, monitoring i alerty.
8. Optimistic locking dla draft/publish CMS; last-known-good snapshot i spójny rollback.
9. Ujednolicenie formularza i CMS pakietów; wprowadzenie elastycznych identyfikatorów przed nowymi pakietami.
10. Triage `npm audit` i selektywne aktualizacje.

### P2 — rozwój produktu

11. V1.5B-3 media manager: storage, upload, EXIF, zgody, kategorie, kolejność, publikacja, rollback.
12. V1.5B-4 harmonogram: szablony slotów, zasoby, wyjątki i możliwość blokady dnia/slotu; bez automatycznej sprzedaży.
13. V2.0: silnik dostępności, kolory kalendarza, modal slotów, rezerwacje współdzielone/prywatne, płatności — tylko po zatwierdzeniu cen/polityk i testach współbieżności.
14. V2.1/2.2/2.3/3.0: konta klientów, drużyny, rankingi i nagrody w tej kolejności.

## 15. Proponowane kryteria odbioru kolejnego PR

- Mały izolowany PR z aktualnego `main`, nie zmienia schematu rezerwacji przed terminem.
- Testy integracyjne PostgreSQL, bezpieczne seedy i teardown.
- Przygotowane scenariusze P0 regresyjne (auth i CMS + inquiry).
- Wynik `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:coverage`, `npm run build`, `npm run test:e2e`, `npm run lhci`, `npx prisma migrate deploy` na prawdziwym PostgreSQL.
- Rozdzielony audyt produkcyjnych i deweloperskich zależności.
- Brak zmiany opublikowanych danych, ceny, polityki lub widoczności bez decyzji właściciela.
- Raport wykonania z realnymi wynikami CI i odnotowaniem niezweryfikowanych elementów.

## 16. Źródła i linki

- Repozytorium: https://github.com/MagicMikky/strefa-57/tree/main
- Najnowszy PR #18: https://github.com/MagicMikky/strefa-57/pull/18
- GitHub Actions najnowszy `main`: https://github.com/MagicMikky/strefa-57/actions/runs/42263849493
- PR #17: https://github.com/MagicMikky/strefa-57/pull/17
- Katalog dokumentacji: https://github.com/MagicMikky/strefa-57/tree/main/docs
- Polityka prywatności: https://github.com/MagicMikky/strefa-57/blob/main/src/app/polityka-prywatnosci/page.tsx
- Prisma: https://github.com/MagicMikky/strefa-57/blob/main/prisma/schema.prisma
- Formularz API: https://github.com/MagicMikky/strefa-57/blob/main/src/app/api/inquiry/route.ts
- Auth: https://github.com/MagicMikky/strefa-57/blob/main/src/lib/auth-factory.ts
- CMS: https://github.com/MagicMikky/strefa-57/blob/main/src/lib/content/store.ts
- Galeria: https://github.com/MagicMikky/strefa-57/blob/main/src/components/gallery-coverflow.tsx
- Zasady produktu: https://github.com/MagicMikky/strefa-57/blob/main/docs/STREFA29_NOWA_ROADMAPA_I_PLAN_WERSJI_2026-11-06.md
- Rejestr decyzji: https://github.com/MagicMikky/strefa-57/blob/main/docs/STREFA29_REJESTR_DECYZJI_DO_USTALENIA.md

*Raport opiera się na analizie kodu źródłowego i logów GitHub. Nie jest certyfikatem bezpieczeństwa, prawną opinią RODO ani wynikiem produkcyjnego testu E2E.*
