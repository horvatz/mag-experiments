# P08 — Načrt izvedbe

Različica 1.0 (2026-10-13). Vir zahtev: `task/instructions.md`; specifikacija:
`docs/agent/P08/spec.md`; ustava: `.specify/memory/constitution.md`.

## Tehnični kontekst

- React 19 + TypeScript 6 + Vite 8, obstoječe odvisnosti (lucide-react);
  Node 24. E2E: Playwright (projekt `agent` za `tests/agent/**/*.spec.ts`).
- Skripti: `npm run typecheck`, `npm run lint`, `npm run build`, `npm test`,
  `npm run check`; Playwright sam zažene strežnik (`WEB_PORT=5174`).
- Berem in uporabljam obstoječi API `GET /api/projects` in
  `GET /api/projects/{id}/tasks`; `server/`, `shared/`, skupni testi in
  konfiguracije ostanejo nedotaknjeni.
- Izhodiščne datoteke: `src/App.tsx` (ProjectView, tabela, števci),
  `src/TaskBoard.tsx`, `src/components.tsx`, `src/navigation.ts`,
  `src/styles.css`.

## Odločitve

1. Čista pravila v novem `src/deadlines.ts`:
   - `parseCalendarDate(v)`: strogo `^\d{4}-\d{2}-\d{2}$` + veljaven
     koledarski datum (prestopna leta); sicer null.
   - `dayNumber({y,m,d}) = Date.UTC(y, m-1, d) / 86_400_000`; razlika dni je
     tako neodvisna od časovnega pasu in poletnega časa.
   - `groupFor(task, ref)`: done → done; sicer D<0 overdue, D=0 today,
     1–7 week, ≥8 later.
   - `groupCounts(tasks, ref)`: pet števcev iz vseh opravil (filter jih ne
     spremeni).
   - `filterTasks(tasks, ref, filter)`: ohrani izvorni vrstni red.
   - Konstanti `DEFAULT_REF = "2026-09-21"` in urejen seznam skupin z imeni.
2. Stanje v `ProjectView`: `ref`, `dateText`, `filter`, `warning`. Ponastavitev
   na S1 z `key={project.id}` (menjava projekta) in osvežitvijo strani; stanje
   se ne hrani v URL/localStorage in preživi preklop table/board ter odpiranje
   podrobnosti (komponenta ostane montirana).
3. Vmesnik v `src/App.tsx`:
   - `<label>` Referenčni datum + input type=date; `<select>` Pogled rokov z
     all/overdue/today/week/later/done. Veljaven vnos takoj preračuna;
     prazen/neveljaven prikaže `role=alert` z `Vnesi veljaven referenčni datum.`
     in ohrani zadnji veljavni izračun.
   - Obstoječi `summary-grid` (`aria-label="Pregled stanj opravil"`) dobi pet
     števcev z `aria-label="Število rokov <ključ>"` in samo številsko vrednostjo.
   - Tabela in `TaskBoard` dobita `filterTasks(...)`; ista filtrirana množica
     ID-jev, `data-task-id` in obstoječe povezave se ohranijo. Prazna skupina v
     nepraznem projektu prikaže `Ni opravil v izbrani skupini.`
4. Slog v `src/styles.css` z obstoječimi spremenljivkami; kontrole se ovijejo,
   pri 390 pik ostane notranje drsenje `.table-scroll`/`.board-scroll`.
5. Lastni testi (v implementaciji) `tests/agent/p08.spec.ts`: scenariji po
   R01–R12 prek UI z nadzorovanimi GET fixture-i; brez `/__test/` v aplikaciji.

## Datoteke

| Datoteka | Sprememba |
| --- | --- |
| `src/deadlines.ts` | novo: čista razvrstitev, števci, filtriranje, konstante |
| `src/App.tsx` | stanje ref/filter, kontrole, pet števcev, filtriran prikaz |
| `src/components.tsx` | po potrebi majhne predstavitvene komponente |
| `src/styles.css` | slog kontrol in sporočila prazne skupine |
| `tests/agent/p08.spec.ts` | lastni E2E testi za R01–R12 |
| `docs/agent/P08/` | spec.md, plan.md, tasks.md, končno poročilo |

## Preverjanje in tveganja

- `npm run lint`, `npm run build`, `npm test` (skupni + lastni testi); ročni
  pregled pri 390 pik in skladnosti s Folio. Rezultati z imeni testov.
- Prazno polje type=date vrne prazen niz → S3; neveljaven ročni vnos enako.
- Prikaz `formatDate` ostane nespremenjen; izračun dni ne uporablja lokalnega
  časa. Tabla ohrani stolpce po stanjih; filtrirana množica je enaka kot v
  preglednici (vrstni red znotraj stolpcev ostane izvorni).
