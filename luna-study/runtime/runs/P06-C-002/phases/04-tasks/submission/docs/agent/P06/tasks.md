# Naloge P06: Nastavljiv izvoz CSV

## Setup

- [ ] [T001] V `tests/agent/P06.spec.ts` pripravi Playwright ogrodje, ki podatke za projektne GET klice poda z lokalnimi odgovori in zna pregledati preneseno datoteko; aplikacija pri tem ne sme uporabljati `/__test/`.

## Foundational

- [ ] [T002] V `src/csvExport.ts` dodaj deterministično pripravo CSV iz `Task[]`: kanonični vrstni red izbranih polj, stabilen filter brez mutiranja podatkov, nevtralizacijo formul, citiranje in podvajanje narekovajev, izbrano ločilo, CRLF na koncu vsake vrstice ter UTF-8 BOM. (R01–R02, R04–R09)
- [ ] [T003] V `src/CsvExportControls.tsx` dodaj dostopne checkboxe in selecte z dogovorjenimi imeni, privzete nastavitve, pogoje onemogočenja izvoza ter brskalniški prenos z imenom `folio-<projectId>.csv`; stanje naj preživi preklop pogleda, ponastavi pa naj se z obstoječim projektnim ključem ob menjavi projekta in osvežitvi. Ne dodajaj odvisnosti ali zapisovalnih klicev. (R01–R03, R05–R09, R11–R12)

## User story 1 — nastavitev in izvoz

- [ ] [T004] V `src/App.tsx` umesti izvozne kontrole ob preklop Preglednica/Tabla in jim posreduj opravila trenutnega projekta; filter naj omeji samo izvoz, obstoječi prikaz in povezave opravil pa naj ostanejo nedotaknjeni. (R01–R04, R10, R12)
- [ ] [T005] V `src/styles.css` oblikuj kontrole z obstoječimi gradniki in spremenljivkami Folio; pri širini 390 px prepreči širjenje cele strani in ohrani notranje drsenje preglednice/table ter viden fokus. (R12)
- [ ] [T006] V `tests/agent/P06.spec.ts` preveri privzeti izvoz, vrstni red stolpcev ne glede na vrstni red izbire, onemogočenje in ponovno omogočenje izvoza po izboru kolone, prazen projekt/rezultat, filtre brez spremembe prikaza, ime, BOM in brez navigacije/zapisovalne zahteve ter citiranje, ločila, CRLF, nevtralizacijo formul, Unicode, status in datum. (R01–R09)

## User story 2 — ohranjeno stanje in podatki

- [ ] [T007] V `tests/agent/P06.spec.ts` preveri enake bajte po preklopu pogleda, ponastavitev nastavitev ob menjavi projekta in osvežitvi, odraz zadnjih izbir v naslednjem izvozu, odsotnost zapisov na API ter ohranitev `data-task-id`, dostopnih imen in celotnega prikaza. (R10–R12)

## Polish

- [ ] [T008] Zaženi lint, tipizacijo, skupne regresijske teste, pripravljene razvojne teste P06 in `tests/agent/P06.spec.ts`; nato v `docs/agent/P06/spec.md` za R01–R12 poveži dejanske datoteke/kodo in teste z rezultati ter zapiši nepreverjene dele ali omejitve. Ne spreminjaj skupnih testov ali nastavitev.
