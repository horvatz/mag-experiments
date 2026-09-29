# Folio — ustava projekta za pilot P10, postopek C

## Projektna načela

1. **Izvirne zahteve določajo obseg.** Merilo so `PROJECT_RULES.md`, vseh dvanajst zahtev R01–R12 in dogovor o vmesniku v `task/instructions.md`. Specifikacija jih ne sme zožiti ali razširiti. Ne uvajamo novih zahtev, odvisnosti ali obveznih arhitekturnih preureditev.
2. **Ohranimo potrjeni Folio.** Dopolnjujemo obstoječi vmesnik s slovenskimi poimenovanji, gradniki in slogi iz `docs/dizajn.md`. Ohranimo dostopna imena, vidni fokus, pravilne podrobnosti in prilagodljivost; pri širini 390 pik se stran ne razširi, notranje drsenje preglednice in table je dovoljeno.
3. **Identiteta temelji na ID-jih.** Podatke beremo iz javnega `/api/`; naslovi niso identifikatorji. P10 spreminja samo lokalno permutacijo iste množice ID-jev trenutnega projekta, brez sprememb polj, statusov, zapisov na API ali trajne shrambe. Vmesnik ne uporablja `/__test/`, testnih pripomočkov ali lokalne kopije strežnika.
4. **Meje sprememb so obvezne.** Dovoljeni so `src/`, lastni testi v `tests/agent/`, dokumentacija v `docs/agent/` ter procesni datoteki `.specify/memory/constitution.md` in `.specify/feature.json`. Strežnik, začetni podatki, skupni tipi in testi, odvisnosti, nastavitve, uradne predloge, veščine in druge datoteke Spec Kit ostanejo samo berljivi.
5. **Sledljivost in dejanski dokazi.** Skupno predlogo `task/specification-template.md` izpolnimo v `docs/agent/P10`, po potrebi s povezavami med dokumenti brez podvajanja. Vsako R01–R12 povežemo s sprejemnim pogojem, kodo in izvedenim testom oziroma scenarijem; izbrane pogoje izrazimo s pojasnjenimi predikati. Preverimo skupne teste in smiselne dodatne primere iz celotne dovoljene domene podatkov. Zabeležimo rezultate, izvor dokazov, neizvedena preverjanja, omejitve in zgodovino sprememb specifikacije. Nedostopnih končnih testov ne navajamo kot opravljenih.

## Potek in upravljanje

En isti agent z ohranjeno zgodovino izvaja samo vsakokrat navedeni lokalni korak Spec Kit 1.0.8 s presetom Lean 1.0.0. Ne zaganja drugih agentov, ne ustvarja vej ali commitov ter ne uporablja drugih projektov, povezovalnikov, oddaljenih repozitorijev ali javnega interneta. Delo sproti shranjuje, čas preverja z `node task/time-budget.mjs` in zadnjo minuto skupnega roka nameni predaji.

Ta ustava povzema obstoječa pravila; ne nadomešča izvirnih zahtev. Spremembe načel morajo ostati znotraj uporabnikovih navodil in dovoljenega obsega ter imeti zabeležen datum in različico. Bistvenih manjkajočih podatkov ne izmišljamo: omejitev jasno navedemo in se ustavimo.

**Različica**: 1.0.0 | **Sprejeto**: 2026-09-26 | **Zadnja sprememba**: 2026-09-26
