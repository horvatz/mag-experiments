# P08: Naloge izvedbe

## Setup

- [x] [T001] V `tests/agent/P08.spec.ts` dodaj lastne Playwright scenarije za zahteve, ki jih pripravljeni D01–D04 ne pokrijejo: koledarske meje/prestopni datum, vsi filtri in vrstni red, števci neodvisni od filtra, menjava projekta/osvežitev, ohranitev stanja ob preklopu pogleda, prazni rezultati, isti ID-ji prikazov, bralne podrobnosti brez zapisov ter širina 390 px. Uporabi testne API odgovore samo iz testa; obstoječih testov ne spreminjaj.

## Foundational

- [x] [T002] V `src/deadlineGroups.ts` implementiraj koledarsko razvrščanje po R02–R05 in stabilno filtriranje po R07; uporabi koledarsko aritmetiko neodvisno od časovnega pasu in obravnavaj `done` pred rokom.

## Uporabniške zgodbe (po vrstnem redu)

- [x] [T003] V `src/App.tsx` dodaj lokalno stanje projekta z začetnim datumom `2026-09-21`, filtrom `all`, kontrolama `Referenčni datum` in `Pogled rokov`, opozorilom ob praznem datumu ter petimi števci iz celotnega projekta (R01, R06, R08).
- [x] [T004] V `src/App.tsx` izpelji filtrirani seznam iz skupnega razvrščanja in ga uporabi za preglednico ter `src/TaskBoard.tsx`; ohrani vrstni red, ID-je in stanje pri preklopu prikaza. Dodaj zahtevano prazno stanje, ne spreminjaj podatkov opravila in zagotovi ponastavitev ob menjavi projekta/osvežitvi brez shranjevanja v URL ali trajno shrambo (R02–R04, R07–R11).
- [x] [T005] V `src/styles.css` in po potrebi `src/App.tsx` oblikuj nove kontrole in števce z obstoječimi Folio slogi; ohrani dostopna imena, slovenske oznake, vidni fokus ter širino strani pri 390 px (R06, R08, R12).

## Polish in dokazila

- [ ] [T006] Zaženi `npm run check` iz `package.json` ter preveri razvojne D01–D04, skupne regresijske in agentne teste; odpravi regresije samo v dovoljenih datotekah.
- [ ] [T007] V `docs/agent/P08/spec.md` dopolni sledljivost za R01–R12 z dejanskimi datotekami/kodo, imeni izvedenih testov, rezultati in omejitvami; ne označi neizvedenih preverjanj kot uspešnih.
