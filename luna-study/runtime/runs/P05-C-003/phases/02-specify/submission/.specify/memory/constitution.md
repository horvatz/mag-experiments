# Folio Constitution

## Core Principles

### I. Ohranitev potrjenega Folio
Dopolnitve izhajajo iz obstoječega uporabniškega vmesnika. Ohranjajo slovenska poimenovanja in potrjeni videz Folio iz `docs/dizajn.md` ter uporabljajo obstoječe gradnike in slogovne spremenljivke.

### II. Omejen obseg sprememb
Dopolnjujemo uporabniški vmesnik v `src/` ter po potrebi dodamo lastne teste v `tests/agent/` in dokumentacijo v `docs/agent/`. Začetni podatki, strežnik, skupni tipi in testi, odvisnosti ter nastavitve zagona in preverjanja ostanejo nespremenjeni. Sprememba skupne infrastrukture zahteva vnaprej dogovorjeno posodobitev izhodišča za vse postopke.

### III. Uporaba javnega podatkovnega vmesnika
Podatke beremo in shranjujemo prek obstoječega javnega vmesnika `/api/`; opravila izbiramo po `id`. Uporabniški vmesnik ne uporablja testnih kontrol `/__test/`, lokalne kopije podatkov ali `localStorage` namesto strežniških podatkov.

### IV. Preverljivo in pošteno poročanje
Rešitev preverimo s skupnimi testi in po potrebi dodamo lastna preverjanja. Ob oddaji opišemo spremembe, dejansko izvedena preverjanja in njihove rezultate ter morebitne neizpolnjene zahteve. Neizvedenih testov ne označimo kot uspešnih.

## Dodatne omejitve

- Testne kontrole `/__test/` uporablja samo testni program; uporabniški vmesnik prek njih ne nastavlja odzivov, ne bere testnega stanja in ne ponastavlja podatkov.
- Projektna pravila in konkretne zahteve naloge določajo dovoljeni obseg posamezne izvedbe.

## Potek dela

Pred izvedbo preberemo zahteve naloge in uporabimo priloženo predlogo specifikacije. Spremembe ter preverjanja prilagodimo dovoljenemu obsegu projekta in naloge.

## Governance

Ta načela povzemajo projektna pravila za Folio. Podrobnosti in dovoljeni obseg določajo `PROJECT_RULES.md` ter navodila konkretne naloge.

**Version**: 1.0.0 | **Ratified**: 2026-09-28 | **Last Amended**: 2026-09-28
