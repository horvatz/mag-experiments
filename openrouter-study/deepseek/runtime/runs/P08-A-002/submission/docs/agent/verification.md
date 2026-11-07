# Poročilo o preverjanju P08

Datum: 2026-10-13. Vsi ukazi so bili izvedeni v korenu projekta, brez sprememb
skupnih testov, strežnika ali odvisnosti.

## Izvedeni ukazi in rezultati

| Ukaz | Obseg | Rezultat |
| --- | --- | --- |
| `npm run typecheck` | `tsc --noEmit` | uspešno, brez napak |
| `npm run lint` | `eslint .` | uspešno, brez opozoril |
| `npm run build` | typecheck + `vite build` | uspešno (del `npm run check`) |
| `npx playwright test --project=development-desktop --project=development-mobile --project=agent` | razvojni P08 + lastni testi | 15 uspešnih; 2 lastna testa sprva padla zaradi napake v pričakovanjih testa, popravljena |
| `npm run check` | lint + build + vsi testi | **56 uspešnih, 0 neuspešnih (19,2 s)**: 14 api, 12 desktop, 12 mobile, 4 development-desktop, 4 development-mobile, 10 agent |

Zadnji skupni zagon (`npm run check`) je merodajen; vključuje vseh 8 razvojnih
preverjanj P08 (D01–D04 na dveh širinah) in 10 lastnih preverjanj A00–A09.

## Povezava zahtev z dokazi

| Zahteva | Preverjanje | Dokaz (test) |
| --- | --- | --- |
| R01 | začetni `2026-09-21`, pogled `all`, izvorni vrstni red | A00, A01 |
| R02 | done z zapadlim in prihodnjim rokom ostane v `done` | A00, A02 |
| R03 | `2026-09-20` → overdue, `2026-09-21` → today | A00, A02, D01, D03 |
| R04 | meja `ref+7` vključno, `ref+8` → later; disjunktna unija | A00, A02, A09, D02 |
| R05 | prestopni februar 2028, prehod leta 2026/2027 | A00, A03 |
| R06 | pet števcev z `aria-label="Število rokov <ključ>"`, nespremenjeni ob filtru | A01, A02, A04 |
| R07 | izbor overdue/week/done, izvorni vrstni red, brez sprememb podatkov | A02, A05, D01–D04 |
| R08 | prazno polje → `role=alert` in zadnji veljavni izračun; nov datum odstrani opozorilo | A04, D03 |
| R09 | ista filtrirana ID-ja v preglednici in tabli, ohranjeno stanje | A05, D04 |
| R10 | menjava projekta in osvežitev ponastavita; brez URL-ja in `localStorage`/`sessionStorage` | A06 |
| R11 | prazen projekt → pet ničel; prazna skupina → `Ni opravil v izbrani skupini.` s preklopom | A07, A08 |
| R12 | `readonly` (brez zahtev PATCH in `saveRequests=0`), 390 px brez prelivanja strani | A02, A05, D04 |

## Opombe k dokazom

- A00 je čista logična preveritev (brez brskalnika) za `parseCalendarDate`,
  `classifyTask`, `countGroups` in `filterTasks`.
- A02 in D04 prek `readonly` preverita, da pregled ne pošilja nobenih zahtev
  PATCH/POST na `/api/` in da je `saveRequests` v testnem stanju 0.
- A05 preveri `document.documentElement.scrollWidth <= innerWidth` pri 390 px.
- A06 preveri, da sta `localStorage.length + sessionStorage.length` 0 in da
  URL ne vsebuje referenčnega datuma ali skupine.

## Omejitve in nepreverjeni deli

- Končni (skriti) ocenjevalni testi niso dostopni; preverjanje temelji na
  razvojnih testih P08 in lastnih testih A00–A09.
- Neodvisnost od časovnega pasu in poletnega časa je zagotovljena z uporabo
  ordinalov `Date.UTC` in preverjena logično (A00), ne pa z zagonom brskalnika
  v drugem časovnem pasu.
- Ročni vizualni pregled z `WEB_PORT=5193 API_PORT=3123 npm run dev` ni bil
  izveden; videz je preverjen posredno prek testov na 1440 px in 390 px.
- Podatki z neveljavnim `dueDate` (izven dogovorjene domene) se obravnavajo kot
  `later`; to ni posebej testirano, ker R12 predpostavlja veljavne datume.
- Med nalaganjem opravil števci še ne prikazujejo vrednosti (prikažejo 0);
  končno stanje po nalaganju je preverjeno v vseh scenarijih.
