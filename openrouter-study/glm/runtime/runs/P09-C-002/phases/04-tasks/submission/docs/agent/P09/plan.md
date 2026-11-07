# Načrt izvedbe P09

## Tehnični kontekst

Aplikacija je React 19 + TypeScript + Vite z obstoječim hash usmerjanjem, javnim API-jem `/api/` in nameščenimi Playwright razvojnymi testi. Ohranjamo obstoječe odvisnosti, strežnik, skupne tipe, nastavitve in potrjen dizajn Folio.

## Arhitekturne odločitve

- URL ostaja edini vir potrjenega stanja (`q`, `status`, `order`, `view`, pot opravila). Ne uporabimo `localStorage`, testnih kontrol ali dodatnih zapisovalnih API-jev.
- Razčlenjevanje in sestavljanje fragmenta razširimo v `src/navigation.ts`: prva vrednost ponovljenega parametra, neveljavne vrednosti postanejo privzete, neznani parametri se ob sestavljanju odstranijo.
- Normalizacija, preverjanje ujemanja in urejanje izoliramo v novo datoteko `src/viewState.ts`. Uporabimo NFD, odstranjevanje `U+0300`–`U+036F`, male črke, UTF-16 primerjavo naslovov in stabilno izvorno zaporedje pri izenačitvi.
- `ProjectView` dobi lokalni osnutek treh kontrol. Spremembe kontrole spreminjajo samo osnutek; prikaz se izračunava iz potrjenega stanja iz URL-ja. Ob vsaki navigaciji se osnutek ponastavi na potrjeno stanje.
- `Uporabi pogled` in `Ponastavi pogled` sestavita nov URL z ohranjenim `view` in potjo; sprememba URL-ja ustvari en zgodovinski vnos, enaka vrednost pa ne.
- Preglednica in tabla uporabljata isti filtriran in urejen seznam opravil ter ohranjata `data-task-id` in dostopna imena.

## Spremembe po datotekah

- `src/navigation.ts`: razširi vrsto poti s potrjenim stanjem; podpira varno razčlenjevanje query dela fragmenta, privzete vrednosti, `view`, pot opravila in sestavljanje URL-jev s kodiranimi parametri.
- `src/viewState.ts`: konstante dovoljenih vrednosti, normalizacija, filter, urejanje, štetje in pomožne funkcije za URL.
- `src/App.tsx`: doda dostopne kontrole, osnutek, potrditev, ponastavitev, števec `Prikazano: N od M.`, prazen prikaz `Ni zadetkov.` ter uporabi filtriran seznam v obeh pogledih in podrobnostih.
- `src/TaskBoard.tsx`: po potrebi prilagodi podpise kartic ali linke, da ohranjajo potrjene parametre in `view`.
- `src/TaskDetails.tsx`: ohrani trenutne parametre in način pogleda pri zapiranju z gumbom ali `Escape`.
- `src/styles.css`: le minimalni Folio slogi za novo vrstico kontrol, gumbe, števec in prazen rezultat; ohrani vidni fokus in ozko drsenje.
- `tests/agent/P09.spec.ts`: lastni Playwright testi za vse R01–R12, brez sprememb skupnih testov ali pripomočkov.

## Testiranje

- Najprej izvedemo lastne teste: `npx playwright test tests/agent/P09.spec.ts`.
- Nato razvojne teste P09: `npx playwright test tests/development/P09.spec.ts`.
- Nato še skupne preverjalne ukaze: `npm run typecheck`, `npm run lint`, `npm run build`.
- Po potrebi izvedemo celoten `npm test`; rezultate in morebitne neizvedene ukaze zabeležimo v sledljivost specifikacije.
- Preverimo še ozko obnašanje na 390 px in odsotnost zapisovalnih zahtevkov ali testnih klicev iz uporabniškega vmesnika.

## Meje

Ne spreminjamo strežnika, skupnih tipov, odvisnosti, nastavitev, skupnih testov ali infrastrukture. Ne dodajamo novih funkcionalnih zahtev ali zunanjih meritev.
