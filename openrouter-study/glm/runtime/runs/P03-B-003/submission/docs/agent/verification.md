# Implementerjevo preverjanje

## Načrt

- Zahteve so prebrane iz `PROJECT_RULES.md`, `task/instructions.md`, `task/specification-template.md` in `docs/agent/specification.md`.
- Implementiral sem iskanje in sestavljene filtre v obstoječem pogledu, dodal lastne Playwright teste in posodobil slogovne definicije.
- Preveril sem razvojne teste, lastne teste, tipovno preverjanje, gradnjo in polno projektno preverjanje.

## Spremembe in sledljivost

- R01–R03: `src/App.tsx` – privzeto lokalno stanje filtrov, normalizacija Unicode NFD, odstranitev U+0300–U+036F, iskanje po `id`, `title`, `description` in `assignee`, deljenje po belinah ter dobesedno vsebujevanje vseh nepraznih besed.
- R04–R05: `src/App.tsx` – sestavljeno logično IN iskanja, stanja in odgovorne osebe; natančna primerjava osebe; možnosti iz celotnega trenutnega projekta z `all` in enoličnimi nepraznimi imeni.
- R06–R07: `src/App.tsx` – isti filtriran seznam za preglednico in tablo; lokalno stanje v `ProjectView` in obstoječi `key={project.id}` povesta ponastavitev ob preklopu projekta.
- R08–R09: `src/App.tsx` – brez URL-ja ali trajne shrambe; status `Prikazano: N od M.`; pregled stanj in stolpci table štejejo filtrirane zadetke.
- R10–R11: `src/App.tsx` – sporočilo `Ni zadetkov.` za neprazen projekt brez zadetkov, običajno prazno stanje za prazen projekt ter enodejstveno počiščenje vseh treh kontrol.
- R12: `src/App.tsx` – obstoječa navigacija, povezave, `data-task-id`, podrobnosti in Folio so ohranjeni; filtriranje ne izvaja pisnih zahtev.
- Slogi: `src/styles.css` – kontrola za filtre so vključena v obstoječi Folio dizajn in prilagojena ozki širini.
- Lastni testi: `tests/agent/filters.spec.ts` – pet testov pokriva R01–R12, vključno z obema pogledoma, števci, preklopom projekta, osvežitvijo, praznim projektom in podrobnostmi.

## Izvedena preverjanja in rezultati

- `npx playwright test tests/development/P03.spec.ts --project=development-desktop --project=development-mobile`: 8/8 uspešno.
- `npx playwright test tests/agent/filters.spec.ts --project=agent`: 5/5 uspešno.
- Prvi `npm run check` je odkril osnovno regresijo: prazen projekt v tabuli ni ve prikazal treh stolpcev. Pogoj v `src/App.tsx` sem popravil tako, da prazen projekt v tabuli ohrani prazne stolpce, v preglednici pa običajno prazno stanje.
- Končni `npm run check`: ESLint brez napak, TypeScript brez napak, Vite gradnja uspešna, 51/51 Playwright testov uspešnih (14 API, 24 osnovnih desktop/mobile, 8 razvojnih P03, 5 lastnih).

## Omejitve okolja

- Javni internet ni na voljo; uporabljene so samo lokalne odvisnosti in lokalni testni strežnik.
- Chromium je povezan prek `wsEndpoint` iz `task/browser.json`; `chromium.launch()` ni uporabljen.
- Skupna infrastruktura, odvisnosti in skupni testi niso spremenjeni.
- V tem okolju ni na voljo git repozitorija (`git status` poroča, da nadrejena mapa ni git repozitorij).

## Opazke o specifikaciji

- Specifikacija zajema izvorne zahteve R01–R12. Nisem zaznal nasprotij ali izpuščene obvezne zahteve.
- Specifikacija v tabeli sledljivosti napoveduje `src/TaskBoard.tsx` pri števcih stolpcev; obstoječa komponenta te števce že vsebuje, zato sprememba ni bila potrebna.
