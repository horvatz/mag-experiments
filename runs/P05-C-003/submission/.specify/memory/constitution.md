# Folio — projektna načela pilota P05, postopek C

**Različica:** 1.0.0 | **Sprejeto:** 2026-09-25 | **Zadnja sprememba:** 2026-09-25

## 1. Izvirne zahteve določajo obseg

Merilo so [projektna pravila](../../PROJECT_RULES.md) in vseh dvanajst zahtev R01–R12 iz [navodil naloge](../../task/instructions.md), tudi kadar jih izvedbeni dokument izpusti. Dokumentacija sledi [skupni predlogi](../../task/specification-template.md); povezave na dokumente Spec Kit lahko nadomestijo podvajanje vsebine. Ne dodajamo novih zahtev, odvisnosti ali obveznih arhitekturnih preureditev.

## 2. Ohranitev vmesnika Folio

Dopolnjujemo obstoječi vmesnik in ohranjamo slovenska poimenovanja, [potrjeni dizajn Folio](../../docs/dizajn.md), dostopna imena, identifikatorje opravil, povezave, podrobnosti, nalaganje in prilagodljiv prikaz. Nove kontrole in besedila upoštevajo izrecni dogovor o vmesniku iz navodil naloge.

## 3. Javni API in pravilna identiteta podatkov

Aplikacija bere in shranjuje podatke samo prek obstoječega javnega `/api/` ter izbira zapise po `id`. Naslovi in imena niso identifikatorji; besedilna polja ostanejo navadno besedilo. Straničenje in filtriranje ne spreminjata podatkov in ne pošiljata zapisov. Njuno stanje se ne shranjuje v trajno shrambo ali URL. Strežnika ne nadomeščamo z lokalno kopijo ali `localStorage`; testne kontrole `/__test/` in pripomočki so namenjeni samo testom.

## 4. Omejen poseg v obstoječi projekt

Dovoljene spremembe so v `src/`, `tests/agent/` in `docs/agent/`; postopek C sme dodatno posodobiti `.specify/memory/constitution.md` in `.specify/feature.json`. Strežnik, začetni podatki, skupni tipi in testi, nastavitve, odvisnosti, infrastruktura, uradne predloge, veščine in druge datoteke Spec Kit ostanejo samo berljivi. Ne uporabljamo drugih projektov, oddaljenih repozitorijev ali javnega interneta ter ne ustvarjamo vej ali commitov.

## 5. Sledljivost in dejanska dokazila

Specifikacija poveže R01–R12 s sprejemnimi pogoji, izbranimi predikati, kodo in dejansko izvedenimi testi. Splošna pravila veljajo za celotno dovoljeno podatkovno domeno, ne le za razvojne primere. Rešitev preverimo s skupnimi testi in smiselnimi dodatnimi preverjanji. Dokazila vsebujejo določljiv test ali scenarij in rezultat; neizvedenih ali nedostopnih končnih testov ne označujemo kot uspešnih. Zapišemo omejitve, nepreverjene dele in zgodovino sprememb specifikacije.

## Izvajanje in vzdrževanje

En agent z ohranjeno zgodovino izvaja izrecno sprožene lokalne veščine Spec Kit 1.0.8 s presetom Lean 1.0.0, po en korak na turn. Dokumenti funkcionalnosti so v `docs/agent/P05`. Delo sproti shranjuje, preostanek skupnega časa preverja z `node task/time-budget.mjs` in zadnjo minuto nameni predaji. Ta načela povzemajo izvorna navodila; ne spreminjajo njihovega obsega. Spremembe načel morajo ostati skladne z njimi in posodobiti datum ter različico tega dokumenta.
