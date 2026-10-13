# P10 – Razvojna specifikacija: lokalni vrstni red z razveljavitvami

Postopek A (en agent). Predloga: `task/specification-template.md`.

## Problem in kontekst

Folio prikazuje opravila projekta v vrstnem redu, ki ga vrne javni API
(`GET /api/projects/:id/tasks`). Uporabnik želi vrstni red opravil znotraj
projekta začasno prilagoditi: premikati opravila gor/dol, razveljaviti in
ponoviti premike ter se vrniti na začetni vrstni red. Spremembe so lokalne
permutacije iste množice ID-jev; ne shranjujejo se na strežnik, ne spreminjajo
polj opravil in ne preživijo osvežitve ali menjave projekta.

Začetno stanje: preglednica in tabla prikazujeta opravila v prejetem vrstnem
redu, brez kontrol za premikanje in brez zgodovine.

## Vhodi, dejanja in izidi

Vhodi: polje `Task` iz javnega API-ja; vrstni red elementov polja je izhodiščna
permutacija. ID-ji so enkratni; naslovi so lahko enaki, tudi z Unicode znaki;
status je `todo | in_progress | done`; število opravil je lahko 0, 1 ali več.

Stanje nove funkcionalnosti (lokalno, v komponenti projekta):

- `P`: trenutna permutacija ID-jev (začetno enaka prejetemu polju),
- `U`: sklad prejšnjih permutacij za razveljavitev (največ 20),
- `R`: sklad razveljavljenih permutacij za ponovitev,
- `P0`: izhodiščna permutacija projekta.

Dovoljena dejanja in izidi:

| Dejanje | Pogoj | Izid (stanje po uspehu) |
| --- | --- | --- |
| Premakni gor/dol | cilj zamenjave obstaja v `P` | `U := cap20(U + [P])`, `P := zamenjava(P)`, `R := []` |
| Razveljavi premik | `U` ni prazen | `P := zadnji(U)`, `U := U brez zadnjega`, `R := R + [prejšnji P]` |
| Ponovi premik | `R` ni prazen | `P := zadnji(R)`, `R := R brez zadnjega`, `U := cap20(U + [prejšnji P])` |
| Začetni vrstni red | `P ≠ P0` | `U := cap20(U + [P])`, `P := P0`, `R := []` |
| Neveljavno dejanje (rob, neznan ID, prazen sklad) | sicer | stanje nespremenjeno |
| Preklop pogleda, odprtje/zaprtje podrobnosti | vedno | `P`, `U`, `R` nespremenjeni |
| Menjava projekta, osvežitev | vedno | novo izhodišče `P := P0`, `U := R := []` |

Napake: branje podatkov ostaja odvisno od obstoječih `useResource`/`LoadError`
poti; nova funkcionalnost se ob napaki nalaganja ne prikaže (ni permutacije).

## Zahteve in pravila

Simbologi: `N = |P|`, `pos(id)` je indeks ID-ja v `P` (0..N-1), `swap(P,i,j)`
zamenja elementa, `P0` izhodišče, `cap20(X) = zadnjih 20 elementov X`.
Predpostavke: ID-ji so enkratni in pripadajo projektu; gumb je onemogočen, ko
pogoj dejanja ne velja, zato onemogočen klik ne spremeni stanja.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob začetku `P = P0`. Za vsak `id` velja `pos(id)+1 = prikazano globalno mesto`, 1..N; isti naslovi se ne povezujejo (identiteta je ID). | Lastni test T01: 12 opravil, enaki naslovi in Unicode; preglednica in tabla. |
| R02 | Premik gor: `P' = swap(P, pos(id)-1, pos(id))`; premik dol: `P' = swap(P, pos(id), pos(id)+1)`. Polja in statusi opravil ter števci stanj se ne spremenijo. | Lastni test T02; razvojni D01. |
| R03 | Če `pos(id)=0` (gor) oz. `pos(id)=N-1` (dol), je gumb onemogočen in dejanje ne spremeni `P`, `U` ali `R`. | Lastni T02/T04; razvojni D01. |
| R04 | Vsak veljaven premik: `U' = cap20(U + [P])`, `R' = []`. Razveljavitev: `P' = zadnji(U)`, `U' = U - zadnji`, `R' = R + [P]`. | Lastni T03/T05; razvojni D02. |
| R05 | Ponovitev: `P' = zadnji(R)`, `R' = R - zadnji`, `U' = cap20(U + [P])`. Zaporedja ohranijo vse ID-je brez izgube/podvajanja (permutacije). | Lastni T03; razvojni D02. |
| R06 | Veljaven premik nastavi `R' = []`. Neveljaven robni premik ne spremeni `R` (gumb je onemogočen). | Lastni T04; razvojni D03. |
| R07 | `|U| ≤ 20`; ob 21. premiku se najstarejša permutacija zavrže (`cap20`). Vse trenutno razveljavljene korake je mogoče ponoviti. | Lastni T05: 21 premikov, 20 razveljavitev, 20 ponovitev. |
| R08 | Ob `P ≠ P0` gumb vrne `P0` kot eno dejanje (`U' = cap20(U + [P])`, `R' = []`). Ob `P = P0` je onemogočen in ne spremeni zgodovine. | Lastni T06; razvojni D04. |
| R09 | Preglednica prikazuje `P`; tabla v vsakem stalnem stolpcu prikaže filtrirano podzaporedje `P` po statusu. Premiki na tabli uporabljajo globalnega soseda in prikažejo globalno mesto; status se ne spremeni. | Lastni T01/T02; razvojni D04. |
| R10 | Preklop pogleda ter odprtje/zaprtje podrobnosti ohranijo `P`, `U`, `R`. Menjava projekta in osvežitev nastavita `P = P0` ter `U = R = []`. Shramba je samo v pomnilniku. | Lastni T07; osvežitev pokrije tudi osvežitev strani. |
| R11 | `role=status` z `aria-label="Zgodovina vrstnega reda"` kaže `Razveljavitve: |U|. Ponovitve: |R|.`; gumba sta onemogočena pri ničli. Prazen projekt in projekt z enim opravilom ostaneta uporabna (gumbi onemogočeni). | Lastni T05–T08; razvojni D02/D03. |
| R12 | Vse spremembe so lokalne permutacije iste množice ID-jev; ni zahtev PATCH/POST na `/api/` in ni sprememb polj. Števci stanj, podrobnosti in prilagodljiv videz ostanejo. Pri 390 px se stran ne razširi. | Lastni T01/T02/T09; razvojni D04 (`readonly`). |

Splošna pravila veljajo za poljubne podatke; testni primeri so le primeri
izbranih vrednosti (npr. 12 opravil, 21 premikov) in ne izčrpajo domene.

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | začetni `P = P0`, mesta 1..N | T01 | `src/useTaskOrder.ts`, `src/App.tsx` (rank celica) | glej `docs/agent/verification.md` |
| R02 | zamenjava soseda, nespremenjena polja | T02, D01 | `src/useTaskOrder.ts` (`moveOrder`) | glej verification |
| R03 | rob je onemogočen | T02, D01 | `src/App.tsx`, `src/TaskBoard.tsx` (`disabled`) | glej verification |
| R04 | `U + [P]`, obnovitev `P` | T03, D02 | `src/useTaskOrder.ts` (`move`, `undo`) | glej verification |
| R05 | ponovitev in permutacije | T03, D02 | `src/useTaskOrder.ts` (`redo`) | glej verification |
| R06 | `R := []` ob premiku; rob ne | T04, D03 | `src/useTaskOrder.ts` (`move`) | glej verification |
| R07 | `|U| ≤ 20` | T05 | `src/useTaskOrder.ts` (`pushHistory`) | glej verification |
| R08 | reset kot dejanje, onemogočen pri `P0` | T06, D04 | `src/useTaskOrder.ts` (`reset`), `src/App.tsx` | glej verification |
| R09 | globalna/podzaporedna razporeditev | T01, T02, D04 | `src/App.tsx`, `src/TaskBoard.tsx` | glej verification |
| R10 | ohranitev in ponastavitev | T07 | `src/App.tsx` (`key={project.id}`), `src/useTaskOrder.ts` | glej verification |
| R11 | status in onemogočeni gumbi | T05–T08, D02, D03 | `src/App.tsx` (`role=status`) | glej verification |
| R12 | brez zapisov, odzivnost | T01, T02, T09, D04 | `src/App.tsx`, `src/styles.css` | glej verification |

## Odprta vprašanja in omejitve

- Končni (skriti) testi niso dostopni; tu so navedena samo lastna in razvojna
  preverjanja. Njihovih izidov ne navajam kot opravljenih.
- Razporeditev novih kontrol ni predpisana; izbrana je orodna vrstica nad
  seznamom, ki je vidna v obeh pogledih in pri praznem projektu.
- Sočasne spremembe podatkov brez osvežitve in navigacija med nalaganjem nista
  razširjeni prek obstoječih regresijskih zahtev; lokalna permutacija se
  ponastavi ob novem ključu prejetih ID-jev.
- Shramba je namerno samo v pomnilniku (brez `localStorage` in brez zapisov).

## Zgodovina sprememb specifikacije

- 2026-10-09: prva različica pred implementacijo.
