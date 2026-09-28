# Ustava projekta Folio

## Temeljna načela

### I. Ohranitev potrjenega videza
Nadgradnje ohranjajo potrjeni dizajn Folio, slovenska poimenovanja in
obstoječe gradnike. Uporabnost s tipkovnico, vidni fokus in prilagodljiv
prikaz ostajajo del kakovostnega vmesnika.

### II. Uporaba javnega podatkovnega vmesnika
Aplikacija bere in shranjuje podatke prek javnega vmesnika `/api/` ter
opravila prepoznava po `id`. Testne poti niso del uporabniškega vmesnika;
strežniških podatkov se ne nadomešča z lokalno kopijo ali `localStorage`.

### III. Omejen in sorazmeren obseg
Delo dopolnjuje obstoječo aplikacijo. Spremembe ostanejo v dovoljenih
datotekah `src/`, `tests/agent/` in `docs/agent/`; skupna infrastruktura,
strežnik, odvisnosti in nastavitve ostanejo nespremenjeni, razen ob vnaprej
dogovorjeni posodobitvi izhodišča. Izogibamo se nepotrebnim odvisnostim in
arhitekturnim preureditvam.

### IV. Preverljivost in pošteno poročanje
Rešitve preverimo s skupnimi testi in ustreznimi lastnimi preverjanji.
Poročilo loči izvedena preverjanja od neizvedenih ter navede znane
neizpolnjene zahteve.

## Omejitve

Za vsako nalogo so izvirne zahteve in projektna pravila merodajni. Testne
kontrole so namenjene samo testnemu programu. Dokument `docs/dizajn.md`
določa potrjeno vizualno usmeritev; uporabljamo obstoječe gradnike in
slogovne spremenljivke.

## Potek dela

Pred spremembami preberemo zahteve in uporabimo predpisano predlogo. Kodo,
lastne teste in dokumentacijo spreminjamo samo v dovoljenih mapah. Ob zaključku
povzamemo spremembe, dejansko izvedena preverjanja in omejitve.

## Upravljanje

Ta ustava povzema projektna pravila in ne razširja zahtev posamezne naloge.
Ob neskladju se upoštevajo izvirne zahteve naloge ter projektna pravila;
sprememba ustave mora ostati skladna z njimi.

**Različica**: 1.0.0 | **Sprejeto**: 2026-09-27 | **Nazadnje spremenjeno**: 2026-09-27
