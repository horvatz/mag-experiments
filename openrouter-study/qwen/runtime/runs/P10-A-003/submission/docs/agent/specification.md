# Specifikacija: Lokalni vrstni red z razveljavitvami (P10)
## Problem in kontekst

**Namen:** Implementirati lokalni algoritem za menjavo vrstnega reda opravil z možnostmi razveljavitve in ponavljanja premikov.

**Izhodiščno stanje:** Obstoječe Folio aplikacijo z delovnim pogledom. Opravila so navedena v dveh prikazih: tabela (globalni vrstni red) in tabla (vrstni red po stanjih). Trenutno ni funkcionalnosti za manipulacijo vrstnega reda ali zgodovine sprememb.

**Pričakovana sprememba:** Dodati interaktivno kontrolo za premikanje opravil s sledenjem zgodovine premikov, razveljavitvami, ponavljanji in vračanjem začetnega vrstnega reda, brez sprememb v vireh podatkov ali statusih opravil.

---

## Vhodi, dejanja in izidi

### Podatkovni vhodi
- Poljubna množica opravil (Task[]) z enkratnimi ID-ji iz istega projekta
- Podatki so narejeni z javnega vmesnika /api/projects/{id}/tasks

### Dovoljena dejanja (prek UI gumbi)
- Premakni id gor: izmenjava opravila z neposrednim globalnim predhodnikom
- Premakni id dol: izmenjava opravila z neposrednim globalnim naslednikom
- Razveljavi premik: vrne zadnjo shranjeno permutacijo
- Ponovi premik: obnovi zadnjo razveljavljeno permutacijo
- Začetni vrstni red: vrne izvorno permutacijo (kot novo razveljavljivo dejanje)

### Izidi po vsakem dejanju
- Uspeh: Novo vrstni red se odrazi v vmesniku; zgodovina se posodobi
- Prekliči: Neveljavno dejanje (ob robu) potiska obvestilo, vrstni red ostane enak

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob začetku je vrstni red enak prejetemu polju. Vsako opravilo ima prikazano globalno mesto od 1 do N po svojem ID-ju; enaki naslovi se ne povezujo. | Testno gibanje: osvežitev od API-a; pregled data-task-id atributov in značilnosti Mesto opravila |
| R02 | Gumb Premakni id gor zamenja opravilo z neposrednim globalnim predhodnikom; Premakni id dol z neposrednim naslednikom. Polja opravil in status ostanejo nespremenjeni. | Preverjanje API odzivov, preverjanje title, status, assignee ostane nespremenjen v Task[] |
| R03 | Premik gor za prvo oziroma dol za zadnje opravilo je onemogočen. Neveljaven ali ponovljen robni dejanje ne spremeni vrstnega reda in ne doda zgodovine. | Testno gibanje: gumb za prvo opravilo naj bo onemogočen; klik na onemogonjen gumb naj vrne vrstni red enak začetnemu |
| R04 | Vsak veljaven premik doda prejšnjo celotno permutacijo v zgodovino razveljavitv. Gumb Razveljavi premik obnovi zadnjo prejšnjo permutacijo in trenutni vrstni red shrani za ponovno izvedbo. | Preverjanje zgodovinskega vmesnika /__test/state, potrditev z expectIds po razveljavi |
| R05 | Gumb Ponovi premik obnovi zadnjo razveljavljeno permutacijo. Več razveljavitev in ponovitve ohrani pravilni zaporedji brez izgube ali podvajanja ID-jev. | Seznam ID-jev in vrstni red po vec zaporednih undo redo undo |
| R06 | Nov veljaven premik po razveljavitvi zavrže vso zgodovino ponovitev. Neveljaven premik na robu zgodovine ponovitev ne zavrže. | Preverjanje zgodovine po undo move redo ni vec na voljo; preverjanje robnih primerov |
| R07 | Hrani se največ 20 prejšnjih permutacij za razveljavitev; ob 21. veljavnem premiku se zavrje najstarejsa. Ponovitve delujejo za vse trenutno razveljavljene korake. | Test z 21+ premiki, preverjanje zgodovinskega in Redo |
| R08 | Gumb Začetni vrstni red vrne izvorno permutacijo kot eno novo razveljavljivo dejanje in pocisti ponovitve. Ce je vrstni red ze izvoren, je gumb onemogocen in ne spreminja zgodovine. | Preverjanje po kliku na Reset undo redo vrne prvotno; gumb naenkrat onemogocen |
| R09 | Preglednica prikazuje globalni vrstni red, tabla pa njegov relativni vrstni red znotraj stalnih stolpcev stanja. Na tabli premiki se vedno uporabljajo globalnega soseda, kar pokaže globalno mesto; ne spreminja status. | Enaki naslovi v tabeli in tabli omogocata globalni razred; izvorna podrobost ostane vidna |
| R10 | Preklop pogleda in odpiranje/zapiranje podrobnosti ohranita vrstni red ter obe zgodovini. Menjava projekta in osvežitev vse ponastavita na njegovo izhodiše. Podatki se ne shranjujejo trajno. | window.location.hash za vrstice; API odzivi se ne spreminjajo pri spremembah pogleda |
| R11 | Stevec kaze Razveljavitve: U. Ponovitve: R. in je usklajen z gumboma, ki sta onemogocena pri nicli. Prazen projekt in projekt z enim opravilom ostaneta uporabna brez dovoljenega premika. | Element role=status z vsebino Razveljavitve: {cnt}. Ponovitve: {cnt}. |
| R12 | Vse spremembe so lokalne permutacije iste mnozice ID-jev; ni zapisov na API ali sprememb polj. Stevci stanj in pravilne podrobnosti ostanejo enaki, prilagodljiv Folio je ohranjen. | Preverjanje z /__test/state za vpisov 0; readonly() testi |

---

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Zacetni tasks iz API-a se prikaze v tasks seznamu z globalnim indeksom 1..N | Mount s tests/agent/P10-m01.spec.ts expectIds | TaskBoard.tsx sortableRank | ID-ji [web-01, web-02, ...] v vrstnem redu odprte vrstice |
| R02 | moveSwap(i) izmenjava tasks[i] in tasks[i±1] oz. tasks[i-1] in tasks[i+1] | tests/agent/P10-rm02.spec.ts click(Premakni 02 gor) expectIds([web-02,...]) | TaskBoard.tsx handleMove | Odziv vmesnika; readonly() vrne prazen zapis |
| R03 | Robni pogoji: i === 0 ali i === N-1 disabled | Mount z enim elementom ali dvema zadnjima elementoma testno kliki | TaskBoard.tsx canMoveUp(i)/canMoveDown(i) | toBeDisabled() v expect |
| R04 | history.push(permutation.clone()) po veljavnem premiku; undo() vrne history.pop(), shrani trenutno v redoStack | tests/agent/P10-hand04.spec.ts | TaskBoard.tsx handleUndo/handleRedo | /__test/state undoStack: [...], redoStack: [...] |
| R05 | redoStack.push(currentPermutation) po vsakem undo(); redo() izvade vse redoStack vrstice | tests/agent/P10-hand05.spec.ts | TaskBoard.tsx redoStack logiko | expectIds po undo redo undo redo vrne prvotni |
| R06 | newMove() redoStack = []; rob (!canUndo()) history ni spreminjan | tests/agent/P10-hand06.spec.ts | TaskBoard.tsx handleUndo | undoStack z push vs. robno preverjanje |
| R07 | undoStack.length > MAX_HISTORY undoStack.shift().push() | tests/agent/P10-hand07.spec.ts | TaskBoard.tsx MAX_HISTORY = 20 | 21 premik + undo vrne 20 zadnjih stanj |
| R08 | resetToOriginal() undoStack.push(original); redoStack = []; gumb onemogocen, ce undoStack[0] === original | tests/agent/P10-hand08.spec.ts | TaskBoard.tsx resetView(), originalOrder | reset undo = prvotna permutacija; disabled gumb |
| R09 | view: table globalna vrstica, view: board relativno; premiki uporabi globalni red | tests/agent/P10-rm09.spec.ts | TaskBoard.tsx handleMove | ID obnasanje enakost v Preglednica vs. Tabla po spremembi |
| R10 | hashchange ohrani undoStack/redoStack; projectNavigation ali location.reload() reset na originalOrder, undoStack = [], redoStack = [] | tests/agent/P10-rm10.spec.ts | ProjectView.tsx key=projectId; useResource | Stevec vrne 0,0 po menjavi projekta; undoStack[0].length === original |
| R11 | undoCount = undoStack.length, redoCount = redoStack.length Zgodovina... {undoCount}, {redoCount} | tests/agent/P10-rm11.spec.ts | ProjectView.tsx undoCount, redoCount | Element role=status z Razveljavitve: 0. Ponovitve: 0. |
| R12 | Vse PATCH/POST API-ji ostanejo enakost; vse spremembe je sort v Task[] lokalno in ni localStorage.setitem | tests/agent/P10-rm12.spec.ts, readonly() | TaskBoard.tsx handleMove; src/ ni odvisnih | /__test/state za saveRequests: 0 |


---

## Odprta vprašanja in omejitve

- **Nepreverjeni scenariji:** Odprava manjkajocih API odzivov (404) v readonly()
- **Omejitev:** Vmesnik ne uporablja API za PATCH/POST za spremembe vrstnega reda; vse spremembe so v client-side sort
- **Podpora za Unicode:** Preverjeno v testnih podatkih, a ni izrecno testirano z dolgo besedilom
- **Korektnost pomnilnika za Redo po resetu:** ni izrecno preverjen v testih
- **Testni podatki z launch projektom:** R09 in R10 sta potrdili z launch projekti

