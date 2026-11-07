# Poročilo implementacije in preverjanja (P05, postopek B)

Vloga: implementer. Podlaga: `docs/agent/specification.md` (avtorica specifikacije)
in izvirne zahteve R01–R12 iz `task/instructions.md`. Specifikacije, njene
zgodovine in `review.md`/`review.json` ne spreminjam.

## Načrtovan obseg

- Stanje straničenja v `ProjectView` (`src/App.tsx`): `size ∈ {all,2,5,10}`,
  `filter ∈ {all,todo,in_progress,done}`, `page` (1-indeksiran, lokalno).
- Izračun `F` (filtrirano), `P` (število strani), `V` (vidni odsek) po pravilih
  iz specifikacije; `TaskBoard` prejme samo `V`; `TaskDetails` in pogledi
  ohranijo stanje.
- Kontrole: `<select>` `Velikost strani` in `Filter strani`, gumbi
  `Prva stran`, `Prejšnja stran`, `Naslednja stran`, `Zadnja stran`,
  `role=status` z `aria-label="Stanje straničenja"` in natančnim besedilom.
- Lastni testi v `tests/agent/` (Playwright, projekt `agent`).

## Načrtovana preverjanja (pred izvedbo)

| Zahteva | Preverjanje | Status |
| --- | --- | --- |
| R01 | privzeti `all`/`all`, vsi ID-ji v izvornem vrstnem redu | ni še izvedeno |
| R02 | odseki za 2/5/10, brez izgube/podvajanja | ni še izvedeno |
| R03 | navigacija in onemogočeni gumbi na robovih | ni še izvedeno |
| R04 | sprememba velikosti vrne na stran 1; `all` = ena stran | ni še izvedeno |
| R05 | filter pred straničenjem, sprememba vrne na stran 1 | ni še izvedeno |
| R06 | ista stran v preglednici in na tabli | ni še izvedeno |
| R07 | preklop pogleda in podrobnosti ohranijo stanje | ni še izvedeno |
| R08 | menjava projekta/osvežitev ponastavita stanje; brez URL/šrambe | ni še izvedeno |
| R09 | natančno besedilo statusa (srednja/zadnja stran) | ni še izvedeno |
| R10 | prazno stanje: `Stran 0 od 0. Prikazano 0–0 od 0.`, vsi gumbi disabled | ni še izvedeno |
| R11 | pregled šteje celoten projekt, stolpci le `V` | ni še izvedeno |
| R12 | brez zapisov, povezave/`data-task-id`/390 px brez prelivanja | ni še izvedeno |

Poleg lastnih testov: `npx playwright test --project=development-desktop
--project=development-mobile` (D01–D04) in `npm run check` (slog, tipi,
gradnja, vsi testi: 38 osnovnih + 8 razvojnih + lastni).

## Izvedba in rezultati

### Spremembe kode

- `src/App.tsx`: v `ProjectView` dodano lokalno stanje `size`, `filter`, `page`
  (`useState`), izračun `filtered`/`total`/`pageCount`/`currentPage`/`visible`
  ter besedilo statusa; kontrole v `.pagination-bar` (izbiri, štirje gumbi,
  `role=status` z `aria-label="Stanje straničenja"`); `TaskBoard` in telo
  preglednice prejmeta `visible`; značka ob naslovu prikazuje `total`
  (filtrirani `n`), noga ostane na celotnem projektu; prazno stanje loči
  prazen projekt od praznega rezultata filtra.
- `src/styles.css`: slog `.pagination-bar`, `.pagination-field`,
  `.pagination-nav`, `.pagination-status`; v mobilnem medijskem bloku gumbi
  zavijejo v polno širino (brez vodoravnega prelivanja strani).
- `tests/agent/pagination.spec.ts`: 14 lastnih testov R01–R12 (spodaj).

### Zagnani ukazi in izidi

| Ukaz | Izid |
| --- | --- |
| `npm run lint` | uspešno (brez opozoril ESLint) |
| `npx tsc --noEmit` | uspešno |
| `npx playwright test --project=agent` | 14 uspešnih, 0 neuspešnih (6,2 s) |
| `npx playwright test --project=development-desktop --project=development-mobile` | 8 uspešnih, 0 neuspešnih (3,6 s) |
| `npm run check` (slog + tipi + gradnja + vsi testi) | 60 uspešnih, 0 neuspešnih (21,7 s): 38 osnovnih/API + 8 razvojnih + 14 lastnih |

### Sledljivost zahtev (dejansko izvedeni testi)

| Zahteva | Test (ime v dnevniku) | Rezultat |
| --- | --- | --- |
| R01 | lastni `R01: privzeto all/all, vsa opravila v izvornem vrstnem redu` | uspešno |
| R02 | lastni `R02: odseki 2/5/10 brez izgube ali podvajanja`; `R02/R04: velikost 10 na enajstih opravilih, krajša zadnja stran` | uspešno |
| R03 | lastni `R03: navigacija in onemogočeni gumbi na robovih` | uspešno |
| R04 | razvojna `D01`, `D04` (desktop+mobile) + lastni `R04: sprememba velikosti vedno vrne na prvo stran` | uspešno |
| R05 | razvojna `D03` (desktop+mobile) + lastni `R05: filter pred straničenjem in ponastavitev strani` | uspešno |
| R06 | razvojna `D03` + lastni `R06: preglednica in tabla kažeta isti odsek` | uspešno |
| R07 | lastni `R07: preklop pogleda in podrobnosti ohranijo stanje` | uspešno |
| R08 | lastni `R08: menjava projekta in osvežitev ponastavita stanje` (tudi pregled URL-ja) | uspešno |
| R09 | razvojna `D02` + lastni `R09: natančno besedilo statusa na srednji in zadnji strani` | uspešno |
| R10 | lastni `R10: prazen projekt`; `R10: prazen rezultat filtra in vrnitev na all` | uspešno |
| R11 | lastni `R11: pregled celotnega projekta, stolpci le trenutna stran` | uspešno |
| R12 | razvojna `D04` (`readonly`) + lastni `R12: brez zapisov, povezave in 390 px brez prelivanja` | uspešno |

Testi uporabljajo nadzorovane GET odgovore iz `tests/development/helpers.ts`
(`mount`), kar je dovoljen testni mehanizem; aplikacija sama bere samo `/api/`
in se `/__test/` ne dotika. `readonly` je potrdil 0 zahtev za zapis in 0
`saveRequests`; test R12 je potrdil `scrollWidth <= innerWidth` pri 390 px.

## Omejitve in odprta vprašanja

- Omejitve okolja: javni internet blokiran; brskalnik le prek
  `chromium.connect(wsEndpoint)` iz `task/browser.json`; testni strežnik
  5174/3102.
- `git` v peskovniku ni uporabljen (nedostopna `~/.gitconfig` in sistemska
  predpomnilniška mapa), zato stanje sprememb ni bilo preverjeno z `git`;
  spremenjene datoteke so `src/App.tsx`, `src/styles.css`,
  `tests/agent/pagination.spec.ts`, `docs/agent/verification.md`.
- Značka ob naslovu `Opravila`: uporabljen `n` (filtrirani seznam) v skladu s
  predpostavko specifikacije; noga ohrani pomen celotnega projekta.
- Niso bili izvedeni: ročni ogled prek `WEB_PORT=5193 API_PORT=3123 npm run dev`
  (namesto tega avtomatizirani testi na 390 px in 1440 px) ter skriti končni
  testi, ki niso dostopni; teh ne navajam kot uspešnih.
- Napak v predani specifikaciji med implementacijo nisem odkril; predpostavka
  o znački (`n`) in noga (`X / N končanih` celotnega projekta) je izrecno
  zapisana zgoraj.
