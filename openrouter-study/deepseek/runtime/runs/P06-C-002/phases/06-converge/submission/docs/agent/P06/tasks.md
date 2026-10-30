# P06: Naloge izvedbe

> Vir: `docs/agent/P06/spec.md` in `docs/agent/P06/plan.md`. Oznake T001+ so zaporedne in odvisnostno urejene. Vsaka naloga navaja datoteko; kljukica pomeni opravljeno in preverjeno.

## Faza 1: Priprava

- [x] T001 Potrdi obseg in meje: preberi `task/instructions.md`, `docs/agent/P06/spec.md` in `docs/agent/P06/plan.md`; spremembe le v `src/`, `tests/agent/`, `docs/agent/`.

## Faza 2: Temelj

- [x] T002 V `src/csvExport.ts` dodaj kanonične kolone, tipe in čiste funkcije `filterRows`, `neutralizeFormula`, `serializeCsv` (BOM U+FEFF, narekovanje, CRLF tudi za zadnjo vrstico) skladno s pravili iz specifikacije.
- [x] T003 V `src/App.tsx` dodaj stanje izvoza (izbrane kolone, ločilo, filter), kontrole z dostopnimi imeni (`Stolpec <ime>`, `Ločilo CSV`, `Filter izvoza`, gumb `Izvozi CSV`), pravilo `enabled` in prenos `folio-<projectId>.csv` prek Blob + `a[download]`; brez `window.open` in brez zapisov na API.
- [x] T004 V `src/styles.css` oblikuj vrstico kontrol po Folio gradnikih; pri 390 pik brez vodoravnega prelivanja strani, viden fokus.

## Faza 3: Scenarij 1 — privzeti izvoz (R01, R05–R09)

- [x] T005 V `tests/agent/p06-export.spec.ts` dodaj test privzetega izvoza: ime `folio-web.csv`, BOM, kanonična glava, vsa opravila v izvornem vrstnem redu, CRLF na koncu (R01, R05, R07).
- [x] T006 V `tests/agent/p06-export.spec.ts` dodaj test narekovanja in nevtralizacije: podvojeni narekovaji, prelomi in ločila znotraj vrednosti, vsi štirje znaki formul za vsemi dovoljenimi začetnimi znaki, ohranjeni šumniki in `dueDate`/`status` (R06, R08, R09).
- [x] T007 Zaženi razvojna primera D01 in D03: `npx playwright test --project=development-desktop --grep "D01|D03"`.

## Faza 4: Scenarij 2 — prilagojeni izvoz (R02–R04, R10, R11)

- [x] T008 V `tests/agent/p06-export.spec.ts` dodaj test izbora kolon v različnih vrstnih redih (enaka glava in bajti) ter obeh ločil (R02, R06).
- [x] T009 V `tests/agent/p06-export.spec.ts` dodaj test filtra `all/todo/in_progress/done` (omeji samo izvoz, prikaz ostane cel), onemogočenega gumba pri praznem izboru kolon in praznem filtriranem rezultatu ter ponovnega omogočanja (R03, R04).
- [x] T010 V `tests/agent/p06-export.spec.ts` dodaj test preklopa pogleda (isti bajti), ponastavitve ob menjavi projekta in zaporednih izvozov po spremembi nastavitev (R10, R11).
- [x] T011 Zaženi razvojna primera D02 in D04: `npx playwright test --project=development-desktop --grep "D02|D04"`.

## Faza 5: Scenarij 3 — varnost in nespreminjanje podatkov (R12)

- [x] T012 V `tests/agent/p06-export.spec.ts` dodaj test: po izvozu so opravila in izvorna polja nespremenjeni, ni novih zapisovalnih zahtev na `/api/` (uporabi `readonly` iz javnega pomočnika) (R12).

## Faza 6: Preverjanje in predaja

- [x] T013 Zaženi `npm run typecheck` in `npm run lint`.
- [x] T014 Zaženi lastne in skupne teste: `npx playwright test --project=agent --project=development-desktop --project=development-mobile --project=desktop --project=mobile --project=api`.
- [x] T015 V `docs/agent/P06/spec.md` izpolni tabelo sledljivosti R01–R12 z dejanskimi izidi (ime testa, dnevnik) in zapiši nepreverjene dele ali omejitve; uspešnih testov ne navajaj brez izvedbe.
