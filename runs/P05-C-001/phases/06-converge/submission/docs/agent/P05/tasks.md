# P05 — Izvedbene naloge

2026-09-22 · Viri: [spec.md](spec.md), [plan.md](plan.md), [izvorne zahteve](../../../task/instructions.md).

Izvajaj zaporedno T001 → T009, kot isti agent. Vsaka naloga je odvisna od prejšnje; oznake pomenijo dokončano delo šele po izvedbi. Vsa implementacija je omejena na `src/`, lastni testi na `tests/agent/` in dokazi na `docs/agent/`. Infrastruktura, odvisnosti, skupni testi in dizajn Folio ostanejo skladni z načrtom. Čas preverjaj z `node task/time-budget.mjs`.

## Priprava

- [x] T001 V `docs/agent/verification.md` zapiši začetek izvedbe, predvideni ukaz `npm run check` in trenutno neizvedena preverjanja. Uporabi obstoječi Playwright projekt `agent` ter že nameščene odvisnosti; brez konfiguracijskih sprememb.

## Temelji

- [x] T002 V `src/App.tsx` dodaj tipizirano stanje `pageSize/statusFilter/page` v `ProjectView`, privzeto all/all/1; iz `tasks` izpelji stabilni filter, število strani, trenutni odsek in indekse po predikatih specifikacije. Spremembi velikosti in filtra vedno ponastavita stran. Ohrani obstoječi ključ projekta in ne dodajaj URL-ja ali shrambe (R01, R02, R04, R05, R07, R08, R09, R10, R12).

## Uporabniška zgodba 1 — Straničenje in filter v obeh pogledih

- [x] T003 V `src/App.tsx` poveži odsek s preglednico in `TaskBoard`, dodaj oba označena HTML selecta, štiri gumbe z robnimi pogoji ter natančen dostopen status. Loči prazen projekt od praznega filtra; povzetek in skupno število še naprej računaj iz celotnega projekta. Preveri uporabo obstoječih stolpcev v `src/TaskBoard.tsx`, ohrani ID-je, povezave in podrobnosti (R01–R12).

- [x] T004 V `src/styles.css` dodaj omejene sloge za nove kontrole skladno s Folio: obstoječe spremenljivke, prelamljanje, viden fokus in onemogočena stanja. Pri 390 pikah prepreči širjenje celotne strani, ohrani notranje drsenje preglednice/table (R12, pogodba vmesnika).

- [x] T005 V `tests/agent/P05.spec.ts` dodaj skupino P01 za S01–S04 in S09: 13 opravil z drugačnimi nesortiranimi ID-ji, ponovljenimi naslovi in veljavnimi datumi; vse velikosti, prehod čez vse odseke brez izgubljenih/podvojenih ID-jev, vsi štirje premiki in robovi, natančen status ter ponastavitev velikosti z višje še veljavne strani (R01–R04, R09).

## Uporabniška zgodba 2 — Ohranjanje konteksta in pravilni števci

- [x] T006 V `tests/agent/P05.spec.ts` dodaj P02/P03 za S05–S08 in S11: vsi filtri pred rezom, ponastavitev filtra z višje strani, enaki ID-ji preglednice/table, globalni povzetek in števci prikazanih stolpcev. Preveri ohranitev izbir in strani pri pogledih/podrobnostih (gumb in Escape), pravilni ID pri enakih naslovih ter ponastavitev ob menjavi projekta, vrnitvi in osvežitvi; brez novih parametrov URL-ja (R05–R08, R11).

## Uporabniška zgodba 3 — Prazni rezultati in ozki zaslon

- [x] T007 V `tests/agent/P05.spec.ts` dodaj P04/P05 za S09, S10 in S12: prazna projekta, eno opravilo, neujemajoči filter in odstranitev filtra; ničelni status in štirje onemogočeni gumbi. Preveri 390 pik v obeh pogledih, tipkovnico/fokus ter odsotnost zapisovalnih zahtev in sprememb podatkov; javni testni pripomoček uporabljaj samo iz testov (R09, R10, R12).

## Zaključna preverjanja in predaja

- [x] T008 Izvedi `npm run check` z obstoječimi nastavitvami in shrani izhod ter izhodno kodo v `docs/agent/P05/check.log`; zapiši dejanske rezultate v `docs/agent/verification.md`. Preverjanje vključuje lint, typecheck/build, API, skupne UI teste, razvojne D01–D04 na namizju/mobilno in lastne teste. Odpravi najdene napake samo v dovoljenih datotekah in ohrani dokaze tudi o neuspelih zagonih; ponovi potrebna preverjanja. Vizualno preglej lokalni posnetek novih kontrol pri 390 pikah, če je na voljo, sicer izrecno navedi omejitev (R01–R12).

- [x] T009 V `docs/agent/P05/spec.md` dopolni vsako vrstico R01–R12 z dejansko kodo, imenom testa, izidom in povezavo na dokaz. V `docs/agent/verification.md` zapiši pregled odsotnosti trajne shrambe, testnih kontrol v aplikaciji in nedovoljenih sprememb, omejitve ter neizvedene/skrite teste; posodobi zgodovino specifikacije in oznake v `docs/agent/P05/tasks.md`. Predaj kratek povzetek sprememb in rezultatov brez neutemeljenih trditev o uspehu.
