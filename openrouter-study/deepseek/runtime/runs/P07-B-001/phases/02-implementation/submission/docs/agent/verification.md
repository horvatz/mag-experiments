# Poročilo o izvedbi in preverjanju (P07, postopek B — izvajalec)

Verzija 2 (rezultati), 30. 10. 2026. Vir zahtev: `task/instructions.md` in
predana `docs/agent/specification.md`. Vsi spodnji izidi so dejansko izvedeni
v tem okolju; zadnji zagon `npm run check` je zabeležen sproti.

## Obseg sprememb

- `src/favorites.ts` (nov): `FAVORITES_KEY = "folio:favorites:v1"`,
  `parseFavorites` (validacija: `version === 1`, `ids` je polje nizov;
  neveljavno → prazna množica), `serializeFavorites` (`[...ids].sort()`,
  privzeti UTF-16 vrstni red), `loadFavorites`/`saveFavorites` z lovljenjem
  izjem (vračata `storageError`/`false`).
- `src/components.tsx`: `FavoriteButton` (`aria-label="Priljubljeno opravilo
  <id>"`, `aria-pressed`), `StorageWarning` (`role=alert`, beseda
  »shramba«).
- `src/App.tsx`: globalna množica v `App` (preživi menjavo projekta in
  pogleda), filter `onlyFavorites` v `ProjectView` (ob menjavi projekta se
  komponenta ponovno vzpostavi s privzeto `false`), `storage` poslušalec brez
  povratnega zapisa, orodna vrstica s števcem `Priljubljeno: X od M.`,
  gumb za odstranitev po projektu (onemogočen, ko `fav ∩ P = ∅`), prazno
  stanje `Ni priljubljenih opravil.` z gumbom za izklop filtra, stolpec z
  gumbom v vsaki vrstici preglednice.
- `src/TaskBoard.tsx`: gumb priljubljenega zunaj povezave kartice, števci
  stolpcev štejejo prejeta (vidna) opravila.
- `src/styles.css`: slog orodne vrstice, gumbov (zvezdica), opozorila in
  postavitve na ozkem zaslonu.
- `tests/agent/p07-favorites.spec.ts`: 13 lastnih E2E testov (R01–R12).

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | gumb + `aria-pressed`, neodvisnost po ID-ju, brez dialoga | agent `R01/R07`; razvojna D01 (desktop+mobile) | `src/components.tsx` (`FavoriteButton`), `src/App.tsx` (stolpec), `src/TaskBoard.tsx` (kartica) | USPEŠNO: `59 passed (24.5s)`, med njimi D01 in `R01/R07` |
| R02 | `{version:1, ids: sort(unique strings)}`, brez polj opravil | agent `R02`; razvojna D03 | `src/favorites.ts` (`serializeFavorites`) | USPEŠNO: shramba `{"version":1,"ids":["web-01","web-03"]}`, ključa le `ids`/`version` |
| R03 | obnova; podvojeni = en, neznani ostanejo, brez izmišljenih opravil | agent `R03` | `src/favorites.ts` (`parseFavorites`), `src/App.tsx` | USPEŠNO: 8 vrstic, števec `1 od 8`, zapis ohrani `launch-01`, `unknown-99` |
| R04 | neveljavni zapisi → ∅, brez prepisa ob nalaganju | agent `R04` (6 različic) | `src/favorites.ts` (`loadFavorites`) | USPEŠNO: vsak neveljaven zapis pusti shrambo nespremenjeno, števec `0 od 8` |
| R05 | filter `visible`, privzeto false, izvorni vrstni red | agent `R05/R06`; razvojna D02 | `src/App.tsx` (`visibleTasks`) | USPEŠNO: `expectIds ['web-02','web-05']`, privzeto neoznačeno |
| R06 | takojšen izbris, `Ni priljubljenih opravil.`, izklop | agent `R05/R06` in `R06` (tabla); razvojna D02 | `src/App.tsx` (`EmptyFavorites`) | USPEŠNO: po izbrisu `[]`, besedilo vidno, checkbox ostane uporaben in izklop povrne vseh 8 |
| R07 | isto stanje v obeh pogledih, podrobnosti po ID-ju | agent `R01/R07`; razvojna D04 | `src/App.tsx`, `src/TaskBoard.tsx` | USPEŠNO: preklop pogleda ohrani `aria-pressed`; podrobnosti `web-02` se odprejo |
| R08 | globalna množica, filter ob menjavi projekta false | agent `R08` | `src/App.tsx` (`key={project.id}`) | USPEŠNO: `web-02` ostane priljubljen, v `launch` filter neoznačen (`0 od 2`), po osvežitvi enako |
| R09 | `fav \ P`, ohranjeni drugi/neznani ID-ji, `disabled` | agent `R09` | `src/App.tsx` (`removeProjectFavorites`) | USPEŠNO: shramba `["launch-01","tuj-99"]`, gumb onemogočen brez priljubljenih projekta |
| R10 | `Priljubljeno: X od M.` za cel projekt tudi ob filtru; števci stolpcev vidna opravila | agent `R10` | `src/App.tsx` (števec), `src/TaskBoard.tsx` (`column-count`) | USPEŠNO: ob filtru `2 od 8`, stolpci `['1','0','1']`; povzetek stanj ostaja `[4,2,2]` (vsa opravila) |
| R11 | `storage` sinhronizacija, `null`, drug ključ, brez povratnega zapisa, izjeme + opozorilo | agent `R11` (dogodki), `R11` (zapis), `R11` (branje) | `src/App.tsx` (poslušalec), `src/favorites.ts`, `src/components.tsx` (`StorageWarning`) | USPEŠNO: `setItem` klicev 0 ob dogodku; ob izjemi gumb deluje v pomnilniku, `role=alert` vsebuje »shramba« |
| R12 | brez API zapisov, nespremenjena polja, ohranjen videz in ozek prikaz | agent `R12`; D04 `readonly()`; osnovni testi (38) | `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css` | USPEŠNO: `saveRequests = 0`, brez zahtev PATCH/POST, pri 390 px `scrollWidth ≤ innerWidth` v obeh pogledih; Folio videz in `aria-label="Pregled stanj opravil"` ohranjena |
| — | skupni in razvojni testi | `npm run check` | — | USPEŠNO: lint + build + `59 passed (24.5s)`: 38 osnovnih (api/desktop/mobile), 8 razvojnih P07 (D01–D04 × 2), 13 lastnih |

Zagoni (dokazi): `npx playwright test --project=development-desktop
--project=development-mobile` → `8 passed (4.2s)`; `npx playwright test
--project=agent` → `13 passed (7.6s)`; `npm run check` → `59 passed (24.5s)`
(vključuje `tsc --noEmit`, `vite build` in `eslint .` brez napak).

## Odprta vprašanja in omejitve

- Razlika v predani specifikaciji: predikat `parse(raw)` v razdelku
  »Zahteve in pravila« vrne `null` pri neveljavnem zapisu, tabela R04/R11 pa
  zahteva prazno množico. Izvedba sledi zahtevam R04/R11 (neveljavno → ∅),
  zato odstopanja od naloge ni; specifikacije nisem spreminjal.
- Povzetek `Pregled stanj opravil` tudi ob aktivnem filtru šteje vsa opravila
  projekta; to je skladno z odprtim vprašanjem v specifikaciji (zahteve
  urejajo le števec priljubljenih in števce stolpcev table). Preverjeno v
  `R10` (`summary [4,2,2]` ob filtru).
- Preverjanje je omejeno na razvojne podatke `tests/development/helpers.ts`
  in lastne primere; končnih (skritih) testov ne morem zagnati in jih ne
  navajam kot izvedene. Pokrite so tudi robne oblike zapisa (podvojeni,
  neznani, neveljavni, `null`) in dogodki `storage`.
- Okolje: javni internet je blokiran, brskalnik je dosegljiv samo prek
  `chromium.connect(wsEndpoint)` (`task/browser.json`); `chromium.launch()`
  ne deluje. Ročni vizualni pregled ni bil izveden; videz je preverjen s
  testi postavitve in osnovnimi testi (širina, fokus, dostopna imena).
