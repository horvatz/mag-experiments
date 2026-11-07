# P10 specifikacija: Lokalni vrstni red z razveljavitvami

**Status:** sprejeta razvojna specifikacija  
**Različica:** 1.0 | **Datum:** 2026-10-09

## Problem in kontekst

Folio že omogoča pregled projektnih opravil v preglednici in tabli ter odpiranje podrobnosti. P10 doda urejanje lokalnega vrstnega reda izbranega projekta ter razveljavitve in ponovitve. Vrstni red ni trajno shranjen, ne spremeni podatkov opravil in ne uvede novih zapisovalnih API-jev. Potrjena zasnova Folio v [`docs/dizajn.md`](../../dizajn.md) ostaja obvezna.

## Vhodi, dejanja in izidi

- **Vhodi:** opravila izbranega projekta, pridobljena iz javnega API-ja `/api/`; vsaka entiteta je izbrana po `id`. Testni primeri lahko vsebujejo 0, 1, več kot 10 opravil, enake naslove, različna zaporedja, Unicode besedilo in veljavne koledarske datume.
- **Dejanja:** `Premakni <id> gor`, `Premakni <id> dol`, `Razveljavi premik`, `Ponovi premik` in `Začetni vrstni red`. Nova dejanja ob opravilu so zunaj povezave do podrobnosti.
- **Izidi:** trenutna permutacija iste množice ID-jev, zgodovina razveljavitev, zgodovina ponovitev, prikaz globalnih mest in usklajen števec. Polja opravil, statusi, števci stanj, dostopna imena, pogledi in podrobnosti ostanejo nespremenjeni.

## Zahteve in pravila

### Poimenovanja in stanje

- Naj bo `I₀` izvorno zaporedje ID-jev opravil izbranega projekta v prejetem vrstnem redu, `C` trenutna permutacija, `U` sklad prejšnjih permutacij za razveljavitev in `R` sklad trenutno razveljavljenih permutacij za ponovitev. Zgornji element sklada je zadnje dejanje.
- `C` je veljavna, če je permutacija natanko istih ID-jev kot `I₀`; spremembe polj ali statusov niso del vrstnega reda.
- Globalno mesto `mesto(id)` je indeks `id` v `C` plus 1. Naslovi se ne uporabljajo za izbiro; enaki naslovi ostanejo ločena opravila po ID-ju.

### Pravila sprememb stanja

1. **Premik:** veljaven premik obstaja le, če obstaja neposredni globalni sosed v smeri guba. Izvedba zamenja soseda v `C`; vsak drug poskus je onemogočen in ne spremeni `C`, `U` ali `R`.
2. **Zgodovina premika:** vsak veljaven premik prejšnji `C` doda na `U` in počisti `R`.
   - `C' = zamenjaj_soseda(C)`  
   - `U' = omeji(U + [C], 20)`  
   - `R' = []`
3. **Razveljavitev:** če `U` ni prazen, zadnjo permutacijo iz `U` postavi v `C`, trenutni `C` doda na `R` in zadnji element odstrani iz `U`.
4. **Ponovitev:** če `R` ni prazen, zadnjo razveljavljeno permutacijo postavi v `C`, trenutni `C` doda na `U` in zadnji element odstrani iz `R`. Ponovitev pri praznem `R` je onemogočena.
5. **Začetni vrstni red:** če `C ≠ I₀`, trenutni `C` doda na `U`, `C` nastavi na `I₀` in počisti `R`. Če je `C = I₀`, je gumb onemogočen in zgodovina se ne spremeni.
6. **Omejitev zgodovine:** `U` hrani največ 20 permutacij. Ob 21. dodatku se najstarejša zavrze; `R` ohrani vsa trenutna razveljavljena dejanja.

### Prikaz in navigacija

- Preglednica prikazuje globalni vrstni red `C`; tabla prikazuje relativni vrstni red znotraj obstoječih stalnih stolpcev stanj. Gumba premika v tabli še vedno uporabljata globalnega soseda iz `C`, prikazano globalno mesto pa se ne spreminja s stolpcem statusa.
- Element z `role=status` in `aria-label="Zgodovina vrstnega reda"` prikazuje natanko `Razveljavitve: U. Ponovitve: R.`, kjer sta `U` in `R` trenutni dolžini skladov. Gumba `Razveljavi premik` in `Ponovi premik` sta onemogočena, kadar je pripadajoča zgodovina prazna.
- Vsaka vrstica in kartica ima `data-task-id` ter gube `Premakni <id> gor` in `Premakni <id> dol`. Vsako opravilo ima element z `aria-label="Mesto opravila <id>"` in globalno številko.
- Preklop preglednica/tabla ter odpiranje in zapiranje podrobnosti ohranita `C`, `U` in `R`. Menjava projekta ali osvežitev ponastavi vrstni red in obe zgodovini na izhodišče izbranega projekta. Stanje se ne shranjuje v `localStorage` ali drugo trajno shrambo.
- Prazen projekt in projekt z enim opravilom ostaneta uporabna; vsi premiki so onemogočeni, zgodovina pa ostane prazna.

### Sprejemni pogoji po zahtevah

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob nalaganju je `C = I₀`; vsa globalna mesta so od 1 do N po ID-ju; enaki naslovi ne vplivajo na izbiro. | Naloži projekt z enakimi naslovi in preveri zaporedje ID-jev, mesta in povezave do podrobnosti. |
| R02 | Veljavna guba zamenjata opravilo z neposrednim globalnim predhodnikom oziroma naslednikom; polja in statusi ostanejo enaki. | Izvedi gube nad znanim zaporedjem in primerjaj novo zaporedje ID-jev ter nespremenjena polja in statuse. |
| R03 | Premik prvega gor ali zadnjega dol je onemogočen; neveljaven poskus ne spremeni `C`, `U` ali `R`. | Preveri atribut `disabled`, sproži poskus in primerjaj celotno stanje. |
| R04 | Vsak veljaven premik doda prejšnji `C` na `U`; razveljavitev zamenja `C` z zadnjim `U` in doda trenutni `C` na `R`. | Zaporedoma premikaj, razveljavi in primerjaj ID-je, števca in gumba. |
| R05 | Ponovitev vzame zadnji `R`; več parov razveljavitev/ponovitev ohrani zaporedji brez izgube ali podvajanja ID-jev. | Izvedi več veljavnih premikov, nato več razveljavitev in ponovitev v različnih zaporedjih. |
| R06 | Veljaven premik počisti `R`; neveljaven premik na robu zgodovine ponovitev ne spremeni zgodovin. | Po razveljavitvi izvedi veljaven premik in preveri prazen `R`; nato ponovi neveljaven robni poskus in primerjaj stanje. |
| R07 | `U` hrani največ 20 permutacij; 21. dodatek zavrze najstarejšo; `R` obdeluje vsa trenutna razveljavljena dejanja. | Izvedi 21 veljavnih premikov in več razveljavitev; preveri števec, dostopnost najstarejše permutacije in ponovitve. |
| R08 | Začetni vrstni red vrne `I₀` kot razveljavljivo dejanje in počisti `R`; pri `C = I₀` je gumb onemogočen in zgodovina se ne spremeni. | Preveri reset po spremembi in reset ob izvornem stanju, vključno s števci. |
| R09 | Preglednica prikazuje `C`, tabla pa relativni red znotraj stolpcev stanj; guba v tabli uporabljata globalnega soseda in ne spreminjata statusa. | Izvedi gube v obeh pogledih in primerjaj ID-je, mesta, stolpce statusov in status vsakega opravila. |
| R10 | Preklop pogleda in odpiranje/zapiranje podrobnosti ohranita `C`, `U`, `R`; menjava projekta in osvežitev ponastavita stanje. | Izvedi dejanja in preverjaj zaporedja ID-jev, števce ter gumba. |
| R11 | Števec je usklajen z `U` in `R`; gumba sta onemogočena pri ničli; prazen projekt in projekt z enim opravilom sta uporabna brez dovoljenega premika. | Preveri števec in stanja gumbov pri 0, 1 in več opravili. |
| R12 | Vse spremembe so permutacije iste množice ID-jev; ni zapisov na API, `localStorage` ali sprememb polj. | Izvedi vsa dejanja in prisluhni omrežnemu prometu ter primerjaj nespremenjena polja, statuse in množico ID-jev. |

## Uporabniški scenariji

1. Uporabnik naloži projekt z več opravili, vidi globalna mesta in premakne eno opravilo gor ali dol. Vrstni red se spremeni, polja in statusi pa ne.
2. Uporabnik naredi več premikov, večkrat razveljavi in nato ponovi. Števec in guba vedno kažeta trenutno zgodovino, zaporedji pa ostaneeta usklajena.
3. Uporabnik po razveljavitvi naredi nov premik; zgodovina ponovitev se počisti, prejšnje razveljavljene akcije pa niso več na voljo.
4. Uporabnik preklopi med preglednico in tablo ter odpre in zapre podrobnosti; vrstni red in obe zgodovini se ohranita.
5. Uporabnik izbere drug projekt ali osveži stran; funkcionalnost se ponastavi na izhodišče tega projekta.
6. Uporabnik odpre prazen projekt ali projekt z enim opravilom; pogled je berljiv in uporaben, premiki pa niso dovoljeni.

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | `C = I₀`, globalna mesta so po ID-jih. | `R01: initial global order, ranks and duplicate titles stay distinct` | `src/ordering.ts` (`createOrderState`), `src/App.tsx` (`orderedTasks`), `tests/agent/P10.spec.ts` | Uspešno: lastni test 1/10. |
| R02 | Guba zamenjata globalnega soseda; polja in statusi se ne spremenijo. | `R02 and R03: valid moves swap global neighbours and boundary moves stay disabled` | `src/ordering.ts` (`moveTask`), `src/App.tsx`, `src/TaskBoard.tsx` | Uspešno: lastni test 2/10. |
| R03 | Robna premika sta onemogočena in ne spreminjata zgodovine. | Preverjanje `disabled` ter zaporedja ID-jev v testu 2. | `src/ordering.ts` (`canMove`), `src/App.tsx`, `src/TaskBoard.tsx` | Uspešno: lastni test 2/10. |
| R04 | Veljaven premik shrani prejšnjo permutacijo v `U`; razveljavitev preklopi na `R`. | `R04 and R05: repeated undo and redo preserve both stacks` | `src/ordering.ts` (`moveTask`, `undoMove`) | Uspešno: lastni test 3/10. |
| R05 | Ponovitev vzame zadnji `R`; zaporedji ostaneta enolični. | Zaporedni undo/redo v testu 3 in 20 undo/redo v testu 5. | `src/ordering.ts` (`undoMove`, `redoMove`) | Uspešno: lastni testi 3/10 in 5/10. |
| R06 | Veljaven premik počisti `R`; neveljaven robni poskus ga ne spremeni. | `R06: a new valid move clears redo and an invalid edge leaves redo intact` | `src/ordering.ts` (`moveTask`, `canMove`) | Uspešno: lastni test 4/10. |
| R07 | `U` ima največ 20 vnosov; vsi razveljavljeni koraki so lahko ponovljeni. | `R07: undo history is capped at twenty and redo works for all undone moves` | `src/ordering.ts` (`addToUndo`) | Uspešno: lastni test 5/10. |
| R08 | Reset je novo undo dejanje in počisti `R`; ob izvornem redu je onemogočen. | `R08: reset is one undoable action and is disabled at the initial order` | `src/ordering.ts` (`resetToInitial`) | Uspešno: lastni test 6/10. |
| R09 | Tabla je statusno-relativna, gubi pa uporabljata globalnega soseda. | `R09 and R12: board shows relative order but moves use the global neighbour without writes` | `src/App.tsx`, `src/TaskBoard.tsx` | Uspešno: lastni test 7/10. |
| R10 | Pogled in podrobnosti ohranita stanje; projekt in osvežitev ga ponastavita. | `R10: view switch and details preserve state while project change and reload reset it` | `src/App.tsx` (`ProjectView`, `key={project.id}`) | Uspešno: lastni test 8/10. |
| R11 | Števec in gubi sta skladni; prazen in eno-opravilen projekt sta uporabna. | Testi 9 in 10. | `src/ordering.ts` (`historyText`), `src/App.tsx`, `src/TaskBoard.tsx` | Uspešno: lastna testi 9/10 in 10/10. |
| R12 | Spremeni se le permutacija ID-jev; ni zapisov na API ali `localStorage`. | `readonly` pomoč v testih 1, 2, 7 in 10, vključno s širino 390 px. | `tests/agent/helpers.ts`, `src/ordering.ts` | Uspešno: `npm run check`, 56/56. |

## Uspešni merilniki

- Vseh R01–R12 je zajetih s preverljivimi pogoji in načrtovanim testiranjem.
- Uporabniški vmesnik ohrani potrjeno zasnovo Folio, slovenska poimenovanja in dostopnost.
- Nove funkcionalnosti ne dodajo zapisovalnih API-jev, odvisnosti, trajne shrambe, sprememb skupne infrastrukture ali zunanjih meritev.

## Odprta vprašanja in omejitve

- Ni odprtih vprašanj, ki bi blokirala izvedbo; izvirna navodila so merilo.
- Končni zasebni testi niso dostopni; dejanski izidi preverjanj so v [`verification.md`](./verification.md).
