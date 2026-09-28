# P07 Implementation Tasks

## Setup

- [ ] [T001] V `tests/agent/P07.favorites.spec.ts` pripravi Playwright scenarije in nadzorovane GET odgovore samo za `/api/`; obstoječih razvojnih in skupnih testov ne spreminjaj.

## Foundational

- [ ] [T002] V `src/favorites.ts` dodaj ključ `folio:favorites:v1` ter funkciji za varno razčlenjevanje in zapis različice 1: obravnavaj neveljavne vnose, dvojnike in neznane ID-je ter pri zapisu shrani samo unikatne, po UTF-16 urejene nize.
- [ ] [T003] V `src/App.tsx` vzpostavi globalno množico ID-jev, varno začetno branje, zapis po uporabniški spremembi, poslušalca za pravi `storage` ključ brez povratnega zapisa ter pomnilniško delovanje z opozorilom ob izjemi.

## User stories (po prioriteti)

- [ ] [T004] V `src/App.tsx` in `src/TaskBoard.tsx` dodaj gumbe `Priljubljeno opravilo <id>` z `aria-pressed` zunaj povezav; klik ne odpre podrobnosti. Poveži jih z isto množico za preglednico in tablo ter ohrani podrobnosti po ID-ju.
- [ ] [T005] V `src/App.tsx` dodaj checkbox `Prikaži le priljubljena` (privzeto false), projektno brisanje in prazno stanje `Ni priljubljenih opravil.`; ohrani izvorni vrstni red in ob menjavi projekta ter osvežitvi ponastavi filter. Status `role="status"`/`aria-label="Število priljubljenih"` naj kaže `Priljubljeno: X od M.` za celoten projekt, števci stolpcev table pa vidna opravila; brez projektnih priljubljenih naj bo gumb onemogočen.
- [ ] [T006] V `tests/agent/P07.favorites.spec.ts` pokrij R01–R12: preklop po ID-ju in enake naslove, obliko/obnovo/neveljavne zapise shrambe, filter in prazno stanje, oba pogleda in podrobnosti, menjavo projekta, projektno brisanje, števce, `storage` dogodke in izjeme, odsotnost API zapisov, nespremenjena polja, zahtevane a11y atribute ter stran brez širjenja pri 390 px. Uporabi D01–D04 kot dodatno regresijsko referenco, ne kot nadomestilo za manjkajoče scenarije.

## Polish

- [ ] [T007] V `src/styles.css` oblikuj nove kontrole in sporočila z obstoječimi Folio slogi; preveri vidni fokus in širino 390 px brez širjenja strani, pri čemer je notranje drsenje prikazov dovoljeno.
- [ ] [T008] Zaženi `npm run check` in ciljne P07 teste; nato v `docs/agent/P07/spec.md` dopolni sledljivost R01–R12 z dejanskimi datotekami, imeni zagnanih testov, rezultati ter nepreverjenimi omejitvami.
