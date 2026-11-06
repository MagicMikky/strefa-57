# Paintball Strefa 29 — lokalny projekt

Instrukcje uruchomienia projektu lokalnie i uruchomienia testów.

Wymagania:
- Node.js v20+ (zalecane 20.9+)

Skrypty:
- `npm run dev` — uruchamia Next.js w trybie deweloperskim
- `npm run build` — buduje aplikację
- `npm start` — uruchamia zbudowaną aplikację
- `npm run typecheck` — uruchamia `tsc --noEmit`
- `npm run lint` — uruchamia `eslint`
- `npm test` — uruchamia testy przez `vitest`

Uruchomienie (Windows PowerShell):
```powershell
npm ci
npm run dev
```

Uruchomienie testów:
```powershell
npm ci
npm test
```

CI:
Dodano podstawowy workflow GitHub Actions w `.github/workflows/ci.yml`.
