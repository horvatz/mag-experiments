# Preverjanje P10

2026-09-25 — začetek implementacije po lokalni veščini `speckit-implement`.
Viri: [specifikacija](P10/spec.md), [načrt](P10/plan.md), [naloge](P10/tasks.md).

## Potek in rezultati

- Prebrana izvirna pravila, vseh R01–R12, skupna predloga in izvedbeni dokumenti.
- Preverjanja implementacije še niso izvedena. Rezultate dodajamo sproti.

## Omejitve

Nedostopni končni testi niso izvedeni. Strežnik, infrastruktura, odvisnosti,
skupni tipi in skupni testi ostanejo nespremenjeni.

- T001–T002: izhodišče preverjeno; dodan čisti reducer po predikatih, brez API zapisov.

- T003–T005: dodana neposredna testa zgodovine; vključene skupne kontrole in mesta v oba pogleda. Stanje je v naloženi komponenti projekta. Testi še čakajo na skupni zagon.

- Prvi `npm run check`: lint, tipi in gradnja uspešni; 52/54 testov uspešnih (vseh 38 osnovnih in 8 razvojnih). Dva lastna testa sta imela napaki: A03 preširok selektor obeh naslovov dialoga, A07 programski fokus po miški ne aktivira `:focus-visible`. Popravljen selektor na h2 in uporabljen dejanski Shift+Tab/Tab; aplikacija zaradi teh napak ni bila spremenjena. Prvi dnevnik: [verification.log](P10/verification.log).

- Končni `npm run check` je končal z izhodno kodo 0: ESLint, TypeScript in produkcijska gradnja uspešni; **54/54 testov uspešnih** v 21,3 s (38 osnovnih, 8 razvojnih P10, 8 lastnih). Dokaz: [verification-final.log](P10/verification-final.log).
- Vizualno pregledani štirje posnetki iz A07: [preglednica 1440](P10/folio-1440-table.png), [tabla 1440](P10/folio-1440-board.png), [preglednica 390](P10/folio-390-table.png), [tabla 390](P10/folio-390-board.png). Ohranjeni lebdeča navigacija, barve in gradniki Folio; na telefonu se kontrole prelomijo, preglednica in tabla drsita znotraj prikaza. A07 preveri tudi širino dokumenta, ločenost gumbov od povezav ter viden tipkovniški fokus.
- Uporabljena je obstoječa Playwright konfiguracija s povezavo na brskalnik iz `task/browser.json`; ni bilo novih odvisnosti ali sprememb infrastrukture. Opozorila npm o `http-proxy` in Node o `NO_COLOR` niso preprečila preverjanj.

## Sledljivost zahtev

Pogoji in predikati ostanejo v [specifikaciji](P10/spec.md#zahteve-in-pravila).
Spodnja matrika je skupni zapis izvedbe po predlogi; `spec.md` jo povezuje
brez podvajanja. A01–A07 so konkretna imena testov v
[tests/agent/P10.spec.ts](../../tests/agent/P10.spec.ts); A06 se izvede dvakrat
za 0 in 1 opravilo. D01–D04 so v nespremenjenem
[razvojnem testu](../../tests/development/P10.spec.ts) in so izvedeni na obeh
konfiguriranih širinah. Za vse uspešne izide velja
[končni dnevnik](P10/verification-final.log).

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | `P=B`, identiteta in globalna mesta | A03: arbitrary IDs, 13 tasks, ranks and unchanged data; D01 | [taskOrder.ts](../../src/taskOrder.ts): createTaskOrder; [App.tsx](../../src/App.tsx): ProjectTasks/positions; [TaskOrderControls.tsx](../../src/TaskOrderControls.tsx): TaskMoveControls | Uspešno; začetni seznam in vseh 13 mest po drugačnih ID-jih |
| R02 | Zamenjava neposrednih globalnih sosedov | A01: whole permutations, boundaries, branching and reset; A03, A04; D01 | taskOrder.ts: taskOrderReducer/move; App.tsx: onMove | Uspešno; premiki v obe smeri in čez mejo stanj |
| R03 | Robni premik brez učinka | A01; A05: reset is undoable and branching updates exact counters; D01 | taskOrder.ts: preverjanje index/neighbor; TaskOrderControls.tsx: disabled | Uspešno; ponovljeno robno dejanje ohrani stanje in redo |
| R04 | Undo obnovi celotno prejšnjo permutacijo | A01, A02, A04, A05; D02 | taskOrder.ts: remember in undo | Uspešno; točna zaporedja in števci |
| R05 | Redo v pravem vrstnem redu, brez izgube ID-jev | A01; A02: last 20 snapshots and every available redo; A04; D02 | taskOrder.ts: redo | Uspešno; več undo/redo, vse ohranjene permutacije |
| R06 | Veljaven premik počisti redo, robni ga ohrani | A01, A05; D03 | taskOrder.ts: move po preverjanju veljavnosti; TaskMoveControls | Uspešno; oboje preverjeno neposredno in v brskalniku |
| R07 | Največ 20 prejšnjih permutacij | A02 | taskOrder.ts: remember/slice(-20), undo, redo | Uspešno; 24 premikov na 25 ID-jih, vseh 20 dovoljenih undo in redo, rob sklada brez učinka |
| R08 | Obnova izhodišča je eno dejanje; na izhodišču brez učinka | A01, A05; D04 | taskOrder.ts: reset/isInitialOrder; TaskOrderControls.tsx: TaskOrderHistory | Uspešno; reset počisti redo, undo/redo reseta in onemogočen gumb |
| R09 | Tabla je projekcija globalnega reda, sosed ostane globalen | A04: global neighbors on board and history across navigation; D04 | [TaskBoard.tsx](../../src/TaskBoard.tsx): filter po statusu, globalni positions/onMove | Uspešno; stolpci in statusi ohranjeni, mesta usklajena s preglednico |
| R10 | Pogled/podrobnosti ohranijo zgodovini; projekt/osvežitev ponastavita | A04; osnovni testi navigacije in podrobnosti | App.tsx: ProjectTasks/useReducer, ProjectView s key project.id; obstoječi TaskDetails | Uspešno; oba sklada čez preklop in podrobnosti, menjava in povratek, osvežitev |
| R11 | Točen števec, gumbi skladni s skladoma, N=0/1 uporabno | A03–A06, zlasti A06: 0/1 tasks remain usable in both views and projects; D03 | TaskOrderControls.tsx: TaskOrderHistory; App.tsx: prazni seznam; TaskBoard.tsx: prazni stolpci | Uspešno; oba projekta sta lahko prazna, enojni seznam brez dovoljenega premika |
| R12 | Isti ID-ji in polja, brez zapisov, števci/podrobnosti/Folio ohranjeni | A01–A07; D04; vseh 38 osnovnih testov | taskOrder.ts: samo ID-ji; App.tsx: Map in izpeljani seznam; TaskBoard.tsx; [styles.css](../../src/styles.css): order-history/task-order-controls | Uspešno; nadzor omrežja in saveRequests=0, opisi/datumi/števci, širina in štirje vizualno pregledani posnetki |

## Končno stanje izvedbe

T001–T009 so dokončane. Dodana sta reducer in skupni komponenti kontrol,
preglednica in tabla uporabljata isti lokalni vrstni red. Ni znanih
neizpolnjenih obveznih zahtev v preverjenem obsegu. Omejitev dokaza: lokalni
razvojni in lastni scenariji niso izčrpen dokaz vseh dovoljenih vhodov;
nedostopni končni testi niso izvedeni. Mobilni pregled je Chromium pri
390 pikah, ne fizična naprava. Kontrolnega seznama kakovosti zahtev ta
korak ni spreminjal.
