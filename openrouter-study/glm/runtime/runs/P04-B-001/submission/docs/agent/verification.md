# Preverjanje implementacije P04

## Načrt

- Preberi izvorno stanje UI in razvojne teste.
- Izvedi razvrščanje kot čisto projekcijo s stabilnimi primerjalniki.
- Dopolni kontrole in ohrani obstoječo Folio zasnovo.
- Dodaj lastne Playwright teste v `tests/agent/`.
- Poženi ciljne lastne teste, razvojne teste in nato celotni `npm run check`.

## Potek in rezultati

### Spremembe

- Dodan je `src/sortTasks.ts` s tipi nastavitev, privzetimi vrednostmi, normalizacijo besedila, statusnim in datumskim primerjalnikom ter stabilno projekcijo `sortTasks`.
- `src/App.tsx` hrani štiri nastavitve lokalno v `ProjectView`, izpeljuje razvrščeno polje, prikazuje štiri kontrole in gumb za ponastavitev ter uporabi isti razvrščenemu polju v preglednici in tabi.
- `src/styles.css` doda razporeditev novih kontrol z obstoječimi Folio spremenljivkami in prilagoditvijo za ozke zaslone.
- Dodan je `tests/agent/P04.spec.ts` s 13 lastnimi Playwright testi za R01–R12.
- `src/TaskBoard.tsx` ni bilo treba spreminjati: obstoječa komponenta že sprejme polje in ohrani relativni vrstni red znotraj statusnih stolpcev.

### Sledljivost

| Zahteva | Izid in dokaz |
| --- | --- |
| R01 | `R01: default order and controls` preveri privzete vrednosti in izvorno zaporedje API-ja. |
| R02 | `R02: normalized UTF-16 text order` preveri normalizacijo, UTF-16 primerjavo in obe besedilni ključa. |
| R03 | `R03: status and chronological date comparators` preveri statusni in datumski vrstni red v obeh smereh. |
| R04 | `R04: descending direction does not reverse ties` preveri obrat le rezultata primerjave. |
| R05 | `R05: independent secondary direction` preveri neodvisno sekundarno smer. |
| R06 | `R06: duplicate keys and original remain stable` preveri duplikate, enake ključe in obnašanje `original`. |
| R07 | `R07: board columns keep sorted relative order` preveri vse tri stolpce tabele. |
| R08 | `R08: settings survive view and detail navigation` preveri ohranitev nastavitev ob preklopih. |
| R09 | `R09: project change and refresh reset settings` preveri ponastavitev, URL in `localStorage`. |
| R10 | `R10: reset works in an empty project` in `R10: reset and all controls work with one task` pokrijeta mejna projekta. |
| R11 | `R11: sorting is a read-only projection` preveri števce, vrstni red in odsotnost zapisov. |
| R12 | `R12: unique IDs, details and narrow viewport` preveri enkratne ID-je, podrobnosti in širino 390 px. |

### Izvedena preverjanja

- `npx playwright test tests/agent/P04.spec.ts --project=agent`: 13/13 uspešno.
- `npx playwright test --project=development-desktop --project=development-mobile`: 8/8 uspešno.
- `npm run check`: slog, tipi, gradnja in 59/59 dostopnih testov uspešno.

Med razvojem so bili trije lastni testi najprej rdeči zaradi napačnih pričakovanih vrstnih redov, enega neobdelanega obljubljenega rezultata in ponovnega prirejanja API-ja v isti testni strani. Napake so bile odpravljene v testih; končne preglebe so zeleni.

## Omejitve okolja

- Javni internet je blokiran.
- Spremenljive smejo biti le `src/`, `tests/agent/` in implementerski zapisi v `docs/agent/`.
- Infrastruktura, odvisnosti in skupni testi ostajajo nespremenjeni.

## Ugotovitve in odstopanja specifikacije

- Predana specifikacija je skladna z izvirnimi zahtevami; nisem odkril odstopanj.
