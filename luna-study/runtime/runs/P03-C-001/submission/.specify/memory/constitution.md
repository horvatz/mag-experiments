# Folio — projektna ustava

## Temeljna načela

### I. Ohranitev Folio in slovenskega vmesnika
Dopolnjujemo obstoječi uporabniški vmesnik, ohranjamo potrjeni videz Folio in slovenska poimenovanja.

### II. Javni API in zvestoba podatkom
Podatke beremo in shranjujemo prek javnega vmesnika `/api/` ter opravila izbiramo po `id`. Uporabniški vmesnik ne uporablja testnih kontrol `/__test/`, lokalne kopije podatkov ali `localStorage`.

### III. Ohranjanje skupnega izhodišča
Aplikacijske spremembe omejimo na `src/`, lastne teste v `tests/agent/` in dokumente v `docs/agent/`. Začetni podatki, strežnik, skupni tipi in testi, odvisnosti ter nastavitve ostanejo nespremenjeni. Spremembe skupne infrastrukture zahtevajo vnaprej dogovorjeno posodobitev izhodišča.

### IV. Preverjanje in jasna oddaja
Rešitev preverimo s skupnimi testi in po potrebi z lastnimi preverjanji. Ob oddaji opišemo spremembe, dejansko izvedena preverjanja in njihove rezultate ter morebitne neizpolnjene zahteve. Neizvedenih testov ne navajamo kot uspešnih.

## Potek dela

Pred spremembami preberemo zahteve naloge in uporabimo skupno predlogo specifikacije. Pri delu upoštevamo projektna pravila in meje dovoljenih sprememb.

## Upravljanje

Ustava povzema skupna projektna načela; konkretne zahteve naloge določajo sprejemne pogoje. Spremembe skupnega izhodišča se opravijo samo po vnaprejšnjem dogovoru.

**Različica**: 1.0.0 | **Sprejeto**: 2026-09-27 | **Nazadnje spremenjeno**: 2026-09-27
