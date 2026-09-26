# P10 — Lokalni vrstni red z razveljavitvami

Datum: 2026-09-26. Različica: 1.1. Status: implementirano in lokalno preverjeno.

## Problem in kontekst

Uporabnik želi v trenutnem projektu Folio začasno spreminjati vrstni red opravil, premike razveljaviti in ponoviti ter se vrniti na prejeto zaporedje. Izhodišče bere projekte in opravila prek `/api/`, prikazuje preglednico ali tablo s stalnimi stolpci stanj in odpira podrobnosti po ID-ju. Kontrol vrstnega reda še nima.

Dopolnitev ohrani potrjeni [dizajn Folio](../../dizajn.md), obstoječo navigacijo, slovenska imena, podatkovna polja in infrastrukturo. Izvirno merilo so [R01–R12](../../../task/instructions.md), [projektna pravila](../../../PROJECT_RULES.md) in [ustava](../../../.specify/memory/constitution.md). Ta dokument izpolnjuje vse rubrike [skupne predloge](../../../task/specification-template.md); rezultati implementacije se bodo dopolnili v spodnji sledljivosti.

## Vhodi, dejanja in izidi

Vhod je polje `Task[]` iz `GET /api/projects/{projectId}/tasks` v prejetem vrstnem redu. `Task` ima `id`, `projectId`, `title`, `description`, `status`, `assignee`, `dueDate`; identiteto določa izključno enkratni `id`. Status je `todo`, `in_progress` ali `done`. Projekti prihajajo iz `GET /api/projects`, podrobnosti iz `GET /api/tasks/{id}`. Obstoječe tipe in poti ohranimo.

Domena vključuje nič, eno, več kot deset in poljubno drugo število opravil, drugačne ID-je, enake naslove, Unicode in ločila ter veljavne koledarske datume. Vsako opravilo pripada svojemu projektu; tudi oba projekta sta lahko prazna. Nove funkcije ne predpostavljajo konkretnih naslovov, ID-jev, števila ali začetne razvrstitve.

Dovoljena dejanja so premik za eno globalno mesto gor/dol, razveljavitev, ponovitev in vrnitev na začetni vrstni red. Uspeh spremeni samo lokalni vrstni red in zgodovino. Neveljavno oziroma onemogočeno dejanje je brez učinka. Novih potrditvenih dialogov ali preklicev ni; zaprtje podrobnosti, tudi s tipko Escape, ohrani vrstni red. Napake branja in ponovni poskus ohranijo obstoječe vedenje nalaganja; nova dejanja ne pošiljajo zapisov in nimajo strežniške potrditve. Stanje se ne shranjuje v URL, localStorage ali drugo trajno shrambo.

## Zahteve in pravila

### Model stanja in predikati

Za uspešno naložen trenutni projekt naj bo `T` nespremenjena preslikava ID → opravilo, `I` začetno zaporedje ID-jev iz prejetega polja, `O` trenutno zaporedje, `H` sklad preteklih celotnih permutacij in `F` sklad ponovitev. Vrhnji element sklada je zadnji; `[]` je prazen sklad. `N = |I|`, `U = |H|`, `R = |F|`. `push20(H,O)` pripne kopijo `O` ter obdrži zadnjih največ 20 elementov. Enakost zaporedij primerja ID-je na vseh mestih.

Vedno velja `|O| = N ∧ set(O) = set(I) ∧ |set(O)| = N`; isto velja za vsako zaporedje v `H` in `F`. `T` ostane enak, `0 ≤ U ≤ 20`. Prikazano mesto opravila `id` je `index(O,id)+1`.

| Dogodek in predpogoj | Naslednje stanje `(O,H,F)` |
| --- | --- |
| Prvi uspešni prejem opravil, menjava projekta ali osvežitev | `(I, [], [])`, pri čemer `I` pripada novo naloženemu projektu |
| `move(id,d)`, `d ∈ {-1,+1}`, `i=index(O,id)`, `0 ≤ i < N ∧ 0 ≤ i+d < N` | `(swap(O,i,i+d), push20(H,O), [])` |
| Premik brez veljavnega ID-ja ali globalnega soseda | Brez sprememb, tudi če `F` ni prazen |
| Razveljavitev, `H ≠ []` | `(last(H), pop(H), F ⧺ [O])` |
| Ponovitev, `F ≠ []` | `(last(F), push20(H,O), pop(F))` |
| Začetni vrstni red, `O ≠ I` | `(I, push20(H,O), [])` |
| Razveljavitev pri `H=[]`, ponovitev pri `F=[]`, začetni red pri `O=I` | Brez sprememb |
| Menjava preglednica/tabla, odprtje/zaprtje podrobnosti | Brez sprememb |

Skladi vsebujejo samostojne posnetke celotnih zaporedij. Ponovitev mora biti na voljo za vsak trenutno razveljavljen korak; prehodi ne izgubijo ali podvojijo ID-jev. Vrnitev na začetno zaporedje je eno novo dejanje, ne praznjenje razveljavitev.

### Sprejemni pogoji

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | `O=I` ob začetku; vsak ID ima globalno mesto 1…N; enaki naslovi ostanejo neodvisni. | S01: drugačen vhodni red, ID-ji in podvojeni naslovi; primerjava zaporedja in vseh mest. |
| R02 | Veljavni premik zamenja samo neposredna globalna soseda; vsa polja in status ostanejo enaki. | S02: premik gor/dol v preglednici in tabli, primerjava ID-jev ter podatkov. |
| R03 | Gor za globalno prvega in dol za globalno zadnjega sta onemogočena. Ponovljeno robno dejanje ne spremeni `O,H,F`. | S02/S03: obe meji, tudi pri nepraznem `F`; preverjanje gumbov in števcev. |
| R04 | Veljaven premik shrani celotno prejšnjo permutacijo; undo jo obnovi in prenese trenutno v `F`. | S03: več različnih premikov in razveljavitev, primerjava celih zaporedij. |
| R05 | Redo obnovi zadnje razveljavljeno zaporedje in prejšnjega doda v `H`. | S03: več zaporednih undo/redo, brez manjkajočih ali podvojenih ID-jev. |
| R06 | Nov veljaven premik počisti ves `F`; neveljaven robni premik ga ohrani. | S03: razvejitev po več undo, posebej robno dejanje pred redo. |
| R07 | `U≤20`; 21. veljavno dejanje izloči najstarejši posnetek. Vsi razveljavljeni koraki so ponovno izvedljivi. | S04: vsaj 21 premikov, 20 undo, meja undo in 20 redo s preverjanjem zaporedij. |
| R08 | Reset pri `O≠I` obnovi `I`, doda eno razveljavitev in počisti `F`. Pri `O=I` je onemogočen in brez učinka. | S05: reset po premikih in po undo, undo/redo reseta, onemogočen reset z obstoječim `F`. |
| R09 | Preglednica kaže `O`; stolpec statusa `s` kaže podzaporedje `filter(O,T[id].status=s)`. Mesta in premiki so globalni. | S06: soseda različnih statusov; primerjava relativnega reda v vseh stalnih stolpcih in globalnih mest. |
| R10 | Pogled in podrobnosti ohranijo `(O,H,F)`. Menjava projekta, tudi povratek v prejšnjega, ter osvežitev obnovijo njegovo `I` in prazni zgodovini. | S07: oba sklada neprazna ob preklopih, podrobnosti po ID-ju, menjava projekta in ponovni obisk, osvežitev. |
| R11 | Status kaže natanko `Razveljavitve: U. Ponovitve: R.`; undo je onemogočen natanko pri `U=0`, redo pri `R=0`. Pri N=0 ali N=1 ni dovoljenega premika. | S01/S03/S08: števec po vsakem dejanju, prazen in enočlenski projekt, uporabna navigacija in pogleda. |
| R12 | Vse spremembe so lokalne permutacije istih ID-jev, brez zapisov na API ali sprememb polj. Števci stanj in podrobnosti ostanejo pravilni; Folio je prilagodljiv. | S06/S07/S08: spremljanje zahtev, primerjava polj in števcev, podrobnosti po premiku, 390 px, regresije Folia. |

### Dogovor o vmesniku

- Vsaka vrstica in kartica ohrani `data-task-id`. Ob opravilu sta gumba z dostopnima imenoma `Premakni <id> gor` in `Premakni <id> dol`, zunaj povezave do podrobnosti. Element `aria-label="Mesto opravila <id>"` vsebuje globalno številko brez dodatnega besedila.
- Skupni gumbi so `Razveljavi premik`, `Ponovi premik` in `Začetni vrstni red`; onemogočenost sledi zgornjim predpogojem.
- Števec ima `role="status"`, `aria-label="Zgodovina vrstnega reda"` in besedilo `Razveljavitve: U. Ponovitve: R.`.
- Ohranimo imena pogledov in stalnih stolpcev `Pripravljeno`, `V delu`, `Končano` ter `aria-label="Pregled stanj opravil"`. Položaj novih kontrol ni predpisan; uporabijo obstoječi slog Folia in ohranijo vidni fokus.
- Pri širini 390 pik širina celotne strani ne preseže prikaznega polja; dovoljeno je notranje drsenje preglednice in table.

## Uporabniški scenariji in merilo uspeha

S01 začetni prikaz: uporabnik odpre projekt s poljubnim vhodnim zaporedjem in vidi ID-je ter globalna mesta skladno z njim, vključno z enakimi naslovi.

S02 premiki in meje: uporabnik premakne opravilo gor/dol, doseže obe meji in vidi onemogočeno neveljavno dejanje brez dodatne zgodovine.

S03 zgodovina: uporabnik izvede več premikov, jih večkrat razveljavi in ponovi; nov veljaven premik po undo odstrani redo, robno dejanje ga ohrani.

S04 meja zgodovine: po 21 veljavnih premikih je mogoče razveljaviti zadnjih 20 in jih vseh 20 ponoviti; izločena prva sprememba ni več razveljavljiva.

S05 začetni vrstni red: uporabnik obnovi izvorni red kot eno dejanje, ga razveljavi in ponovi; pri že izvornem redu se zgodovina ne spremeni.

S06 oba pogleda: uporabnik na tabli premakne opravilo ob globalnega soseda drugega statusa; statusi in stolpci ostanejo enaki, mesta odražajo premik, preglednica pa pokaže novo celotno zaporedje.

S07 življenjska doba: uporabnik menja pogled, odpira in zapira pravilne podrobnosti ter ohrani oba sklada. Menjava projekta in povratek ter osvežitev vrnejo izhodišče brez zgodovine.

S08 robni podatki in Folio: prazna in enočlenska projekta ter več kot deset opravil ostanejo uporabni. Pri 390 px in običajni širini so nove kontrole dostopne, polja, števci in podrobnosti nespremenjeni, omrežje pa nima zapisov zaradi dejanj P10.

Uspeh pomeni izpolnjene R01–R12 in dogovor o vmesniku za opisano domeno, potrjene z dejansko izvedenimi preverjanji; razvojni primeri sami niso celotno merilo. Ni dodatnih zunanjih meritev.

## Izvedba in sledljivost

Izidi temeljijo na uspešnem `npm run check`: [dnevnik](check.log), [poročilo in omejitve](../verification.md). A01–A08 so v [lastnih testih](../../../tests/agent/P10.spec.ts); A07 ima dva primera. D01–D04 so [razvojni testi](../../../tests/development/P10.spec.ts), izvedeni na namizju in mobilno.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Prejeti red in globalna mesta po ID | A04, A07 | [taskOrder.ts](../../../src/taskOrder.ts): createOrder; [TaskList.tsx](../../../src/TaskList.tsx): byId/positions | Uspešno; A04/A07 v check.log. |
| R02 | Zamenjava globalnih sosedov | A01, A04–A06; D01 | [taskOrder.ts](../../../src/taskOrder.ts): orderReducer/move; [TaskOrderControls.tsx](../../../src/TaskOrderControls.tsx) | Uspešno; celotna zaporedja in oba pogleda. |
| R03 | Robovi brez učinka | A01, A04, A06–A07; D01 | [taskOrder.ts](../../../src/taskOrder.ts): validacija move; [TaskOrderControls.tsx](../../../src/TaskOrderControls.tsx): disabled | Uspešno; ponovljena neveljavna dejanja in gumbi. |
| R04 | Undo celotnega zaporedja | A01–A03, A06; D02 | [taskOrder.ts](../../../src/taskOrder.ts): remember/undo | Uspešno; natančna prejšnja zaporedja. |
| R05 | Redo in ista množica ID | A01–A03, A05–A06; D02 | [taskOrder.ts](../../../src/taskOrder.ts): redo | Uspešno; več korakov, vključno z vsemi 20. |
| R06 | Razvejitev; neveljaven premik ohrani redo | A01, A06; D03 | [taskOrder.ts](../../../src/taskOrder.ts): move/remember | Uspešno; A01/A06/D03 v check.log. |
| R07 | Največ 20 preteklih posnetkov | A02 | [taskOrder.ts](../../../src/taskOrder.ts): remember/redo, slice(-20) | Uspešno; 21 premikov, 20 undo in 20 redo. |
| R08 | Razveljavljiv reset; no-op pri izvornem redu | A03, A06; D04 | [taskOrder.ts](../../../src/taskOrder.ts): reset/isInitialOrder; [TaskList.tsx](../../../src/TaskList.tsx): reset | Uspešno; vključno z nepraznim redo. |
| R09 | Globalni red in relativni red stolpcev | A05, A08; D04 | [TaskList.tsx](../../../src/TaskList.tsx): orderedTasks/positions; [TaskBoard.tsx](../../../src/TaskBoard.tsx): filter | Uspešno; sosed drugega statusa in red stolpcev. |
| R10 | Pogledi/podrobnosti ohranijo; projekt/reload ponastavita | A05; skupne regresije | [App.tsx](../../../src/App.tsx): ProjectView key/TaskList; [TaskList.tsx](../../../src/TaskList.tsx): useReducer | Uspešno; oba sklada in povratek v projekt. |
| R11 | Števec/gumbi, nič in eno opravilo | A04–A08; D03 | [TaskList.tsx](../../../src/TaskList.tsx): status/orodna vrstica/prazno stanje; [TaskOrderControls.tsx](../../../src/TaskOrderControls.tsx) | Uspešno; natančno besedilo in onemogočenost. |
| R12 | Lokalne permutacije, polja, števci, Folio | A01–A08; D04; 38 osnovnih regresij | [taskOrder.ts](../../../src/taskOrder.ts); [App.tsx](../../../src/App.tsx): povzetki/podrobnosti; [styles.css](../../../src/styles.css): kontrole | Uspešno; brez UI zapisov, ohranjena polja, [posnetki in dokazi](../verification.md). |

## Odprta vprašanja in omejitve

Bistvenih odprtih vprašanj ni. Pot funkcionalnosti je določil uporabnik. Razporeditev novih kontrol je dovoljena izvedbena odločitev znotraj Folia; nova dejanja nimajo trajnosti ali zapisovalnega API-ja. Navigacije med nedokončanim nalaganjem in novih sočasnih sprememb podatkov ne širimo prek obstoječih regresijskih zahtev. Ne spreminjamo infrastrukture, odvisnosti, strežnika, skupnih tipov/testov ali uradnih predlog.

Izvedenih je 55 uspešnih lokalnih preverjanj, lint, tipi in gradnja. Končni skriti testi niso dostopni in niso bili izvedeni. Primeri ne pomenijo izčrpnega preverjanja vseh vhodov; izidi in omejitve so v [poročilu](../verification.md). Znane neizpolnjene R01–R12 niso ostale.

## Zgodovina sprememb

- 2026-09-26, 1.0: začetna specifikacija vseh R01–R12, formalni prehodi, scenariji in sledljivost po skupni predlogi; brez implementacije.

- 2026-09-26, 1.1: implementacija obeh pogledov; sledljivost dopolnjena z A01–A08, 55 uspešnimi preverjanji in posnetki. Osrednja evidenca po navodilu implementacije: `docs/agent/verification.md`. Sprejemni pogoji nespremenjeni.
