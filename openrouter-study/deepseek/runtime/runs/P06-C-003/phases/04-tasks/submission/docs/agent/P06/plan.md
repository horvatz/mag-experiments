# P06 — Načrt izvedbe: Nastavljiv izvoz CSV

Vhod: `docs/agent/P06/spec.md`, `.specify/memory/constitution.md`, `task/instructions.md`. Obseg: R01–R12; brez novih zahtev in brez sprememb infrastrukture.

## Tehnični kontekst

- React 19.3 + TypeScript 6.0.3 + Vite 8.3; Playwright 1.63; obstoječe odvisnosti, brez novih.
- Podatki: `GET /api/projects` in `GET /api/projects/:id/tasks` prek `src/useResource.ts`; izvoz je v celoti v odjemalcu, brez zapisovalnih klicev.
- Obstoječa struktura: `src/App.tsx` (ProjectView), `src/TaskBoard.tsx`, `src/components.tsx`, `src/api.ts`, `src/navigation.ts`, `src/styles.css`; `shared/types.ts` ostane nespremenjen.
- Referenca za vmesnik: `tests/development/helpers.ts` (samo branje) — imena `Stolpec <ime>`, `Ločilo CSV`, `Filter izvoza`, `Izvozi CSV` in prenos prek dogodka download.

## Odločitve

1. `src/csv.ts` (nov) — čista logika izvoza:
   - `EXPORT_COLUMNS` v fiksnem vrstnem redu id, projectId, title, status, assignee, dueDate, description.
   - `neutralizeFormula(v)`: vodilni znaki iz {presledek, tab, CR, LF}, nato =, +, - ali @ → apostrof na sam začetek izvirnega niza; sicer nespremenjeno (R08).
   - `quoteField(v)`: po nevtralizaciji vedno obdano z dvojnimi narekovaji, notranji narekovaj podvojen (R06).
   - `buildCsv(tasks, columns, separator)`: BOM U+FEFF + glava + vrstice, ločene s CRLF, tudi za zadnjo vrstico (R01, R05, R07).
   - `downloadCsv(filename, text)`: Blob UTF-8 + `URL.createObjectURL` + začasna povezava `download` + revoke; brez nove strani in brez pošiljanja vsebine (R05).
2. `src/ExportControls.tsx` (nov) — kontrolniki in stanje izvoza: checkboxi `Stolpec <ime>`, select `Ločilo CSV`, select `Filter izvoza`, gumb `Izvozi CSV`. Gumb je onemogočen, ko ni izbrane kolone ali je filtrirani seznam prazen (R03, R04). Filtriranje se uporabi samo za izvoz; prikaz projekta ostane celoten.
3. Stanje (kolone, ločilo, filter) živi v `ExportControls`, ki je vgrajen s `key={project.id}`: menjava projekta in osvežitev ponastavita privzete vrednosti (R11), preklop Preglednica/Tabla pa komponente ne remounta, zato stanje ostane (R10).
4. `src/App.tsx` (sprememba) — v ProjectView vgradi kontrolnike v območje naslova razdelka, zunaj povezav opravil; obstoječi prikaz, bralne funkcije in `data-task-id` ostanejo nespremenjeni (R12).
5. `src/styles.css` (sprememba) — minimalni slogi v jeziku Folio; kontrolniki se ovijajo, pri 390 px brez vodoravnega prelivanja strani.
6. `tests/agent/export.spec.ts` (nov) — scenariji R01–R12 s pomožnimi funkcijami iz `tests/development/helpers.ts` (samo branje): `mount`, `select`, `downloadCSV`, `readonly`, `board`.
7. Dokazi: med izvajanjem se v tabelo sledljivosti v `spec.md` vpišejo imena testov in dejanski rezultati; neizvedeno ali neuspešno se ne označi kot uspešno.

## Datoteke

| Datoteka | Vloga |
| --- | --- |
| `src/csv.ts` (nov) | Gradnja CSV in prenos datoteke. |
| `src/ExportControls.tsx` (nov) | Kontrolniki, stanje in omogočenost izvoza. |
| `src/App.tsx` (sprememba) | Vgradnja kontrolnikov v ProjectView. |
| `src/styles.css` (sprememba) | Slogi kontrolnikov in odzivnost. |
| `tests/agent/export.spec.ts` (nov) | Lastna preverjanja R01–R12. |
| `docs/agent/P06/spec.md` (sprememba) | Vpis dokazov med izvajanjem. |
| `docs/agent/P06/plan.md`, `tasks.md` | Dokumenta postopka. |

Nespremenjeno: `server/`, `shared/`, `tests/baseline.spec.ts`, `tests/api.spec.ts`, `tests/development/`, `package.json`, nastavitve in odvisnosti.

## Preverjanje

- `npm run typecheck`, `npm run lint`, `npm run build`.
- `npx playwright test tests/agent/export.spec.ts` za R01–R12; nato `npm test` za skupne teste.
- Pokritje: privzete vrednosti in vrstni red (R01), fiksni vrstni red ob obratnih klikih (R02), onemogočenost brez kolon (R03), filtri in prazne množice (R04), ime/BOM/prenos (R05), ločilo in navedba (R06), CRLF in znaki v vrednostih (R07), nevtralizacija (R08), Unicode/status/datum (R09), preklop pogleda (R10), ponastavitev ob projektu in osvežitvi (R11), brez stranskih učinkov in 390 px (R12).

## Tveganja in omejitve

- Dostopna imena in obnašanje gumba so del dogovora; odstopanje bi pokvarilo skupne in končne teste.
- BOM mora biti prvi znak vsebine; prenos ne sme odpreti nove strani.
- Stanje je lokalno trenutnemu projektu; novih API-jev in trajne shrambe ni.
- Če se med izvajanjem pokaže potreba po spremembi infrastrukture, se delo ustavi in omejitev zapiše.
