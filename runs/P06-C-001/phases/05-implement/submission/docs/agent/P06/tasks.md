# P06 — Izvedbene naloge

Datum: 2026-09-22. Podlaga: [specifikacija](spec.md) in [načrt](plan.md); izvirne [R01–R12](../../../task/instructions.md) ostajajo merilo. En agent izvaja naloge zaporedno T001 → T008. Vsaka naloga se označi šele po dokončanju; rezultat testov se vodi ločeno od samega zapisa testa. Brez sprememb infrastrukture, odvisnosti, skupnih testov, vej ali commitov.

## Priprava

- [x] T001 V `docs/agent/verification.md` odpri jedrnat dnevnik z obsegom R01–R12, mesti za ukaze, izhodne kode, dokazila in omejitve; potrdi obstoječi projekt Playwright `agent` z branjem `playwright.config.ts`. Preveri čas z `node task/time-budget.mjs`; konfiguracije ne spreminjaj.

## Temelj

- [x] T002 V `src/csv.ts` dodaj stalne kolone K, tipe nastavitev in čisto sestavo CSV: stabilni filter, stalni vrstni red kolon, zavrnitev praznih kolon/vrstic, N pred Q pri vseh vrednostih, glava brez N, obe ločili, UTF-8 BOM in končni CRLF. V `tests/agent/P06.spec.ts` dodaj smiselne čiste teste z ročno pričakovanimi bajti, štirimi sprožilci formul, dovoljenimi začetnimi znaki in negativnimi primeri, Unicode/prelomi/narekovaji ter zamrznjenim vhodom. Pokritje R01–R09, R12; S02–S04, S06.

## Uporabniška zgodba 1 — Nastavljiv prenos trenutnega projekta

- [x] T003 V `src/CsvExport.tsx` dodaj sedem checkboxov, nativna selecta in gumb s točnimi dostopnimi imeni; lokalno stanje D, omogočenost po `canExport` in zaščito v obravnavalniku. Prenesi trenutni CSV z Blob/objektnim URL-jem kot `folio-<projectId>.csv`, brez nove strani ali omrežnega zapisa; sprosti začasno povezavo in URL. Pokritje R01–R06, R12.

- [x] T004 V `src/App.tsx` vključi `CsvExport` z izvirnimi opravili v skupni del `ProjectView`, tudi pri praznem naloženem projektu, zunaj razcepa preglednica/tabla in povezav opravil. Ohrani obstoječi `key={project.id}`, polne podatke prikazov/povzetka in bralne funkcije. V `src/styles.css` dodaj omejene sloge kontrol po Foliu z vidnim fokusom in prelamljanjem pri 390 pikah. Pokritje R04, R10–R12 in dogovor o vmesniku; S03, S05–S07.

## Uporabniška zgodba 2 — Robni podatki in življenjski cikel nastavitev

- [x] T005 V `tests/agent/P06.spec.ts` dopolni brskalniške scenarije S01–S04: 0, 1 in več kot 10 opravil, drugačni ID-ji/vrstni red, ponovljeni naslovi, privzeta glava in celoten prenos z BOM, izbira kolon v obratnem vrstnem redu, prazen izbor in ponovni izbor, vsi filtri ter prazen rezultat/oba prazna projekta. Preveri, da prikaz in povzetek ostaneta celotna. Za obe ločili preveri dejanski prenos s posebnimi znaki in ročno pričakovanimi bajti, brez produkcijske funkcije za računanje pričakovanj. Pokritje R01–R09.

- [x] T006 V `tests/agent/P06.spec.ts` dopolni S05–S07: enaki bajti in ohranjene kontrole v obeh pogledih, spremenjeni zaporedni izvozi, ponastavitev ob menjavi/vrnitvi projekta in osvežitvi, brez zapisovalnih zahtev ali novih strani, ohranjene podrobnosti in oznake opravil. Pri 390 pikah v obeh pogledih preveri širino dokumenta, dostopna imena ter tipkovnični fokus; shrani posnetka v `docs/agent/P06/` za vizualni pregled. Pokritje R05, R10–R12 in dogovor o vmesniku.

## Zaključna preverjanja in predaja

- [ ] T007 Izvedi `npm run lint`, `npm run build` in `npm test` z obstoječo konfiguracijo (skupni API/namizni/mobilni testi, razvojni D01–D04 v obeh pogledih naprav ter lastni testi). Dnevnike in izhodne kode shrani v `docs/agent/P06/`; vizualno preglej posnetka Folia. Odpravi ugotovljene napake samo v dovoljenih datotekah in ponovi prizadeta preverjanja. V `docs/agent/verification.md` loči uspeh, neuspeh in neizvedeno. Pokritje vseh R01–R12, S01–S07.

- [ ] T008 V `docs/agent/P06/spec.md` dopolni vseh 12 vrstic sledljivosti s konkretnimi funkcijami/datotekami, imeni dejansko izvedenih testov ter povezavami na rezultate iz `docs/agent/verification.md`; posodobi zgodovino sprememb in morebitne omejitve. V `docs/agent/P06/tasks.md` ohrani resničen status nalog. Preveri dovoljeni obseg sprememb in čas; predaj spremembe, rezultate in neizpolnjene zahteve. Skritih končnih testov ne označi kot opravljenih.
