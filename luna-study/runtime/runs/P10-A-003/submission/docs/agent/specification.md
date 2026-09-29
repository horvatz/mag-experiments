# Specifikacija: Lokalni vrstni red z razveljavitvami

## Problem in kontekst

Folio prikazuje projektna opravila v preglednici ali tabli. Trenutno vrstni red obeh prikazov izhaja neposredno iz polja, prejetega prek `/api/projects/:id/tasks`; uporabnik ne more urediti njihovega vrstnega reda. Naloga P10 doda začasno, lokalno permutiranje opravil, premikanje po globalnem vrstnem redu, razveljavitev in ponovitev. Sprememba ne sme vplivati na API, opravila ali njihove statuse. Ob osvežitvi ali izbiri drugega projekta se začetni vrstni red znova naloži.

## Vhodi, dejanja in izidi

- Vhod je urejeno polje `Task[]` iz obstoječega API-ja. Identiteta elementa je `task.id`; naslovi niso identifikatorji. Izvorni vrstni red se zajame ob nalaganju projekta.
- Lokalno stanje za projekt vsebuje trenutno permutacijo ID-jev, sklad največ 20 prejšnjih permutacij in sklad permutacij za ponovitev. Prikazne vrednosti `Task` se pridobijo po ID-ju iz naloženih podatkov.
- Premik opravila zamenja njegovo mesto z globalnim predhodnikom/naslednikom. Če sosed ne obstaja, se stanje ne spremeni. Veljaven nov premik shrani staro permutacijo, omeji sklad razveljavitev na 20 ter izprazni ponovitve.
- Razveljavitev shrani trenutno permutacijo za ponovitev in obnovi zadnjo permutacijo razveljavitev; ponovitev izvede obratno. Robna in onemogočena dejanja so brez spremembe.
- Začetni vrstni red je veljavno razveljavljivo dejanje samo, kadar se trenutna permutacija razlikuje od izvorne; shrani trenutno permutacijo, obnovi izvorno ter izprazni ponovitve.
- Menjava pogleda in odprtje/zaprtje podrobnosti ohranita lokalno stanje. Menjava projekta ustvari novo stanje iz njegovih prejetih podatkov.

## Zahteve in pravila

Naj bo `O` trenutna permutacija različnih ID-jev, `S` sklad razveljavitev, `R` sklad ponovitev, `I` izvorna permutacija, `N=|O|`, `p(i)` pa indeks ID-ja `i` v `O`. Vrhnji element sklada je zadnji. `swap(O,a,b)` zamenja samo dve mesti. API opravilo za ID `i` je `T(i)`.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetno `O=I`; v vsakem pogledu je dostopno mesto opravila `i` enako `p(i)+1`, določeno po ID-ju tudi pri enakih naslovih. | UI scenarij: začetni vrstni red, enaki naslovi in mesta v obeh pogledih. |
| R02 | Veljaven gor/dol: če je `j=p(i)±1` v `[0,N)`, `O'=swap(O,p(i),j)`; vsi podatki opravila ostanejo `T(i)`. | UI premiki gor/dol in primerjava prikazanih polj. |
| R03 | Gor velja samo, če `p(i)>0`, dol samo, če `p(i)<N-1`; neveljaven/ponovljen robni poskus ne spremeni `O,S,R`. | Robna gumba onemogočena; preveri invariant stanje pred/po. |
| R04 | Veljaven premik: `S'=tail20(S·[O])`; razveljavitev, ko `S≠[]`: `R'=R·[O]`, `O'=last(S)`, `S'=init(S)`. | Več premikov in razveljavitev; števec, gumbi in permutacija. |
| R05 | Ponovitev, ko `R≠[]`: `S'=tail20(S·[O])`, `O'=last(R)`, `R'=init(R)`. | Zaporedne razveljavitve in ponovitve brez manjkajočih/podvojenih ID-jev. |
| R06 | Veljaven premik vedno določi `R'=[]`; robni premik ne spremeni nobenega sklada. | Razveljavi, naredi novo spremembo in preveri izpraznitev; preizkusi robno dejanje z `R≠[]`. |
| R07 | Po vsaki dodani permutaciji velja `|S|≤20`; pri presežku se odstrani najstarejša. `R` hrani vse trenutno dosegljive ponovitve. | Več kot 20 premikov, nato razveljavitve/ponovitve; preveri števce. |
| R08 | Ponastavitev, če `O≠I`: `S'=tail20(S·[O])`, `O'=I`, `R'=[]`; če `O=I`, brez spremembe in gumb onemogočen. | Ponastavitev iz spremenjenega in izvornega vrstnega reda. |
| R09 | Tabla združuje ID-je po nespremenjenem statusu, vrstni red znotraj vsakega stolpca je podzaporedje `O`; vsaka kartica kaže globalno `p(i)+1`, premik uporablja globalnega soseda. | Premik med opravili različnih stanj in primerjava preglednice/table. |
| R10 | Lokalni vrstni red in sklada živijo nad navigacijo pogleda/podrobnosti, a se ob zamenjavi projekta/ponovnem nalaganju inicializirajo iz `I`. | Menjaj pogled in podrobnosti, projekt ter osveži stran. |
| R11 | Status zgodovine prikazuje `|S|` in `|R|`; razveljavi/ponovi sta onemogočena natanko, ko ustrezni sklad nima elementa. Za `N≤1` ni veljavnega premika, prazni prikaz ostane uporaben. | Prazen, enoopravilni in običajni projekt; status in disabled. |
| R12 | Za vsa dosegljiva stanja `O` je permutacija `I`; premik menja le vrstni red. Ni klica zapisovalnega API-ja. Povzetki statusov in podrobnosti izvirajo iz `T(i)`; obstoječi prilagodljivi videz ostane. | Pregledi lastnosti v UI, API zahteve in obstoječi odzivni testi. |

## Izvedba in sledljivost

Stanje je implementirano kot lokalni reducer `src/taskOrder.ts`; naloženi seznam v `src/App.tsx` ga inicializira za izbrani projekt, `src/TaskBoard.tsx` pa ohranja stolpce po statusu. Dostopna mesta in gumbe za premik izrisujeta `src/TaskOrderControls.tsx`, videz in odzivni razpored pa `src/styles.css`. Lastni scenariji so v `tests/agent/P10.spec.ts`. Celotni izidi, imena testov in omejitve so zapisani v [`verification.md`](verification.md).

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | `O=I`; mesto `i` je `p(i)+1`, identiteta po ID-ju | P10: global places follow IDs and moves keep task data and counts; razvojni D02 | `src/taskOrder.ts` inicializacija; `src/App.tsx` projekcija `positions` | Uspešno; 55/55 v končnem `npm run check` |
| R02 | Zamenjava samo sosednjega ID-ja, podatki ostanejo `T(i)` | P10: global places follow IDs…; razvojni D01 | `src/taskOrder.ts` primer `move`; `src/TaskOrderControls.tsx` | Uspešno; preverjen ID, naslov, rok in permutacija |
| R03 | Robni premik nima učinka; ustrezni gumbi onemogočeni | P10: global places…; empty project…; single task…; razvojni D01 | `src/taskOrder.ts` meje indeksa; `src/TaskOrderControls.tsx` `disabled` | Uspešno; prva/zadnja ter prazna/enojna opravila |
| R04 | Premik shrani staro `O`; undo obnovi vrhnjo permutacijo | P10: multiple undo and redo… | `src/taskOrder.ts` primer `move` in `undo` | Uspešno; več zaporednih razveljavitev |
| R05 | Redo obnovi zadnjo razveljavljeno permutacijo in ohrani ID-je | P10: multiple undo and redo…; undo history keeps only 20… | `src/taskOrder.ts` primer `redo` | Uspešno; 20 ponovitev in končna permutacija |
| R06 | Veljaven premik izprazni `R`; robni poskus sklada ne spremeni | P10: a rejected edge action preserves both undo and redo history; multiple undo and redo… | `src/taskOrder.ts` neveljaven premik vrne isto stanje | Uspešno; preverjena referenčna enakost stanja ob robu |
| R07 | `|S|≤20`; najstarejši presežek se odstrani | P10: undo history keeps only 20 states and all retained steps can be redone | `src/taskOrder.ts` `remember` | Uspešno; po 21 premikih ostane natanko 20 razveljavitev in ponovitev |
| R08 | Ponastavitev shrani trenutno permutacijo; pri `O=I` je brez učinka | P10: multiple undo and redo…; a rejected edge action… | `src/taskOrder.ts` primer `reset`; `src/App.tsx` onemogočanje | Uspešno; reset, undo reset in noop reset |
| R09 | Tabla je podzaporedje `O` po stalnem statusu; številka in premik sta globalna | P10: board keeps status columns and global adjacency across columns; razvojni D04 | `src/TaskBoard.tsx` statusni stolpci z `tasks` v globalnem vrstnem redu | Uspešno; sosednja opravila različnih statusov |
| R10 | Navigacija pogleda/podrobnosti ohranja stanje; nov projekt/nalaganje ga inicializira | P10: view, details, project navigation and refresh have the required lifetime | `src/App.tsx` `LoadedProjectTasks` in `key={project.id}` | Uspešno; preglednica, tabla, modal, menjava projekta in reload |
| R11 | Status kaže velikosti skladov; undo/redo onemogočena pri ničli; prazno/enojno uporabno | P10: global places…; empty project…; single task… | `src/App.tsx` vrstica zgodovine in disabled pogoji | Uspešno; števci, prazni projekt in enojno opravilo |
| R12 | ID-ji permutacije se ohranijo; polja/statusi ostanejo; brez zapisov API; širina 390 px | P10: global places…; table actions stay inside the table scroll area at 390px; razvojni D04; izhodiščni testi podrobnosti | `src/taskOrder.ts`; podatki `Task` v `src/App.tsx`/`src/TaskBoard.tsx`; `src/styles.css` | Uspešno; preverjeni statusi, rok, brez zapisov in brez vodoravnega drsenja strani |

### Zapis popravka specifikacije

- 2026-09-27: po implementaciji sem zamenjal načrtovane/čakajoče povezave v tabeli z dejanskimi mesti kode, opravljenimi scenariji in njihovimi končnimi izidi. Zahteve in predikati 1.0 so ostali nespremenjeni.

## Odprta vprašanja in omejitve

- API za opravila je obstoječi vir resnice; vrstni red se ne zapisuje trajno.
- Skupni razvojni testi niso nujno celoten obseg. Posebej je treba preveriti kapaciteto zgodovine, začetni vrstni red, lokalne permutacije in širino 390 px.
- Predpostavka: posamezno opravilo znotraj projekta ima enoličen ID, kot določajo tipi in API naloge.
