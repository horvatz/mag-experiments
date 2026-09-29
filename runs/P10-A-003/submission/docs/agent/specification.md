# P10 — specifikacija postopka A

## Problem in kontekst

Uporabnik želi lokalno prerazporejati opravila trenutnega projekta ter premike
razveljaviti in ponoviti. Izhodiščni Folio bere opravila prek `/api/`, omogoča
preglednico, tablo in podrobnosti. Dodatek ohrani slovenska poimenovanja,
obstoječi videz, podatkovna polja, povezave in števce stanj. Delo izvaja en agent.

## Vhodi, dejanja in izidi

Vhod je prejeto polje `Task[]`; vsak `id` je enkraten, `projectId` določa projekt.
Naslov, opis, status, oseba in rok ostanejo nedotaknjeni. Naslovi niso identiteta.
Veljavni so poljubna velikost polja, prazna projekta, Unicode in enaki naslovi.

Stanje: `I` je izvorno zaporedje ID-jev, `P` trenutna permutacija, `U` sklad
prejšnjih permutacij, `R` sklad ponovitev. Vrh sklada je na koncu; `tail20`
obdrži največ zadnjih 20 elementov. Inicializacija: `(P,U,R)=(I,[],[])`.

- Invarianta: `|P|=|I| ∧ set(P)=set(I) ∧ |set(P)|=|P|`; velja tudi za vse
  shranjene permutacije. `0 ≤ |U| ≤ 20` in polja opravil se ne spreminjajo.
- Premik ID-ja na indeksu `i` v smeri `d ∈ {-1,1}` je veljaven natanko, ko
  `0 ≤ i < N ∧ 0 ≤ i+d < N`. Tedaj `P'=swap(P,i,i+d)`,
  `U'=tail20(U+[P])`, `R'=[]`. Sicer je celotno stanje nespremenjeno.
- Razveljavitev pri `U≠[]`: `P'=last(U)`, `U'=init(U)`, `R'=R+[P]`.
- Ponovitev pri `R≠[]`: `P'=last(R)`, `R'=init(R)`, `U'=tail20(U+[P])`.
- Začetni vrstni red pri `P≠I`: `P'=I`, `U'=tail20(U+[P])`, `R'=[]`.
  Pri `P=I` je dejanje onemogočeno in ne spremeni niti zgodovine.
- Onemogočena razveljavitev/ponovitev je prav tako brez učinka.
- Tabla za status `s` prikazuje `filter(P, task.status=s)`, mesto pa je vedno
  `indexOf(P,id)+1`. Status se zaradi premika ne spremeni.
- Preklop pogleda ali odpiranje/zapiranje podrobnosti ohrani `(I,P,U,R)`.
  Menjava projekta in osvežitev ustvarita novo stanje iz novega GET odgovora.

Ni potrditve ali preklica premika: uspešen premik je takojšen, njegov preklic je
razveljavitev. Napake GET in ponovni poskus uporabljajo obstoječi vmesnik.
Med nalaganjem ni kontrol vrstnega reda. Ni zapisov API, shrambe ali novega URL stanja.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Prvi prikaz sledi prejetemu polju; mesto 1..N določa ID. | D01; A01 s premešanimi ID-ji, enakimi naslovi in >10 opravili. |
| R02 | Premik zamenja samo neposredna globalna soseda. | D01, D04; A01, A04 in primerjava polj. |
| R03 | Prvi gor/zadnji dol sta onemogočena; neveljavno dejanje je identiteta stanja. | D01; A02 in A07. |
| R04 | Vsak veljaven premik shrani celotno P; razveljavitev obnovi vrh U. | D02; A02, A03. |
| R05 | Ponovitev obnovi vrh R; več korakov ohrani vse ID-je. | D02; A02, A03. |
| R06 | Samo novo veljavno dejanje počisti R. | D03; A02 in A07. |
| R07 | Največ 20 razveljavitev; 21. izrine najstarejšo; vse razveljavljeno je ponovljivo. | A03 z več kot 20 premiki. |
| R08 | Ponastavitev na I je eno razveljavljivo dejanje; pri P=I je brez učinka. | D04; A02, A07. |
| R09 | Preglednica sledi P, stalni stolpci table filtrirajo P; premiki so globalni. | D04; A04. |
| R10 | Pogled/podrobnosti ohranijo obe zgodovini; projekt/osvežitev ju izbrišeta. | A04, A05; regresijski testi navigacije. |
| R11 | Status natančno kaže `Razveljavitve: U. Ponovitve: R.`; gumbi ustrezajo ničlam; N=0/1 deluje. | D03; A02, A03, A06. |
| R12 | Lokalna permutacija, isti podatki in števci, brez zapisov; Folio deluje pri 390 px. | D04; A01, A04, A06; izhodiščni testi in vizualni ogled. |

Kontrole ob opravilu bodo zunaj povezave: `Premakni <id> gor/dol` in element
`aria-label="Mesto opravila <id>"` s samo številko. Ohranijo se `data-task-id`,
imena pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`.
Zgodovina ima `role="status"` in `aria-label="Zgodovina vrstnega reda"`.

## Izvedba in sledljivost

Izvedba: čist reducer v `src/taskOrder.ts`; naloženi seznam v `src/TaskList.tsx`
hrani stanje z `useReducer`. Življenjska doba seznama sledi komponenti projekta,
ki je že ključena po ID-ju. Skupne kontrole `src/TaskMoveControls.tsx` uporabljata
preglednica in `src/TaskBoard.tsx`. Slogi so dopolnjeni v `src/styles.css`.
DOM ID-ji za dostopna imena kartic kodirajo ID opravila, da tudi presledki in
ločila v podatkovnem ID-ju ne pokvarijo povezav `aria-labelledby`.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | P=I ob nalaganju, mesto po ID | D01, A01 | [taskOrder: createTaskOrder](../../src/taskOrder.ts); [TaskList](../../src/TaskList.tsx), [TaskMoveControls](../../src/TaskMoveControls.tsx) | Uspešno; check-final.log, A01 in oba D01. |
| R02 | swap globalnih sosedov | D01, A01, A04 | [taskOrder: move](../../src/taskOrder.ts) | Uspešno; check-final.log, A01/A04/D01. |
| R03 | Rob/neznan ID: brez spremembe | D01, A02, A07 | [taskOrder: validacija](../../src/taskOrder.ts); [TaskMoveControls: disabled](../../src/TaskMoveControls.tsx) | Uspešno; check-final.log, A02/A07/D01. |
| R04 | U vsebuje celotne permutacije | D02, A02, A03 | [taskOrder: remember/undo](../../src/taskOrder.ts) | Uspešno; check-final.log, A02/A03/D02. |
| R05 | R je sklad za redo | D02, A02, A03 | [taskOrder: redo](../../src/taskOrder.ts) | Uspešno; check-final.log, A02/A03/D02. |
| R06 | Veljavno novo dejanje izbriše R | D03, A02, A07 | [taskOrder: remember](../../src/taskOrder.ts) | Uspešno; check-final.log, A02/A07/D03. |
| R07 | Dolžina U največ 20 | A03 | [taskOrder: remember, slice(-20)](../../src/taskOrder.ts) | Uspešno; A03 preveri 25 različnih premikov in vseh 20 undo/redo korakov. |
| R08 | Reset je pogojno novo dejanje | D04, A02, A03, A07 | [taskOrder: reset](../../src/taskOrder.ts); [TaskList: disabled](../../src/TaskList.tsx) | Uspešno; check-final.log, A02/A03/A07/D04. |
| R09 | filter(P,status), globalno mesto | D04, A04 | [TaskBoard: positions, entries](../../src/TaskBoard.tsx) | Uspešno; A04 preveri premik med različnima in istima statusoma. |
| R10 | Življenjska doba stanja po projektu | A04, A05, baseline | [App: ProjectView key](../../src/App.tsx); [TaskList: useReducer](../../src/TaskList.tsx) | Uspešno; check-final.log, A04/A05 in baseline navigacija. |
| R11 | Števci, disabled, N≤1 | D03, A02, A03, A06 | [TaskList: orodna vrstica](../../src/TaskList.tsx); [TaskMoveControls](../../src/TaskMoveControls.tsx) | Uspešno; A06 preveri oba prazna projekta in eno opravilo; A03 števce vsakega koraka. |
| R12 | Nespremenjena polja/API/videz | D04, A01, A04, A06, baseline, vizualni ogled | [TaskList](../../src/TaskList.tsx), [TaskBoard](../../src/TaskBoard.tsx), [styles](../../src/styles.css) | Uspešno; check-final.log, visual-check.json in štirje pregledani posnetki. |

Dejanski ukazi, rezultati in omejitve so v [verification.md](verification.md).
Testi A01–A07 so v [tests/agent/P10.spec.ts](../../tests/agent/P10.spec.ts);
D01–D04 so skupni razvojni testi, uspešno izvedeni na namizju in mobilnem zaslonu.
Celoten dokaz zagona je [check-final.log](check-final.log).

## Odprta vprašanja in omejitve

Ni vsebinskih odprtih vprašanj. Osvežitev pomeni osvežitev strani. Sočasne zunanje
spremembe brez osvežitve ter nova pravila navigacije med nalaganjem niso v obsegu.
Končni skriti testi niso dostopni in ne bodo navedeni kot opravljeni. Časovna
omejitev je 20 minut; dovoljene spremembe so samo src/, tests/agent/, docs/agent/.

## Zgodovina sprememb specifikacije

- V1, 2026-09-24: začetna specifikacija pred implementacijo; rezultati še niso izvedeni.
- V2, 2026-09-24: po izvedbi dopolnjena sledljivost z dejanskimi imeni funkcij,
  uspešnimi testi in dokazi; pojasnjeno kodiranje DOM ID-jev. Sprejemni pogoji
  R01–R12 in obseg niso spremenjeni. Rezultati V1 niso bili retroaktivno pripisani.
