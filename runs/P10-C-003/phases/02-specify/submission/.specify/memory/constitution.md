# Folio — projektna načela pilota P10, postopek C

## Temeljna načela

1. **Izvirne zahteve so merilo.** Upoštevamo vseh R01–R12 iz
   [navodil naloge](../../task/instructions.md), tudi če jih izvedbeni dokument
   izpusti. Obsega ne širimo z novimi zahtevami, odvisnostmi ali obveznimi
   arhitekturnimi preureditvami.
2. **Ohranimo Folio.** Dopolnjujemo obstoječi vmesnik s slovenskimi
   poimenovanji in [potrjenim dizajnom](../../docs/dizajn.md). Ohranimo
   dostopnost, obstoječe povezave in prilagodljivost; pri širini 390 pik
   dovolimo notranje drsenje preglednice in table, ne širjenja cele strani.
   Upoštevamo točna dostopna imena in oznake iz navodil naloge.
3. **Identiteto določa ID.** Podatke beremo samo prek javnega `/api/` in
   opravila razlikujemo po `id`, ne po naslovu. P10 spreminja samo lokalno
   permutacijo iste množice ID-jev, brez sprememb polj, zapisov na API ali
   trajne shrambe. Uporabniški vmesnik ne uporablja `/__test/` ali testnih
   pripomočkov in strežnika ne nadomešča z lokalno zbirko.
4. **Meje sprememb so zavezujoče.** Dovoljene so spremembe v `src/`,
   `tests/agent/` in `docs/agent/` ter procesnih datotek
   `.specify/memory/constitution.md` in `.specify/feature.json`.
   Strežnik, začetni podatki, skupni tipi in testi, odvisnosti, nastavitve,
   infrastruktura, uradne predloge in veščine ostanejo nespremenjeni.
5. **Specifikacija in dokazi so sledljivi.** Uporabimo
   [skupno predlogo](../../task/specification-template.md); vsebino lahko
   povežemo z dokumenti Spec Kit v `docs/agent/P10`, brez podvajanja.
   Za vseh R01–R12 povežemo sprejemne pogoje, kodo, teste oziroma scenarije
   ter dejanske izide. Izbrane pogoje izrazimo s pojasnjenimi predikati;
   splošna pravila ločimo od testnih primerov. Po popravkih posodobimo
   povezave in ohranimo zgodovino sprememb specifikacije.
6. **Preverjanje poročamo pošteno.** Izvedemo skupna preverjanja in smiselna
   preverjanja zahtev P10 tudi za dovoljene različice podatkov. Navedemo
   izvedene ukaze oziroma teste, rezultate in dokazila ter nepreverjene
   scenarije, omejitve in neizpolnjene zahteve. Neizvedenih ali nedostopnih
   končnih testov ne označimo za uspešne.

## Pravila postopka

En agent z ohranjeno zgodovino opravlja samo vsakokrat navedeni korak
lokalne uradne veščine Spec Kit 1.0.8 s presetom Lean 1.0.0. Ne zaganjamo
drugih agentov, ne ustvarjamo vej ali commitov in ne uporabljamo drugih
projektov, oddaljenih repozitorijev, povezovalnikov ali javnega interneta.
Delo sproti shranjujemo, preostanek skupnega časa preverjamo z
`node task/time-budget.mjs`, zadnjo minuto roka namenimo predaji.
Bistveno manjkajočo informacijo navedemo kot omejitev in se ustavimo;
uporabnikovih odgovorov si ne izmišljamo.

## Veljavnost

Ta načela povzemajo [projektna pravila](../../PROJECT_RULES.md), skupno
predlogo in izrecna navodila pilota; ne nadomeščajo izvirnih zahtev in ne
uvajajo dodatnih odobritev ali postopkovnih pogojev.

**Različica:** 1.0.0 | **Sprejeto:** 2026-09-25 | **Zadnja sprememba:** 2026-09-25

**Zgodovina:** 2026-09-25 — začetni sprejem načel za pilot P10, postopek C.
