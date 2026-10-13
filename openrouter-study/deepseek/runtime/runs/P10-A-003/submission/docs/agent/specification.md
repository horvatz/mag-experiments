# P10 – specifikacija: Lokalni vrstni red z razveljavitvami

## Problem in kontekst

Uporabnik želi v Folio projektu samostojno določiti vrstni red opravil (globalno
in znotraj stolpcev stanj) ter napačne premike razveljaviti in ponoviti, ne da bi
se spremenili podatki na strežniku. Izhodišče bere opravila iz javnega API-ja
(`GET /api/projects/:id/tasks`) in jih prikaže v preglednici ali na tabli.
Sprememba je lokalna permutacija ID-jev trenutnega projekta: nobenih zapisov na
API, nobenih sprememb polj, brez trajne shrambe in brez uporabe testnih kontrol
`/__test/`.

## Vhodi, dejanja in izidi

- Vhod: polje `Task` iz `GET /api/projects/:id/tasks` (ID-ji so enkratni,
  naslovi se lahko ponavljajo; polje je lahko prazno, z enim ali več opravili).
- Začetno stanje ob nalaganju projekta: vrstni red = vrstni red prejetega
  polja; zgodovina razveljavitev in ponovitev je prazna.
- Dejanja: `Premakni <id> gor`, `Premakni <id> dol`, `Razveljavi premik`,
  `Ponovi premik`, `Začetni vrstni red`, preklop pogleda, odpiranje/zapiranje
  podrobnosti, menjava projekta, osvežitev strani.
- Uspeh: permutacija se spremeni oz. obnovi; zgodovini se ustrezno posodobita;
  števca `Razveljavitve: U. Ponovitve: R.` in stanje gumbov se ujemata.
- Neuspeh/preklic: robni premik (prvo gor, zadnje dol) in `Začetni vrstni red`
  ob že izvornem vrstnem redu sta onemogočena in ne spremenita stanja; neveljavno
  dejanje ne doda zgodovine in ne zavrže ponovitev. Napaka branja podatkov ostane
  obstoječe stanje `LoadError` z gumbom `Poskusi znova`.
- Izhod: lokalno preurejeno polje opravil; podatki na strežniku, polja opravil
  in števci stanj ostanejo nespremenjeni.

## Zahteve in pravila

Simboli: `O` = trenutna permutacija ID-jev (polje dolžine N), `O0` = izvorna
permutacija, `U` = sklad prejšnjih permutacij (največ 20), `R` = sklad
razveljavljenih permutacij za ponovitev. `swap(O, i, j)` zamenja elementa.
`push(S, x)` doda na konec; `pop(S)` odvzame zadnjega. Veljaven premik pomeni,
da ciljni indeks obstaja znotraj `[0, N-1]`.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob inicializaciji `O = O0` (vrstni red prejetega polja); vsakemu opravilu pripada globalno mesto `index(O, id)+1` (1..N), prikazano z `aria-label="Mesto opravila <id>"`; istovetnost je ID, ne naslov. | D01, A01, A08; primerjava `data-task-id` zaporedja in mest |
| R02 | `Premakni id gor`: `i>0 ⇒ O' = swap(O, i-1, i)`. `Premakni id dol`: `i<N-1 ⇒ O' = swap(O, i, i+1)`. Polja opravil in `status` se ne spreminjajo. | D01, D04, A02, A05 |
| R03 | Premik gor pri `i=0` oz. dol pri `i=N-1` je onemogočen (`disabled`); klic ne spremeni `O`, `U`, `R`. Ponovljen robni klic je brez učinka. | D01, A03, A10 |
| R04 | Veljaven premik: `push(U, O)`, `O = O'`, `R = []`. `Razveljavi premik`: `U≠[] ⇒ R' = push(R, O); O = pop(U)`. | D02, A03, A04 |
| R05 | `Ponovi premik`: `R≠[] ⇒ push(U, O); O = pop(R)`. Zaporedja več razveljavitev/ponovitev ohranijo isto množico ID-jev brez izgube ali podvajanja. | D02, A04 |
| R06 | Nov veljaven premik po razveljavitvi postavi `R = []`. Neveljaven robni klic ne spremeni `R`. | D03, A04, A10 |
| R07 | `|U| ≤ 20`; ob preseganju se zavrže najstarejša permutacija (`U = U[1..]`). Ponovitve delujejo za vse trenutno razveljavljene korake (dokler je `R` neprazen). | A04, A06 |
| R08 | `Začetni vrstni red`: če `O ≠ O0`, velja `push(U, O)`, `O = O0`, `R = []` (eno razveljavljivo dejanje). Če `O = O0`, je gumb onemogočen in stanje nespremenjeno. | D04, A03, A05 |
| R09 | Preglednica prikazuje globalni vrstni red `O`; tabla združuje kartice po nespremenjenih stolpcih `status` in jih znotraj stolpca prikaže v relativnem vrstnem redu iz `O`. Premik na tabli zamenja globalnega soseda (lahko iz drugega stolpca), mesto se posodobi, `status` ostane. | D04, A05 |
| R10 | Preklop pogleda in odpiranje/zapiranje podrobnosti ohranita `O`, `U` in `R`; menjava projekta in osvežitev strani ponastavita na `O0` tega projekta z praznima `U` in `R`; stanje je samo v pomnilniku (brez `localStorage`/API zapisov). | A07, A09, A11 |
| R11 | `role=status aria-label="Zgodovina vrstnega reda"` kaže natanko `Razveljavitve: |U|. Ponovitve: |R|.`; gumba sta onemogočena pri ničli. Prazen projekt (`N=0`) in projekt z enim opravilom (`N=1`) ostaneta uporabna, vsi premiki so onemogočeni. | D03, A03, A10 |
| R12 | Vse spremembe so permutacije iste množice ID-jev; nobenega pisanja na `/api/` in nobenega branja `/__test/`; števci stanj, podrobnosti in prilagodljiva postavitev Folio ostanejo pravilni; pri širini 390 pik se cela stran ne razširi (notranje drsenje preglednice/table je dovoljeno). | D04, A01, A02, A09, A12 |

Splošno pravilo (velja za vse R): ob vsakem dejanju se `O` vedno znova sestavi
iz istih ID-jev, zato se število opravil in njihova polja nikoli ne spremenijo.

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | `O = O0`, mesta 1..N | D01, A01, A08 | `src/useTaskOrder.ts` (inicializacija, `placeOf`), `src/App.tsx` (mesto v vrstici) | glej `docs/agent/verification.md` |
| R02 | zamenjava soseda | D01, D04, A02, A05 | `src/useTaskOrder.ts` (`move`), `src/App.tsx`, `src/TaskBoard.tsx` | glej `docs/agent/verification.md` |
| R03 | rob onemogočen | D01, A03, A10 | `src/useTaskOrder.ts` (`canMove`), `src/App.tsx`/`src/TaskBoard.tsx` (`disabled`) | glej `docs/agent/verification.md` |
| R04 | `push(U, O)`, razveljavitev | D02, A03, A04 | `src/useTaskOrder.ts` (`move`, `undo`) | glej `docs/agent/verification.md` |
| R05 | ponovitev | D02, A04 | `src/useTaskOrder.ts` (`redo`) | glej `docs/agent/verification.md` |
| R06 | ponovitve se zavržejo | D03, A04, A10 | `src/useTaskOrder.ts` (`move`, `reset`) | glej `docs/agent/verification.md` |
| R07 | `|U| ≤ 20` | A04, A06 | `src/useTaskOrder.ts` (`HISTORY_LIMIT`) | glej `docs/agent/verification.md` |
| R08 | začetni vrstni red | D04, A03, A05 | `src/useTaskOrder.ts` (`reset`), `src/App.tsx` (gumb) | glej `docs/agent/verification.md` |
| R09 | tabla po stolpcih | D04, A05 | `src/TaskBoard.tsx` (filtriranje po statusu), `src/App.tsx` (globalna mesta) | glej `docs/agent/verification.md` |
| R10 | ohranitev/ponastavitev | A07, A09, A11 | `src/App.tsx` (`key={project.id}`, `useTaskOrder`) | glej `docs/agent/verification.md` |
| R11 | števec in gumbi | D03, A03, A10 | `src/App.tsx` (status), `src/useTaskOrder.ts` (štetja) | glej `docs/agent/verification.md` |
| R12 | brez zapisov, odzivnost | D04, A01, A02, A09, A12 | `src/useTaskOrder.ts`, `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css` | glej `docs/agent/verification.md` |

## Zgodovina sprememb specifikacije

- 2026-10-13: začetna različica pred implementacijo.

## Odprta vprašanja in omejitve

- Vrstni red znotraj stolpcev table je relativni vrstni red iz globalne
  permutacije; naloga ne predpisuje drugačnega pravila.
- Ponovitveni sklad ni ločeno omejen, a ne more preseči 20, ker nastane le iz
  razveljavitev sklada `U`.
- Hkratne spremembe podatkov brez osvežitve in navigacija med nalaganjem nista
  del obsega (skladno z navodili); ponovno nalaganje istega projekta z istimi
  ID-ji ohrani lokalno stanje, drugačna množica ID-jev pa stanje ponastavi.
