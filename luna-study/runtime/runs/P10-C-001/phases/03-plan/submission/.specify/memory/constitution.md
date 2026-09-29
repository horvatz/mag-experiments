# Folio — Ustava projekta

## Temeljna načela

### I. Ohranitev Folia in slovenske rabe
Dopolnitve izhajajo iz obstoječe aplikacije. Ohranijo potrjeni videz Folio,
obstoječe gradnike in slogovne spremenljivke ter slovenska poimenovanja.

### II. Omejen obseg sprememb
Uporabniški vmesnik in njegovi slogi sodijo v `src/`; lastni testi in
dokumentacija v `tests/agent/` oziroma `docs/agent/`. Strežnik, skupni tipi,
skupni testi, odvisnosti in nastavitve ostanejo nespremenjeni, razen ob
dogovorjeni posodobitvi skupnega izhodišča.

### III. Podatki prek javnega vmesnika
Aplikacija bere in shranjuje podatke prek javnega `/api/` ter opravila
prepoznava po `id`. Uporabniški vmesnik ne uporablja testnih kontrol `/__test/`
in ne nadomešča strežniških podatkov z lokalno kopijo ali `localStorage`.

### IV. Preverljiva kakovost
Spremembe se preverijo s skupnimi testi in po potrebi z lastnimi testi.
Poročilo navede opravljena preverjanja, dejanske rezultate in neizpolnjene
zahteve; neizvedenih preverjanj ne označi kot uspešnih.

## Delovni okvir

Zahteve konkretne naloge in skupna predloga določajo funkcionalni obseg.
Ustava ohranja skupna pravila aplikacije in sama ne uvaja dodatnih funkcij,
odvisnosti ali arhitekturnih preureditev.

## Upravljanje

Ta ustava povzema `PROJECT_RULES.md` in potrjeni dizajn v `docs/dizajn.md`.
Ob spremembi skupnih pravil se ustrezno posodobi; izvedba naloge mora ostati
znotraj dovoljenega obsega sprememb.

**Različica**: 1.0.0 | **Sprejeta**: 2026-09-27 | **Nazadnje spremenjena**: 2026-09-27
