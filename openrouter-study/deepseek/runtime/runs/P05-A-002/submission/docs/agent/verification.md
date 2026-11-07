# P05 – Zapis preverjanja

Datum: 2026-10-11. Postopek A (en agent). Vsa preverjanja so bila dejansko
izvedena v tem okolju (Chromium prek `task/browser.json`, lokalni strežnik
testov na 5174/3102). Noben test ni bil označen kot uspešen brez zagona.

## Izvedeni ukazi in rezultati

1. `npx tsc --noEmit` – uspešno (brez napak).
2. `npm run lint` – uspešno (ESLint brez opozoril/napak).
3. `npx playwright test --project=development-desktop --project=development-mobile --project=agent`
   – uspešno: 20 preverjanj (8 razvojnih + 12 lastnih).
4. `npm run check` (lint + typecheck/build + vsi testi) – uspešno:
   **58 passed (22.9 s)**, brez neuspehov. Sestava: 38 preverjanj izhodišča
   (baseline desktop/mobile + API), 8 razvojnih P05 (D01–D04 ×
   desktop/mobile) in 12 lastnih (A01–A12).

Dokaz: dnevnik zadnjega zagona je v izhodu ukaza `npm run check`; poročilo je
tudi v `playwright-report/html`, sledi neuspehov pa v `test-results/run/`
(ob uspešnem zagonu prazno).

## Povezava zahtev z dejanskimi preverjanji

| Zahteva | Testi | Rezultat |
| --- | --- | --- |
| R01 | D01, A01 (privzeto `all/all`, izvorni vrstni red, status `1–11 od 11`) | uspešno |
| R02 | D01, D02, A02 (velikosti 2/5/10, konkatenacija strani = celotno polje, brez dvojnikov, krajša zadnja stran), A07 | uspešno |
| R03 | D02, A03 (Prva/Prejšnja onemogočeni na prvi strani, Naslednja/Zadnja na zadnji), A10 | uspešno |
| R04 | D04, A04 (sprememba velikosti vrne na prvo stran tudi, ko bi bila prejšnja številka veljavna; `all` = ena stran) | uspešno |
| R05 | D03, A05 (filter pred straničenjem, ponastavitev na prvo stran, ohranjen vrstni red) | uspešno |
| R06 | D03, A06 (isti ID-ji v preglednici in na tabli, združevanje šele odseka strani) | uspešno |
| R07 | A07 (preklop pogleda in odpiranje/zapiranje podrobnosti ohranijo stran, velikost, filter) | uspešno |
| R08 | A08 (menjava projekta in osvežitev ponastavita na `all/all/1`; brez zapisov v `localStorage`/`sessionStorage`, hash brez parametrov stanja) | uspešno |
| R09 | D02, A02, A09 (`Stran X od Y. Prikazano A–B od N.` s pomišljajem U+2013, vključno z eno stranjo in `all`) | uspešno |
| R10 | A10 (prazen projekt in prazen rezultat filtra: `Stran 0 od 0. Prikazano 0–0 od 0.`, vsi štirje gumbi onemogočeni; odstranitev filtra vrne prvo stran) | uspešno |
| R11 | A06, A11 (pregled stanj šteje celoten nefiltrirani projekt, števci stolpcev le trenutno stran, skupno število se ne spremeni) | uspešno |
| R12 | D04, A12 (brez zahtev PATCH/POST in brez `saveRequests`, `data-task-id` in `href` povezave ohranjeni, podrobnosti delujejo, pri 390 px ni vodoravnega prelivanja strani) | uspešno |

Dodatno so vsi obstoječi testi izhodišča (preglednica, tabla, podrobnosti,
napake nalaganja, prazna projekta, mobilna postavitev) ponovno preverjeni z
`npm run check` in ostajajo uspešni; straničenje ni spremenilo njihovega
delovanja.

## Popravki med preverjanjem

- Med prvim zagonom lastnih testov sta A09 in A10 padla zaradi ponovnega
  `mount` na isti URL (brskalnik ni znova naložil strani, zato so ostali
  podatki prejšnjega primera). Popravek je v testih: po drugem `mount` je
  dodana osvežitev (`page.reload()`). Aplikacijska koda ni bila spremenjena.
- Zahteve R01–R12 in njihovi pogoji se med preverjanjem niso spremenili;
  specifikacija je dopolnjena le v tabeli sledljivosti in zgodovini sprememb.

## Omejitve

- Skritih končnih testov izvajalca ni mogoče zagnati; pokriti so enakovredni
  scenariji iz opisane domene (0, 1, 8 in 11 opravil, enaki naslovi, poljubni
  ID-ji, Unicode, prazna projekta, meje strani).
- Ročni vizualni ogled v brskalniku ni bil izveden; preverjanje videza je
  posredno prek obstoječih regresijskih testov postavitve (desktop in iPhone 13
  v izhodišču) ter lastnega preverjanja širine 390 px.
- Preverjanje vključuje le lokalne storitve naloge; javni internet ni bil
  uporabljen in ni bil potreben.
