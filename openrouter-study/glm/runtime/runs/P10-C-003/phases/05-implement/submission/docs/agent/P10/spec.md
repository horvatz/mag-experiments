# P10 — Lokalni vrstni red z razveljavitvami

**Različica**: 1.0 | **Status specifikacije**: sprejeta za načrtovanje
**Vir zahtev**: `task/instructions.md` | **Skupna predloga**: `task/specification-template.md`

## Problem in kontekst

Folio omogoča pregled projektnih opravil v preglednici in tabli. Uporabnik želi spremeniti vrstni red opravil, da si uredi prednostne naloge, vendar ne sme spremeniti polj opravil, stanj ali strežniških podatkov.

P10 doda lokalno permutacijo trenutno naloženih opravil izbranega projekta, gibe gor/dol, razveljavitve, ponovitve in vrnitev na začetni vrstni red. Stanje velja le v trenutnem pomnilniškem prikazu; projekt, osvežitev ali menjave ne trajno shranijo novega vrstnega reda.

## Vhodi, dejanja in izidi

Podatke prebere obstoječi odjemalec iz javnega API-ja `GET /api/projects/:id/tasks`. Tipi in polja ostanejo enaki `shared/types.ts`. Vsak `id` je enkraten, naslovi so navadno besedilo in se ne uporabljajo za povezovanje.

Dovoljena dejanja:

- `Premakni <id> gor` in `Premakni <id> dol` zamenjata opravilo z neposrednim globalnim sosedom.
- `Razveljavi premik` obnovi zadnjo prejšnjo permutacijo.
- `Ponovi premik` obnovi zadnjo razveljavljeno permutacijo.
- `Začetni vrstni red` vrne permutacijo prejetega polja.
- Preklop pogleda, odpiranje in zapiranje podrobnosti sta obstoječi dejanji in ne spremenita zgodovin.

Po uspešnem dejanju se prikaže nova permutacija istih ID-jev, števca zgodovine pa se uskladita. Neveljavno robno dejanje ne spremeni stanja in ne doda zgodovine. Napake nalaganja obravnava obstoječi UI za napake; novih API-jev in zunanjih meritev ni.

## Pravila sprememb stanja

Naj bo `T` uspešno prejeto polje opravil v točno tem vrstnem redu, `N = |T|`, `I` množica njegovih ID-jev in `P` trenutna permutacija. Zgodovina razveljavitev je sklad `H`, zgodovina ponovitev pa sklad `F`. Oba vsebujeta celotne permutacije.

Velja:

- Začetek: `P = T`, `H = []`, `F = []`.
- Globalno mesto opravila `id` je `1 + index(P, id)`, kjer je `index` mesto v `P`.
- `move(id, direction)` je veljavna, če `id` obstaja v `P` in ni na robu v smeri `direction`. Pri veljavnem premiku prejšnjo `P` dodamo na `H`, `P` zamenja soseda, `F = []`, nato `H` po potrebi obdrži najnovejših 20 vnosov.
- `move(id, direction)` pri neveljavnem robu ne spremeni `P`, `H` niti `F`.
- `undo` je dovoljen samo za `H ≠ []`. Zadnji vnos prenesemo iz `H` v `F` in ga nastavimo kot novo `P`.
- `redo` je dovoljen samo za `F ≠ []`. Zadnji vnos prenesemo iz `F` v `H` in ga nastavimo kot novo `P`.
- `reset` je veljaven samo za `P ≠ T`. Prejšnjo `P` dodamo na `H`, `P = T`, `F = []` in po potrebi obdržimo najnovejših 20 vnosov na `H`.
- Menjava projekta ali osvežitev ponastavita vse tri dele stanja na začetne vrednosti za novo prejeto polje.
- Preklop pogleda in odpiranje ali zapiranje podrobnosti ne spremenita `P`, `H` niti `F`.
- Prikaz je vedno permutacija istih ID-jev iz `I`; spremembe ne smejo povzročiti zapisov prek API-ja.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob zaključku nalaganja je `P = T`. Vsako opravilo prikaže globalno mesto `1..N` po ID-ju; enaki naslovi ostanejo ločeni. | Naloži različna polja, tudi prazna, z enim, več opravili in enakimi naslovi; preveri vrstni red, mesta in ID-je. |
| R02 | Za veljavni `id` zamenja `move(id, "up")` oz. `move(id, "down")` neposredna soseda v `P`; vsa polja opravil in statusi ostanejo enaki. | Spremeni vrstni red, primerjaj celotne objekte pred in po dejanju. |
| R03 | Za prvi `id` je gumb gor onemogočen, za zadnjega gumb dol. Neveljavno robno ali ponovljeno dejanje pusti `P`, `H` in `F` nespremenjene. | Preveri stanje gumbov, klik robnega dejanja in izjemo neveljavnega klica brez spremembe. |
| R04 | Vsak veljaven premik doda prejšnjo celotno `P` na `H`. `undo` vzame zadnji vnos `H`, doda trenutno `P` na `F` in prikaže shranjeno permutacijo. | Izvedi več premikov in več razveljavitev; preveri točna zaporedja vseh ID-jev in števca. |
| R05 | `redo` vzame zadnji vnos `F`, doda trenutno `P` na `H` in prikaže shranjeno permutacijo. Več `undo` in `redo` ohrani zaporedji brez izgube ali podvajanja ID-jev. | Izmenično izvedi več razveljavitev in ponovitev ter preveri identiteto množice ID-jev in vrstni red. |
| R06 | Po veljavnem premiku je `F = []`. Neveljaven premik na robu ne počisti `F`. | Po `undo` izvedi veljaven premik in preveri onemogočen `Ponovi premik`; nato po `undo` izvedi robno dejanje in preveri ohranjeno `F`. |
| R07 | Veljavni premiki ohranijo največ 20 zadnjih permutacij na `H`; ob 21. premiku najstarejša izgine. Vsi trenutno razveljavljeni koraki ostanejo na `F` in delujejo. | Izvedi 21 premikov, nato 21 razveljavitev in izmenične ponovitve; preveri meji in stanji. |
| R08 | `Začetni vrstni red` je veljaven le, če `P ≠ T`; vrne `T`, doda prejšnjo `P` na `H`, počisti `F`. Za `P = T` je gumb onemogočen in ne spremeni zgodovine. | Spremeni vrstni red in se vrni na izhodišče; preveri tudi onemogočen gumb v izhodišču. |
| R09 | Preglednica prikaže `P` z globalnimi mesti. Tabla ohrani stalne stolpce stanj, kartice znotraj stolpca pa razvrsti po mestu v `P`. Premiki uporabljajo globalnega soseda iz `P`, ne soseda v istem stolpcu, in ne spremenijo statusa. | Preveri oba pogleda z opravili v vseh stanjih; premakni opravilo prek meje stolpca in preveri mesto ter status. |
| R10 | Preklop pogleda in odpiranje ali zapiranje podrobnosti ohranita `P`, `H` in `F`. Menjava projekta in osvežitev ju ponastavita na prejeto izhodišče; ni trajnega shranjevanja. | Izvedi zaporedje dejanj, menjaj projekt in osveži; po vsakem dejanju preveri vrstni red ter števca. |
| R11 | Element status vsebuje točno `Razveljavitve: U. Ponovitve: R.`. Gumba sta onemogočena pri `U = 0` oz. `R = 0`. Prazni projekt in projekt z enim opravilom sta uporabna brez veljavnega premika. | Preveri števca, stanja gumbov in uporabnost praznega ter enoopravilnega projekta. |
| R12 | Vsaka sprememba je permutacija `I`. Ne sme priti do klica API za pisanje ali spremembe polj, statusov, številcev stanj ali podrobnosti. Preveri dostopnost in prilagodljiv Folio iz `docs/dizajn.md`. | Preveri enakost ID-jev, polj in številcev; sledi omrežnim zahtevam ter zagon skupnih in agentovih testov na širini 390 px. |

## Dogovor o vmesniku

Ob vsaki vrstici ali kartici, zunaj povezave na podrobnosti, sta gumba `Premakni <id> gor` in `Premakni <id> dol`. Element z oznako `Mesto opravila <id>` prikaže globalno mesto. Na vrsticah in karticah ostane atribut `data-task-id`.

Glavna dejanja so `Razveljavi premik`, `Ponovi premik` in `Začetni vrstni red`. Element z `role="status"` in `aria-label="Zgodovina vrstnega reda"` prikaže `Razveljavitve: U. Ponovitve: R.`.

Ohranijo se obstoječa dostopna imena pogledov, stolpcev, `aria-label="Pregled stanj opravil"` ter preglednica in tabla. Novi gradniki sledijo barvam, tipografiji in razmikom iz `docs/dizajn.md`. Ob širini 390 px se stran ne razširi; notranje drsenje preglednice in table je dovoljeno.

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R03 | Začetni vrstni red, veljavni premiki in robna dejanja | `tests/agent/p10.spec.ts`: reducer, preglednica, prazen/en opravili | `src/taskOrder.ts`, `src/useTaskOrder.ts`, `src/App.tsx` | Uspešno; lastni testi 7/7. |
| R04–R08 | Razveljavitve, ponovitve, reset in omejitev 20 | `tests/agent/p10.spec.ts`: model zgodovine in 21 veljavnih premikov | `src/taskOrder.ts`, `src/useTaskOrder.ts`, `src/App.tsx` | Uspešno; `npm run check`: 53/53. |
| R09–R10 | Globalni vrstni red, tabla, preklop pogleda, menjava in osvežitev | `tests/agent/p10.spec.ts`: tabla, pogoji, ponastavitve | `src/App.tsx`, `src/TaskBoard.tsx` | Uspešno; lastni in skupni testi brez napak. |
| R11–R12 | Števci, dostopnost, integriteta polj, Folio in ozka postavitev | `tests/agent/p10.spec.ts`: status, uporabnost, 390 px; skupni testi | `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css` | Uspešno; `npm run check`: 53/53. Podrobnosti v `docs/agent/verification.md`. |

## Odprta vprašanja in omejitve

Ni bistvenih odprtih vprašanj. Zahteve določajo, da stanje ni trajno shranjeno, zato zgodovina po osvežitvi ali menjavi projekta namerno izgine. Ne dodajajo se strežniške spremembe, novi odvisni API-ji, zunanje meritve ali nove odvisnosti. Končni testi iz zasebnega repozitorija niso dostopni in niso bili izvedeni; izvedena in uspešna so opisana lokalna preverjanja v `docs/agent/verification.md`.
