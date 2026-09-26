# Folio — projektna načela pilota P09, postopek C

## 1. Izvirne zahteve določajo obseg

Merilo so [projektna pravila](../../PROJECT_RULES.md) in vseh dvanajst zahtev R01–R12 iz [navodil P09](../../task/instructions.md), tudi kadar jih izvedbena dokumentacija izpusti. Ne dodajamo novih zahtev, odvisnosti ali obveznih arhitekturnih preureditev.

## 2. Omejene spremembe in ohranjen Folio

Spreminjamo samo `src/`, lastne teste v `tests/agent/`, dokumente v `docs/agent/` ter procesni datoteki `.specify/memory/constitution.md` in `.specify/feature.json`. Strežnik, začetni podatki, skupni tipi in testi, nastavitve, odvisnosti, uradne predloge in veščine ostanejo samo za branje. Ohranimo slovenska poimenovanja, dogovor o dostopnosti ter [potrjeni dizajn Folio](../../docs/dizajn.md), vključno s prilagodljivim prikazom in vidnim fokusom.

## 3. Javni API in stabilna identiteta

Aplikacija bere podatke prek obstoječega `/api/` in opravila izbira po `id`, tudi pri enakih naslovih. P09 ne spreminja podatkov in ne pošilja zapisov na API. Uporabniški vmesnik ne uporablja `/__test/`, testnih pripomočkov ali `localStorage` in ne nadomešča strežnika z lokalnimi podatki. Rešitev upošteva celotno domeno podatkov iz navodil, ne le razvojnih primerov.

## 4. Specifikacija in preverljiva sledljivost

Dokumentacija v `docs/agent/P09` pokrije [skupno predlogo](../../task/specification-template.md); dovoljene so povezave na dokumente Spec Kit namesto podvajanja. Vseh R01–R12 povežemo s sprejemnimi pogoji, kodo, testi in dejanskimi izidi. Izbrane pogoje izrazimo s predikati ter pojasnimo simbole. Po popravkih posodobimo povezave in zgodovino sprememb specifikacije.

## 5. Poštena dokazila in predaja

Rešitev preverimo s skupnimi testi in smiselnimi preverjanji zahtev P09. Uspeh navedemo samo za dejansko izvedena preverjanja z določljivim dokazom. Zapišemo spremembe, rezultate, nepreverjene dele, odstopanja in omejitve; nedostopnih končnih testov ne označimo za opravljene. Manjkajočih bistvenih podatkov ne izmišljamo.

## Izvajanje in veljavnost

Postopek C izvaja isti agent z ohranjeno zgodovino, brez drugih agentov, vej ali commitov. Vsak turn zajema le korak, ki ga sproži izvajalnik, z ustrezno lokalno veščino Spec Kit 1.0.8 in presetom Lean 1.0.0. Raziskovanje je omejeno na lokalno kodo in priložena navodila. Delo shranjujemo sproti, preostanek skupnega dvajsetminutnega roka preverjamo z `node task/time-budget.mjs` in zadnjo minuto namenimo predaji.

Ta načela povzemajo dogovorjene omejitve; ne nadomeščajo izvirnih zahtev. Spremembe načel morajo ostati znotraj uporabnikovega pooblastila in se zabeležijo z datumom ter različico.

**Različica**: 1.0.0 | **Sprejeto**: 2026-09-26 | **Nazadnje spremenjeno**: 2026-09-26
