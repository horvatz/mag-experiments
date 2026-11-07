# P06 — Načrt izvedbe

## Tehnični kontekst

- Aplikacija je React 19 + TypeScript + Vite; testira joč Playwright 1.63. Odvisnosti, strežnik, skupni tipi, skupni testi in nastavitve ostanejo nespremenjeni.
- Podatke beremo z obstoječega `useResource` na `/api/projects/{projectId}/tasks`; tipi so v `shared/types.ts`.
- Izvoz je lokalna, bralna funkcionalnost v uporabniškem vmesniku. Ne uvajamo nove odvisnosti, zapisovalnega API-ja, URL stanja ali `localStorage`.
- Vizualno sledimo potrjenemu Folio dizajnu in obstoječim spremenljivkam v `src/styles.css`.

## Odločitve in struktura

### 1. Čista pretvorba CSV

Ustvarimo `src/csvExport.ts` z:

- nespremenljivim dovoljenim vrstnim redom kolon: `id`, `projectId`, `title`, `status`, `assignee`, `dueDate`, `description`;
- tipoma `ExportColumn` in `ExportFilter` ter dovoljenima ločiloma `;` in `,`;
- čisto funkcijo `buildCsv(tasks, selectedColumns, delimiter)`, ki izvede filtriranje po statusu, vrstni red po `allowedColumns`, navedbo glav in vrednosti ter zaključi vsako vrstico z `CRLF`;
- nevtralizacijo formul le za podatkovne vrednosti: uvodni apostrof dodamo na začetek originalnega niza, če se po presledku, tabulatorju, CR ali LF pojavi `=`, `+`, `-` ali `@`; glava ostane brez te spremembe;
- podvajanjem notranjih dvojnih narekovajev in ohranjanjem vseh drugih Unicode znakov, presledkov, ločil in prelomov vrstic.

Filtriranje izvoza ostane ločeno od obstoječega prikaza: vmesnik vedno prikaže celoten projekt, CSV pa vsebuje samo vrstice izbranega statusa.

### 2. Stanje in uporabniški vmesnik

V `src/App.tsx` v `ProjectView` dodamo:

- stanje izbranih kolon, ločila in filtra izvoza;
- privzete vrednosti: vse kolone, `;`, `all`;
- ponastavitev ob spremembi projekta ali zaključku osvežitve podatkov; `ProjectView` je že ključen z `project.id`, osvežitev pa zaznamo prek spremembe podatkovnega objekta;
- izvedene `filteredTasks` in pogoj `canExport`; gumb je onemogočen med nalaganjem, ob napaki, brez izbranih kolon in ob praznem filtriranem rezultatu;
- kontrole znotraj oddelka opravil, zunaj povezav posameznih opravil. Vsak checkbox ima dostopno ime `Stolpec <ime>`, selektorja sta `Ločilo CSV` in `Filter izvoza`, gumb pa `Izvozi CSV`.

Preklop Preglednica/Tabla ne spreminja tega stanja, ker se isti `ProjectView` ohrani med URL zamenjavo pogleda.

### 3. Lokalni prenos

V `src/csvExport.ts` dodamo pomožno izvozno funkcijo, ki:

- zgradi CSV brez BOM in ga kodira z `TextEncoder`;
- predstavi BOM z `Uint8Array` bajti `EF BB BF` in ne s prefixom niza, da sta izid in zahteve po bajtih dosledni;
- ustvari `Blob`, `URL.createObjectURL` in začasni `<a download>` ter po kliku sprosti URL; ne odpre nove strani in ne pošlje vsebine na strežnik;
- datoteko poimenuje `folio-{projectId}.csv`.

### 4. Folio slog

V `src/styles.css` dodamo samo stil za nov sklop kontrol izvoza. Uporabimo obstoječe površine, robove, radij, pisave in razmike; zagotovimo ozko postavitev brez razširjanja celotne strane in vidne tipkovniške fokuse.

## Testiranje in sledljivost

Dodamo `tests/agent/csv-export.spec.ts`, ki z lokalnimi podatki prek javnega API-ja pokrije:

- R01–R02: privzet izvoz, trenutni projekt, izvorni vrstni red in vrstni red kolon;
- R03–R04: onemogočen izvoz brez kolon, praznega projekta ali praznega filtriranega rezultata ter delujoč filter;
- R05–R09: ime in bajte prenosa, UTF-8 BOM, obe ločili, navedbo, podvajanje narekovajev, CRLF, prelome v vrednostih, nevtralizacijo formul, Unicode in izvorne vrednosti statusa ter datuma;
- R10–R11: enake bajte v obeh pogledih ter ponastavitev ob menjavi projekta ali osvežitvi podatkov;
- R12: ohranitev obstoječih oznak in bralnih poti ter odsotnost zapisovalnih API-jev.

Po implementaciji izvedemo:

1. `npm test -- tests/agent/csv-export.spec.ts` za nove lastne teste.
2. `npm run check` za lint, tipno preverjanje, gradnjo in celotni Playwright niz.

Ob morebitni napaki popravimo vzrok, posodobilimo sledljivost v `spec.md` in ponovno zagnali preverjanja. Neresultatov ne označimo za uspešne.

## Meje

- Ne spreminjamo strežnika, skupnih tipov, skupnih testov, odvisnosti, Playwright ali Vite nastavitev.
- Ne dodajamo trajnega stanja izvoza ali novih zunanjih meritev.
- Sočasne spremembe podatkov brez osvežitve niso del tega načrta, ker jih izvirne zahteve ne razširijo.

**Verzija načrta:** 1.0 · **Datum:** 2026-10-30
