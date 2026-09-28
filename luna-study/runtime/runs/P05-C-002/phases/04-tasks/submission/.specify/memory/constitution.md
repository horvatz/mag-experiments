# Folio — Ustava projekta

## Temeljna načela

### I. Ohranitev potrjenega Folia
Vsaka dopolnitev uporablja obstoječe gradnike in slogovne spremenljivke ter ohranja potrjeni videz Folia, slovenska poimenovanja in odzivno obnašanje. Upošteva potrjene smernice v `docs/dizajn.md`.

### II. Omejen obseg sprememb
Aplikacijske spremembe sodijo v `src/`, lastni testi v `tests/agent/` in lastna dokumentacija v `docs/agent/`. Začetnih podatkov, strežnika, skupnih tipov in skupnih testov se ne spreminja. Sprememba skupne infrastrukture zahteva vnaprej dogovorjeno enako posodobitev izhodišča za vse postopke.

### III. Javni podatkovni vmesnik
Aplikacija bere in shranjuje podatke prek javnega vmesnika `/api/` ter opravila izbira po `id`. Poti `/__test/` so namenjene samo testnemu programu. Aplikacija jih ne uporablja za nastavljanje odzivov ali branje testnega stanja; strežniških podatkov ne nadomešča z lokalno kopijo ali `localStorage`.

### IV. Preverljivi izidi
Rešitev preveri s skupnimi testi in po potrebi z lastnimi preverjanji v `tests/agent/`. Poročilo navede dejansko izvedena preverjanja in rezultate ter jasno označi neizpolnjene zahteve. Neizvedenih testov ne predstavlja kot uspešnih.

## Delovni okvir

Konkretne zahteve naloge določajo predvideno spremembo; projektna pravila določajo dovoljeni obseg. Ohranijo se obstoječe povezave, pravilni identifikatorji, podrobnosti, prikaz nalaganja in prilagodljivost Folia.

## Upravljanje

Ta načela izhajajo iz `PROJECT_RULES.md` in potrjenih smernic Folia. Skupna infrastruktura se spremeni le z dogovorjeno, za vse postopke enako posodobitvijo izhodišča.

**Različica**: 1.0.0 | **Sprejeto**: 2026-09-27 | **Nazadnje spremenjeno**: 2026-09-27
