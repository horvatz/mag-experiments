# Razvojni dokazi P07-B-001

Izvleček zaključenih dogodkov iz nespremenjenega arhiva. Omejitev specifikacije je ločen procesni izid; implementer in pregledovalec sta zaključila.

Arhivska potrditev SHA-256: `a815c497bae50708cc392ed887961510f791add82da7e542796bfc718c8153ae`.

Izvor faze 01-specification: `runtime/runs/P07-B-001/phases/01-specification/events.jsonl.gz`, SHA-256 `905809e124b735b2ec263eb8a555dacf6642591d7747a4eed0688f443a93e1bd`.

## 01-specification-item_7

Ukaz:
```text
/bin/zsh -lc 'rg --files docs/agent; git status --short -- docs/agent'
```

Izhodna koda: 1.

```text
xcrun: error: invalid active developer path (/Library/Developer/CommandLineTools), missing xcrun at: /Library/Developer/CommandLineTools/usr/bin/xcrun

```

## 01-specification-item_21

Ukaz:
```text
/bin/zsh -lc "node task/time-budget.mjs && sed -n '139,176p' src/styles.css && git diff -- docs/agent/specification.md"
```

Izhodna koda: 1.

```text
{"phaseSecondsRemaining":184,"totalSecondsRemaining":1024,"phaseDeadlineUTC":"2026-09-28T20:15:57.366Z"}
@media (max-width: 1180px) {
  main { width: calc(100% - 56px); }
  .project-overview { align-items: flex-start; flex-direction: column; gap: 28px; }
  .summary-grid { min-width: 0; width: 100%; max-width: 420px; }
  .summary-item { padding-inline: 22px; }
  .summary-item:first-child { padding-left: 0; border-left: 0; }
  td, th { padding-inline: 14px; }
  table { min-width: 720px; }
}
@media (max-width: 760px) {
  .app-shell { flex-direction: column; }
  .app-sidebar { top: 12px; display: grid; grid-template-columns: 1fr auto; gap: 12px 10px; width: calc(100% - 24px); height: auto; margin: 12px auto 0; padding: 12px; border-radius: 14px; overflow: visible; }
  .brand { margin: 0 4px; }
  .brand > span { font-size: 21px; }
  .brand img { width: 26px; height: 26px; }
  .workspace-label { grid-column: 2; grid-row: 1; align-self: center; margin: 0; padding: 0 4px 0 0; border: 0; font-size: 10px; }
  .sidebar-projects { grid-column: 1 / -1; margin: 0; }
  .nav-label { display: none; }
  .project-nav { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px; }
  .project-nav-link { justify-content: center; gap: 6px; min-height: 38px; padding: 7px; font-size: 12px; }
  main { width: calc(100% - 40px); padding: 34px 0 48px; scroll-margin-top: 140px; }
  h1 { font-size: 29px; letter-spacing: -.85px; }
  .project-intro { margin-top: 10px; font-size: 13px; }
  .project-overview { gap: 26px; margin-bottom: 36px; }
  .summary-item { padding-inline: 16px; }
  .summary-label { font-size: 11px; }
  .summary-item strong { font-size: 24px; }
  .section-heading { flex-wrap: wrap; gap: 12px; }
  .section-heading h2 { font-size: 16px; }
  .section-heading .view-switch { margin-left: auto; }
  .view-switch button { padding-inline: 9px; min-height: 36px; font-size: 11px; }
  .task-board { grid-template-columns: repeat(3, minmax(280px, 1fr)); gap: 12px; }
  .board-column { min-height: 330px; }
  .table-footer { font-size: 10px; gap: 8px; }
  .detail-body { padding-inline: 23px; }
  .detail-topbar { padding-inline: 19px; }
  .detail-properties > div { grid-template-columns: 142px minmax(0, 1fr); }
}
xcrun: error: invalid active developer path (/Library/Developer/CommandLineTools), missing xcrun at: /Library/Developer/CommandLineTools/usr/bin/xcrun

```

## 01-specification-item_26

Ukaz:
```text
/bin/zsh -lc 'node task/time-budget.mjs'
```

Izhodna koda: 0.

```text
{"phaseSecondsRemaining":43,"totalSecondsRemaining":883,"phaseDeadlineUTC":"2026-09-28T20:15:57.366Z"}

```

Izvor faze 02-implementation: `runtime/runs/P07-B-001/phases/02-implementation/events.jsonl.gz`, SHA-256 `b76a609a332c2c12f86add9f062e83faf00ebf2f822aa0ef991728978d44cf9d`.

## 02-implementation-item_11

Ukaz:
```text
/bin/zsh -lc 'git diff -- src/App.tsx src/TaskBoard.tsx src/components.tsx src/styles.css src/useFavorites.ts docs/agent/verification.md'
```

Izhodna koda: 1.

```text
xcrun: error: invalid active developer path (/Library/Developer/CommandLineTools), missing xcrun at: /Library/Developer/CommandLineTools/usr/bin/xcrun

```

## 02-implementation-item_16

Ukaz:
```text
/bin/zsh -lc 'npm run check'
```

Izhodna koda: 0.

```text
npm warn Unknown env config "http-proxy". This will stop working in the next major version of npm.

> folio@0.1.0 lint
> eslint .

npm warn Unknown env config "http-proxy". This will stop working in the next major version of npm.

> folio@0.1.0 build
> npm run typecheck && vite build

npm warn Unknown env config "http-proxy". This will stop working in the next major version of npm.

> folio@0.1.0 typecheck
> tsc --noEmit

vite v8.3.0 building client environment for production...
transforming...
✓ 1876 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.61 kB │ gzip:  0.36 kB
dist/assets/index-Dner4IYl.css   14.03 kB │ gzip:  3.81 kB
dist/assets/index-CdmSOTwq.js   242.48 kB │ gzip: 75.72 kB

✓ built in 104ms
npm warn Unknown env config "http-proxy". This will stop working in the next major version of npm.

> folio@0.1.0 test
> playwright test

[WebServer] (node:37719) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] npm warn Unknown env config "http-proxy". This will stop working in the next major version of npm.
[WebServer] (node:37762) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)

Running 49 tests using 1 worker

(node:37764) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  ✓   1 [api] › tests/api.spec.ts:10:1 › fixture IDs are unique and each project has three tasks (36ms)
  ✓   2 [api] › tests/api.spec.ts:27:1 › a successful update changes only the chosen record and fields (8ms)
  ✓   3 [api] › tests/api.spec.ts:47:3 › invalid update leaves all records unchanged: {"title":"","status":"done"} (6ms)
  ✓   4 [api] › tests/api.spec.ts:47:3 › invalid update leaves all records unchanged: {"title":" \t\r\n","status":"done"} (8ms)
  ✓   5 [api] › tests/api.spec.ts:47:3 › invalid update leaves all records unchanged: {"title":"Veljaven naslov","status":"unknown"} (5ms)
  ✓   6 [api] › tests/api.spec.ts:47:3 › invalid update leaves all records unchanged: {"title":"Veljaven naslov"} (10ms)
  ✓   7 [api] › tests/api.spec.ts:47:3 › invalid update leaves all records unchanged: {"title":42,"status":"done"} (4ms)
  ✓   8 [api] › tests/api.spec.ts:47:3 › invalid update leaves all records unchanged: {"title":"Veljaven naslov","status":"done","projectId":"launch"} (4ms)
  ✓   9 [api] › tests/api.spec.ts:47:3 › invalid update leaves all records unchanged: null (5ms)
  ✓  10 [api] › tests/api.spec.ts:55:1 › rejected save writes nothing and the next request can succeed (11ms)
  ✓  11 [api] › tests/api.spec.ts:66:3 › held request remains unchanged until released with success (12ms)
  ✓  12 [api] › tests/api.spec.ts:66:3 › held request remains unchanged until released with reject (8ms)
  ✓  13 [api] › tests/api.spec.ts:80:1 › reset cancels a pending save and restores a previously changed record (7ms)
  ✓  14 [api] › tests/api.spec.ts:91:1 › normal server does not expose test controls (6ms)
(node:37766) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  ✓  15 [desktop] › tests/baseline.spec.ts:8:1 › projects show their own tasks and all three states (435ms)
  ✓  16 [desktop] › tests/baseline.spec.ts:24:1 › duplicate titles open by ID, with complete details and keyboard dismissal (469ms)
  ✓  17 [desktop] › tests/baseline.spec.ts:50:1 › direct task links survive refresh and browser back closes details (533ms)
  ✓  18 [desktop] › tests/baseline.spec.ts:62:1 › a saved API change survives browser refresh and project navigation (631ms)
  ✓  19 [desktop] › tests/baseline.spec.ts:79:1 › unknown locations and task IDs show a recoverable state (460ms)
  ✓  20 [desktop] › tests/baseline.spec.ts:96:3 › failed /api/projects can be retried (353ms)
  ✓  21 [desktop] › tests/baseline.spec.ts:96:3 › failed /api/projects/web/tasks can be retried (354ms)
  ✓  22 [desktop] › tests/baseline.spec.ts:111:1 › an empty project keeps the navigation and shows an empty state (340ms)
  ✓  23 [desktop] › tests/baseline.spec.ts:120:1 › switching project during loading never shows the previous project tasks (343ms)
  ✓  24 [desktop] › tests/baseline.spec.ts:136:1 › board navigation preserves the view and opens duplicate titles by ID without writes (905ms)
  ✓  25 [desktop] › tests/baseline.spec.ts:174:1 › board reflects saved states on refresh, including empty columns and duplicate titles (596ms)
  ✓  26 [desktop] › tests/baseline.spec.ts:193:1 › an empty board keeps all columns and supports switching back to the table (410ms)
(node:37782) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  ✓  27 [mobile] › tests/baseline.spec.ts:8:1 › projects show their own tasks and all three states (381ms)
  ✓  28 [mobile] › tests/baseline.spec.ts:24:1 › duplicate titles open by ID, with complete details and keyboard dismissal (494ms)
  ✓  29 [mobile] › tests/baseline.spec.ts:50:1 › direct task links survive refresh and browser back closes details (564ms)
  ✓  30 [mobile] › tests/baseline.spec.ts:62:1 › a saved API change survives browser refresh and project navigation (713ms)
  ✓  31 [mobile] › tests/baseline.spec.ts:79:1 › unknown locations and task IDs show a recoverable state (469ms)
  ✓  32 [mobile] › tests/baseline.spec.ts:96:3 › failed /api/projects can be retried (410ms)
  ✓  33 [mobile] › tests/baseline.spec.ts:96:3 › failed /api/projects/web/tasks can be retried (407ms)
  ✓  34 [mobile] › tests/baseline.spec.ts:111:1 › an empty project keeps the navigation and shows an empty state (359ms)
  ✓  35 [mobile] › tests/baseline.spec.ts:120:1 › switching project during loading never shows the previous project tasks (362ms)
  ✓  36 [mobile] › tests/baseline.spec.ts:136:1 › board navigation preserves the view and opens duplicate titles by ID without writes (896ms)
  ✓  37 [mobile] › tests/baseline.spec.ts:174:1 › board reflects saved states on refresh, including empty columns and duplicate titles (685ms)
  ✓  38 [mobile] › tests/baseline.spec.ts:193:1 › an empty board keeps all columns and supports switching back to the table (443ms)
(node:38079) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  ✓  39 [development-desktop] › tests/development/P07.spec.ts:2:1 › D01: independent favorites by ID (349ms)
  ✓  40 [development-desktop] › tests/development/P07.spec.ts:3:1 › D02: filter and remove visible favorite (352ms)
  ✓  41 [development-desktop] › tests/development/P07.spec.ts:4:1 › D03: storage and refresh (546ms)
  ✓  42 [development-desktop] › tests/development/P07.spec.ts:5:1 › D04: view parity and no writes (375ms)
(node:38324) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  ✓  43 [development-mobile] › tests/development/P07.spec.ts:2:1 › D01: independent favorites by ID (382ms)
  ✓  44 [development-mobile] › tests/development/P07.spec.ts:3:1 › D02: filter and remove visible favorite (389ms)
  ✓  45 [development-mobile] › tests/development/P07.spec.ts:4:1 › D03: storage and refresh (526ms)
  ✓  46 [development-mobile] › tests/development/P07.spec.ts:5:1 › D04: view parity and no writes (392ms)
(node:38331) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  ✓  47 [agent] › tests/agent/favorites.spec.ts:3:1 › obnovi veljavne ID-je, deduplicira ob naslednjem zapisu in ohrani neznane (342ms)
  ✓  48 [agent] › tests/agent/favorites.spec.ts:12:1 › filter se ob menjavi projekta izklopi, čiščenje odstrani samo ID-je projekta (401ms)
  ✓  49 [agent] › tests/agent/favorites.spec.ts:24:1 › sinhronizira storage dogodke brez povratnega zapisa in opozori na napako zapisa (351ms)

  49 passed (18.2s)

```

## 02-implementation-item_19

```json
{
  "id": "item_19",
  "type": "file_change",
  "changes": [
    {
      "path": "/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P07-B-001/app/tests/agent/favorites.spec.ts",
      "kind": "update"
    }
  ],
  "status": "completed"
}
```

## 02-implementation-item_21

Ukaz:
```text
/bin/zsh -lc 'npx playwright test --project=agent'
```

Izhodna koda: 1.

```text
[WebServer] (node:39187) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] npm warn Unknown env config "http-proxy". This will stop working in the next major version of npm.
[WebServer] (node:39218) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)

Running 5 tests using 1 worker

(node:39253) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  ✓  1 [agent] › tests/agent/favorites.spec.ts:3:1 › obnovi veljavne ID-je, deduplicira ob naslednjem zapisu in ohrani neznane (381ms)
  ✓  2 [agent] › tests/agent/favorites.spec.ts:12:1 › filter se ob menjavi projekta izklopi, čiščenje odstrani samo ID-je projekta (403ms)
  ✓  3 [agent] › tests/agent/favorites.spec.ts:24:1 › sinhronizira storage dogodke brez povratnega zapisa in opozori na napako zapisa (354ms)
  ✘  4 [agent] › tests/agent/favorites.spec.ts:40:1 › neveljavni in manjkajoči zapisi pomenijo prazen izbor brez samodejnega zapisa (667ms)
(node:39274) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  ✓  5 [agent] › tests/agent/favorites.spec.ts:55:1 › napaka branja shramba ne prepreči uporabe izbora v pomnilniku (342ms)


  1) [agent] › tests/agent/favorites.spec.ts:40:1 › neveljavni in manjkajoči zapisi pomenijo prazen izbor brez samodejnega zapisa 

    Error: expect(received).toBe(expected) // Object.is equality

    Expected: "{\"version\":2,\"ids\":[\"web-02\"]}"
    Received: "{neveljaven json"

      45 |     await page.reload()
      46 |     await expect(page.getByRole('button', { name: 'Priljubljeno opravilo web-02', exact: true })).toHaveAttribute('aria-pressed', 'false')
    > 47 |     expect(await page.evaluate(() => localStorage.getItem('folio:favorites:v1'))).toBe(raw)
         |                                                                                   ^
      48 |   }
      49 |   await page.evaluate(() => localStorage.removeItem('folio:favorites:v1'))
      50 |   await page.reload()
        at /Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P07-B-001/app/tests/agent/favorites.spec.ts:47:83

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results/run/agent-favorites-neveljavni-06fdd-bor-brez-samodejnega-zapisa-agent/test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results/run/agent-favorites-neveljavni-06fdd-bor-brez-samodejnega-zapisa-agent/error-context.md

    attachment #3: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/run/agent-favorites-neveljavni-06fdd-bor-brez-samodejnega-zapisa-agent/trace.zip
    Usage:

        npx playwright show-trace test-results/run/agent-favorites-neveljavni-06fdd-bor-brez-samodejnega-zapisa-agent/trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

  1 failed
    [agent] › tests/agent/favorites.spec.ts:40:1 › neveljavni in manjkajoči zapisi pomenijo prazen izbor brez samodejnega zapisa 
  4 passed (3.0s)

```

## 02-implementation-item_22

```json
{
  "id": "item_22",
  "type": "file_change",
  "changes": [
    {
      "path": "/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P07-B-001/app/tests/agent/favorites.spec.ts",
      "kind": "update"
    }
  ],
  "status": "completed"
}
```

## 02-implementation-item_23

Ukaz:
```text
/bin/zsh -lc 'node task/time-budget.mjs && npx playwright test --project=agent'
```

Izhodna koda: 0.

```text
[WebServer] (node:39359) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] npm warn Unknown env config "http-proxy". This will stop working in the next major version of npm.
[WebServer] (node:39390) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)

Running 5 tests using 1 worker

(node:39391) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  ✓  1 [agent] › tests/agent/favorites.spec.ts:3:1 › obnovi veljavne ID-je, deduplicira ob naslednjem zapisu in ohrani neznane (368ms)
  ✓  2 [agent] › tests/agent/favorites.spec.ts:12:1 › filter se ob menjavi projekta izklopi, čiščenje odstrani samo ID-je projekta (397ms)
  ✓  3 [agent] › tests/agent/favorites.spec.ts:24:1 › sinhronizira storage dogodke brez povratnega zapisa in opozori na napako zapisa (373ms)
  ✓  4 [agent] › tests/agent/favorites.spec.ts:40:1 › neveljavni in manjkajoči zapisi pomenijo prazen izbor brez samodejnega zapisa (1.1s)
  ✓  5 [agent] › tests/agent/favorites.spec.ts:54:1 › napaka branja shramba ne prepreči uporabe izbora v pomnilniku (355ms)

  5 passed (3.2s)

```

## 02-implementation-item_24

```json
{
  "id": "item_24",
  "type": "file_change",
  "changes": [
    {
      "path": "/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P07-B-001/app/docs/agent/verification.md",
      "kind": "update"
    }
  ],
  "status": "completed"
}
```

## 02-implementation-item_25

Ukaz:
```text
/bin/zsh -lc 'node task/time-budget.mjs && npm run lint && npm run typecheck'
```

Izhodna koda: 0.

```text
npm warn Unknown env config "http-proxy". This will stop working in the next major version of npm.

> folio@0.1.0 typecheck
> tsc --noEmit


```

Izvor faze 03-review: `runtime/runs/P07-B-001/phases/03-review/events.jsonl.gz`, SHA-256 `f668c0c69cefde4a4c6c04e0eca9c325f84bb9a068dc8207e9b7a3c2de105a5a`.

## 03-review-item_6

Ukaz:
```text
/bin/zsh -lc 'cat docs/agent/specification.md docs/agent/specification-history.md docs/agent/verification.md'
```

Izhodna koda: 1.

```text
# P07: priljubljena opravila in trajna shramba

## Problem in kontekst

Folio zdaj prek `/api/projects` naloži projekte, v `ProjectView` pa prek
`/api/projects/{id}/tasks` prikaže opravila v preglednici ali na tabli.
Uporabnik želi opravila neodvisno označiti kot priljubljena, izbor ohraniti po
osvežitvi, ga filtrirati in počistiti za trenutni projekt. `Project` ima polji
`id` in `name`; `Task` ima `id`, `projectId`, `title`, `description`, `status`,
`assignee` in `dueDate` (`shared/types.ts`). ID je identiteta opravila; naslov
ni nujno enoličen. Ohranita se Folio, obstoječa navigacija/podrobnosti in ozka
postavitev iz `docs/dizajn.md`.

## Vhodi, dejanja in izidi

Naj bo `Tₚ` seznam opravil trenutnega projekta v vrstnem redu API-ja, `Iₚ` množica
njihovih ID-jev, `F` globalna množica priljubljenih ID-jev in `b` stanje filtra.
Vidni seznam je `Vₚ = Tₚ`, kadar `b=false`, sicer
`Vₚ = [t ∈ Tₚ | t.id ∈ F]` (vrstni red se ohrani). Oznaka opravila `t` je
pritisnjena natanko tedaj, ko `t.id ∈ F`. V `localStorage` se pod ključem
`folio:favorites:v1` hrani JSON `{ "version": 1, "ids": [...] }`; `ids` ob
zapisu vsebuje enolične nize, razvrščene z JavaScriptovim privzetim
UTF-16-urejanjem. Opravila in njihova polja niso del zapisa.

Klik oznake spremeni samo članstvo njenega ID-ja v `F`. Brisanje projekta
odstrani iz `F` samo ID-je iz `Iₚ`. Napaka shrambe ne prepreči sprememb `F` v
pomnilniku in uporabe preostalega vmesnika. Nobeno dejanje priljubljenih ne
spreminja opravila ali pošilja zapisovalnih zahtev API-ju.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Vsaka vrstica in kartica ima ločen gumb z imenom `Priljubljeno opravilo <id>`; `aria-pressed` je enak `t.id ∈ F`. Klik izvede `F' = F △ {t.id}` (simetrična razlika), ne sproži povezave/podrobnosti; enaka naslova ne povežeta stanj. | Klikni dve opravili z enakim naslovom v obeh pogledih; preveri ID-je, `aria-pressed` in odsotnost dialoga (D01). |
| R02 | Vsak zapis uporabi točen ključ in obliko `{version:1,ids:[...]}`; ID-ji so nizi brez dvojnikov in po UTF-16 vrstnem redu. Vrednosti opravil se nikoli ne zapisujejo. | Preveri vrednost localStorage po več preklopih, vključno z Unicode ID-ji. |
| R03 | Veljaven zapis se ob zagonu obnovi. Podvojeni ID-ji postanejo en član `F`; veljavni, a trenutno neznani ID-ji ostanejo v `F`, vendar zanje UI ne ustvari opravil. | Osveži z vnaprej pripravljenim zapisom z dvojniki in neznanim ID-jem; kasnejši zapis ga ohrani. |
| R04 | Manjkajoč ključ ali zapis z neveljavnim JSON, `version !== 1`, manjkajočim `ids` ali vsaj enim nenizom v `ids` da `F=∅`. UI ostane uporaben; samo nalaganje ne zapisuje nazaj v shrambo. | Preveri vsak neveljaven primer in potrdi prazen začetni izbor ter nespremenjen ključ. |
| R05 | Checkbox `Prikaži le priljubljena` se začne kot `false`; vključen omeji oba prikaza na `Vₚ` in ohrani vrstni red `Tₚ`. | Preveri privzeto stanje in filtriran vrstni red v preglednici in tabli. |
| R06 | Odstranitev oznake med aktivnim filtrom takoj odstrani opravilo iz `Vₚ`. Če je `Vₚ=∅`, je vidno točno `Ni priljubljenih opravil.`; kontrola filtra ostane dosegljiva za izklop. | Vključi filter, odstrani zadnji vidni ID in preveri prazno stanje ter checkbox. |
| R07 | Preglednica in tabla uporabljata isti `F` in `b`; menjava pogleda ju ne ponastavi. Odpiranje povezave opravila še vedno pokaže podrobnosti po njegovem ID-ju. | D01, D04; preklopi pogled in odpri podrobnosti opravila z enakim naslovom kot drugo. |
| R08 | Menjava projekta ohrani globalni `F` in nastavi `b=false`; osvežitev obnovi `F` iz shrambe in začne z `b=false`. | Preklopi projekt med vključenim filtrom, nato osveži in preveri oznake ter filter. |
| R09 | Gumb `Odstrani priljubljene tega projekta` nastavi `F' = F \\ Iₚ`, tudi če so opravila skrita s filtrom. ID-ji drugih projektov in neznani ID-ji ostanejo. Gumb je onemogočen natanko, ko `F ∩ Iₚ = ∅`. | Izbriši priljubljene enega projekta, preveri drugi projekt/neznani ID ter stanje gumba pri nič in več zadetkih. |
| R10 | `role=status`, `aria-label="Število priljubljenih"` vedno kaže točno `Priljubljeno: X od M.`, kjer `X=|F ∩ Iₚ|` in `M=|Tₚ|` ne glede na filter. Števci stolpcev table štejejo samo vidna opravila po stanju. Ohranita se `aria-label="Pregled stanj opravil"` in `data-task-id` na vrsticah/karticah. | Preveri števce pred/med filtrom ter števce stolpcev po stanju. |
| R11 | Dogodek `storage` za ključ `folio:favorites:v1` takoj zamenja `F` po pravilih R03–R04; `newValue=null` pomeni `F=∅`. Drug ključ se prezre, uskladitev ne sproži povratnega zapisa. Izjema `getItem` ali `setItem` ne prekine uporabe: stanje v pomnilniku deluje, `role=alert` pa vsebuje besedo `shramba`. | Sproži veljaven/neveljaven/null dogodek, dogodek drugega ključa ter napaki branja in pisanja; preveri brez povratnega zapisa in opozorilo. |
| R12 | Vse spremembe so lokalne: brez zapisovalnih zahtev `/api/` in brez spremembe polj `Task`. UI ne uporablja `/__test/`, lokalne kopije opravil ali drugega ključa za shranjevanje. Obstoječe nalaganje, navigacija, podrobnosti in Folio ostanejo; pri 390 px ni vodoravnega drsenja cele strani, notranje drsenje tabele/table je dovoljeno. | D04 ter pregled mrežnih zahtev, podatkov, podrobnosti, navigacije in `documentElement.scrollWidth <= innerWidth` pri širini 390 px. |

Splošna pravila veljajo za prazne sezname, eno ali več opravil, poljubne nize
ID-jev in naslove, tudi enake, ter opravila v izvornem vrstnem redu API-ja.
Začetna podatkovna domena določa enolične ID-je; testni projekt je lahko prazen.
UI bere samo javni `/api/`; testi lahko neodvisno nadzirajo GET odgovore.
Navigacije med nedokončanim nalaganjem in sočasnih sprememb podatkov brez
osvežitve zahteve ne širijo prek regresijskega obnašanja izhodišča.

## Izvedba in sledljivost

Izvorni pregled: `src/App.tsx` veže projektno nalaganje, povzetek, preglednico,
poglede in `TaskDetails`; `src/TaskBoard.tsx` razporedi kartice po stanju;
`src/navigation.ts` nosi ID projekta/opravila in pogled v hash poti; `src/api.ts`
izpostavlja GET in obstoječi pripravljeni `updateTask`; `src/styles.css` vsebuje
notranje pomikanje ter odzivno postavitev. `tests/development/P07.spec.ts`
vsebuje scenarije D01–D04, `helpers.ts` pa nadzorovane podatke/GET-e in preverjanje
zapisov API ter širine strani. Ti testi v fazi specifikacije niso bili zagnani.
Implementer po izvedbi dopolni dejanske lokacije kode, dodatne scenarije in dokaze;
spodaj navedeni izidi zato niso uspešni rezultati.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | ID določa samo svojo oznako; klik ne odpre podrobnosti. | D01; oba pogleda, enaka naslova. | `App.tsx` `ProjectView`; `TaskBoard.tsx` `TaskBoard` — obstoječa mesta vrstice/kartice. | Ni zagnano v fazi specifikacije. |
| R02 | Kanoničen zapis ID množice pod točnim ključem. | D03; dodatno urejanje in brez polj opravila. | Nova shrambena/stanj­ska koda (implementer določi lokacijo). | Ni zagnano; še ni implementirano. |
| R03 | Obnova, deduplikacija in ohranitev neznanih ID-jev. | D03; vnaprej nastavljen zapis z dvojniki/neznanim ID-jem. | Nova shrambena/stanj­ska koda. | Ni zagnano; še ni implementirano. |
| R04 | Neveljaven zapis postavi prazno stanje brez samodejnega zapisa. | Razvojni scenariji za vse navedene napake oblike. | Nova shrambena/stanj­ska koda. | Ni zagnano; še ni implementirano. |
| R05 | Filter je privzeto izklopljen in ohranja vrstni red. | Filtriranje v preglednici in tabli. | `App.tsx` `ProjectView`; `TaskBoard.tsx` prejme filtriran seznam. | Ni zagnano v fazi specifikacije. |
| R06 | Odznačitev takoj spremeni rezultate; prazen filter pokaže določeno sporočilo. | D02. | `App.tsx` stanje seznama in prazno stanje. | Ni zagnano; D02 ni bil zagnan. |
| R07 | Stanje je enotno za oba pogleda; podrobnosti uporabljajo ID povezave. | D01, D04; obstoječi scenarij `details`. | `App.tsx`, `TaskBoard.tsx`, `navigation.ts`, `TaskDetails.tsx`. | Ni zagnano v fazi specifikacije. |
| R08 | Globalna množica preživi projektno menjavo/osvežitev; filter se ponastavi. | Projektna menjava z vključenim filtrom in osvežitev. | Lastništvo stanja v `App.tsx`/novem stanju; `navigation.ts` za pot. | Ni zagnano; še ni implementirano. |
| R09 | Odšteje samo celoten `Iₚ`; pravilno onemogočanje. | Večprojektni ID-ji, skriti zadetki in prazen projekt. | `App.tsx` kontrole `ProjectView`; skupna shrambena množica. | Ni zagnano; še ni implementirano. |
| R10 | Točni atributi/tekst števca in števci vidnih stolpcev. | Filter on/off, različna stanja, prazen projekt. | `App.tsx` povzetek; `TaskBoard.tsx` `columns`. | Ni zagnano; še ni implementirano. |
| R11 | Zunanji dogodek brez odmevnega zapisa; izjeme so obravnavane. | Storage dogodki in napake branja/pisanja. | Nova shrambena/stanj­ska koda in opozorilo v UI. | Ni zagnano; še ni implementirano. |
| R12 | Samo lokalna priljubljenost, ohranjene regresije in brez preliva strani. | D04; pregled podrobnosti, API zahtev in širine 390 px. | `App.tsx`, `api.ts`, `navigation.ts`, `styles.css`. | Ni zagnano v fazi specifikacije. |

## Odprta vprašanja in omejitve

Naloga ne določa dodatnega vedenja za dodana polja v veljavnem JSON objektu;
za obnovo so obvezni `version:1` in veljaven nizovni seznam `ids`. Predlagani
scenariji v zgornji sledljivosti niso dokaz izvedbe. Končni testi naloge niso
dostopni tej fazi in niso navedeni kot opravljeni.
# Implementacija in preverjanje P07

## Začetni zapis

Vloga: implementer. Specifikacija `docs/agent/specification.md` opredeljuje R01–R12; izvirne zahteve v `task/instructions.md` ostajajo merodajne. Dovoljene spremembe so `src/`, `tests/agent/` in ta implementacijski zapis. Ne spreminjam specifikacije, njene zgodovine, skupnih testov ali infrastrukture.

## Izvedba in sledljivost

Implementacija je v `src/useFavorites.ts` (branje, validacija, zapis, zunanji dogodki in izjeme), `src/App.tsx` (stanje projektnega filtra, kontrole, števec in filtriranje vrstice) ter `src/TaskBoard.tsx` (iste priljubljene in filtrirane naloge na tabli). Gumb je v `src/components.tsx`, odzivni slogi/opozorilo v `src/styles.css`. Dodatni scenariji so v `tests/agent/favorites.spec.ts`.

| Zahteva | Povezava s pogojem | Test in dejanski dokaz |
| --- | --- | --- |
| R01 | Članstvo se preklopi po ID-ju; gumb je ločen od povezave. | D01 prestane v `npm run check`; test neveljavnih/veljavnih ID-jev in osvežitve v `tests/agent/favorites.spec.ts` prestane. |
| R02 | Shrani samo unikatne ID-je po privzetem JS vrstnem redu pod `folio:favorites:v1`. | D03 in agentni test obnove/kanonizacije prestaneta; preverita JSON po zapisu. |
| R03 | Obnova v `Set` deduplicira in obdrži neznane ID-je. | Agentni test obnove `future-task` in dvojnega `web-02` prestane. |
| R04 | Neveljaven zapis pomeni prazen nabor in se pri nalaganju ne prepiše. | Agentni test pokrije neveljaven JSON, napačno različico, manjkajoče `ids`, neniz in manjkajoč ključ; 5 primerov prestane. |
| R05 | `visibleTasks = tasks.filter(...)` ob vključenem filtru, sicer API vrstni red; filter se zažene izključen. | D02 prestane; projektni agentni test preveri filtriranje. |
| R06 | Odstranitev posodobi isti nabor; prazen aktiven filter izpiše določeno besedilo. | D02 prestane v `npm run check`. |
| R07 | Preglednica in tabla dobita isti `visibleTasks` in `favorites`; povezave še naprej uporabljajo ID. | D01, D04 in regresijski baseline za podrobnosti po ID-ju prestanejo v `npm run check`. |
| R08 | `favorites` je v `App`; ključ `ProjectView` ponastavi filter ob menjavi projekta. | Agentni projektni test potrdi ponastavitev filtra; D03 potrdi obnovo po osvežitvi. |
| R09 | Brisanje filtrira globalni nabor po vseh `tasks` trenutnega projekta. | Agentni projektni test preveri ohranitev `foreign-task` in onemogočen gumb po brisanju. |
| R10 | Statusno besedilo šteje `projectFavoriteIds` proti vsem `tasks`; stolpci table preštejejo prej filtrirane vnose. | Razvojni D04 ter mobilni/namizni baseline prestanejo; natančni dodatni robni števci niso bili posebej preverjeni. |
| R11 | Listener preverja ključ; `null` razčleni kot prazno; sinhronizacija ne kliče zapisovalne poti. Izjeme branja/zapisa so ujete in opozorjene. | Agentni testi za dogodke, napako branja in napako zapisa prestanejo; brez API zapisov. |
| R12 | Spremembe delujejo v React/localStorage brez API pozivov ali sprememb `Task`. | `readonly` v D04 preveri nič API zapisov in `scrollWidth <= innerWidth`; prestanejo namizni in mobilni testi. |

Pred iztekom faze je `npm run check` prestal lint, TypeScript, gradnjo in vseh 49 takratnih testov (14 API, 24 baseline, 8 P07 razvojnih, 3 agentni). Po razširitvi agentne pokritosti je `npx playwright test --project=agent` prestal vseh 5 agentnih testov. NPM je med zagoni izpisal opozorilo o neznani `http-proxy` nastavitvi; ni vplivalo na rezultate.

## Spremembe in dokazi

Predaja pregledovalcu: testna koda je bila spremenjena po celotnem `npm run check`, zato je zadnji končni zagon pokrival popravljeno agentno zbirko, ne pa ponovnega polnega 51-testnega zagona. Končnih skritih testov ni mogoče preveriti. Omejitve okolja: `git diff` ni deloval, ker sistemski `xcrun` javlja neveljavno Command Line Tools pot; splet ni potreben in ni bil uporabljen.

Pregled specifikacije: ne vidim napake, ki bi preprečevala izvedbo. Specifikacija pravilno opozarja, da statusi v števcih table sledijo vidnim opravilom; preostali nepreverjeni robni primeri vključujejo poljubne Unicode ID-je v sortirnem vrstnem redu ter napake branja/zapisa v vseh brskalnikih.
cat: docs/agent/specification-history.md: No such file or directory

```

## 03-review-item_12

Ukaz:
```text
/bin/zsh -lc 'cat tests/development/helpers.ts && cat package.json && cat docs/agent/review.json && git status --short -- docs/agent/review.json src tests/agent'
```

Izhodna koda: 1.

```text
import { expect, type Page } from '@playwright/test'
export { expect, test } from '@playwright/test'

export type Task = { id: string; projectId: string; title: string; description: string; status: 'todo' | 'in_progress' | 'done'; assignee: string; dueDate: string }
export const makeTask = (id: string, values: Partial<Task> = {}): Task => ({ id, projectId: 'web', title: 'Opravilo ' + id, description: 'Opis opravila ' + id, status: 'todo', assignee: 'Ana Novak', dueDate: '2026-09-21', ...values })
export const examples: Task[] = [
  makeTask('web-01', { title: 'Čas za pregled', description: 'Končni zapis vsebine', status: 'in_progress', dueDate: '2026-09-18' }),
  makeTask('web-02', { title: 'Pregled vsebine', assignee: 'Luka Kovač', dueDate: '2026-09-22' }),
  makeTask('web-03', { title: 'Pregled vsebine', status: 'done', dueDate: '2026-09-16' }),
  makeTask('web-04', { title: 'Alfa 10', assignee: 'Maja Zupan', dueDate: '2026-09-28' }),
  makeTask('web-05', { title: 'alfa 2', status: 'in_progress', dueDate: '2026-09-29' }),
  makeTask('web-06', { title: 'Zapis, "citat"', description: 'Prva vrstica\nDruga vrstica; čšž', status: 'done', assignee: 'Živa Kovač', dueDate: '2026-09-21' }),
  makeTask('web-07', { title: '=SUM(A1)', assignee: 'Črt', dueDate: '2026-09-20' }),
  makeTask('web-08', { title: 'Dodatno opravilo', assignee: 'Maja Zupan', dueDate: '2026-10-01' }),
  makeTask('launch-01', { projectId: 'launch', title: 'Drugi projekt', dueDate: '2026-09-24' }),
  makeTask('launch-02', { projectId: 'launch', title: 'Drugi projekt', status: 'done', assignee: 'Luka Kovač', dueDate: '2026-09-25' }),
]

export async function mount(page: Page, records: Task[] = examples, hash = '#/projects/web') {
  await page.request.post('/__test/reset')
  const writes: string[] = []
  page.on('request', request => { if (new URL(request.url()).pathname.startsWith('/api/') && !['GET', 'HEAD', 'OPTIONS'].includes(request.method())) writes.push(request.method() + ' ' + request.url()) })
  await page.route('**/api/**', async route => {
    const request = route.request(), path = new URL(request.url()).pathname
    if (request.method() !== 'GET') return route.continue()
    if (path === '/api/projects') return route.fulfill({ json: [{ id: 'web', name: 'Spletna prenova' }, { id: 'launch', name: 'Jesenska kampanja' }] })
    const project = /^\/api\/projects\/([^/]+)\/tasks$/.exec(path)
    if (project) return route.fulfill({ json: records.filter(t => t.projectId === decodeURIComponent(project[1])) })
    const detail = /^\/api\/tasks\/([^/]+)$/.exec(path)
    if (detail) {
      const task = records.find(t => t.id === decodeURIComponent(detail[1]))
      return task ? route.fulfill({ json: task }) : route.fulfill({ status: 404, json: { message: 'Opravilo ne obstaja.' } })
    }
    return route.continue()
  })
  await page.goto('/' + hash)
  await expect(page.getByRole('heading', { name: hash.includes('/launch') ? 'Jesenska kampanja' : 'Spletna prenova', exact: true })).toBeVisible()
  return writes
}

export const ids = (page: Page) => page.locator('[data-task-id]').evaluateAll(nodes => nodes.map(n => n.getAttribute('data-task-id')))
export async function expectIds(page: Page, values: string[], ordered = true) {
  await expect.poll(async () => { const result = await ids(page); return ordered ? result : result.sort() }).toEqual(ordered ? values : [...values].sort())
}
export const webIds = (records: Task[] = examples) => records.filter(t => t.projectId === 'web').map(t => t.id)
export async function board(page: Page) { await page.getByRole('button', { name: 'Tabla', exact: true }).click(); await expect(page.getByRole('region', { name: 'Tabla opravil' })).toBeVisible() }
export async function table(page: Page) { await page.getByRole('button', { name: 'Preglednica', exact: true }).click(); await expect(page.getByRole('button', { name: 'Preglednica', exact: true })).toHaveAttribute('aria-pressed', 'true') }
export const select = (page: Page, name: string, value: string) => page.getByRole('combobox', { name, exact: true }).selectOption(value)
export const click = (page: Page, name: string) => page.getByRole('button', { name, exact: true }).click()
export async function project(page: Page, id: 'web' | 'launch') {
  const name = id === 'web' ? 'Spletna prenova' : 'Jesenska kampanja'
  await page.getByRole('navigation', { name: 'Projekti' }).getByRole('link', { name, exact: true }).click()
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
}
export async function details(page: Page, id: string) {
  await page.locator(`[data-task-id="${id}"]`).getByRole('link').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('dialog').getByText(id, { exact: true }).first()).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
}
export async function summary(page: Page, values: number[]) {
  await expect(page.locator('[aria-label="Pregled stanj opravil"] strong')).toHaveText(values.map(String))
}
export async function columnIds(page: Page, name: string, values: string[]) {
  await expect.poll(() => page.getByRole('region', { name, exact: true }).locator('[data-task-id]').evaluateAll(nodes => nodes.map(n => n.getAttribute('data-task-id')))).toEqual(values)
}
export async function readonly(page: Page, writes: string[]) {
  expect(writes).toEqual([])
  const state = await (await page.request.get('/__test/state')).json() as { saveRequests: number }
  expect(state.saveRequests).toBe(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
}
export async function downloadCSV(page: Page) {
  const event = page.waitForEvent('download'); await click(page, 'Izvozi CSV'); const download = await event
  const stream = await download.createReadStream(); if (!stream) throw Error('Download has no stream')
  const buffers: Buffer[] = []; for await (const part of stream) buffers.push(Buffer.from(part))
  return { name: download.suggestedFilename(), text: Buffer.concat(buffers).toString('utf8') }
}
{
  "name": "folio",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "engines": {
    "node": ">=24.11.0 <25"
  },
  "scripts": {
    "dev": "node server/dev.ts",
    "preview": "node server/dev.ts --preview",
    "typecheck": "tsc --noEmit",
    "build": "npm run typecheck && vite build",
    "lint": "eslint .",
    "test": "playwright test",
    "test:ui": "playwright test tests/baseline.spec.ts",
    "check": "npm run lint && npm run build && npm test"
  },
  "dependencies": {
    "lucide-react": "1.46.0",
    "react": "19.3.0",
    "react-dom": "19.3.0"
  },
  "devDependencies": {
    "@eslint/js": "10.0.1",
    "@playwright/test": "1.63.0",
    "@types/node": "26.5.1",
    "@types/react": "19.3.0",
    "@types/react-dom": "19.3.0",
    "@vitejs/plugin-react": "6.1.1",
    "eslint": "10.10.0",
    "eslint-plugin-react-hooks": "7.1.1",
    "eslint-plugin-react-refresh": "0.5.7",
    "globals": "17.12.0",
    "typescript": "6.0.3",
    "typescript-eslint": "8.70.0",
    "vite": "8.3.0"
  }
}
{"complete":false,"checkedRequirements":[],"unverified":[],"specificationChangesRequired":false,"codeChangesRequired":false,"summary":"Pregled poteka.","findings":[]}
xcrun: error: invalid active developer path (/Library/Developer/CommandLineTools), missing xcrun at: /Library/Developer/CommandLineTools/usr/bin/xcrun

```

## 03-review-item_16

Ukaz:
```text
/bin/zsh -lc "node -e \"const fs=require('node:fs'); const p='docs/agent/review.json'; const x=JSON.parse(fs.readFileSync(p,'utf8')); if("'!x.complete || x.checkedRequirements.length!==12 || x.findings.length!==0 || x.specificationChangesRequired || x.codeChangesRequired) process.exit(1); console.log(JSON.stringify(x))" && node task/time-budget.mjs'
```

Izhodna koda: 0.

```text
{"complete":true,"checkedRequirements":["R01","R02","R03","R04","R05","R06","R07","R08","R09","R10","R11","R12"],"unverified":["Nisem ponovno zagnal npm run check ali Playwright testov; docs/agent/verification.md poroča o uspešnih zagonih, vendar jih nisem neodvisno ponovil.","Končni skriti testi niso dostopni; brskalniškega preverjanja nisem ponovil.","R10: pregledani testi ne preverijo izrecno številčnih vrednosti stolpcev table po filtru; implementacija jih izračuna iz vidnega seznama.","Ukaz git status je omejen zaradi neveljavne poti Command Line Tools (xcrun)."],"specificationChangesRequired":false,"codeChangesRequired":false,"summary":"Pregled R01–R12 je opravljen; pri primerjavi specifikacije, kode in vidnih testov nisem našel konkretnih odstopanj od zahtev.","findings":[]}
{"phaseSecondsRemaining":111,"totalSecondsRemaining":230,"phaseDeadlineUTC":"2026-09-28T20:27:57.362Z"}

```
