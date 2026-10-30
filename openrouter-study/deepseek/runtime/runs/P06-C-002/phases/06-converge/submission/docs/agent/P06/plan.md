# P06: Nastavljiv izvoz CSV — načrt izvedbe

> Vir zahtev: `docs/agent/P06/spec.md` in `task/instructions.md`. Ta načrt ne širi obsega; spremembe ostajajo v `src/`, `tests/agent/` in `docs/agent/`.

## Tehnični kontekst

- React 19.3.0 + TypeScript 6 + Vite 8; ikone `lucide-react`. Vse odvisnosti so nameščene; novih ni.
- Podatki: `useResource` bere javni `/api/` (samo GET); `ProjectView` se ob menjavi projekta remounta (`key={project.id}`), zato se stanje izvoza ob menjavi projekta ponastavi, osvežitev strani pa prav tako.
- Testi: Playwright s projekti `api`, `desktop`, `mobile`, `development-desktop`, `development-mobile`, `agent`. Javni pomočnik `tests/development/helpers.ts` podaja nadzorovane GET odgovore, `downloadCSV`, `board`, `readonly`; razvojni primeri D01–D04 so v `tests/development/P06.spec.ts` (samo berljivi).
- Dizajn: Folio slog v `src/styles.css` (spremenljivke, kartice, tabela/tabla, odzivnost do 390 pik).

## Skladnost z ustavo

- I. Meje: posegi le v `src/`, `tests/agent/`, `docs/agent/`; `server/`, `shared/`, skupni testi, odvisnosti in nastavitve ostanejo nespremenjeni.
- II. API: berejo se obstoječe GET poti; izvoz ne pošilja ničesar na strežnik in ne uporablja testnih kontrol.
- III. Dizajn: uporabljeni so obstoječi gradniki in slogovne spremenljivke; ohranjeni `data-task-id`, dostopna imena in `aria-label="Pregled stanj opravil"`.
- IV. Dokazi: skupni in lastni testi; izidi se vpišejo v `spec.md` šele po dejanski izvedbi.
- V. Skromnost: ena nova modulska datoteka, ena nova testna datoteka, minimalni posegi v `App.tsx` in `styles.css`.

## Odločitve

1. Čista serijalizacija, ločena od DOM: `src/csvExport.ts`
   - `EXPORT_COLUMNS` s kanoničnim vrstnim redom `K = [id, projectId, title, status, assignee, dueDate, description]`; tipi `ExportColumn`, `ExportFilter`, `ExportSeparator`.
   - `filterRows(tasks, filter)`, `neutralizeFormula(value)`, `serializeCsv(tasks, columns, separator): string` (BOM U+FEFF, glava, vrstice, CRLF tudi za zadnjo vrstico).
   - Zakaj: enostavno preverljivo, brez stranskih učinkov, enaka logika za oba pogleda.
2. Stanje izvoza v `ProjectView` (`src/App.tsx`): `selectedColumns` (privzeto vse), `filter` (privzeto `all`), `separator` (privzeto `;`). `enabled = selectedColumns.length > 0 ∧ filterRows(tasks, filter).length > 0`; gumb je onemogočen, ko `!enabled`.
3. Kontrole v skupni vrstici nad vsebino opravil, vidne v obeh pogledih (stanje skupno, zato preklop pogleda ne spremeni nastavitev):
   - checkboxi z `aria-label="Stolpec <ime>"`; `<select aria-label="Ločilo CSV">` z `;` in `,`; `<select aria-label="Filter izvoza">` z `all/todo/in_progress/done`; `<button>Izvozi CSV`.
   - Nova dejanja niso znotraj povezave opravila; pri 390 pik se stran ne razširi vodoravno.
4. Prenos: `new Blob([csv], { type: "text/csv;charset=utf-8" })`, `URL.createObjectURL`, začasen `<a download="folio-<projectId>.csv">`, nato sprostitev URL. Brez `window.open` in brez POST.
5. Filter omeji samo izvoz; prikaz projekta ostane celoten `T(P)`.
6. Nevtralizacija formul: če se vrednost po poljubnem začetnem zaporedju presledek/tab/CR/LF začne z `=`, `+`, `-` ali `@`, se na sam začetek izvirnega niza doda U+0027; velja za vse podatkovne kolone, ne za glavo. `status` se izvozi kot interna vrednost, `dueDate` kot izvirni `YYYY-MM-DD`.

## Datoteke

| Datoteka | Vrsta | Vsebina |
| --- | --- | --- |
| `src/csvExport.ts` | nova | kanonične kolone, filtriranje, nevtralizacija, serijalizacija |
| `src/App.tsx` | sprememba | stanje izvoza, kontrole, prenos, povezava na `ProjectView` |
| `src/styles.css` | sprememba | slog kontrole izvoza po Folio gradnikih |
| `tests/agent/p06-export.spec.ts` | nova | lastni testi R01–R12 prek javnega pomočnika |
| `docs/agent/P06/spec.md` | dopolnitev | izpolnjena tabela sledljivosti po izvedbi |

Ne spreminjamo: `server/`, `shared/`, `tests/baseline.spec.ts`, `tests/api.spec.ts`, `tests/development/*`, `playwright.config.ts`, `package.json`, `.specify/` (razen že zapisanih procesnih datotek).

## Preverjanje

1. `npm run typecheck` in `npm run lint`.
2. `npx playwright test --project=agent` (lastni testi R01–R12).
3. `npx playwright test --project=development-desktop --project=development-mobile` (razvojni primeri D01–D04).
4. `npx playwright test --project=desktop --project=mobile --project=api` (skupni regresijski testi).
5. Izidi (imena testov, dnevnik) se vpišejo v `docs/agent/P06/spec.md`; neizvedeni testi niso označeni kot uspešni.

## Tveganja in omejitve

- Razvojni primeri zahtevajo natančne bajte (D01–D03), zato čista funkcija in primerjava celotnih nizov.
- Izvoz mora v obeh pogledih dati iste bajte (D04), zato je stanje v skupnem staršu, ne v posameznem pogledu.
- Končni skriti testi niso dostopni; pokritost R01–R12 zagotavljajo lastni testi in razvojni primeri.
