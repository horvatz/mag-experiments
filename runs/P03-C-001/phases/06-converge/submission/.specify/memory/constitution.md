# Projektna načela Folio — pilot P03, postopek C

**Različica:** 1.0.0 | **Sprejeto:** 2026-09-24 | **Zadnja sprememba:** 2026-09-24

## 1. Izvirne zahteve in sledljivost

Merilo pravilnosti so [projektna pravila](../../PROJECT_RULES.md) in vseh dvanajst zahtev R01–R12 iz [navodil P03](../../task/instructions.md), tudi če jih izvedbeni dokument izpusti. Specifikacija mora zajeti [skupno predlogo](../../task/specification-template.md); dovoljene so povezave na dokumente Spec Kit v `docs/agent/P03/` brez podvajanja. Zahteve povežemo s sprejemnimi pogoji, kodo, dejansko izvedenimi testi in dokazi. Izbrane pogoje izrazimo s predikati ter pojasnimo simbole in predpostavke.

## 2. Ohranitev uporabniškega vmesnika

Obstoječi Folio dopolnjujemo skladno s [potrjenim dizajnom](../../docs/dizajn.md), slovenskimi poimenovanji in dogovorom o vmesniku P03. Ohranimo navigacijo, bralne podrobnosti, dostopna imena in zahtevane oznake elementov. Pri širini 390 pik se cela stran ne razširi; notranje drsenje preglednice in table je dovoljeno.

## 3. Javni API in celovitost podatkov

Aplikacija podatke pridobiva prek obstoječega `/api/` in opravila izbira po `id`. Filtriranje ne spreminja polj ali izvornega vrstnega reda podatkov in ne pošilja zapisovalnih zahtev. Filtri ostanejo začasno stanje trenutnega projekta, brez URL-ja ali trajne shrambe. Strežnika ne nadomeščamo z lokalno kopijo podatkov; `/__test/` sme uporabljati samo testni program. Rešitev mora veljati za celotno opisano podatkovno domeno, ne zgolj za začetne podatke ali razvojne primere.

## 4. Meje sprememb

Spremembe so dovoljene samo v `src/`, `tests/agent/`, `docs/agent/` ter procesnih datotekah `.specify/memory/constitution.md` in `.specify/feature.json`. Začetni podatki, strežnik, skupni tipi in testi, odvisnosti, nastavitve, infrastruktura, uradne predloge in veščine ostanejo nespremenjeni. Ne dodajamo novih zahtev, odvisnosti, zapisovalnih API-jev ali obveznih arhitekturnih preureditev.

## 5. Preverljivi rezultati

Rešitev preverimo s skupnimi testi in ločenimi smiselnimi preverjanji zahtev P03. Uspeh navedemo samo za dejansko izvedena preverjanja z določljivim izvorom dokaza. Ob predaji opišemo spremembe, rezultate, neizpolnjene zahteve, nepreverjene scenarije in omejitve. Nedostopnih končnih testov ne označimo kot opravljenih. Po popravkih posodobimo sledljivost in ohranimo zgodovino sprememb specifikacije.

## Vodenje postopka

En isti agent z ohranjeno zgodovino izvaja samo vsakokrat izrecno sproženi korak lokalnega Spec Kit 1.0.8 s presetom Lean 1.0.0. Ne zaganja drugih agentov, ne ustvarja vej ali commitov in ne uporablja drugih projektov, povezovalnikov, oddaljenih repozitorijev ali javnega interneta. Delo sproti shranjuje in preverja skupni čas z `node task/time-budget.mjs`; zadnjo minuto nameni predaji. Odprta vprašanja rešuje iz obstoječih zahtev; ob manjkajočem bistvenem podatku navede omejitev in se ustavi.

Ta načela povzemajo navedene vire in ne širijo obsega naloge. Spremembe načel morajo ostati skladne z izrecnimi navodili pilota; predloge niso dovoljenje za spreminjanje infrastrukture.
