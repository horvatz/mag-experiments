# Naloge: P04 stabilno razvrščanje z dvema ključema

- Vir: `docs/agent/P04/spec.md` in `docs/agent/P04/plan.md`; različica 1.0 (2026-11-01).
- Vrstni red je odvisnostni: naloge se izvajajo po oznakah.

## Faza 1: Priprava

- [ ] T001 Potrdi pričakovane vrstne rede in dostopna imena iz razvojnih primerov (`tests/development/P04.spec.ts`, `tests/development/helpers.ts`) ter jih primerjaj s `docs/agent/P04/spec.md`

## Faza 2: Temelj (logika)

- [ ] T002 Ustvari `src/sorting.ts`: tipi `SortKey`, `SortDirection`, `SortSettings`, privzete nastavitve, `normaliziraj` (NFD → U+0300–U+036F → male črke), `primerjaj` (UTF-16, rang stanj, datumi) in `sortTasks` (stabilno, smer obrne le izid primerjave, original vrne vhod)

## Faza 3: Uporabniške zgodbe (vmesnik)

- [ ] T003 Ustvari `src/SortControls.tsx`: izbire `Primarni ključ`, `Primarna smer`, `Sekundarni ključ`, `Sekundarna smer` in gumb `Izvorni vrstni red`
- [ ] T004 Poveži stanje σ in izračun razvrščenega polja v `src/App.tsx`; kontrole so vidne v obeh pogledih, menjava projekta in osvežitev ponastavita σ0
- [ ] T005 Prilagodi `src/TaskBoard.tsx`, da prejme že razvrščeno polje in ohrani stalni vrstni red stolpcev
- [ ] T006 Dodaj slog orodne vrstice v `src/styles.css` v skladu z dizajnom Folio (brez sprememb potrjenega videza)

## Faza 4: Lastni testi

- [ ] T007 Napiši `tests/agent/sort-table.spec.ts`: privzeti red, ključi title/assignee/status/dueDate, smeri, izenačeni elementi, stabilnost, original, gumb (R01–R06, R10)
- [ ] T008 Napiši `tests/agent/sort-board.spec.ts`: stalni vrstni red stolpcev in relativni red istega razvrščenega polja kot v preglednici (R07)
- [ ] T009 Napiši `tests/agent/sort-state.spec.ts`: ohranitev σ pri preklopu pogleda in podrobnostih, ponastavitev ob menjavi projekta in osvežitvi, robni velikosti 0 in 1 (R08–R10)
- [ ] T010 Napiši `tests/agent/sort-projection.spec.ts`: nespremenjeni podatki in števci, brez zapisov na API, vsak ID natanko enkrat, prave podrobnosti ob enakih naslovih, ozek zaslon (R11, R12)

## Faza 5: Preverjanje in dokazila

- [ ] T011 Zaženi `npm run lint` in `npm run build`; odpravi napake
- [ ] T012 Zaženi `npm test` (skupni, razvojni in lastni testi); zabeleži izide po posameznih zahtevah
- [ ] T013 Vpiši dokazila v `docs/agent/P04/spec.md` (Izvedba in sledljivost) in dopolni zgodovino sprememb; neizvedenih testov ne označi kot uspešnih
- [ ] T014 Končni pregled: R01–R12 pokriti, spremenjeni le `src/`, `tests/agent/` in `docs/agent/`, infrastruktura nespremenjena
