# Poročilo implementacije in preverjanja — P07

Vloga: implementer. Predana specifikacija: `docs/agent/specification.md`.
Zahteve: `task/instructions.md` R01–R12. Datum: 2026-10-30.

## Načrt preverjanja (začetni zapis; izvedba v nadaljevanju)

Razvojni testi (samo izvajanje, nespremenljivi): `tests/development/P07.spec.ts`
D01–D04 prek `npx playwright test --project=development-desktop --project=development-mobile`.

Lastni testi v `tests/agent/` (projekt `agent`), načrtovani scenariji:

- L01: enaki naslovi — klik na eno opravilo ne spremeni drugega; gumb zunaj povezave; podrobnosti se ne odprejo (R01).
- L02: zapis shrambe po kliku — `{version:1,ids:[...]}`, enkratni nizi, razvrščeni po UTF-16, brez polj opravil; neznani ID ostane (R02, R03).
- L03: obnova po osvežitvi; podvojeni ID kot eden; neznani ID se ohrani in ne ustvari opravila (R03).
- L04: pet neveljavnih oblik zapisa (manjkajoč ključ, neveljaven JSON, napačna version, manjkajoč ids, neniz v ids) → prazna množica, shramba ob nalaganju nespremenjena (R04).
- L05: filter vrne natanko priljubljena v izvornem vrstnem redu; privzeto izklopljen (R05).
- L06: odstranitev med filtrom takoj odstrani iz prikaza; sporočilo `Ni priljubljenih opravil.`; checkbox omogočen (R06).
- L07: preklop pogleda ohrani F in filter; podrobnosti dosegljive (R07).
- L08: menjava projekta ohrani F in ponastavi filter; osvežitev ohrani F, filter false (R08).
- L09: `Odstrani priljubljene tega projekta` odstrani le ID-je projekta; neznani in tuji ostanejo; disabled brez priljubljenih (R09).
- L10: števec `Priljubljeno: X od M.` ves čas za cel projekt; števci stolpcev table za vidna opravila (R10).
- L11: `storage` dogodek: veljavna vrednost, null, drug ključ; brez povratnega zapisa; opozorilo ob izjemi shrambe (R11).
- L12: brez zapisovalnih klicev API in nespremenjena polja opravil (R12).

Preverjanja: `npx playwright test --project=development-desktop --project=development-mobile`,
lastni testi `npx playwright test --project=agent`, nato `npm run check`
(lint, tipi, gradnja, vsi testi: 38 osnovnih, 8 razvojnih, lastni).

## Izvedeni rezultati

### Izvedeni ukazi in izidi (dejanski)

- `npx playwright test --project=development-desktop --project=development-mobile`
  → 8 passed (D01–D04 na obeh projektih).
- `npx playwright test --project=agent` → 14 passed (L01–L12, vključno z L11b in L11c).
- `npm run check` (lint + tsc/build + vsi projekti) → 60 passed (38 osnovnih
  api/desktop/mobile, 8 razvojnih, 14 lastnih). Lint in gradnja brez napak.

### Sledljivost zahtev

| Zahteva | Pogoj (povzetek) | Dejanski test | Koda | Izid |
| --- | --- | --- | --- | --- |
| R01 | gumb `Priljubljeno opravilo <id>` z aria-pressed, zunaj povezave, ne odpre podrobnosti, enaki naslovi neodvisni | D01, L01 | `src/components.tsx` (FavoriteButton), `src/App.tsx`, `src/TaskBoard.tsx` | uspešno |
| R02 | `{version:1,ids:[...]}`, enkratni nizi, `sort()`, brez polj opravil | D03, L02 | `src/favorites.ts` (serializeFavorites) | uspešno |
| R03 | obnova ob nalaganju, podvojeni kot eden, neznani ohranjeni brez izmišljenih opravil | L03, L09 | `src/favorites.ts` (parseFavoritesValue) | uspešno |
| R04 | pet neveljavnih oblik → prazna množica, brez prepisa ob nalaganju | L04 | `src/favorites.ts` (parseFavoritesValue, readStoredFavorites) | uspešno |
| R05 | filter natanko priljubljenih v izvornem vrstnem redu, privzeto false | D02, L05 | `src/App.tsx` | uspešno |
| R06 | odstranitev med filtrom takoj, `Ni priljubljenih opravil.`, checkbox omogočen | D02, L06 | `src/App.tsx` | uspešno |
| R07 | ista F/f v obeh pogledih, podrobnosti po ID-ju, `data-task-id` ohranjen | D04, L07 | `src/App.tsx`, `src/TaskBoard.tsx` | uspešno |
| R08 | menjava projekta ohrani F in ponastavi filter; osvežitev enako | L08 | `src/favorites.ts` (hook v `App`), `key` na `ProjectView` | uspešno |
| R09 | odstranitev le ID-jev trenutnega projekta, tuji/neznani ostanejo, disabled | L09 | `src/App.tsx` | uspešno |
| R10 | `Priljubljeno: X od M.` za cel projekt tudi ob filtru; stolpci table štejejo vidna | L10 | `src/App.tsx`, `src/TaskBoard.tsx` | uspešno |
| R11 | storage dogodek (veljaven/null/drug ključ), brez povratnega zapisa, opozorilo ob izjemi, uporabnost v pomnilniku | L11, L11b, L11c | `src/favorites.ts`, `src/components.tsx` (StorageWarning) | uspešno |
| R12 | brez zapisovalnih klicev API, nespremenjena polja, ohranjen videz in 390 px | D04, L12, osnovni desktop/mobile | `src/` celota, `src/styles.css` | uspešno |

Opombe k dokazom: izidi so iz dnevnikov zgoraj navedenih zagonov; `npm run check`
je bil izveden po zadnji spremembi kode in testov. Osnovni testi (desktop in
mobile) pokrivajo R12 za videz, navigacijo, nalaganje in ozki prikaz.

### Spremembe kode

- `src/favorites.ts` (nov): branje/validacija shrambe, zapis `{version:1,ids}` z
  `sort()`, hook `useFavorites` z dogodkom `storage`, opozorilom ob izjemi in
  pomnilniško množico; ob nalaganju se shramba ne prepiše.
- `src/components.tsx`: `FavoriteButton` (aria-pressed, aria-label
  `Priljubljeno opravilo <id>`) in `StorageWarning` (`role=alert`, beseda
  "shramba").
- `src/App.tsx`: kontrole `Prikaži le priljubljena`, `Odstrani priljubljene tega
  projekta`, števec `role=status` z `aria-label="Število priljubljenih"`,
  filtriranje vidnih opravil, gumbi v vrsticah zunaj povezave, opozorilo shrambe;
  stanje F živi v `App` (globalno), filter v `ProjectView` (ponastavi se ob
  menjavi projekta).
- `src/TaskBoard.tsx`: gumb priljubljenega na karticah (zunaj povezave), stolpci
  prejmejo filtrirana opravila (števci vidnih).
- `src/styles.css`: videz novih kontrol, opozorila in odzivnost na 390 px.
- `tests/agent/favorites.spec.ts` (nov): 14 lastnih testov L01–L12 z lastnimi
  nadzorovanimi GET odgovori; `tests/development/` in skupna infrastruktura se
  ne spreminjata.

## Omejitve in odstopanja

- Javni internet je blokiran; testi tečejo le proti lokalnemu strežniku 5174/3102.
- `chromium.launch()` ni na voljo; lastni skripti bi uporabili `wsEndpoint` iz `task/browser.json`
  (lastni Playwright testi tega ne potrebujejo; `playwright.config.ts` se že povezuje prek `wsEndpoint`).
- Končni (skriti) testi naloge niso dostopni; navedeni so le izvedeni testi.
- Ročni vizualni pregled strani ni bil izveden; preliv na 390 px je preverjen
  avtomatsko (L12 in osnovni mobilni testi), ne s sliko zaslona.
- V specifikaciji ni bilo najdene napake; implementirane so bile vse zahteve
  R01–R12 po dogovoru o vmesniku. Povzetek `Pregled stanj opravil` je ostal
  vezan na vsa opravila projekta (predpostavka specifikacije).
- Ukazi `git` v tem peskovniku niso izvedljivi (beri `~/.gitconfig` in sistemski
  predpomnilnik sta zavrnjena), zato stanja veje ni bilo mogoče preveriti; datoteke
  so spremenjene le v `src/`, `tests/agent/` in `docs/agent/verification.md`.
