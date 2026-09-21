# Folio — projektna načela pilota P05, postopek C

## 1. Izvorne zahteve so merilo

Upoštevaj [projektna pravila](../../PROJECT_RULES.md) in vseh dvanajst zahtev R01–R12 iz [navodil P05](../../task/instructions.md), tudi če jih izvedbeni dokument izpusti. Obseg je straničenje in filter stanja ob ohranitvi obstoječega delovanja. Ne dodajaj zahtev, odvisnosti ali obveznih arhitekturnih preureditev.

## 2. Ohrani Folio in pogodbo vmesnika

Ohrani slovenska poimenovanja, [potrjeni dizajn Folio](../../docs/dizajn.md), obstoječe gradnike, dostopna imena, identifikatorje opravil, povezave, podrobnosti in nalaganje. Nove kontrole in status sledijo natančni pogodbi P05; stran pri širini 390 pik ne sme imeti vodoravnega preliva. Notranje drsenje preglednice in table je dovoljeno.

## 3. Podatki ostanejo pri javnem API-ju

Aplikacija uporablja samo obstoječi javni `/api/` in izbira opravila po `id`, ne po naslovu ali položaju. Uporabniški vmesnik ne uporablja `/__test/` ali testnih pripomočkov in ne nadomešča strežnika z lokalnimi podatki. Straničenje in filtriranje ne spreminjata podatkov in ne pošiljata zapisov. Njuno stanje ostane lokalno trenutnemu projektu, brez trajne shrambe in URL-ja, s ponastavitvami iz zahtev.

## 4. Meje sprememb so obvezne

Dovoljene so spremembe samo v `src/`, `tests/agent/`, `docs/agent/` ter procesnih datotekah `.specify/memory/constitution.md` in `.specify/feature.json`. Strežnik, začetni podatki, skupni tipi in testi, odvisnosti, nastavitve, uradne predloge, veščine in preostale datoteke Spec Kit so samo berljivi. Ne ustvarjaj vej ali commitov ter ne uporabljaj drugih projektov, povezovalnikov ali oddaljenih virov.

## 5. Sledljivost in preverljivi dokazi

Dokumenti v `docs/agent/P05` morajo skupaj pokriti [skupno predlogo](../../task/specification-template.md); povezave nadomestijo podvajanje. Vsako zahtevo R01–R12 poveži s sprejemnim pogojem, kodo, testom oziroma scenarijem in dejanskim izidom. Izbrane pogoje izrazi s predikati in pojasni simbole. Preveri skupne teste in zahteve P05 z ločenimi smiselnimi preverjanji tudi za dovoljeno podatkovno domeno zunaj razvojnih primerov. Neizvedenih ali nedostopnih testov ne označi kot uspešnih; zapiši omejitve, dokaze in zgodovino sprememb specifikacije.

## Vodenje postopka

En agent z ohranjeno zgodovino izvaja le korak, ki ga sproži izvajalnik, po izrecno navedeni lokalni veščini Spec Kit 1.0.8 s presetom Lean 1.0.0. Delo sproti shranjuje, preostanek skupnega 20-minutnega proračuna preverja z `node task/time-budget.mjs` in zadnjo minuto nameni predaji. Bistvenih manjkajočih podatkov ne izmišljuje. Ta načela povzemajo izvorna pravila in jih ne razširjajo; poznejše dopolnitve morajo ostati znotraj dovoljenega obsega.

**Različica**: 1.0.0 | **Sprejeto**: 2026-09-22 (datum pilota, Europe/Ljubljana) | **Zadnja sprememba**: 2026-09-22
