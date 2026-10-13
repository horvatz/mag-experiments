# Specifikacija: P10 – Lokalni vrstni red z razveljavitvami

**Funkcija**: `docs/agent/P10` | **Ustvarjeno**: 2026-10-13 | **Status**: osnutek
**Viri**: `task/instructions.md` (R01–R12 in dogovor o vmesniku), `PROJECT_RULES.md`, `docs/dizajn.md`, `task/specification-template.md`, `.specify/memory/constitution.md`

## Problem in kontekst

Uporabnik želi v aplikaciji Folio samostojno določiti vrstni red opravil znotraj
projekta in napačne premike popravljati brez izgube podatkov. Izhodišče prikazuje
opravila v vrstnem redu, kot ga vrne API, in ne ponuja premikanja. Predvidena
sprememba je lokalna permutacija iste množice opravil: premiki gor/dol, razveljavitev,
ponovitev in vrnitev na začetni vrstni red, brez zapisov na strežnik.

## Vhodi, dejanja in izidi

**Podatki.** Projekt `{id, name}` in opravilo `{id, projectId, title, description,
status, assignee, dueDate}` iz javnega API-ja `/api/`. Opravila imajo enkratne ID-je;
naslovi, opisi in imena so lahko enaki, tudi z Unicode znaki; datumi so veljavni
koledarski datumi; projekt ima lahko 0, 1 ali več opravil.

**Stanje.** Za trenutni projekt: `P = [id1..idN]` (globalni vrstni red, permutacija
množice ID-jev opravil projekta), `P0` (izvorna permutacija), `U` (sklad prejšnjih
permutacij za razveljavitev, največ 20), `R` (sklad razveljavljenih permutacij za
ponovitev). Vsa polja opravil in njihovi statusi se med premiki ne spreminjajo.

**Dovoljena dejanja:** premik opravila na globalnega predhodnika/naslednika;
razveljavitev, ponovitev, vrnitev na začetni vrstni red; preklop pogleda in
odpiranje/zapiranje podrobnosti (ne spreminjata vrstnega reda ali zgodovin);
menjava projekta in osvežitev (ponastavita `P := P0`, `U := ∅`, `R := ∅` za
novi projekt). Izid uspeha: nova permutacija in/ali posodobljena zgodovina.
Izid neveljavnega dejanja: stanje nespremenjeno, brez novih zapisov v zgodovini.

**Pravila sprememb stanja** (`⊕` = dodaj na konec, `⌢` = zadnji element, `∖` =
odstrani zadnji element, `index(t)` = 1-indeksirano globalno mesto):

- Premik gor: veljaven, če `index(t) > 1`; `P := swap(P, index(t), index(t)-1)`,
  `U := (U ⊕ [P_pred]) z rezanjem na 20`, `R := ∅`. Sicer no-op brez zgodovine.
- Premik dol: veljaven, če `index(t) < N`; `P := swap(P, index(t), index(t)+1)`,
  `U := (U ⊕ [P_pred]) z rezanjem na 20`, `R := ∅`. Sicer no-op brez zgodovine.
- Razveljavitev: če `U ≠ ∅`: `R := R ⊕ [P]`, `P := U⌢`, `U := U∖`; sicer no-op.
- Ponovitev: če `R ≠ ∅`: `U := U ⊕ [P]` (rezanje na 20), `P := R⌢`, `R := R∖`; sicer no-op.
- Začetni vrstni red: če `P ≠ P0`: `U := (U ⊕ [P]) z rezanjem na 20`, `R := ∅`,
  `P := P0`; če `P = P0`, je gumb onemogočen in stanje nespremenjeno.
- Gumbi razveljavitve/ponovitve so onemogočeni, ko je ustrezni sklad prazen; števec
  izpiše `Razveljavitve: |U|. Ponovitve: |R|.` in je usklajen z gumboma.
- Vsak premik, razveljavitev in ponovitev ohranita isto množico ID-jev; polja
  opravil, statusi in prikazani števci stanj se ne spremenijo. Na API se ne piše.

## Uporabniški scenariji in preverjanje

- **P1 (premiki):** uporabnik premakne opravilo gor/dol; prikaz pokaže novo globalno
  mesto, enaki naslovi se ne povežejo. Preveri R01–R03, R09.
- **P2 (razveljavitev/ponovitev):** uporabnik razveljavi in ponovi več korakov;
  zaporedji in števca ostaneta pravilna, meja 20 se upošteva. Preveri R04–R07, R11.
- **P3 (začetni vrstni red):** uporabnik vrne izvorno permutacijo kot eno dejanje;
  ponovitve se počistijo. Preveri R08, R11.
- **P4 (pogleda in projekt):** preklop pogleda/podrobnosti ohrani stanje; menjava
  projekta in osvežitev ponastavita; tabla kaže relativni vrstni red po stolpcih,
  premiki pa uporabljajo globalnega soseda. Preveri R09, R10, R12.

## Zahteve in pravila

Simboli: `P`, `P0`, `U`, `R`, `index(t)`, `N` kot zgoraj. Predpostavke: opravila
so vezana na trenutni projekt; stanje je lokalno in se ne shranjuje trajno.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | `P :=` vrstni red iz API-ja; vsako `t` ima `index(t)` od 1 do `N`; enaki naslovi ne povezujejo. | Test: začetni vrstni red in `aria-label="Mesto opravila <id>"`. |
| R02 | Premik gor/dol zamenja `t` z globalnim predhodnikom/naslednikom; polja in statusi nespremenjeni. | Test: novi vrstni red, nespremenjena polja. |
| R03 | `index(t)=1` gor oziroma `index(t)=N` dol: no-op brez zapisa v `U`/`R`. | Test: robna gumba onemogočena; ponovljeno dejanje brez spremembe. |
| R04 | Veljaven premik: `U := U ⊕ [P_pred]` (največ 20); razveljavitev: `R := R ⊕ [P]`, `P := U⌢`. | Test: razveljavitev obnovi prejšnjo permutacijo in omogoči ponovitev. |
| R05 | Ponovitev: `U := U ⊕ [P]`, `P := R⌢`; več ciklov ohrani vrstni red brez izgube/podvajanja ID-jev. | Test: zaporedje undo/redo z več koraki. |
| R06 | Nov veljaven premik: `R := ∅`; neveljaven premik na robu: `R` nespremenjen. | Test: premik po razveljavitvi zavrže ponovitve; robni premik jih ne. |
| R07 | `\|U\| ≤ 20`; ob 21. veljavnem premiku se najstarejši zavrže; `R` deluje za vse trenutno razveljavljene korake. | Test: 21 premikov, meja sklada in ponovitve. |
| R08 | `P ≠ P0`: `U := U ⊕ [P]`, `R := ∅`, `P := P0`; `P = P0`: gumb onemogočen, brez spremembe zgodovine. | Test: vrnitev kot eno dejanje in onemogočen gumb. |
| R09 | Preglednica prikazuje globalni vrstni red; tabla relativni vrstni red znotraj stolpcev stanj, premiki uporabljajo globalnega soseda in ne spremenijo statusa. | Test: oba pogleda, isti premik, nespremenjeni statusi. |
| R10 | Preklop pogleda in podrobnosti ohranita `P`, `U`, `R`; menjava projekta in osvežitev ponastavita na `P0` projekta; brez trajne shrambe. | Test: stanje po preklopih, menjavi projekta in osvežitvi. |
| R11 | Števec `Razveljavitve: \|U\|. Ponovitve: \|R\|.` usklajen z gumboma; 0 opravil in 1 opravilo ostaneta uporabna brez dovoljenega premika. | Test: števca, onemogočena gumba, prazni in enojni projekt. |
| R12 | Vse spremembe so lokalne permutacije iste množice ID-jev; ni zapisov na API ali sprememb polj; števci stanj in podrobnosti enaki; Folio ohranjen. | Test: nespremenjeni API klici, polja, števci in slog; 390 px brez razširitve strani. |

Dogovor o vmesniku (iz `task/instructions.md`): ob vrstici/kartici gumba
`Premakni <id> gor` in `Premakni <id> dol`, ločena od povezave; element
`aria-label="Mesto opravila <id>"` z globalno številko; gumbi `Razveljavi premik`,
`Ponovi premik`, `Začetni vrstni red`; `role=status` z `aria-label="Zgodovina
vrstnega reda"` in besedilom števca. Ohranjeni `data-task-id`, dostopna imena
obstoječih pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`.

## Izvedba in sledljivost

Načrtovane lastne kontrole v `tests/agent/` (izvedejo se v koraku implementacije;
tu še niso izvedene): `order.spec.ts` (R01–R03, R09, R11), `history.spec.ts`
(R04–R08, R11), `state.spec.ts` (R10, R12). Skupni testi izhodišča ostanejo
nespremenjeni; končni dokazi (imena testov in dnevniki zagona) se vpišejo ob izvedbi.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R12 | Kot v tabeli zahtev | `tests/agent/order.spec.ts`, `history.spec.ts`, `state.spec.ts` | `src/App.tsx`, `src/TaskBoard.tsx` | Ni izvedeno – bo v koraku implementacije. |

## Odprta vprašanja in omejitve

- Razporeditev novih kontrol in besedila, ki niso izrecno določena, niso
  predpisana; specifikacija jih ne zamejuje.
- Navigacija med nezaključenim nalaganjem in nove sočasne spremembe podatkov brez
  osvežitve niso del obsega (veljajo obstoječe regresijske zahteve).
- Zunanjih meritev uspešnosti ni; merilo je izvedeno preverjanje R01–R12 in
  ohranjeni skupni testi.
- Nejasnosti ni bilo treba reševati z izmišljenim odgovorom; vsa pravila izhajajo
  iz `task/instructions.md`.
