# P04 — Načrt izvedbe

Specifikacija: `docs/agent/P04/spec.md`. Ustava: `.specify/memory/constitution.md`.
Datum: 2026-10-11.

## Tehnični kontekst

- React + TypeScript + Vite, Node 24.11.1, obstoječe odvisnosti (brez novih), ikone lucide-react.
- Podatki: obstoječi GET `/api/projects/:id/tasks`; izbira opravila po `id`. Brez `/__test/`,
  `localStorage` in novih zapisovalnih klicev.
- Meje: spreminjamo `src/`, `tests/agent/`, `docs/agent/`; strežnik, `shared/`, skupni testi,
  odvisnosti in nastavitve ostanejo nespremenjeni. Dizajn Folio iz `docs/dizajn.md` se ohrani.
- Preverjanje: `npm run check` (slog, tipi, gradnja, skupni testi) in lastni testi
  `npx playwright test --project=agent`.

## Odločitve

1. **Čisto razvrščanje** v novi `src/sorting.ts`: `norm` (NFD, odstranitev U+0300–U+036F,
   male črke, primerjava po UTF-16 z `<` in `>`, brez `localeCompare`), `compareByKey`
   (rang todo < in_progress < done, datumi kronološko, nizi z `norm`) in
   `sortTasks(tasks, settings)`. Izenačeni vrnejo 0; stabilnost zagotavlja standardni
   `Array.prototype.sort` (ES2019+), zato `S` ostane (R06).
2. **Tipi**: `SortKey = original | title | assignee | status | dueDate`,
   `SecondaryKey = none | SortKey`, `SortDirection = asc | desc`,
   `SortSettings = { primary, primaryDirection, secondary, secondaryDirection }`,
   `DEFAULT_SORT = { primary: original, primaryDirection: asc, secondary: none,`
   `secondaryDirection: asc }` (R01). Smer obrne samo `cmp` izbranega ključa (R04).
3. **Stanje nastavitev** v `ProjectView` z `useState(DEFAULT_SORT)`: obstoječi
   `key={project.id}` ob menjavi projekta komponento ponovno postavi (R09), osvežitev
   začne privzeto, stanje pa ni v URL-ju ali trajni shrambi (R09); preklop pogleda in
   podrobnosti ne ponovno postavita komponente (R08).
4. **Ena projekcija**: `sortedTasks = useMemo(() => sortTasks(tasks ?? [], settings), …)`.
   Preglednica in tabla uporabljata isto polje; tabla filtrira po statusu in s tem ohrani
   relativni vrstni red stolpcev (R07). Skupna števila se računajo iz izvornih `tasks` (R11).
5. **Kontrole** v novi `src/SortControls.tsx`: štirje označeni selecti (Primarni ključ,
   Primarna smer, Sekundarni ključ, Sekundarna smer) in gumb Izvorni vrstni red, ki
   nastavi `DEFAULT_SORT` (R10). Slogi v `src/styles.css` z obstoječimi spremenljivkami;
   pri 390 pikah notranje drsenje, cela stran se ne razširi.
6. **Brez zapisov**: noben nov klic na API; razvrščanje je le projekcija (R11). Obstoječi
   `data-task-id`, povezave in dostopna imena se ohranijo (R12).

## Struktura datotek

- `src/sorting.ts` — novo: `norm`, `compareByKey`, `sortTasks`, tipi in privzete vrednosti.
- `src/SortControls.tsx` — novo: kontrole in gumb za izvorni vrstni red.
- `src/App.tsx` — stanje nastavitev, vključitev kontrol, `sortedTasks` za preglednico.
- `src/TaskBoard.tsx` — prejme razvrščeno polje; vrstni red stolpcev nespremenjen.
- `src/styles.css` — slogi kontrol v okviru potrjenega videza Folio.
- `tests/agent/p04-sort.spec.ts` — novi testi (Playwright, projekt `agent`), podatki prek
  javnega pripomočka `tests/development/helpers.ts` z nadzorovanimi GET odgovori.
- `docs/agent/P04/spec.md` — med izvedbo se izpolni preglednica sledljivosti z dokazi.

## Tveganja in obravnava

- Napačna primerjava z `localeCompare` bi kršila R02 → uporabimo primerjavo po enotah UTF-16.
- Nestabilno razvrščanje bi kršilo R04/R06 → komparator vrne 0 ob izenačenosti, stabilnost
  zagotavlja jezik; testi pokrijejo izenačene ključe.
- Tabla ne sme ponovno razvrščati po stolpcih → filtrira že razvrščeno polje.
- Nastavitve ne smejo priti v URL ali shrambo → stanje ostane v komponenti.
