# Folio — ustava projekta P03, postopek C

## Projektna načela

1. **Izvirne zahteve so merilo.** Vseh dvanajst zahtev R01–R12 in dogovor o vmesniku iz [navodil naloge](../../task/instructions.md) ostaja obveznih, tudi če jih poznejši dokument izpusti. Obseg je iskanje in sestavljeno filtriranje obstoječih opravil; ne dodajamo zahtev, odvisnosti ali obveznih arhitekturnih preureditev.

2. **Ohranimo Folio.** Dopolnitve uporabljajo obstoječe gradnike, slogovne spremenljivke in slovenska poimenovanja ter spoštujejo [potrjeni dizajn](../../docs/dizajn.md). Ohranijo navigacijo, bralne podrobnosti, dostopna imena, označbe opravil in uporabnost pri ozki širini, vključno s širino 390 pik.

3. **Javni API je vir podatkov.** Aplikacija bere podatke prek `/api/` in opravila izbira po `id`. Filtriranje ne spreminja podatkov ali njihovega izvornega vrstnega reda in ne pošilja zapisovalnih zahtev. Filtri so začasno stanje trenutnega projekta, brez URL-ja ali trajne shrambe. Aplikacija ne uporablja `/__test/`, testnih pripomočkov ali lokalne kopije kot nadomestila strežnika.

4. **Meje sprememb so zavezujoče.** Dovoljene so spremembe v `src/`, `tests/agent/`, `docs/agent/` ter procesnih datotekah `.specify/memory/constitution.md` in `.specify/feature.json`. Strežnik, začetni podatki, skupni tipi in testi, odvisnosti, nastavitve, uradne predloge, veščine ter preostale datoteke Spec Kit ostanejo samo berljivi. Veljajo [projektna pravila](../../PROJECT_RULES.md) z izrecno dopolnitvijo za postopek C.

5. **Sledljivost in preverjanje temeljita na dokazih.** Dokumentacija v `docs/agent/P03` pokrije [skupno predlogo](../../task/specification-template.md); dovoljene so povezave brez podvajanja. Vsako R01–R12 poveže s sprejemnim pogojem, kodo, testom ali scenarijem ter dejanskim izidom in določljivim dokazom. Izbrane pogoje izrazi s predikati in razloži simbole. Preverjanje vključuje skupne teste in smiselna lastna preverjanja zahtev za dovoljene podatke, tudi prazne projekte. Neizvedeni ali nedostopni testi niso uspešni; omejitve in nepreverjeni deli so izrecno zapisani. Po popravkih se povezave posodobijo in zgodovina specifikacije ohrani.

## Izvajanje in veljavnost

En agent z ohranjeno zgodovino izvaja samo sproženi korak lokalnega Spec Kit 1.0.8 s presetom Lean 1.0.0. Ne zaganja drugih agentov, ne ustvarja vej ali commitov in ne uporablja drugih projektov, oddaljenih repozitorijev, povezovalnikov ali javnega interneta. Delo sproti shranjuje, skupni rok preverja z `node task/time-budget.mjs` in zadnjo minuto nameni predaji. Bistvenih manjkajočih podatkov ne izmišljuje: navede omejitev in se ustavi.

Ta ustava povzema obstoječa pravila; ne nadomešča izvirnih zahtev in ne razširja obsega ali dovoljenih posegov. Poznejši dokumenti morajo ostati skladni z navedenimi viri in izrecnimi navodili uporabnika.

**Različica:** 1.0.0 | **Sprejeto:** 2026-09-23 | **Zadnja sprememba:** 2026-09-23
