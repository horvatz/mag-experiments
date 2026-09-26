# Neodvisni pregled P10

Pregledane so vse izvirne zahteve R01–R12, predana specifikacija in njena zgodovina, implementacija v `src/`, razvojni testi D01–D04, lastni testi S1–S6 ter `verification.md` in `check-final.log`. Konkretnih odstopanj, ki bi zahtevala spremembo specifikacije ali kode, nisem ugotovil. Končna strojna predaja je `review.json`.

## Sledljivost pregleda

Vsi spodnji sklepi temeljijo na mojem branju kode in zahtev. Oznake D/S pomenijo pregledano vsebino implementerjevih testov; njihovega zagona nisem ponovil.

| Zahteva | Neodvisno pregledan pogoj in dokaz |
| --- | --- |
| R01 | `useTaskOrder` inicializira ID-je v vrstnem redu GET polja in uporabi Map po ID-ju. Preglednica ter tabla izpišeta globalno mesto. S1 pokriva posebne ID-je, enake naslove in 13 opravil. |
| R02 | `orderReducer` zamenja neposredna globalna soseda v novi kopiji polja ID-jev; objektov Task ne spreminja. D01 in S1–S4 primerjajo permutacije. |
| R03 | `TaskOrderControls` onemogoči oba globalna roba; reducer pri neznanem ID-ju ali robu vrne isto stanje. S2 poskusi ponovljene robne klike; moj modelni preizkus dodatno izvrši neveljavna dejanja neposredno na reducerju. |
| R04 | Veljaven premik shrani celotno prejšnjo permutacijo; undo uporabi vrh sklada in sedanjo permutacijo prenese v redo. S2/S3 in neodvisni modelni preizkus potrjujejo prehode. |
| R05 | Redo obnovi vrh sklada ter shrani prejšnjo permutacijo za undo. Posnetki se ne mutirajo. S2/S3 pokrivata več zaporednih korakov; dodatno preverjeno z modelom. |
| R06 | Veljaven move počisti redo; neveljaven se vrne pred spremembami. S2 in modelni preizkus pokrivata obe veji. |
| R07 | `remember` omeji sklad na zadnjih 20 posnetkov. S3 preverja 21 premikov, vseh 20 undo/redo in reset pri polni zgodovini. Neodvisni model preverja tudi mešane prehode in omejitev. |
| R08 | Reset ob drugačnem redu shrani en posnetek in počisti redo; ob izvornem redu vrne isto stanje. Gumb uporablja isti pogoj. S2/S3 in modelni preizkus se ujemajo. |
| R09 | Preglednica izriše urejeni seznam. Tabla globalna mesta izračuna pred stabilnim filtriranjem po treh stalnih statusih. Premiki uporabljajo isti reducer. S4 preverja prehod med različnima statusoma in znotraj istega. |
| R10 | Hook ostane v istem TaskSection med preklopom pogleda in podrobnostmi; `ProjectView key={project.id}` ga ob menjavi projekta ponovno inicializira. Reload ponovno naloži podatke. S5 preverja oba neprazna sklada, nadaljevanje zgodovine, menjavo projektov in reload. |
| R11 | Status in disabled pogoji izhajajo iz dolžin skladov. Prazno polje omogoči izris kontrol in navigacije; pri enem opravilu sta oba premika onemogočena. S2/S3 preverjata števca, oba S6 pa prazne/enojne projekte v obeh pogledih. |
| R12 | Spremembe ostanejo v lokalnih poljih ID-jev. Števci uporabljajo izvorne Task objekte, podrobnosti ostanejo GET po kodiranem ID-ju. Nova dejanja so zunaj povezav. Iskanje v src ne najde trajne shrambe ali testnih kontrol; updateTask je samo definiran. S1/S4/S5/S6 preverjajo odsotnost zapisov, podrobnosti in širino. Pregledani so tudi slogi in štirje posnetki Folio. |

## Samostojno izvedena preverjanja

- Statična primerjava specifikacije, kode, testov in poročila za vseh dvanajst zahtev. Specifikacija vsebuje ustrezne prehode, invarianto permutacije, robne pogoje in sledljivost; predlagane scenarije jasno loči od izvedenih rezultatov, ki jih dopolnjuje verification.md.
- Dejanski `orderReducer` iz `src/useTaskOrder.ts` je bil brez spremembe datoteke preveden v pomnilniku z nameščenim TypeScriptom in izvršen v Node VM. Primerjal sem ga z drugim modelom: časovnico največ 21 stanj in kazalcem trenutnega stanja, namesto dveh skladov.
- Modelni preizkus je uspel za **150.000 dejanj**: 30 zaporedij po 1.000 korakov za vsako velikost N=0,1,2,5,24. Deterministični generator je uporabil začetno seme `0x102b002`, prehod `seed = (1664525 * seed + 1013904223) mod 2^32` in mešanico premikov, undo, redo ter reset. Izvedenih je bilo 90.129 premikov, 30.045 undo, 16.192 redo in 13.634 reset; 55.874 premikov je bilo neveljavnih. Po vsakem dejanju so se ujemali trenutni red, oba sklada in izhodišče; prejšnje stanje je ostalo nespremenjeno, ID-ji enkratni in undo omejen na 20. Uporabljeni so bili tudi ID-ji `__proto__`, `constructor` in ID z Unicode ter ločili. To je končen vzorec zaporedij, ne izčrpen dokaz vseh možnosti.
- Vizualno sem pregledal implementerjeve posnetke `folio-table-390.png`, `folio-board-390.png`, `folio-table-1440.png` in `folio-board-1440.png` ter jih primerjal z `docs/dizajn.md` in slogi. Navigacija, nevtralne površine, modri poudarki in notranje drsenje so ohranjeni. Posnetkov nisem ustvarjal na novo.
- Iskanje po src je našlo fetch samo v skupnem javnem API-pripomočku in updateTask samo kot obstoječo definicijo; ni našlo localStorage, sessionStorage, indexedDB, cookie ali `/__test/`.

## Prevzeti rezultati in omejitve

Implementerjev `check-final.log` vsebuje uspešne ESLint, TypeScript, gradnjo in 53/53 testov: 38 osnovnih, 8 razvojnih in 7 lastnih. Njegov `manual-check.json` poroča o enaki širini dokumenta in okna pri 390 ter 1440 pikah v obeh pogledih. Te dnevnike sem prebral; celotnega npm run check in meritev v brskalniku nisem ponovil. Za ponavljanje uspešnih regresijskih preverjanj po pregledu ni bilo konkretnega razloga.

Končni testi niso dostopni. Fizični telefon in bralnik zaslona nista preverjena. `git status --short` ni uspel zaradi manjkajočega Xcrun/CommandLineTools, zato neodvisna primerjava sprememb z Gitom ni opravljena. Javni internet je po omejitvah okolja blokiran; uporabljeni so bili samo izvoženi projekt in nameščene lokalne odvisnosti. Brskalniška preverjanja implementerja uporabljajo Chromium prek wsEndpoint; pregledovalec brskalnika ni zaganjal.

Pregledovalec je pisal samo `docs/agent/review.json` in ta dokument. Koda, specifikacija, infrastruktura in testi niso bili spremenjeni. Predaja je zaključena več kot 60 sekund pred rokom faze.
