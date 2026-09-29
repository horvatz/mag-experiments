# P10 — specifikacija postopka A

## Problem in kontekst

Uporabnik želi lokalno urejati vrstni red opravil projekta ter premike
razveljaviti in ponoviti. Izhodiščni Folio prikazuje prejeto polje v
preglednici in po stalnih stolpcih stanj na tabli. Dodamo skupno lokalno
zgodovino vrstnega reda, ne da bi spremenili podatke opravil ali javni API.
Ohranimo slovenski vmesnik, navigacijo, podrobnosti in videz iz `docs/dizajn.md`.

## Vhodi, dejanja in izidi

- Vhod: polje `Task[]` iz GET `/api/projects/:id/tasks`; enkratni ID-ji,
  poljubno število zapisov, podvojeni naslovi, Unicode in veljavni datumi.
  Polja `projectId`, `title`, `description`, `status`, `assignee`, `dueDate`
  se pri urejanju ne spreminjajo.
- Premik gor/dol zamenja ID z neposrednim globalnim sosedom. Robni ali
  neobstoječi ID je brez učinka. Gumbe na robu onemogočimo.
- Razveljavitev in ponovitev obnovita celotno shranjeno permutacijo.
  Začetni vrstni red je novo dejanje samo, če je trenutni vrstni red drugačen.
- Preklop pogleda in odpiranje/zapiranje podrobnosti ohranita stanje;
  menjava projekta (tudi vrnitev) in osvežitev ustvarita novo začetno stanje.
- Ob nalaganju ali napaki ni aktivnih kontrol vrstnega reda. Obstoječe
  ponovno nalaganje ostane uporabno. Lokalna dejanja nimajo omrežnega
  shranjevanja, potrjevanja ali preklica; povratno dejanje je razveljavitev.

## Zahteve in pravila

Naj bo `I` izvorno zaporedje ID-jev, `P` trenutno zaporedje, `U` sklad
prejšnjih in `R` sklad razveljavljenih zaporedij. Vrh sklada je na desni.
`tail20` ohrani zadnjih največ 20 elementov; `·` pomeni dodajanje na konec.
Začetno stanje je `(I, I, [], [])`.

Invarianta: `len(P) = len(I) ∧ set(P) = set(I) ∧ distinct(P)`; ista
invarianta velja za vsako permutacijo v `U` in `R`. Vedno `0 ≤ len(U) ≤ 20`.
Globalno mesto ID-ja `x` je `index(P, x) + 1`.

- Premik: za `i = index(P,x)`, `d ∈ {-1,1}` in
  `0 ≤ i < len(P) ∧ 0 ≤ i+d < len(P)` dobimo
  `(I, swap(P,i,i+d), tail20(U·P), [])`; sicer ostane celotno stanje enako.
- Undo: če `U = U'·Q`, dobimo `(I,Q,U',R·P)`; pri praznem `U` brez učinka.
- Redo: če `R = R'·Q`, dobimo `(I,Q,tail20(U·P),R')`; pri praznem `R` brez učinka.
- Reset: če `P ≠ I`, dobimo `(I,I,tail20(U·P),[])`; sicer brez učinka.
- Tabla za stanje `s` prikazuje `filter(P, task(id).status = s)`.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetek sledi prejetemu polju; mesta 1..N pripadajo ID-jem. | Poljubni ID-ji, enaki naslovi, več kot deset zapisov. |
| R02 | Veljavni premik je globalna sosednja zamenjava; polja ostanejo ista. | Premiki gor/dol, primerjava vrstnega reda, podrobnosti in stanj. |
| R03 | Oba robova sta onemogočena; neveljavno dejanje ne spremeni niti zgodovine. | UI robovi in neposredni prehodi reduktorja za ponovljene/neznane ID-je. |
| R04 | Vsak veljavni premik shrani celo prejšnjo permutacijo; undo shrani P v R. | Več različnih premikov in zaporednih razveljavitev. |
| R05 | Redo obnovi zadnjo razveljavljeno permutacijo brez izgube ID-jev. | Več undo/redo z natančnimi pričakovanimi zaporedji. |
| R06 | Le novo veljavno dejanje počisti R. | Razvejitev po undo in robni poskus ob nepraznem R. |
| R07 | U hrani največ 20 korakov, vseh 20 je mogoče ponoviti. | 21 veljavnih premikov, 20 undo in 20 redo. |
| R08 | Reset je eno razveljavljivo dejanje; P=I je brez učinka tudi na R. | Reset, undo, redo ter reset ob izvorni permutaciji z zgodovino. |
| R09 | Preglednica sledi P; stalni stolpci table sledijo filtriranemu P. | Premik čez različni stanji in znotraj istega stanja, globalna mesta. |
| R10 | Stanje živi v naloženem seznamu trenutnega projekta. | Oba pogleda, podrobnosti, menjava projekta, vrnitev, osvežitev. |
| R11 | Status kaže točna U/R; gumbi so usklajeni; 0/1 opravil je uporabnih. | Števci po dejanjih, prazna projekta, posamezno opravilo. |
| R12 | Vse permutacije imajo isto množico ID-jev, polja in števce; ni zapisov. | Spremljanje omrežja, podrobnosti, invarianta; širina 390 px in Folio. |

Kontrole imajo točna dostopna imena iz navodil: `Premakni <id> gor/dol`,
`Mesto opravila <id>`, `Razveljavi premik`, `Ponovi premik`,
`Začetni vrstni red`. Status `Zgodovina vrstnega reda` ima besedilo
`Razveljavitve: U. Ponovitve: R.`. Premiki so zunaj povezav; `data-task-id`
in obstoječa dostopna imena ostanejo. Pri 390 px je dovoljeno samo notranje
vodoravno drsenje table/preglednice.

## Izvedba in sledljivost

Izvedba: čisti reduktor `src/taskOrder.ts`; stanje v naloženem
seznamu `src/ProjectTasks.tsx`; skupne kontrole `src/TaskOrderControls.tsx`;
projekcija table `src/TaskBoard.tsx`; prilagodljivi slogi `src/styles.css`.
`ProjectView` v `src/App.tsx` ostane vezan na ID projekta.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Izvorno zaporedje in globalna mesta po ID | A01, D01 | taskOrder: createTaskOrder; ProjectTasks: positions | Uspešno; check.log, A01. |
| R02 | Globalna sosednja zamenjava brez sprememb polj | A01/A03/A06, D01 | taskOrder: move; ProjectTasks: byId | Uspešno; check.log. |
| R03 | Robovi in neveljavni premiki brez učinka | A02/A03/A08, D01 | taskOrder: preverjanje meja; TaskMoveControls | Uspešno; check.log. |
| R04 | Cela prejšnja permutacija v U; undo | A03/A05, D02 | taskOrder: commit/undo | Uspešno; check.log. |
| R05 | Pravilni zaporedji undo/redo | A03/A04/A09, D02 | taskOrder: undo/redo | Uspešno; check.log. |
| R06 | Samo veljavno novo dejanje izbriše R | A02/A03, D03 | taskOrder: move/commit | Uspešno; check.log. |
| R07 | Največ 20 prejšnjih permutacij | A04/A09 | taskOrder: commit/redo, slice(-20) | Uspešno; check.log, A04: 21 premikov, 20 undo/redo. |
| R08 | Razveljavljiv reset, izvorni vrstni red brez učinka | A02/A05, D04 | taskOrder: reset/isInitialOrder | Uspešno; check.log. |
| R09 | Filtrirana projekcija globalnega reda | A06, D04 | ProjectTasks: orderedTasks; TaskBoard: entries/positions | Uspešno; check.log; posnetki obeh pogledov. |
| R10 | Ohranitev oziroma ponastavitev življenjske dobe stanja | A07; regresijski testi | App: ProjectView key; ProjectTasks: useReducer | Uspešno; check.log. |
| R11 | Števci, onemogočeni gumbi, 0/1 opravil | A03–A08 | OrderHistoryControls; TaskMoveControls; prazni prikazi | Uspešno; check.log. |
| R12 | Invarianta ID-jev, podatki, lokalnost in Folio | A01/A06/A07/A08/A09, D04; regresijski testi; vizualni pregled | byId; taskOrder; TaskBoard; styles.css | Uspešno v preverjenem obsegu; check.log in visual.log. |

Podrobna sledljivost, dejanski dnevniki in omejitve so v
[verification.md](verification.md).

## Odprta vprašanja in omejitve

- ID-ji so enkratni in opravila pripadajo projektu, kot določa vhodna domena.
- Sočasnih zunanjih sprememb brez osvežitve in navigacije med nedokončanim
  nalaganjem ne širimo preko obstoječih regresijskih zahtev.
- Končni skriti testi niso dostopni; razvojni testi niso popolna specifikacija.
- Omejitev izvedbe je 20 minut. Naloga je zaključena pred rokom;
  znanih neizpolnjenih zahtev ni. Preverjanje ni izčrpna enumeracija vseh vhodov.

## Zgodovina popravkov

- v1, 2026-09-26: začetna specifikacija, napisana pred spremembami kode.
- v2, 2026-09-26: dodani dejanski izidi in individualna sledljivost R01–R12;
  dodano preverjanje A09 (500 mešanih dejanj in nespremenljivost posnetkov).
  Dostopno ime kartice je sestavljeno neposredno iz naslova in ID-ja, da
  podpre tudi ID s presledkom brez neveljavnih referenc `aria-labelledby`.
  Sprejemni pogoji in obseg zahtev se niso spremenili.
