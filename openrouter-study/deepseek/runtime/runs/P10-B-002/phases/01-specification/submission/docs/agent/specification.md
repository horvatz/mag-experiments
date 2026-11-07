# Specifikacija P10 – lokalni vrstni red z razveljavitvami

Različica: 1.0 (predaja implementerju)
Avtor: specifikacijski agent (postopek B)
Podlaga: task/instructions.md, task/specification-template.md, PROJECT_RULES.md,
shared/types.ts, src/App.tsx, src/TaskBoard.tsx, src/components.tsx,
src/TaskDetails.tsx, src/navigation.ts, src/useResource.ts,
tests/development/P10.spec.ts in tests/development/helpers.ts.

## Problem in kontekst

Uporabnik želi v Folio pregledu opravil ročno določiti vrstni red opravil
znotraj trenutnega projekta, ga razveljaviti, ponoviti in vrniti na izhodišče.
Spremembe so lokalne permutacije istih ID-jev: polja opravil, statusi in
podatki na strežniku ostanejo nespremenjeni, stanje pa ni trajno shranjeno.
Obstoječi videz, pogledi, stolpci in slovenska poimenovanja se ohranijo.

Izhodišče: `ProjectView` v `src/App.tsx` bere opravila projekta prek
`useResource<Task[]>(/api/projects/:id/tasks)` in jih prikaže v preglednici
(`<tr data-task-id=...>`) ali na tabli (`<li data-task-id=...>` znotraj
`src/TaskBoard.tsx`). Vrstni red prikaza je enak prejetemu polju. Dodati je
treba gumbe za premik/razveljavitev/ponovitev/izhodišče in števec zgodovine.

## Vhodi, dejanja in izidi

Podatki (`shared/types.ts`): `Task { id, projectId, title, description,
status: todo | in_progress | done, assignee, dueDate }`. Branje samo prek
javnega API-ja `/api/` (`src/api.ts`); testnih kontrol `/__test/` UI ne uporablja.
Ključ identitete je `id`; naslovi se nikoli ne uporabljajo za povezovanje.
Vsako opravilo pripada svojemu projektu.

Stanje vrstnega reda za trenutni projekt (lokalno, v komponenti, ki se ob
menjavi projekta ponovno vzpostavi – `ProjectView key={project.id}`):

- `P`: trenutna permutacija ID-jev; `P0`: permutacija ob nalaganju (vrstni red
  prejetega polja); `ids`: množica ID-jev projekta; `n = |P|`.
- `U`: sklad prejšnjih permutacij za razveljavitev, omejen na 20.
- `R`: sklad razveljavljenih permutacij za ponovitev.

Dejanja: `Premakni <id> gor`, `Premakni <id> dol`, `Razveljavi premik`,
`Ponovi premik`, `Začetni vrstni red`.

Izidi: veljavno dejanje spremeni `P` in/ali zgodovino po spodnjih pravilih;
neveljavno dejanje (rob, prazen sklad, ponovljen klik) pusti `P`, `U` in `R`
nespremenjene. Napake branja API-ja so obstoječi `LoadError`; novih napisnih
klicev ni.

## Predikati in pravila prehoda stanja

- `perm(Q)`: `Q` vsebuje natanko elemente `ids`, vsakega enkrat (brez izgube
  ali podvajanja).
- `pos(Q, id)`: indeks edine pojavitve `id` v `Q`.
- `valid(Q, id, up)`: `id ∈ ids ∧ pos(Q,id) > 0`; `valid(Q, id, down)`:
  `id ∈ ids ∧ pos(Q,id) < |Q|-1`.
- `swapped(Q, id, up)`: `Q` z zamenjanima elementoma na `pos(Q,id)` in
  `pos(Q,id)-1`; `down` analogno s `pos(Q,id)+1`.
- `cap20(U)`: če `|U| > 20`, obdrži zadnjih 20 elementov.
- `push(U, Q) = cap20(U ++ [Q])`.

Prehodi (stanje `(P, U, R)`):

- `move(id, dir)`: če `valid(P, id, dir)`, potem
  `(swapped(P,id,dir), push(U, P), [])`; sicer stanje nespremenjeno.
- `undo()`: če `U ≠ []`, potem `(U.last, U.brez zadnjega, R ++ [P])`;
  sicer nespremenjeno.
- `redo()`: če `R ≠ []`, potem `(R.last, push(U, P), R.brez zadnjega)`;
  sicer nespremenjeno.
- `reset()`: če `P ≠ P0`, potem `(P0, push(U, P), [])`; če `P = P0`, je gumb
  onemogočen in stanje nespremenjeno.

Invariante po vsakem koraku: (I1) `perm(P)`; (I2) vsak element `U` in `R` je
permutacija `ids`; (I3) `|U| ≤ 20`; (I4) noben ID se ne izgubi ali podvoji;
(I5) polja opravil in `status` se ne spreminjajo.

## Zahteve in pravila

Splošno pravilo velja za vsak projekt in poljubno število opravil `n ≥ 0`;
posamezni primeri so le primeri, ne celoten obseg.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | `P = P0 = ids`; vsak element prikazuje globalno mesto `pos(P,id)+1` v 1..n; enaki naslovi ostanejo ločena opravila (ključ `id`). | Test začetnega vrstnega reda, mest 1..n in dveh enakih naslovov. |
| R02 | `move(id, up/down)` zamenja opravilo z neposrednim globalnim predhodnikom/naslednikom; vsa polja `Task` in `status` ostanejo enaki. | Test premika gor/dol in primerjava polj pred/po. |
| R03 | `valid` določa omogočenost gumbov: prvo opravilo ne more gor, zadnje ne dol. Neveljaven ali ponovljen robni klik: `P`, `U`, `R` nespremenjeni, brez vpisa. | Test onemogočenih gumbov na robu in nespremenjene zgodovine. |
| R04 | Veljaven `move`: `U.push(P)` (prejšnja celotna permutacija), `R = []`, `P = swapped`. `undo()` obnovi zadnjo prejšnjo permutacijo in trenutno shrani v `R`. | Test zaporedja: premik, razveljavi, preverjanje obeh skladov. |
| R05 | `redo()` obnovi zadnjo razveljavljeno permutacijo in trenutno doda v `U`. Več zaporednih razveljavitev in ponovitev ohrani vrstni red brez izgube/podvajanja ID-jev. | Test več ciklov undo/redo in `perm(P)`. |
| R06 | Nov veljaven `move` po razveljavitvi zavrže `R` (`R = []`). Neveljaven robni `move` `R` ohrani. | Test: undo, nato nov premik; gumb Ponovi onemogočen, števec 1/0. |
| R07 | `U` hrani največ 20 prejšnjih permutacij; ob 21. veljavnem premiku `cap20` zavrže najstarejšo. Ponovitve pokrijejo vse trenutno razveljavljene korake. | Test 21 premikov (meja 20), nato undo vseh in redo vseh. |
| R08 | `reset()` doda `P` v `U`, nastavi `P = P0` in počisti `R` kot eno dejanje. Če `P = P0`, je gumb onemogočen in zgodovina nespremenjena. | Test gumba po premiku, po razveljavitvi in ob že izvornem redu. |
| R09 | Preglednica prikazuje globalni vrstni red `P`; tabla prikaže `P`, filtriran po stalnih stolpcih `Pripravljeno`, `V delu`, `Končano` (relativni vrstni red znotraj stolpca sledi `P`). Premiki na tabli uporabljajo globalnega soseda, pokažejo globalno mesto, ne spremenijo statusa. | Test table: premik spremeni globalno mesto; statusi in stolpci nespremenjeni. |
| R10 | Preklop pogleda in odpiranje/zapiranje podrobnosti (sprememba hash poti) ohranita `P`, `U`, `R`. Menjava projekta ali osvežitev ponastavi na `P0` tega projekta. Ni trajne shrambe (brez localStorage/URL stanja vrstnega reda). | Test preklopa pogleda, odprtja/zaprtja podrobnosti, menjave projekta in ponovnega nalaganja. |
| R11 | Element `role=status` z `aria-label="Zgodovina vrstnega reda"` kaže točno `Razveljavitve: U. Ponovitve: R.`; gumba sta onemogočena pri ničli in usklajena s števcem. Prazen projekt in projekt z enim opravilom ostaneta uporabna brez dovoljenega premika. | Test točnega besedila, onemogočenih gumbov, n=0 in n=1. |
| R12 | Vse spremembe so lokalne permutacije iste množice ID-jev; ni zapisov na API in ni sprememb polj; števci stanj in podrobnosti ostanejo pravilni; Folio videz in 390 px brez vodoravnega drsenja strani sta ohranjena. | `readonly` preverjanje (brez ne-GET klicev, `saveRequests=0`, `scrollWidth <= innerWidth`) in primerjava polj/števcev. |

## Dogovor o vmesniku (obvezna dostopna imena)

- Ob vsaki vrstici/kartici: gumba z dostopnima imenoma točno
  `Premakni <id> gor` in `Premakni <id> dol`, ločena od povezave opravila
  (klik nanju ne odpre podrobnosti). `data-task-id` ostane na `<tr>` in `<li>`.
- Globalno mesto: element z `aria-label="Mesto opravila <id>"`, besedilo je
  globalna številka `pos(P,id)+1`; viden v obeh pogledih.
- Gumbi z imeni točno `Razveljavi premik`, `Ponovi premik`,
  `Začetni vrstni red`.
- `role=status`, `aria-label="Zgodovina vrstnega reda"`, besedilo točno
  `Razveljavitve: U. Ponovitve: R.` (s končno piko).
- Obstoječe poglede in stolpce ohraniti: gumba `Preglednica`/`Tabla` z
  `aria-pressed`, `aria-label="Pregled stanj opravil"`, `Tabla opravil`,
  `Pripravljeno`, `V delu`, `Končano`, povezave opravil in podrobnosti.
- Pri 390 px se cela stran ne razširi; notranje drsenje `.table-scroll` in
  `.board-scroll` je dovoljeno. Razporeditev novih kontrol ni predpisana.

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | začetni `P = P0`, mesta 1..n | razvojni D01/D04 + lastni test začetka | `src/App.tsx` (ProjectView), `src/TaskBoard.tsx` | dopolni implementer z dejanskim izidom |
| R02 | zamenjava soseda, polja nespremenjena | razvojni D01 + lastni test polj | `src/App.tsx`, `src/TaskBoard.tsx` | dopolni implementer |
| R03 | rob onemogočen, brez vpisa | razvojni D01 + lastni test zgodovine | `src/App.tsx` | dopolni implementer |
| R04 | `U.push(P)`, `R=[]` ob premiku; undo | razvojni D02 + lastni test skladov | `src/App.tsx` | dopolni implementer |
| R05 | redo vrne in doda v `U` | razvojni D02 + lastni test več ciklov | `src/App.tsx` | dopolni implementer |
| R06 | nov premik zavrže `R` | razvojni D03 | `src/App.tsx` | dopolni implementer |
| R07 | največ 20, cap najstarejšega | lastni test 21 premikov | `src/App.tsx` | dopolni implementer |
| R08 | reset kot eno dejanje, sicer onemogočen | razvojni D04 + lastni test | `src/App.tsx` | dopolni implementer |
| R09 | tabla globalni sosed, statusi nespremenjeni | razvojni D04 + lastni test stolpcev | `src/TaskBoard.tsx` | dopolni implementer |
| R10 | hash spremembe ohranijo, projekt/refresh resetira | lastni test preklopov in menjave | `src/App.tsx`, `src/navigation.ts` | dopolni implementer |
| R11 | števec in prazna projekta | razvojni D03 + lastni test n=0/n=1 | `src/App.tsx` | dopolni implementer |
| R12 | brez zapisov, polja/števci nespremenjeni | `readonly` iz helpers.ts + lastni test | `src/App.tsx`, `src/TaskBoard.tsx` | dopolni implementer |

Rezultati v zadnjem stolpcu so zahtevani od implementerja; specifikacijski agent
testov ni zagnal, zato noben izid ni označen kot uspešen.

## Predpostavke

- ID-ji opravil so v projektu enkratni; `ids` je množica, `pos` dobro definiran.
- Vrstni red ob nalaganju je vrstni red prejetega polja; retry/refresh naloži
  sveže podatke in ponastavi `P` na novi `P0`.
- Sočasne spremembe podatkov na strežniku in navigacija med nalaganjem niso
  del obsega; stanje je lokalno trenutnemu projektu.
- `n=0`: ni gumbov za premik, vsi gumbi zgodovine onemogočeni, števec 0/0.
  `n=1`: oba premika onemogočena, stran uporabna, zgodovina 0/0.
- Naslovi so lahko enaki ali Unicode; za imena in ključe se uporablja `id`.

## Odprta vprašanja in omejitve

- Končni skriti testi niso na voljo; brati je bilo mogoče le razvojne
  D01–D04. Implementer mora navesti dejansko izvedene teste in dokaze.
- Točna postavitev novih kontrol ni predpisana, mora pa ohraniti Folio in
  zahteve dostopnosti zgoraj.
