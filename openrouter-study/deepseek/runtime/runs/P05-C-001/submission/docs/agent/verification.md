# P05: Zapis preverjanja

Izvedeno 2026-10-09 v tem okolju. Izidi so iz dejanskih zagonov; neizvedeno je označeno kot neizvedeno.

## Ukazi in izidi

| Ukaz | Izid |
| --- | --- |
| `npm run typecheck` | uspešno (brez napak) |
| `npx playwright test --project=agent` | 13 passed (5.5 s), tests/agent/p05-pagination.spec.ts |
| `npm run check` (lint + build + vsi testi) | uspešno; 59 passed (21.7 s): skupni baseline/api 38, razvojni P05 8, lastni agent 13 |

Prvi zagon agentnih testov je odkril dve napaki v testih (klik na onemogočen gumb, ponovni `mount` na isti hash), ki sta bili popravljeni; končni zagon je 13/13 uspešen. Koda ni bila spremenjena med popravki testov.

## Sledljivost zahtev

| Zahteva | Test ali scenarij (tests/agent/p05-pagination.spec.ts) | Izid ter dokaz |
| --- | --- | --- |
| R01 | privzeto all/all, izvorni vrstni red, skupni badge 8 | uspešno (test v vrstici 6) |
| R02 | particija pri 2/5/10 z 7 opravili: unija = polje, brez podvojenih/izgubljenih ID-jev, zadnja stran krajša | uspešno (vrstica 16) |
| R03 | robovi: Prva/Prejšnja onemogočeni na 1. strani, Naslednja/Zadnja na zadnji; neveljavno dejanje ne spremeni stanja | uspešno (vrstica 36) |
| R04 | menjava velikosti z druge strani vrne na prvo; all = ena stran | uspešno (vrstica 60) |
| R05 | filter pred straničenjem (todo/in_progress/done/all), vrstni red, vrnitev na prvo stran | uspešno (vrstica 75) |
| R06 | ista množica ID-jev trenutne strani v preglednici in tabli | uspešno (vrstica 90) |
| R07 | preklop pogleda in podrobnosti ohranijo velikost, filter in stran | uspešno (vrstica 103) |
| R08 | menjava projekta ponastavi na all/all/1; localStorage/sessionStorage prazna, hash brez stanja | uspešno (vrstica 117) |
| R09 | `Stran 1 od 1. Prikazano 1–2 od 2.` za neprazen rezultat | uspešno (vrstica 135) |
| R10 | prazen filter: `Stran 0 od 0. Prikazano 0–0 od 0.`, štirje gumbi onemogočeni, odstranitev filtra vrne prvo stran; prazen projekt enako | uspešno (vrstici 141, 157) |
| R11 | povzetek šteje celoten projekt (4/2/2), badge 8; števci stolpcev table štejejo trenutno stran | uspešno (vrstica 166) |
| R12 | brez zapisov (`readonly`: 0 zapisov, saveRequests 0), povezava web-03 pravilna, povzetek in status vidna; pri 390 pik brez razširitve strani, notranje drsenje | uspešno (vrstica 184) |

## Opravljene naloge

Vse naloge T001–T017 so opravljene; oznake so v `tasks.md`. Skupni testi in razvojni primeri P05 (D01–D04) so bili izvedeni v `npm run check` in so uspešni.

## Omejitve

- Končni (skriti) testi in njihovi podatki niso dostopni; niso bili izvedeni in niso navedeni kot uspešni.
- Ročni ogled z `WEB_PORT=5193 API_PORT=3123 npm run dev` ni bil izveden; vedenje je preverjeno z agentnimi in skupnimi testi.
- Obseg ostaja znotraj `src/`, `tests/agent/` in `docs/agent/`; infrastruktura, skupni testi, odvisnosti in nastavitve niso bili spremenjeni.
