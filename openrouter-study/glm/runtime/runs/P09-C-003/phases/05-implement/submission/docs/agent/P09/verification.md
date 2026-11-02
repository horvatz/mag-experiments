# P09 preverjanje

## Spremembe

- `src/navigation.ts`: tipe in razčlenjevanje `q`, `status`, `order`, normalizacijo NFD, kanonične URL-je in ohranjanje `view=board`.
- `src/App.tsx`: dostopne kontrole, ločen osnutek, potrjevanje, ponastavitev, filtriranje, urejanje, števec, prazno stanje in ohranjanje parametrov.
- `src/TaskBoard.tsx`: prenašanje potrjenih parametrov v povezave do opravil.
- `src/TaskDetails.tsx`: ohranjanje parametrov pri zapiranju podrobnosti.
- `src/styles.css`: kompaktna postavitev kontrol v Folio vizualnem jeziku.

## Izvedena preverjanja

- `npm run typecheck` — uspešno.
- `npx playwright test tests/development/P09.spec.ts --project=development-desktop` — 4/4 uspešno.
- `npm run lint` — uspešno.
- `npm run build` — uspešno.
- Prvi celoten `npm run check` — 42/46 uspešno; 4 regresije fokusa po remountu `ProjectView`.
- Popravek sinhronizacije osnutka brez remounta; nato ciljna regresija fokusa — 2/2 uspešno.
- Končni `npm run check` — 46/46 uspešno (14 API, 24 osnovnih desktop/mobile, 8 razvojnih P09).
- Ad-hoc Playwright zbirka v `.tmp/agent/p09.spec.ts` — 8/8 uspešno; pokrivala je R01–R12. Datoteka je bila po izvedbi odstranjena.

## Omejitve

- `tests/agent/` v tem izvajalnem okolju ni zapisljiv; ustvarjanje `tests/agent/p09.spec.ts` je sandbox zavrl. Zato T007 ni označen kot opravljen.
- Skriti končni testi in javni internet niso na voljo in niso navedeni kot izvedeni.
- Navigacija med nezaključenim nalaganjem ter sočasne spremembe podatkov brez osvežitve sta po navodilih izven obstoječih regresijskih zahtev.

## Sledljivost

- R01–R12 so povezani s pogoji, izvorno kodo in dejanskimi izidi v `spec.md`.
