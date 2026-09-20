# Tasks: P01 — Urejanje opravila

**Input**: docs/agent/P01/plan.md, spec.md, research.md, data-model.md, contracts/api.md.
**Prerequisites**: obstoječa aplikacija in nameščene odvisnosti; brez inicializacije infrastrukture.
**Tests**: zahtevani skupni testi in smiselni lastni testi; rezultati morajo biti dokazljivi.
**Organization**: zaporedno, isti agent; vse tri zgodbe so obvezne.

## Format: `[ID] [P?] [Story] Description`

Naloge imajo zaporedne ID in poti; oznake US ustrezajo spec.md. [P] ni uporabljen,
ker uporabnik zahteva zaporedno delo brez drugih agentov.

## Path Conventions

Izvedba v src/, lastni testi v tests/agent/, dokumenti v docs/agent/P01/.
Strežnik, skupni tipi, nastavitve, odvisnosti in skupni testi so samo berljivi.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: potrditi obstoječe izhodišče brez sprememb infrastrukture.

- [X] T001 Preveri pripravljeni updateTask v src/api.ts in oznake/slovenske sloge v src/components.tsx ter src/styles.css glede na docs/agent/P01/contracts/api.md; uporabi obstoječe tipe iz shared/types.ts brez sprememb.

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: omogočiti uskladitev shranjenih prikazov pred uporabniškimi tokovi.

- [X] T002 V src/useResource.ts dodaj omejeno posodobitev trenutno naloženih podatkov s funkcijskim updaterjem in ohrani obstoječi retry ter zaščito pred zastarelim virom; uporabi jo samo po uspešnem shranjevanju.

**Checkpoint**: vir omogoča posodobitev seznama in podrobnosti brez nove shrambe.

## Phase 3: User Story 1 - Shranim naslov in stanje (Priority: P1) MVP

**Goal**: R01, R02, R04, R05, R07, R10 — izoliran osnutek in usklajen uspeh.
**Independent Test**: po spremembi obeh polj preveri vse prikaze, števce, osvežitev,
enake naslove, druge projekte in neurejana polja; vseh šest prehodov statusov.

### Tests for User Story 1

- [X] T003 [US1] V tests/agent/P01.spec.ts pripravi teste S01/S02/S04/S05/S07/S10 za izolacijo osnutka, šest različnih prehodov in isto stanje, vrnjeni Task, preglednico, tablo, števce, osvežitev ter primerjavo vseh drugih zapisov; za osnovno odprtje uporabi tudi obstoječi D01. Pred izvedbo funkcije zabeleži pričakovani neuspeh enega testa v docs/agent/P01/verification.md.

### Implementation for User Story 1

- [X] T004 [US1] V src/TaskDetails.tsx dodaj Uredi in ločen osnutek po id, textarea Naslov ter select Stanje; upoštevaj »todo / in_progress / done« in »samo title in status, oba obvezna«. Uspešen updateTask posodobi podrobnosti in prek onSaved v src/App.tsx samo zapis istega id; nenaložen seznam ponovno pridobi. Do uspeha ne spreminjaj prikazov. Obrazec zapri, podrobnosti ohrani.

**Checkpoint**: uspešen tok deluje samostojno; preostali zgodbi še ostaneta obvezni.

## Phase 4: User Story 2 - Popravek in preklic (Priority: P2)

**Goal**: R03/R06 in čist obrazec pri R10.
**Independent Test**: neveljaven vnos ne pošlje zahteve, veljaven popravek umakne
napako, preklic in ponovno odprtje obnovita shranjene podatke brez napak.

### Tests for User Story 2

- [X] T005 [US2] V tests/agent/P01.spec.ts dodaj S03/S06: prazen naslov, mešani štirje robni znaki, notranji presledki/prelomi, U+00A0, povezava aria-describedby in preklic po napaki brez novih zahtev; preveri ponovno odprtje ter drugo opravilo brez ostankov.

### Implementation for User Story 2

- [X] T006 [US2] V src/taskEditing.ts in src/TaskDetails.tsx izvedi pravilo »Naslov po odstranitvi samo U+0020/U+0009/U+000A/U+000D z robov ne sme biti prazen.« ter »Notranji znaki ter U+00A0 ostanejo.« Pred validacijo in pošiljanjem normaliziraj; praznina pokaže povezano napako role=alert in aria-invalid=true, veljaven popravek jo umakne. Prekliči zavrže osnutek/napake brez zahteve; novo odprtje inicializira shranjeni vrednosti.

**Checkpoint**: validacija in preklic delujeta neodvisno od simulacije zavrnitve.

## Phase 5: User Story 3 - Čakanje in ponovitev (Priority: P3)

**Goal**: R08/R09 — ena zahteva in obnovljivo urejanje ob zavrnitvi.
**Independent Test**: zadrži odgovor, preveri zaklep, zavrni in nato uspešno ponovi.

### Tests for User Story 3

- [X] T007 [US3] V tests/agent/P01.spec.ts dodaj S08/S09 z uporabo kontrol samo iz testnega programa: hold, hitre oddaje, pending/saveRequests=1, štiri onemogočene kontrole, role=status in nespremenjeni podatki/prikazi; release reject ohrani vnos in odklene kontrole, ponovni uspeh odpravi napako.

### Implementation for User Story 3

- [X] T008 [US3] V src/TaskDetails.tsx dodaj sinhrono ref zaporo in stanje saving, disabled za obe polji/Shrani/Prekliči ter role=status. Ob zavrnitvi ohrani osnutek in podatke, pokaži razlog z role=alert in v finally omogoči ponovitev; uspeh počisti napako.

**Checkpoint**: vsi trije tokovi so funkcionalni; sledijo celovita preverjanja.

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T009 Dopolni samo sloge obrazca v src/styles.css po Folio, ohrani vidni fokus in obstoječe oznake prikazov; v tests/agent/P01.spec.ts dodaj preverjanje obrazca pri mobilni širini.
- [ ] T010 Izvedi npm run lint, npm run build in npm test po docs/agent/P01/quickstart.md; dnevnike shrani v docs/agent/P01/, odpravi napake znotraj dovoljenih poti in v docs/agent/P01/verification.md zapiši ukaze ter dejanske rezultate.
- [ ] T011 Posodobi docs/agent/P01/development-spec.md z dejanskimi testi, deli kode in dokazi za R01–R10; v docs/agent/P01/verification.md navedi nepreverjene scenarije/odstopanja in zgodovino popravkov, nato označi opravljene naloge v docs/agent/P01/tasks.md.

## Dependencies & Execution Order

T001 → T002 → US1 (T003–T004) → US2 (T005–T006) → US3 (T007–T008) → T009 → T010 → T011.
Teste posamezne zgodbe pripravi pred njenim vedenjem; pred začetkom implementacije
zabeleži vsaj en pričakovani neuspeh. Zgodbe delijo TaskDetails, zato se izvajajo
zaporedno, vsaka pa ima samostojen scenarij preverjanja. Vmesnih commitov ni.

## Parallel Examples

US1: test in UI sta v različnih datotekah, vendar izvedba ostaja T003 → T004.
US2: normalizacija in test sta ločena, vendar izvedba ostaja T005 → T006.
US3: test zavrnitve in zaklep sta ločena, vendar izvedba ostaja T007 → T008.
Vzporedni agenti niso dovoljeni; nobena naloga ne zahteva delegiranja.

## Implementation Strategy

Najprej osnovni uspešen tok US1 kot tehnični MVP; nato obvezno US2 in US3.
To ni dovoljenje za predajo samo MVP. Ne dodajaj strežnika, odvisnosti ali novih
funkcionalnih zahtev. Celoto zaključi s skupnimi/lastnimi testi in sledljivostjo.

## Notes

Vseh 11 nalog je ob nastanku neizvedenih. Zahteve in scenariji ostajajo merilo,
tudi kadar posamezen test pokriva več zahtev. Ne označi uspeha brez dokaza.
