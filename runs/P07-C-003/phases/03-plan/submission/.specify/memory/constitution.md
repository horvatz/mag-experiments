# Projektna načela Folio — pilot P07, postopek C

## Temeljna načela

1. **Izvirne zahteve so merilo.** Upoštevaj vseh R01–R12 iz `task/instructions.md`, tudi če jih izvedbeni dokument izpusti. Obseg omeji na priljubljena opravila in zahtevano trajno shrambo; ne dodajaj zahtev, odvisnosti ali obveznih arhitekturnih preureditev.
2. **Ohrani Folio.** Dopolni obstoječi vmesnik skladno z `docs/dizajn.md`. Ohrani slovenska poimenovanja, dogovorjena dostopna imena in oznake, nalaganje, navigacijo ter delovanje pri širini 390 pik.
3. **Loči opravila od lokalnih priljubljenih.** Opravila beri prek javnega `/api/` in jih izbiraj po `id`; naslovi niso identifikatorji. Priljubljene hrani lokalno po pravilih R02–R04 in R11, brez zapisov na API ali sprememb polj opravil. Izrecno zahtevana shramba ID-jev ne dovoljuje lokalne kopije strežniških podatkov. UI ne uporablja `/__test/` ali testnih pripomočkov.
4. **Spoštuj meje sprememb.** Dovoljeni so `src/`, `tests/agent/`, `docs/agent/` ter procesni datoteki `.specify/memory/constitution.md` in `.specify/feature.json`. Strežnik, začetni podatki, skupni tipi in testi, odvisnosti, nastavitve, infrastruktura, uradne predloge, veščine in druge datoteke Spec Kit ostanejo samo berljive.
5. **Zagotovi sledljivost in resnična dokazila.** Izpolni vse vsebinske dele `task/specification-template.md`; dovoljene so povezave na dokumente Spec Kit v `docs/agent/P07`. Vsako R01–R12 poveži s pogoji, kodo, scenariji in dejansko izvedenimi preverjanji. Izbrane pogoje izrazi s pojasnjenimi predikati. Preveri skupne teste in smiselne lastne scenarije iz celotne dovoljene podatkovne domene. Neizvedenih ali nedostopnih testov ne označi kot uspešnih; navedi določljiva dokazila, omejitve, odstopanja in zgodovino sprememb specifikacije.
6. **Ohrani predpisani postopek.** Isti agent z ohranjeno zgodovino izvaja samo trenutno naročeni korak lokalnih uradnih veščin Spec Kit 1.0.8, preset Lean 1.0.0. Brez drugih agentov, projektov, konektorjev, javnega interneta, oddaljenih repozitorijev, vej ali commitov. Delo sproti shranjuj, čas preverjaj z `node task/time-budget.mjs` in zadnjo minuto skupnega roka nameni predaji.

## Veljavnost in vzdrževanje

Ta načela povzemajo `PROJECT_RULES.md`, `task/instructions.md`, skupno predlogo in izrecna navodila pilota; izvirnih zahtev ne nadomeščajo. Izrecna dopolnitev postopka C dovoljuje navedeni procesni datoteki, zahteve P07 pa določajo lokalno shrambo priljubljenih. Spremembe načel morajo ostati znotraj teh virov. Bistvenega manjkajočega podatka ne izmišljaj; zapiši omejitev in se ustavi. Končna predaja navede spremembe, izvedena preverjanja z rezultati ter neizpolnjene zahteve.

**Različica:** 1.0.0 | **Sprejeto:** 2026-09-25 | **Zadnja sprememba:** 2026-09-25
