# Implementerjevo poročilo o preverjanju

## Zahteve

Predana specifikacija v `docs/agent/specification.md` pokriva zahteve R01–R12 in ni v konfliktu z izvirnimi navodili. Izvirne zahteve so ostale obvezne: javni API, Folio videz, slovenska poimenovanja, bralna navigacija, brez testnih kontrol v uporabniškem vmesniku in brez novih zapisovalnih poti.

## Spremembe in sledljivost

- `src/App.tsx`: dodano lokalno stanje iskanja, stanja in odgovorne osebe; izpeljava `visibleTasks`; normalizacija z Unicode NFD, odstranitvijo diakritičnih znakov in malimi črkami; literalno večbesedno iskanje; združevanje filtrov z IN; možnosti oseb iz celotnega projekta; status `Prikazano: N od M.`; `Ni zadetkov.` ter enodejno čiščenje. Pokrito je R01–R11 in R12.
- `src/App.tsx`: `ProjectView` ostaja ključan z `project.id`, zato preklop projekta ponastavi vse tri filtre in prepreči prenos na drug projekt. Pokrito je R05, R07 in R08.
- `src/TaskBoard.tsx`: komponenta ni bila spreminjana; prejema isti `visibleTasks`, stolpci pa še naprej ločijo stanja. Pokrito je R06 in R09.
- `src/styles.css`: dodani Foliu skladni kontrolniki za iskanje, filtra, gumb in status, z ovijanjem in notranjim drsenjem na ozki širini. Pokrito je R12.
- `tests/agent/P03.spec.ts`: dodani lastni testi za normalizacijo, literalno iskanje, vrstni red besed, kombinirane filtre, persistenco pogleda, preklop projekta, osvežitev, prazen projekt, 11 opravil, števce, čiščenje, ozko širino in bralne podrobnosti. Pokrito so vsi R01–R12.

| Zahteva | Izid |
| --- | --- |
| R01 | Izvedeno in preverjeno. |
| R02 | Izvedeno in preverjeno. |
| R03 | Izvedeno in preverjeno. |
| R04 | Izvedeno in preverjeno. |
| R05 | Izvedeno in preverjeno. |
| R06 | Izvedeno in preverjeno. |
| R07 | Izvedeno in preverjeno. |
| R08 | Izvedeno in preverjeno. |
| R09 | Izvedeno in preverjeno. |
| R10 | Izvedeno in preverjeno. |
| R11 | Izvedeno in preverjeno. |
| R12 | Izvedeno in preverjeno. |

## Izvedena preverjanja

- `npx eslint src/App.tsx tests/agent/P03.spec.ts` — uspešno.
- `npm run typecheck` — uspešno.
- `npx playwright test tests/agent/P03.spec.ts --project=agent` — 6 od 6 uspešnih.
- `npx playwright test --project=development-desktop --project=development-mobile` — 8 od 8 uspešnih.
- `npm run check` — uspešno: lint, tipi, gradnja in 52 od 52 Playwright testov (14 API, 24 osnovnih namizni/mobilni, 8 razvojnih P03, 6 lastnih).

### Posredni izidi

- Prvi zagon lastnih testov je bil 3/6 uspešen. Dve napaki sta bili testni pričakovani: `toHaveValues` je povzročil strict mode violation, drugi klic `mount` na isti strani pa je pustil prejšnjo prazno preslikavo. Testa sta bila popravljena.
- Drugi zagon lastnih testov je bil 5/6 uspešen. Napačno pričakovani zadetek iskanja `10` je bil `many-01`; dejanski zadetek je `many-10`. Pričakovana vrednost je bila usklajena.
- Prvi `npm run check` ni uspel v `tsc --noEmit`, ker `evaluateAll` v testu ni imel lastnosti `value` na vseh možnih elementih. Preverjanje je bilo spremenjeno na `getAttribute('value')` in končni zagon je zelen.

## Morebitne napake specifikacije

- Niso bile odkrite. Specifikacija je z izvirnimi zahtevami usklajena.

## Omejitve okolja

- Javni internet je blokiran; uporabljena so samo lokalna strežnika in lokalni Chromium te naloge.
- Strežnik, `shared/`, skupni testi, odvisnosti in nastavitve ostanejo nespremenjeni; testne kontrole `/__test/` uporablja samo testni program.
- Playwright se povezuje z `wsEndpoint` iz `task/browser.json`; `chromium.launch()` ni uporabljen.
- V tej seji ni na voljo izvedljivega ukaza `apply_patch`, zato so spremembe zapisane z lokalnim Node skriptom v dovoljenih poteh.

## Zaključek

Rešitev je preverjena z vsemi dostopnimi testi in pripravljena za pregled. Ni znanih neizpolnjenih zahtev.