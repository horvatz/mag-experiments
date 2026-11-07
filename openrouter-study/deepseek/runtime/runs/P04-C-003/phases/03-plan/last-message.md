Načrt je zapisan v `docs/agent/P04/plan.md` (59 vrstic, skladen s specifikacijo in ustavo).

**Ključne odločitve**
- Čisto razvrščanje v novi `src/sorting.ts` (`norm`, `compareByKey`, `sortTasks`, tipi, `DEFAULT_SORT`); primerjava po enotah UTF-16 brez `localeCompare`, stabilnost zagotavlja standardni `sort`.
- Stanje štirih nastavitev v `ProjectView`; obstoječi `key={project.id}` poskrbi za ponastavitev ob menjavi projekta (R09), preklop pogleda in podrobnosti pa stanje ohranita (R08). Brez URL-ja in trajne shrambe.
- Ena razvrščena projekcija za preglednico in tablo; tabla filtrira po statusu, zato je relativni vrstni red stolpcev enak (R07); števci ostanejo iz izvornih podatkov (R11).
- Nove kontrole v `src/SortControls.tsx`, slogi v `src/styles.css` z obstoječimi Folio spremenljivkami; brez novih odvisnosti in zapisovalnih klicev.

**Struktura in preverjanje**
- Spremembe: `src/sorting.ts`, `src/SortControls.tsx` (novi), `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css`; testi `tests/agent/p04-sort.spec.ts`; sledljivost se dopolni v `spec.md`.
- Preverjanje: `npm run check` in `npx playwright test --project=agent`; tveganja (R02, R04/R06, R07, R09) so naslovljena v načrtu.

Nobena datoteka zunaj `docs/agent/` ni bila spremenjena; vej in commitov ni.
