# P10 — Zapis dejansko izvedenih preverjanj

Datum: 2026-11-02. Postopek A (en agent). Okolje: lokalni Chromium prek
`task/browser.json` (`chromium.connect(wsEndpoint)`), strežnik testov na
vratih 5174/3102, brez javnega interneta.

## Izvedeni ukazi in rezultati

| Ukaz | Obseg | Rezultat |
| --- | --- | --- |
| `npm run typecheck` | TypeScript | uspešno |
| `npm run lint` | ESLint po celem repozitoriju | uspešno |
| `npm run build` | typecheck + Vite build | uspešno (`dist/assets/index-Bqha1WRx.js`) |
| `npx playwright test --project=development-desktop --project=development-mobile --project=agent` | 8 razvojnih + 12 lastnih preverjanj | 20/20 uspešno |
| `npm run check` (končni) | lint + build + vsi testi: 14 API, 24 izhodiščnih (desktop/mobile), 8 razvojnih, 12 lastnih | **58/58 uspešno, 23,4 s** |

Zadnji celotni zagon je izpisan z `58 passed`; vsak test izhodišča in
razvojni D01–D04 je označen z `✓`.

## Sledljivost zahtev R01–R12

| Zahteva | Dejansko preverjanje | Dokaz |
| --- | --- | --- |
| R01 | `R01: zacetni vrstni red in globalna mesta od 1 do N` (lastni); D01 | začetni `data-task-id` niz je enak prejetemu polju; vsako `Mesto opravila <id>` ima vrednost 1..N; enaka naslova ostaneta ločeni opravili |
| R02 | `R02: premik dol zamenja soseda in ne spremeni polj`; D01 | po premiku je vrstni red zamenjanih globalnih sosedov, naslov/stanje/ID ostanejo, `Pregled stanj opravil` ostane `4/2/2` |
| R03 | `R03: robna gumba sta onemogocena in ne dodata zgodovine`; D01 | prvi "gor" in zadnji "dol" sta `disabled`; vsiljeni klik ne spremeni vrstnega reda niti števca (0/0) |
| R04 | `R04/R05: vec razveljavitev in ponovitev ohrani zaporedje`; D02 | po dveh premikih je `Razveljavitve: 2. Ponovitve: 0.`, po undo `1/1`, po drugem undo `0/2`; obnovljene permutacije so točne |
| R05 | isti test; D02 | dve ponovitvi vrneta obe razveljavljeni permutaciji v pravem zaporedju; končni ID-ji so natanko množica brez podvajanja (`ids().sort()`) |
| R06 | `R06: nov premik zavrze ponovitve, neveljaven rob jih ohrani`; D03 | po undo je `Ponovitve: 1`; neveljaven robni klik pusti 0/1; nov veljaven premik da 1/0 in "Ponovi premik" je onemogočen |
| R07 | `R07: hrani se najvec 20 prejsnjih permutacij` | po 21 veljavnih premikih je `Razveljavitve: 20. Ponovitve: 0.`; 20 undo-jev da 0/20, vrstni red pa stanje po prvem premiku (`web-08` pred `web-07`) |
| R08 | `R08: zacetni vrstni red je eno razveljavitveno dejanje`; D04 | gumb je na izhodišču onemogočen; po dveh premikih in enem undo je reset eno dejanje (U 2, R 0), vrne izhodišče, počisti ponovitve in je znova onemogočen; undo reseta obnovi prejšnjo permutacijo |
| R09 | `R09: tabla ohrani relativni red, premiki uporabijo globalno mesto`; D04 | na tabli premik `web-03 gor` da globalno mesto 2 (in `web-02` mesto 3), `web-03` ostane v stolpcu "Končano"; relativni red "Pripravljeno" ostane `02,04,07,08`; po vrnitvi v preglednico je vrstni red `01,03,02,...` |
| R10 | `R10: pogled, podrobnosti, menjava projekta in osvezitev` | preklop tabela/tabla in odprtje/zaprtje podrobnosti ohranita mesto 1 in zgodovino 1/0; prehod na projekt `launch` da njegovo izhodišče in 0/0; vrnitev na `web` da izhodišče; `page.reload()` prav tako |
| R11 | `R11: prazen projekt ...`, `R11: projekt z enim opravilom ...`, D03 | element `role=status`, `aria-label="Zgodovina vrstnega reda"` ima točno `Razveljavitve: U. Ponovitve: R.`; vsi gumbi so pri 0 onemogočeni; prazen projekt in eno opravilo ostaneta uporabna |
| R12 | `R12: lokalne permutacije brez zapisov, ohranjeni podatki in ozek zaslon`; D04 | `writes` je prazen in `saveRequests` = 0; števci stanj ostanejo 4/2/2; podrobnosti `web-01` kažejo "Čas za pregled", "V delu", "Ana Novak"; pri širini 390 px velja `scrollWidth <= innerWidth` (notranje drsenje) |

## Popravki med preverjanjem

1. Prvi zagon (razvojni + lastni testi) je odkril tekmo: klik pred
   izvedbo učinka `sync` je premik zavrgel, ker stanje še ni imelo
   ID-jev. Popravljeno v `src/order.ts` in `src/App.tsx`: sinhronizacija
   se izvede pred vsakim dejanjem (`sync` + dejanje v istem handlerju),
   primerjava pa uporablja množico ID-jev (`sameSet`), ne zaporedja.
   Po popravku 19/20, nato 20/20.
2. Lastni test R09 je sprva napačno pričakoval `web-05` v stolpcu
   "Pripravljeno"; `web-05` je v podatkih `in_progress`. Pričakovanje
   popravljeno na `02,04,07,08`.
3. Specifikacija med izvajanjem ni bila spremenjena (zapis popravka ni
   potreben).

## Omejitve in nepreverjeni deli

- Končnih (skritih) testov naloge ni bilo mogoče zagnati; tukaj so
  navedena samo dejansko izvedena preverjanja.
- Ročni vizualni pregled v brskalniku ni bil opravljen; videz je
  preverjen posredno z izhodiščnimi testi (desktop in mobile) ter
  preverjanjem širine 390 px, ne z oceno posnetka.
- Scenariji med nezaključenim nalaganjem in sočasnimi spremembami
  podatkov niso del obsega in niso testirani.
- Lastni testi tečejo v projektu `agent` (Chromium, desktop); ozek
  zaslon 390 px je preverjen v R12, mobilni projekti pa pokrivajo D01–D04.
