# Folio Constitution

## Core Principles

### I. Ohranitev potrjenega Folio
Nadgradnje ohranijo potrjeni videz Folio iz `docs/dizajn.md`, slovenska poimenovanja in obstoječo prilagodljivost, uporabo s tipkovnico ter vizualno smer. Uporabljajo obstoječe gradnike in slogovne spremenljivke.

### II. Podatki prek javnega API-ja
Aplikacija podatke bere in zapisuje prek javnega vmesnika `/api/` ter zapise izbira po `id`. Uporabniški vmesnik ne uporablja testnih poti `/__test/` in ne nadomešča strežniških podatkov z lokalno kopijo ali `localStorage`.

### III. Spoštovanje meja projekta
Aplikacijska koda sodi v `src/`, lastni testi v `tests/agent/` in lastna dokumentacija v `docs/agent/`. Strežnik, skupni tipi, skupni testi, odvisnosti ter nastavitve zagona in preverjanja ostanejo nespremenjeni. Skupna infrastruktura se spremeni samo z vnaprej dogovorjeno posodobitvijo izhodišča za vse postopke.

### IV. Preverljiva oddaja
Spremembe se preverijo s skupnimi testi in smiselnimi lastnimi preverjanji. Poročilo jasno loči izvedena preverjanja od neizvedenih ter navede njihove dejanske izide in neizpolnjene zahteve.

## Razvojni potek

Zahteve konkretne naloge in predpisana predloga določajo sprejemne pogoje. Izvedba ohrani projektne meje in ne spreminja skupne infrastrukture brez dogovora, opisanega zgoraj.

## Governance

Ta ustava določa projektna načela za Folio. Konkretne naloge jih uporabljajo skupaj s `PROJECT_RULES.md` in zahtevami naloge; ustava ne razširja dovoljenega obsega sprememb.

## Next Actions

- Nadaljuj pripravo specifikacije P08 z ukazom `$speckit-specify` v `docs/agent/P08`.

**Version**: 1.0.0 | **Ratified**: 2026-09-27 | **Last Amended**: 2026-09-27
