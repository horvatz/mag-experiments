# Poročilo izvajalca — P05: straničenje in filter stanja

Vloga: implementer. Vir zahtev: `docs/agent/specification.md` (R01–R12) in
`task/instructions.md`. Načrt je bil zapisan pred izvedbo; spodaj so dejanski
izidi. Končno stanje: implementirano in preverjeno; odprtih napak ni.

## Spremembe

- `src/pagination.ts` (nov): čisti pripomočki `filterTasks`, `pageCount`,
  `clampPage`, `pageSlice`, `pageBounds`, `pageStatus` (natančno statusno
  besedilo z `–`).
- `src/App.tsx` (`ProjectView`): stanje `pageSize`/`statusFilter`/`requestedPage`
  (privzeto all/all/1), filtriraj → straniči, kontrole Velikost strani, Filter
  strani, Prva/Prejšnja/Naslednja/Zadnja stran, `role=status`
  `aria-label="Stanje straničenja"`; oba pogleda dobita isti odsek; prazno
  filtrirano stanje ohrani status in gumbe.
- `src/styles.css`: `.pagination-bar` in mobilne prilagoditve (wrap, 390 px).
- `tests/agent/pagination.spec.ts` (nov): 11 lastnih testov V3–V12.

## Izidi preverjanja

- `npm run check` (lint + typecheck + build + vsi testi): **57 passed** (21,8 s),
  izhod 0. Sestava: 38 osnovnih (baseline desktop+mobile, api), 8 razvojnih P05
  (desktop+mobile), 11 lastnih agentnih.
- Razvojni testi ločeno: 8/8. Lastni testi ločeno: 11/11.
- Prvi zagon lastnih testov je odkril dve napaki v mojih testih (pričakovan
  vrstni red DOM v tabli je po stolpcih, ne po F; korak čez zadnjo stran), ne v
  izdelku; testa popravljena in ponovno zagnana.

## Sledljivost zahtev

| Zahteva | Sprememba/pogoj | Dokaz (test, izid) |
| --- | --- | --- |
| R01 | privzeto all/all/P=1, ves T v izvornem vrstnem redu | agent V3, D01–D04 — uspešno |
| R02 | odseki za 2/5/10 zaporedni, brez izgube/podvojitve, krajša zadnja stran | agent V4 (2), V4b (10, 12 opravil), V5 (5), D01, D02, D04 — uspešno |
| R03 | meje: Prva/Prejšnja ⇔ P≤1, Naslednja/Zadnja ⇔ P≥Y; onemogočen ne spremeni stanja | agent V4, V4c (force klik na onemogočen gumb) — uspešno |
| R04 | sprememba S → P=1 tudi iz veljavne strani; all = 1 stran | agent V5, D04 — uspešno |
| R05 | filter pred straničenjem, sprememba filtra → P=1 | agent V6, D03 — uspešno |
| R06 | tabela in tabla iste ID-je odseka; tabla združi odsek po stolpcih | agent V6, V7 (columnIds), V10, D03 — uspešno |
| R07 | preklop pogleda in podrobnosti ohranijo S/φ/P | agent V7 — uspešno |
| R08 | menjava projekta/osvežitev → all/all/1; brez trajne shrambe in URL-ja | agent V8, V4b (localStorage/sessionStorage prazna, hash brez stanja) — uspešno |
| R09 | `Stran P od Y. Prikazano A–B od N.` | agent V3–V6, V4b, D02 — uspešno |
| R10 | `Stran 0 od 0. Prikazano 0–0 od 0.`, vsi štirje gumbi onemogočeni; odstranitev filtra → P=1 | agent V9, V9b — uspešno |
| R11 | pregled stanj šteje T; stolpci štejejo odsek; skupno število nespremenjeno | agent V10 (filter done → [4,2,2], kolona 2, značka 8) — uspešno |
| R12 | brez zapisov (`readonly`, saveRequests=0), povezave/podrobnosti/nalaganje/napaka, 390 px brez prelivanja, videz Folio | agent V3, V10/V11, celotni baseline desktop+mobile — uspešno |

## Omejitve in opombe

- Končni (skriti) testi naloge niso dostopni; tu navedeni izidi so le dejansko
  izvedeni testi. Javni internet je blokiran; Chromium je prednameščen in se
  povezuje prek `task/browser.json` (`connectOptions`), strežnik teče na
  5174/3102.
- Navigacija med nezaključenim nalaganjem in sočasne spremembe podatkov brez
  osvežitve ostajajo izven obsega (kot v specifikaciji); med nalaganjem se
  kontrole ne prikažejo, obstoječi prikaz nalaganja/napake je ohranjen.
- Vrstni red vozlišč v tabli je po stolpcih (kot doslej); R06 zahteva iste
  ID-je, kar testi preverijo po stolpcih in v tabeli.
- Napak v specifikaciji nisem našel; vmesniški dogovor (imena, vrednosti,
  statusno besedilo) je bil izveden dobesedno.
