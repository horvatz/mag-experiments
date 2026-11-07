# Preverjanje implementacije P03

## Zapis implementatorja

- Začetek: 2026-10-13 00:08 UTC+1.
- Vloga: implementator. Predana specifikacija je prebrana in je obvezna izhodišče.
- Dovoljene spremembe: `src/`, lastni testi v `tests/agent/` in ta zapisnik.
- Ne spreminjam: specifikacije, njene zgodovine, pregledov, skupne infrastrukture, odvisnosti ali skupnih testov.

## Načrtovana preverjanja

- Pregled obstoječega vmesnika in razvojnih testov P03.
- Implementacija iskanja, filtrov, števcev, enotnega rezultata obeh pogledov in ponastavitve ob menjavi projekta.
- Dodajanje lastnih Playwright testov za izpustene robne primere iz specifikacije.
- Zagon ciljanih lastnih testov, razvojnih testov in nato `npm run check`, če čas dovoljuje.
- Osvežitev tega zapisnika z dejanskimi izidi, sledljivostjo zahtev in opaženimi omejitvami.

## Izvedene spremembe

- `src/App.tsx` dodaja lokalna stanja za iskanje, stanje in odgovorno osebo, normalizacijo Unicode NFD z odstranitvijo kombinacijskih znamenj, dobesedno iskanje po vseh besedah ter enoten seznam `visibleTasks` za preglednico in tablo.
- `src/App.tsx` dodaja tri zahtevane kontrole, gumb `Počisti filtre`, status `Prikazano: N od M.`, števce vidnih stanj ter sporočili za prazen projekt in `Ni zadetkov.`.
- `src/styles.css` doda sloge za nove kontrole v obstoječem Folio dizajnu, vključno z ozkoširinskim prilagoditvami.
- `tests/agent/P03.spec.ts` dodaja štiri lastne Playwright teste za robne primere.
- Stanje se ponastavi ob menjavi projekta zaradi obstoječega `key={project.id}` na `ProjectView`; filtri niso dodani v URL ali brskalnikovo trajno shrambo.

## Sledljivost zahtev

| Zahteva | Izid |
| --- | --- |
| R01 | Izpolnjena: privzeti filtri in izvorni vrstni red sta preverjena z D01, A02 in A04. |
| R02 | Izpolnjena: NFD normalizacija, odstranitev U+0300–U+036F in iskanje po `id`, `title`, `description` ter `assignee` sta preverjena z A01. |
| R03 | Izpolnjena: dobesedne besede v poljubnem vrstnem redu in prazen vnos sta preverjena z A01. |
| R04 | Izpolnjena: kombinacija iskanja, stanja in osebe po logičnem IN ter natančna primerjava osebe sta preverjena z A01. |
| R05 | Izpolnjena: `all` in vsa različna neprazna imena trenutnega projekta so preverjena z A02. |
| R06 | Izpolnjena: enaki ID-ji v obeh pogledih, ohranjeni filtri in števci stolpcev so preverjeni z A03. |
| R07 | Izpolnjena: menjava projekta ponastavi vse tri kontrole in ne uporabi starih filtrov; preverjeno z A02. |
| R08 | Izpolnjena: osvežitev, URL, `localStorage`, `sessionStorage` in piškotki so preverjeni z A04. |
| R09 | Izpolnjena: status, pregled stanj in števci stolpcev štejejo vidne rezultate; preverjeno z A03. |
| R10 | Izpolnjena: sporočilo `Ni zadetkov.` v obeh pogledih ter prazno stanje in števec `0 od 0` sta preverjena z A03. |
| R11 | Izpolnjena: počiščenje vseh kontrol in ohranjen vrstni red sta preverjena z A01, A03 in A04. |
| R12 | Izpolnjena: navigacija, bralne podrobnosti, `data-task-id`, `aria-label`, samo branje in širina 390 px so preverjeni z A04 ter skupnimi testi. |

## Dejanski rezultati preverjanj

- `npx playwright test tests/agent/P03.spec.ts --project=agent`: 4 uspešni testi (A01–A04).
- `npx playwright test --project=development-desktop --project=development-mobile`: 8 uspešnih testov (D01–D04 v obeh velikostih).
- `npm run check`: ESLint, `tsc --noEmit`, Vite gradnja in vsi Playwright testi uspešni; 50/50 testov.
- Med razvojem sta bila najprej dva lastna testa popravljena zaradi napačnih pričakovanih podatkov osebe ter ohranjenega pogleda tabla po osvežitvi. Prvi `npm run check` je odkril tudi TypeScript napako pri `evaluateAll`; popravka sta bila narejena in končno preverjanje je uspešno.

## Omejitve okolja

- Javni internet ni uporabljen in ni bil na voljo; uporabljeni so le lokalni testni strežnik na 5174/3102 in obstoječi Chromium prek `task/browser.json`.
- `npm` večkrat izpiše opozorili o neznani nastavitvi `http-proxy` ter o kombinaciji `NO_COLOR`/`FORCE_COLOR`; nimajo vpliva na rezultat.
- Preverjanje `git status`/`git diff` v tem omejenem okolju ni zanesljivo: dostop do globalne git nastavitve je zavrnjen, mapa pa z izločenimi konfiguracijami ni prepozmana kot git repozitorij.
- Brskalnikove nepovezane vsebine shrambe niso bile predhodno naseljene, zato test A04 potrjuje, da aplikacija ne zapisuje filtrov vanje.
- Specifikacijske napake ali neizpolnjene zahteve niso opažene.
